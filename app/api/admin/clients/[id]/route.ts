import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { CLIENT_STATUSES } from "@/lib/clients";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { name?: unknown; email?: unknown; company?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const update: Record<string, string> = {};

  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.email === "string" && body.email.trim()) update.email = body.email.trim();
  if (typeof body.company === "string") update.company = body.company.trim();
  if (typeof body.status === "string") {
    if (!CLIENT_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    update.status = body.status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("clients").update(update).eq("id", params.id);

  if (error) {
    console.error("admin clients update failed", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("clients").delete().eq("id", params.id);

  if (error) {
    console.error("admin clients delete failed", error);
    return NextResponse.json({ ok: false, error: "Failed to delete the client." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
