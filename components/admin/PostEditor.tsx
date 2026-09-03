"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { slugify, type Post } from "@/lib/posts";

export default function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = { title, slug: slugify(slug), excerpt, content, published };
    const url = isEditing ? `/api/admin/posts/${post!.id}` : "/api/admin/posts";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-editor">
      <div className="form-row form-row-light">
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
      </div>

      <div className="form-row form-row-light">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
        />
        <p className="admin-save-hint">/blog/{slugify(slug) || "…"}</p>
      </div>

      <div className="form-row form-row-light">
        <label htmlFor="excerpt">Excerpt (optional)</label>
        <textarea
          id="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Shown on the /blog list — one or two sentences."
        />
      </div>

      <div className="form-row form-row-light">
        <label>Content (Markdown)</label>
        <div className="admin-editor-tabs">
          <button type="button" className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>
            Write
          </button>
          <button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
            Preview
          </button>
        </div>
        {tab === "write" ? (
          <textarea
            className="admin-editor-textarea"
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        ) : (
          <div className="admin-editor-preview">
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="muted">Nothing to preview yet.</p>}
          </div>
        )}
      </div>

      <label className="diagnostic-checkbox">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published — visible on the public /blog
      </label>

      <div className="admin-editor-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : isEditing ? "Save changes" : "Create post"}
        </button>
        <a href="/admin/blog" className="admin-link-btn">
          Cancel
        </a>
      </div>

      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
