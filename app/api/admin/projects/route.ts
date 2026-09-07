import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { name?: unknown; clientId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const clientId = typeof body.clientId === "string" ? body.clientId : "";

  if (!name || !clientId) {
    return NextResponse.json({ ok: false, error: "Project name and client are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("projects")
    .insert({ name, client_id: clientId, status: "active" })
    .select("id")
    .single();

  if (error) {
    console.error("admin projects create failed", error);
    return NextResponse.json({ ok: false, error: "Failed to create the project." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
