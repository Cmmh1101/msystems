"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { slugify } from "@/lib/posts";
import type { CaseStudy } from "@/lib/caseStudies";
import type { Client, Project } from "@/lib/clients";

export default function CaseStudyEditor({
  caseStudy,
  clients,
  projects,
}: {
  caseStudy?: CaseStudy;
  clients: Pick<Client, "id" | "name">[];
  projects: Pick<Project, "id" | "name" | "client_id">[];
}) {
  const router = useRouter();
  const isEditing = !!caseStudy;

  const [titleEn, setTitleEn] = useState(caseStudy?.title ?? "");
  const [titleEs, setTitleEs] = useState(caseStudy?.title_es ?? "");
  const [summaryEn, setSummaryEn] = useState(caseStudy?.summary ?? "");
  const [summaryEs, setSummaryEs] = useState(caseStudy?.summary_es ?? "");
  const [detailsEn, setDetailsEn] = useState(caseStudy?.details ?? "");
  const [detailsEs, setDetailsEs] = useState(caseStudy?.details_es ?? "");
  const [contentLang, setContentLang] = useState<"en" | "es">("en");

  const [slug, setSlug] = useState(caseStudy?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [published, setPublished] = useState(caseStudy?.published ?? false);
  const [clientId, setClientId] = useState(caseStudy?.client_id ?? "");
  const [projectId, setProjectId] = useState(caseStudy?.project_id ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === clientId), [projects, clientId]);

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      title: titleEn,
      titleEs,
      slug: slugify(slug),
      summary: summaryEn,
      summaryEs,
      details: detailsEn,
      detailsEs,
      published,
      clientId: clientId || null,
      projectId: projectId || null,
    };
    const url = isEditing ? `/api/admin/case-studies/${caseStudy!.id}` : "/api/admin/case-studies";
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

      router.push("/admin/case-studies");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const title = contentLang === "en" ? titleEn : titleEs;
  const summary = contentLang === "en" ? summaryEn : summaryEs;
  const details = contentLang === "en" ? detailsEn : detailsEs;
  const setTitle = contentLang === "en" ? handleTitleEnChange : setTitleEs;
  const setSummary = contentLang === "en" ? setSummaryEn : setSummaryEs;
  const setDetails = contentLang === "en" ? setDetailsEn : setDetailsEs;

  return (
    <form onSubmit={handleSubmit} className="admin-editor">
      <div className="admin-lang-tabs">
        <button type="button" className={contentLang === "en" ? "active" : ""} onClick={() => setContentLang("en")}>
          English
        </button>
        <button type="button" className={contentLang === "es" ? "active" : ""} onClick={() => setContentLang("es")}>
          Español {titleEs || detailsEs ? "" : "(empty — falls back to English)"}
        </button>
      </div>

      <div className="form-row form-row-light">
        <label htmlFor="title">Title{contentLang === "es" ? " (Español)" : ""}</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required={contentLang === "en"} />
      </div>

      {contentLang === "en" && (
        <>
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
            <p className="admin-save-hint">/results/{slugify(slug) || "…"} (same URL for both languages)</p>
          </div>

          <div className="form-row form-row-light">
            <label htmlFor="cs-client">Client (optional — leave blank to anonymize)</label>
            <select
              id="cs-client"
              className="admin-status-select"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
              }}
            >
              <option value="">— None —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {clientId && (
            <div className="form-row form-row-light">
              <label htmlFor="cs-project">Project (optional)</label>
              <select id="cs-project" className="admin-status-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">— None —</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      <div className="form-row form-row-light">
        <label htmlFor="summary">Summary{contentLang === "es" ? " (Español)" : ""}</label>
        <textarea
          id="summary"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Shown on the /results list and homepage teaser — one or two sentences."
          required={contentLang === "en"}
        />
      </div>

      <div className="form-row form-row-light">
        <label>Details (Markdown){contentLang === "es" ? " (Español)" : ""}</label>
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
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required={contentLang === "en"}
          />
        ) : (
          <div className="admin-editor-preview">
            {details ? <ReactMarkdown>{details}</ReactMarkdown> : <p className="muted">Nothing to preview yet.</p>}
          </div>
        )}
      </div>

      <label className="diagnostic-checkbox">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published — visible on the public /results
      </label>

      <div className="admin-editor-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : isEditing ? "Save changes" : "Create case study"}
        </button>
        <a href="/admin/case-studies" className="admin-link-btn">
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
