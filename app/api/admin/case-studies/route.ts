import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/posts";

export async function POST(req: NextRequest) {
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

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("case_studies")
    .insert({
      title,
      title_es: titleEs || null,
      slug,
      summary,
      summary_es: summaryEs || null,
      details,
      details_es: detailsEs || null,
      published,
      published_at: published ? new Date().toISOString() : null,
      client_id: clientId,
      project_id: projectId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("admin case studies create failed", error);
    const message = error.code === "23505" ? "That slug is already in use." : "Failed to create the case study.";
    return NextResponse.json({ ok: false, error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
