import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async (Astro) => {
  const { request, cookies, redirect } = Astro;

  try {
    const form = await request.formData();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return redirect("/admin/login?e=missing");
    }

    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return redirect("/admin/login?e=login");
    }

    // ✅ SET COOKIE (ANTES de redirect)
    cookies.set("sb_access_token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ✅ REDIRECT ASTRO (NO Response.redirect)
    return redirect("/admin");
  } catch (err) {
    console.error("LOGIN ERROR", err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
