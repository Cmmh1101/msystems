"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/caseStudies";

export default function CaseStudiesTable({ initialCaseStudies }: { initialCaseStudies: CaseStudy[] }) {
  const [caseStudies, setCaseStudies] = useState(initialCaseStudies);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    setDeletingId(id);
    const res = await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setCaseStudies((prev) => prev.filter((c) => c.id !== id));
    } else {
      window.alert("Failed to delete the case study. Please try again.");
    }
  }

  if (caseStudies.length === 0) {
    return (
      <div className="admin-table-wrap">
        <div className="admin-empty">No case studies yet — click &ldquo;New case study&rdquo; to write your first one.</div>
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
            <th>Languages</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {caseStudies.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td className="muted">/results/{c.slug}</td>
              <td>
                <span className={`admin-badge ${c.published ? "published" : "draft"}`}>{c.published ? "Published" : "Draft"}</span>
              </td>
              <td>
                <span className="admin-lang-badge">EN</span>
                <span className={`admin-lang-badge ${c.title_es || c.details_es ? "has-es" : "muted"}`}>ES</span>
              </td>
              <td className="muted">{new Date(c.updated_at).toLocaleDateString()}</td>
              <td>
                <div className="admin-row-actions">
                  <a href={`/admin/case-studies/${c.id}/edit`} className="admin-link-btn">
                    Edit
                  </a>
                  <button
                    type="button"
                    className="admin-link-btn admin-link-danger"
                    onClick={() => handleDelete(c.id, c.title)}
                    disabled={deletingId === c.id}
                  >
                    {deletingId === c.id ? "Deleting…" : "Delete"}
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
