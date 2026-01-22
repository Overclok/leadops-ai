/**
 * Tenant Resolution Library
 * Implements strict 1-user-per-tenant model with deterministic resolution
 * and runtime cross-tenant access prevention.
 */

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "./supabase";

export type Tenant = {
  id: string;
  owner_clerk_user_id: string;
  name: string;
  webhook_secret: string;
  created_at: string;
};

/**
 * Core tenant resolution function.
 * - Enforces 1 Clerk user = 1 tenant
 * - Auto-creates tenant on first login
 * - Fails closed: throws if unauthenticated
 */
export async function getOrCreateTenant(): Promise<Tenant> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("TENANT_RESOLUTION_FAILED: User not authenticated");
  }

  const supabase = supabaseServer();

  // 1. Try to fetch existing tenant
  const { data: existing, error: fetchError } = await supabase
    .from("tenants")
    .select("*")
    .eq("owner_clerk_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`TENANT_RESOLUTION_FAILED: DB error: ${fetchError.message}`);
  }

  if (existing) {
    return existing as Tenant;
  }

  // 2. Create new tenant (first login)
  const { data: created, error: createError } = await supabase
    .from("tenants")
    .insert({
      owner_clerk_user_id: userId,
      name: `Tenant for ${userId.substring(0, 8)}`
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(`TENANT_CREATION_FAILED: ${createError.message}`);
  }

  if (!created) {
    throw new Error("TENANT_CREATION_FAILED: No data returned");
  }

  return created as Tenant;
}

/**
 * Get only the tenant_id for the current user.
 * Useful for queries that only need the tenant identifier.
 */
export async function getTenantId(): Promise<string> {
  const tenant = await getOrCreateTenant();
  return tenant.id;
}

/**
 * Runtime assertion: verifies that a given resource belongs to the current tenant.
 * Throws if tenant_id mismatch (prevents cross-tenant access).
 * 
 * @param resourceTenantId - The tenant_id from the resource being accessed
 * @throws Error if mismatch detected
 */
export async function assertTenantOwnership(resourceTenantId: string): Promise<void> {
  const currentTenantId = await getTenantId();

  if (resourceTenantId !== currentTenantId) {
    throw new Error(
      `CROSS_TENANT_ACCESS_DENIED: Resource belongs to ${resourceTenantId}, ` +
      `but current user owns ${currentTenantId}`
    );
  }
}

/**
 * Helper to extract Clerk user ID without full auth check.
 * Use only for logging or non-critical paths.
 */
export async function getCurrentClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
