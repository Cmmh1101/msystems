import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/posts";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { title?: unknown; slug?: unknown; excerpt?: unknown; content?: unknown; published?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await admin
    .from("posts")
    .select("published")
    .eq("id", params.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const published = body.published === true;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);

  if (!title || !content || !slug) {
    return NextResponse.json({ ok: false, error: "Title, slug, and content are required." }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    title,
    slug,
    excerpt: excerpt || null,
    content,
    published,
    updated_at: new Date().toISOString(),
  };

  if (published && !existing.published) {
    update.published_at = new Date().toISOString();
  }
  if (!published) {
    update.published_at = null;
  }

  const { error } = await admin.from("posts").update(update).eq("id", params.id);

  if (error) {
    console.error("admin posts update failed", error);
    const message = error.code === "23505" ? "That slug is already in use." : "Failed to update the post.";
    return NextResponse.json({ ok: false, error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("posts").delete().eq("id", params.id);

  if (error) {
    console.error("admin posts delete failed", error);
    return NextResponse.json({ ok: false, error: "Failed to delete the post." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
