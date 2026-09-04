import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PostEditor from "@/components/admin/PostEditor";
import type { Post } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,created_at,updated_at,title,slug,excerpt,content,published,published_at,featured_image_url,featured_image_alt,title_es,excerpt_es,content_es"
    )
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <>
      <h1>Edit post</h1>
      <p className="admin-page-sub">/blog/{data.slug}</p>
      <PostEditor post={data as Post} />
    </>
  );
}
