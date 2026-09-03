import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <>
      <h1>New post</h1>
      <p className="admin-page-sub">Save as a draft, or publish immediately.</p>
      <PostEditor />
    </>
  );
}
