import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { COLUMN_STATUSES } from "@/lib/tickets";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { title?: unknown; description?: unknown; projectId?: unknown; columnStatus?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const columnStatus =
    typeof body.columnStatus === "string" && COLUMN_STATUSES.includes(body.columnStatus as (typeof COLUMN_STATUSES)[number])
      ? body.columnStatus
      : "to_do";

  if (!title || !projectId) {
    return NextResponse.json({ ok: false, error: "Title and project are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("tickets")
    .insert({
      title,
      description: description || null,
      project_id: projectId,
      column_status: columnStatus,
      created_by_role: "admin",
    })
    .select("id")
    .single();

  if (error) {
    console.error("admin tickets create failed", error);
    return NextResponse.json({ ok: false, error: "Failed to create the ticket." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
