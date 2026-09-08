import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/posts";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: {
    title?: unknown;
    titleEs?: unknown;
    slug?: unknown;
    summary?: unknown;
    summaryEs?: unknown;
    details?: unknown;
    detailsEs?: unknown;
    published?: unknown;
    clientId?: unknown;
    projectId?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await admin
    .from("case_studies")
    .select("published")
    .eq("id", params.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ ok: false, error: "Case study not found." }, { status: 404 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const titleEs = typeof body.titleEs === "string" ? body.titleEs.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const summaryEs = typeof body.summaryEs === "string" ? body.summaryEs.trim() : "";
  const details = typeof body.details === "string" ? body.details : "";
  const detailsEs = typeof body.detailsEs === "string" ? body.detailsEs : "";
  const published = body.published === true;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
  const clientId = typeof body.clientId === "string" && body.clientId ? body.clientId : null;
  const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;

  if (!title || !summary || !details || !slug) {
    return NextResponse.json({ ok: false, error: "Title, slug, summary, and details are required." }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    title,
    title_es: titleEs || null,
    slug,
    summary,
    summary_es: summaryEs || null,
    details,
    details_es: detailsEs || null,
    published,
    client_id: clientId,
    project_id: projectId,
    updated_at: new Date().toISOString(),
  };

  if (published && !existing.published) {
    update.published_at = new Date().toISOString();
  }
  if (!published) {
    update.published_at = null;
  }

  const { error } = await admin.from("case_studies").update(update).eq("id", params.id);

  if (error) {
    console.error("admin case studies update failed", error);
    const message = error.code === "23505" ? "That slug is already in use." : "Failed to update the case study.";
    return NextResponse.json({ ok: false, error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("case_studies").delete().eq("id", params.id);

  if (error) {
    console.error("admin case studies delete failed", error);
    return NextResponse.json({ ok: false, error: "Failed to delete the case study." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
