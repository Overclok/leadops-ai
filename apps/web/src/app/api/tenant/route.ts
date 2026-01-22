import { NextResponse } from "next/server";
import { getOrCreateTenant } from "@/lib/tenant";

export async function GET() {
  const tenant = await getOrCreateTenant();
  return NextResponse.json({ id: tenant.id, name: tenant.name, webhook_secret: tenant.webhook_secret });
}
