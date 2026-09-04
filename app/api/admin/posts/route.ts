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
    slug?: unknown;
    excerpt?: unknown;
    content?: unknown;
    published?: unknown;
    featuredImageUrl?: unknown;
    featuredImageAlt?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const published = body.published === true;
  const slug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title);
  const featuredImageUrl = typeof body.featuredImageUrl === "string" ? body.featuredImageUrl.trim() : "";
  const featuredImageAlt = typeof body.featuredImageAlt === "string" ? body.featuredImageAlt.trim() : "";

  if (!title || !content || !slug) {
    return NextResponse.json({ ok: false, error: "Title, slug, and content are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      published,
      published_at: published ? new Date().toISOString() : null,
      featured_image_url: featuredImageUrl || null,
      featured_image_alt: featuredImageAlt || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("admin posts create failed", error);
    const message = error.code === "23505" ? "That slug is already in use." : "Failed to create the post.";
    return NextResponse.json({ ok: false, error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
