import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "./supabase";

export async function getOrCreateTenant() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthenticated");

  const supabase = supabaseServer();

  const { data: existing, error: e1 } = await supabase
    .from("tenants")
    .select("*")
    .eq("owner_clerk_user_id", userId)
    .maybeSingle();

  if (e1) throw e1;
  if (existing) return existing;

  const { data: created, error: e2 } = await supabase
    .from("tenants")
    .insert({ owner_clerk_user_id: userId, name: "Default Tenant" })
    .select("*")
    .single();

  if (e2) throw e2;
  return created;
}
