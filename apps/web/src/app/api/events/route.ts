import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { EventEnvelope } from "@/lib/eventSchema";
import { hmacHex, timingSafeEqualHex } from "@/lib/hmac";
import { stableStringify } from "@/lib/stableJson";

const TS_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const tsHeader = req.headers.get("x-ag-ts");
  const sigHeader = req.headers.get("x-ag-signature");

  if (!tsHeader || !sigHeader) {
    return NextResponse.json({ ok: false, error: "missing_signature_headers" }, { status: 401 });
  }

  const ts = Number(tsHeader);
  if (!Number.isFinite(ts)) {
    return NextResponse.json({ ok: false, error: "invalid_timestamp" }, { status: 400 });
  }

  const now = Date.now();
  if (Math.abs(now - ts) > TS_WINDOW_MS) {
    return NextResponse.json({ ok: false, error: "timestamp_out_of_window" }, { status: 401 });
  }

  let json: unknown;
  try { json = JSON.parse(rawBody); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = EventEnvelope.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_schema", details: parsed.error.flatten() }, { status: 400 });
  }

  const event = parsed.data;
  const supabase = supabaseServer();

  // Load tenant secret
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .select("id, webhook_secret")
    .eq("id", event.tenant_id)
    .single();

  if (tErr || !tenant) return NextResponse.json({ ok: false, error: "unknown_tenant" }, { status: 404 });

  // Deterministic signature over a canonical JSON representation.
  // This avoids brittle coupling to JSON whitespace / key ordering.
  const canonical = stableStringify(event);
  const expected = hmacHex(tenant.webhook_secret, `${ts}.${canonical}`);
  if (!timingSafeEqualHex(expected, sigHeader)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  // Best-effort lead upsert (match by email/phone)
  let lead_id: string | null = null;
  if (event.lead?.match) {
    const match = event.lead.match;
    const email = match.email || null;
    const phone = match.phone || null;

    if (email) {
      const { data } = await supabase.from("leads").select("id").eq("tenant_id", event.tenant_id).eq("email", email).maybeSingle();
      lead_id = data?.id ?? null;
    } else if (phone) {
      const { data } = await supabase.from("leads").select("id").eq("tenant_id", event.tenant_id).eq("phone", phone).maybeSingle();
      lead_id = data?.id ?? null;
    }

    if (!lead_id) {
      const { data: created } = await supabase
        .from("leads")
        .insert({
          tenant_id: event.tenant_id,
          name: event.lead.name ?? null,
          company: event.lead.company ?? null,
          email,
          phone,
          status: "NEW",
          agent_id: event.agent_id ?? null,
        })
        .select("id")
        .single();
      lead_id = created?.id ?? null;
    }
  }

  const { error: insErr } = await supabase.from("events").insert({
    tenant_id: event.tenant_id,
    occurred_at: event.occurred_at,
    event_type: event.event_type,
    source: event.source,
    channel: event.channel ?? null,
    idempotency_key: event.idempotency_key,
    lead_id,
    campaign_id: event.campaign_id ?? null,
    product_service_id: event.product_service_id ?? null,
    agent_id: event.agent_id ?? null,
    payload: event.payload,
  });

  if (insErr) {
    const msg = String(insErr.message || insErr);
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ ok: true, deduped: true });
    }
    return NextResponse.json({ ok: false, error: "db_error", details: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
