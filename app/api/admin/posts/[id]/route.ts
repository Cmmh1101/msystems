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
    excerpt?: unknown;
    excerptEs?: unknown;
    content?: unknown;
    contentEs?: unknown;
    published?: unknown;
    featuredImageUrl?: unknown;
    featuredImageAlt?: unknown;
  };
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
  const titleEs = typeof body.titleEs === "string" ? body.titleEs.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const contentEs = typeof body.contentEs === "string" ? body.contentEs : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const excerptEs = typeof body.excerptEs === "string" ? body.excerptEs.trim() : "";
  const published = body.published === true;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
  const featuredImageUrl = typeof body.featuredImageUrl === "string" ? body.featuredImageUrl.trim() : "";
  const featuredImageAlt = typeof body.featuredImageAlt === "string" ? body.featuredImageAlt.trim() : "";

  if (!title || !content || !slug) {
    return NextResponse.json({ ok: false, error: "Title, slug, and content are required." }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    title,
    title_es: titleEs || null,
    slug,
    excerpt: excerpt || null,
    excerpt_es: excerptEs || null,
    content,
    content_es: contentEs || null,
    published,
    featured_image_url: featuredImageUrl || null,
    featured_image_alt: featuredImageAlt || null,
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

  const { data: existing } = await admin.from("posts").select("featured_image_url").eq("id", params.id).single();

  const { error } = await admin.from("posts").delete().eq("id", params.id);

  if (!error && existing?.featured_image_url) {
    const marker = "/storage/v1/object/public/blog-images/";
    const idx = existing.featured_image_url.indexOf(marker);
    if (idx !== -1) {
      const path = existing.featured_image_url.slice(idx + marker.length);
      await admin.storage.from("blog-images").remove([path]);
    }
  }

  if (error) {
    console.error("admin posts delete failed", error);
    return NextResponse.json({ ok: false, error: "Failed to delete the post." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
