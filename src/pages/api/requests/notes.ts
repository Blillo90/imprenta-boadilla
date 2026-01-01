import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { assertIsAdmin } from "../../../lib/adminAuth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const token = cookies.get("sb_access_token")?.value;
  if (!token) return redirect("/admin/login");

  const auth = await assertIsAdmin(token);
  if (!auth.ok) return new Response("Forbidden", { status: 403 });

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const notes = String(form.get("notes") || "").slice(0, 5000);

  if (!id) return new Response("Bad Request", { status: 400 });

  const { error } = await supabaseAdmin.from("requests").update({ notes }).eq("id", id);
  if (error) return new Response("Error updating", { status: 500 });

  return new Response("OK", { status: 200 });
};
