import { createClient } from "@supabase/supabase-js";

export function getUserSupabaseWithToken(token: string) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function assertIsAdmin(token: string): Promise<{ ok: true; userId: string } | { ok: false }> {
  const supabase = getUserSupabaseWithToken(token);

  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return { ok: false };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !profile?.is_admin) return { ok: false };

  return { ok: true, userId };
}
