import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  if (!email || !email.includes("@")) return new Response("Email inválido", { status: 400 });

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert({ email, source: "web" }, { onConflict: "email" });

  if (error) return new Response("Error", { status: 500 });

  // puedes redirigir a /gracias si prefieres
  return new Response("OK", { status: 200 });
};
