import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { name?: unknown; email?: unknown; company?: unknown; contactId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const contactId = typeof body.contactId === "string" && body.contactId ? body.contactId : null;

  if (!name || !email) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  let locale = "en";
  if (contactId) {
    const { data: sourceContact } = await admin.from("contacts").select("locale").eq("id", contactId).single();
    if (sourceContact?.locale === "es") locale = "es";
  }

  const { data, error } = await admin
    .from("clients")
    .insert({
      name,
      email,
      company: company || null,
      contact_id: contactId,
      status: "active",
      locale,
    })
    .select("id")
    .single();

  if (error) {
    console.error("admin clients create failed", error);
    return NextResponse.json({ ok: false, error: "Failed to create the client." }, { status: 500 });
  }

  if (contactId) {
    const { error: contactError } = await admin.from("contacts").update({ status: "won" }).eq("id", contactId);
    if (contactError) {
      console.error("admin clients: failed to mark source contact as won", contactError);
    }
  }

  return NextResponse.json({ ok: true, id: data.id });
}
