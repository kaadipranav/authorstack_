import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";

export type BookRecord = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  format: string;
  status: string;
  launch_date?: string | null;
  cover_path?: string | null;
  platforms: string[];
  created_at: string;
  updated_at: string;
};

export async function listBooks(): Promise<BookRecord[]> {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function getBook(bookId: string): Promise<BookRecord | null> {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ?? null;
}

