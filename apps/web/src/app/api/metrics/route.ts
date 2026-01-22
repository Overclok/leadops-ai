import { NextRequest, NextResponse } from "next/server";
import { getOrCreateTenant } from "@/lib/tenant";
import { supabaseServer } from "@/lib/supabase";

const PERIODS = new Set(["daily","weekly","monthly"]);

function periodToStart(period: string): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "daily") return d.toISOString();
  if (period === "weekly") {
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - (day - 1));
    return d.toISOString();
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function GET(req: NextRequest) {
  const tenant = await getOrCreateTenant();
  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "weekly";
  if (!PERIODS.has(period)) return NextResponse.json({ ok:false, error:"invalid_period" }, { status: 400 });

  const since = periodToStart(period);
  const supabase = supabaseServer();

  const { data: rows, error } = await supabase
    .from("events")
    .select("event_type")
    .eq("tenant_id", tenant.id)
    .gte("occurred_at", since);

  if (error) return NextResponse.json({ ok:false, error:"db_error", details:String(error.message) }, { status: 500 });

  const agg: Record<string, number> = {};
  for (const r of rows || []) agg[r.event_type] = (agg[r.event_type] || 0) + 1;

  return NextResponse.json({
    ok: true,
    period,
    since,
    kpis: {
      email_sent: agg["EMAIL_SENT"] || 0,
      email_replied: agg["EMAIL_REPLIED"] || 0,
      email_no_reply: agg["EMAIL_NO_REPLY"] || 0,
      calls_outbound: agg["CALL_OUTBOUND_STARTED"] || 0,
      calls_inbound: agg["CALL_INBOUND_RECEIVED"] || 0,
      meetings_total: (agg["MEETING_BOOKED_EMAIL"]||0) + (agg["MEETING_BOOKED_PHONE"]||0),
      deals_won: agg["DEAL_WON"] || 0,
      deals_lost: agg["DEAL_LOST"] || 0,
    }
  });
}
