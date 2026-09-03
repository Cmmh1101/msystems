"use client";

import { useState } from "react";
import type { Post } from "@/lib/posts";

export default function PostsTable({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    setDeletingId(id);
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      window.alert("Failed to delete the post. Please try again.");
    }
  }

  if (posts.length === 0) {
    return (
      <div className="admin-table-wrap">
        <div className="admin-empty">No posts yet — click &ldquo;New post&rdquo; to write your first one.</div>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td className="muted">/blog/{p.slug}</td>
              <td>
                <span className={`admin-badge ${p.published ? "published" : "draft"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="muted">{new Date(p.updated_at).toLocaleDateString()}</td>
              <td>
                <div className="admin-row-actions">
                  <a href={`/admin/blog/${p.id}/edit`} className="admin-link-btn">
                    Edit
                  </a>
                  <button
                    type="button"
                    className="admin-link-btn admin-link-danger"
                    onClick={() => handleDelete(p.id, p.title)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
