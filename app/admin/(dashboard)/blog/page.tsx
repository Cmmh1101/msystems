import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PostsTable from "@/components/admin/PostsTable";
import type { Post } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminBlogPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,created_at,updated_at,title,slug,excerpt,content,published,published_at,featured_image_url,featured_image_alt,title_es,excerpt_es,content_es"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("admin posts fetch failed", error);
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Blog</h1>
          <p className="admin-page-sub">Write in Markdown. Drafts stay hidden from the public /blog until published.</p>
        </div>
        <a href="/admin/blog/new" className="btn btn-primary">
          New post
        </a>
      </div>
      <PostsTable initialPosts={(data as Post[]) ?? []} />
    </>
  );
}
