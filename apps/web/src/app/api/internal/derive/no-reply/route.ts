import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

/**
 * Internal deterministic derivation: EMAIL_NO_REPLY
 *
 * Rule: for each EMAIL_SENT, if no EMAIL_REPLIED is recorded for the same
 * provider thread within N days, emit EMAIL_NO_REPLY at (sent.occurred_at + N days).
 *
 * Auth: header `x-ag-admin` must match env `AG_ADMIN_SECRET`.
 */
export async function POST(req: NextRequest) {
  const admin = req.headers.get("x-ag-admin");
  if (!process.env.AG_ADMIN_SECRET || admin !== process.env.AG_ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({} as any));
  const days: number = Number(payload.days ?? 5);
  const tenantId: string | undefined = payload.tenant_id;

  if (!Number.isFinite(days) || days < 1 || days > 30) {
    return NextResponse.json({ ok: false, error: "invalid_days" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Tenants scope
  let tenants: { id: string }[] = [];
  if (tenantId) {
    tenants = [{ id: tenantId }];
  } else {
    const { data, error } = await supabase.from("tenants").select("id");
    if (error) return NextResponse.json({ ok: false, error: "db_error", details: String(error.message || error) }, { status: 500 });
    tenants = data ?? [];
  }

  let emitted = 0;
  let scanned = 0;

  for (const t of tenants) {
    // 1) Candidate EMAIL_SENT older than cutoff
    const { data: sent, error: sErr } = await supabase
      .from("events")
      .select("id, tenant_id, occurred_at, channel, lead_id, campaign_id, product_service_id, agent_id, payload")
      .eq("tenant_id", t.id)
      .eq("event_type", "EMAIL_SENT")
      .lte("occurred_at", cutoff)
      .limit(1000);

    if (sErr) {
      return NextResponse.json({ ok: false, error: "db_error", details: String(sErr.message || sErr) }, { status: 500 });
    }
    const sentList = sent ?? [];
    scanned += sentList.length;
    if (!sentList.length) continue;

    // Collect thread_ids
    const threadIds = Array.from(
      new Set(
        sentList
          .map((e: any) => e.payload?.thread_id)
          .filter((x: any) => typeof x === "string" && x.length > 0)
      )
    );
    if (!threadIds.length) continue;

    // 2) Any EMAIL_REPLIED for these threads? (reply at any time counts as reply)
    const { data: replies, error: rErr } = await supabase
      .from("events")
      .select("payload")
      .eq("tenant_id", t.id)
      .eq("event_type", "EMAIL_REPLIED")
      .in("payload->>thread_id", threadIds)
      .limit(5000);

    if (rErr) {
      // `payload->>thread_id` filtering may not be enabled in some PostgREST configs.
      // If it fails, we fall back to client-side filtering by fetching all replies (bounded).
      const { data: allReplies, error: r2Err } = await supabase
        .from("events")
        .select("payload")
        .eq("tenant_id", t.id)
        .eq("event_type", "EMAIL_REPLIED")
        .limit(5000);
      if (r2Err) {
        return NextResponse.json({ ok: false, error: "db_error", details: String(r2Err.message || r2Err) }, { status: 500 });
      }
      const repliedThreads = new Set(
        (allReplies ?? []).map((e: any) => e.payload?.thread_id).filter((x: any) => typeof x === "string")
      );
      emitted += await emitNoReplyForTenant(supabase, t.id, sentList, repliedThreads, days);
      continue;
    }

    const repliedThreads = new Set(
      (replies ?? []).map((e: any) => e.payload?.thread_id).filter((x: any) => typeof x === "string")
    );
    emitted += await emitNoReplyForTenant(supabase, t.id, sentList, repliedThreads, days);
  }

  return NextResponse.json({ ok: true, scanned, emitted, days });
}

async function emitNoReplyForTenant(
  supabase: ReturnType<typeof supabaseServer>,
  tenantId: string,
  sentList: any[],
  repliedThreads: Set<string>,
  days: number
): Promise<number> {
  let emitted = 0;
  const inserts: any[] = [];

  for (const s of sentList) {
    const threadId = s.payload?.thread_id;
    if (!threadId || repliedThreads.has(threadId)) continue;

    const occurredAt = new Date(new Date(s.occurred_at).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const idempotency = `derived:email_no_reply:${s.id}`;

    inserts.push({
      tenant_id: tenantId,
      occurred_at: occurredAt,
      event_type: "EMAIL_NO_REPLY",
      source: "system",
      channel: s.channel ?? null,
      idempotency_key: idempotency,
      lead_id: s.lead_id ?? null,
      campaign_id: s.campaign_id ?? null,
      product_service_id: s.product_service_id ?? null,
      agent_id: s.agent_id ?? null,
      payload: {
        derived_from_event_id: s.id,
        thread_id: threadId,
        message_id: s.payload?.message_id ?? null,
        rule_days: days,
      },
    });
  }

  // Batch insert with best-effort dedupe via unique (tenant_id, idempotency_key)
  if (inserts.length) {
    const { error } = await supabase.from("events").insert(inserts);
    if (!error) emitted += inserts.length;
    // If duplicates exist, PostgREST might return an error; we then insert one-by-one.
    else {
      for (const row of inserts) {
        const { error: e } = await supabase.from("events").insert(row);
        if (!e) emitted += 1;
      }
    }
  }
  return emitted;
}
