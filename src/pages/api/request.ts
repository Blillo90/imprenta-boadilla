import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const clean = (s: string) => s.trim().slice(0, 5000);

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // Honeypot
  const company = String(form.get("company") || "");
  if (company) return new Response("OK", { status: 200 });

  const name = clean(String(form.get("name") || ""));
  const email = clean(String(form.get("email") || ""));
  const phone = clean(String(form.get("phone") || ""));
  const message = clean(String(form.get("message") || ""));
  const type = clean(String(form.get("type") || "otro"));

  const captcha = clean(String(form.get("captcha") || ""));
  if (captcha !== "9") return new Response("Captcha incorrecto", { status: 400 });

  if (!name || !email || !message) return new Response("Faltan campos", { status: 400 });

  const { error } = await supabaseAdmin.from("requests").insert({
    name,
    email,
    phone,
    message,
    type,
    source: "web",
  });

  if (error) return new Response("Error guardando", { status: 500 });

  return Response.redirect(new URL("/gracias", request.url), 303);
};
