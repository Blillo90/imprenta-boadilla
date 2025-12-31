import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabaseClient";

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return Response.redirect(new URL("/admin/login?e=login", request.url), 303);
  }

  cookies.set("sb_access_token", data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.redirect(new URL("/admin", request.url), 303);
};
