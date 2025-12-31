import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const clean = (s: string) => String(s ?? "").trim().slice(0, 5000);

async function readBody(request: Request): Promise<Record<string, any>> {
  const ct = request.headers.get("content-type") || "";

  // JSON
  if (ct.includes("application/json")) {
    return await request.json();
  }

  // x-www-form-urlencoded (curl, forms simples)
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }

  // multipart/form-data (formularios con archivos)
  if (ct.includes("multipart/form-data")) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }

  return {};
}


export const GET: APIRoute = async () => {
  return new Response("Method Not Allowed", { status: 405 });
};

export const POST: APIRoute = async ({ request }) => {
    console.log("METHOD:", request.method);
console.log("CT:", request.headers.get("content-type"));
console.log("CL:", request.headers.get("content-length"));

  const data = await readBody(request);

  console.log("DATA:", data);

  // Honeypot
  const company = clean(data.company);
  if (company) return new Response("OK", { status: 200 });

  const name = clean(data.name);
  const email = clean(data.email);
  const phone = clean(data.phone);
  const message = clean(data.message);
  const type = clean(data.type || "otro");


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
