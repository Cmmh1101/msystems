import { NextRequest, NextResponse } from "next/server";
import { requireClient } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const client = await requireClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { projectId?: unknown; title?: unknown; description?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!projectId || !title) {
    return NextResponse.json({ ok: false, error: "Title and project are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: project } = await admin.from("projects").select("id,client_id").eq("id", projectId).single();
  if (!project || project.client_id !== client.id) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("tickets")
    .insert({
      project_id: projectId,
      title,
      description: description || null,
      column_status: "client_request",
      created_by_role: "client",
      created_by_client_id: client.id,
      billing_status: "n/a",
    })
    .select("id")
    .single();

  if (error) {
    console.error("portal tickets create failed", error);
    return NextResponse.json({ ok: false, error: "Failed to send your request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
