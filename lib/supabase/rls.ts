import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function verifyUserOwnership(
  userId: string,
  table: string,
  recordId: string,
  userIdColumn: string = "profile_id"
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", recordId)
    .eq(userIdColumn, userId)
    .single();

  if (error) {
    console.error(`[RLS] Ownership check failed for ${table}:`, error);
    return false;
  }

  return !!data;
}

export async function verifyUserHasAccess(
  userId: string,
  table: string,
  userIdColumn: string = "profile_id"
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq(userIdColumn, userId)
    .limit(1);

  if (error) {
    console.error(`[RLS] Access check failed for ${table}:`, error);
    return false;
  }

  return !!data;
}

export function enforceRLS(userId: string, recordUserId: string | null): void {
  if (!recordUserId || recordUserId !== userId) {
    throw new Error("Unauthorized: Access denied");
  }
}
