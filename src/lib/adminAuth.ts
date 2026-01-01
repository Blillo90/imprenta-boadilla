import { createClient } from "@supabase/supabase-js";

export function getUserSupabaseWithToken(token: string) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function assertIsAdmin(token: string) {
  const supabase = getUserSupabaseWithToken(token);

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return { ok: false };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") return { ok: false };

  return { ok: true, userId: user.id };
}
