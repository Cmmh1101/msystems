"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { slugify, type Post } from "@/lib/posts";

export default function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const isEditing = !!post;

  const [titleEn, setTitleEn] = useState(post?.title ?? "");
  const [titleEs, setTitleEs] = useState(post?.title_es ?? "");
  const [excerptEn, setExcerptEn] = useState(post?.excerpt ?? "");
  const [excerptEs, setExcerptEs] = useState(post?.excerpt_es ?? "");
  const [contentEn, setContentEn] = useState(post?.content ?? "");
  const [contentEs, setContentEs] = useState(post?.content_es ?? "");
  const [contentLang, setContentLang] = useState<"en" | "es">("en");

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [published, setPublished] = useState(post?.published ?? false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url ?? "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featured_image_alt ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    const previousUrl = featuredImageUrl;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setUploadError(json.error || "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setFeaturedImageUrl(json.url);

      if (previousUrl) {
        fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousUrl }),
        }).catch(() => {});
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    if (featuredImageUrl) {
      fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: featuredImageUrl }),
      }).catch(() => {});
    }
    setFeaturedImageUrl("");
    setFeaturedImageAlt("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      title: titleEn,
      titleEs,
      slug: slugify(slug),
      excerpt: excerptEn,
      excerptEs,
      content: contentEn,
      contentEs,
      published,
      featuredImageUrl,
      featuredImageAlt,
    };
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

  const title = contentLang === "en" ? titleEn : titleEs;
  const excerpt = contentLang === "en" ? excerptEn : excerptEs;
  const content = contentLang === "en" ? contentEn : contentEs;
  const setTitle = contentLang === "en" ? setTitleEn : setTitleEs;
  const setExcerpt = contentLang === "en" ? setExcerptEn : setExcerptEs;
  const setContent = contentLang === "en" ? setContentEn : setContentEs;

  return (
    <form onSubmit={handleSubmit} className="admin-editor">
      <div className="admin-lang-tabs">
        <button type="button" className={contentLang === "en" ? "active" : ""} onClick={() => setContentLang("en")}>
          English
        </button>
        <button type="button" className={contentLang === "es" ? "active" : ""} onClick={() => setContentLang("es")}>
          Español {titleEs || contentEs ? "" : "(empty — falls back to English)"}
        </button>
      </div>

      <div className="form-row form-row-light">
        <label htmlFor="title">Title{contentLang === "es" ? " (Español)" : ""}</label>
        <input
          id="title"
          value={title}
          onChange={(e) => (contentLang === "en" ? handleTitleEnChange(e.target.value) : setTitle(e.target.value))}
          required={contentLang === "en"}
        />
      </div>

      {contentLang === "en" && (
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
          <p className="admin-save-hint">/blog/{slugify(slug) || "…"} (same URL for both languages)</p>
        </div>
      )}

      <div className="form-row form-row-light">
        <label htmlFor="excerpt">Excerpt (optional){contentLang === "es" ? " (Español)" : ""}</label>
        <textarea
          id="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Shown on the /blog list — one or two sentences."
        />
      </div>

      {contentLang === "en" && (
        <div className="form-row form-row-light">
          <label>Featured image (optional)</label>
          {featuredImageUrl ? (
            <div className="admin-image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImageUrl} alt={featuredImageAlt || ""} />
              <div className="admin-image-preview-actions">
                <label htmlFor="featured-image-input" className="admin-link-btn">
                  Replace
                </label>
                <button type="button" className="admin-link-btn admin-link-danger" onClick={handleRemoveImage}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label htmlFor="featured-image-input" className="admin-image-upload-btn">
              {uploading ? "Uploading…" : "Upload an image"}
            </label>
          )}
          <input
            id="featured-image-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleImageSelect}
            disabled={uploading}
            hidden
          />
          {uploadError && <p className="form-error">{uploadError}</p>}
          {featuredImageUrl && (
            <input
              className="admin-alt-input"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              placeholder="Alt text (describes the image for screen readers and SEO)"
            />
          )}
        </div>
      )}

      <div className="form-row form-row-light">
        <label>Content (Markdown){contentLang === "es" ? " (Español)" : ""}</label>
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
            required={contentLang === "en"}
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
