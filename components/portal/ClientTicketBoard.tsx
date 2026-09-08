"use client";

import { FormEvent, useState } from "react";
import type { Project } from "@/lib/clients";
import { COLUMN_LABELS, type Ticket } from "@/lib/tickets";

function billingNote(ticket: Ticket): string | null {
  if (ticket.billing_status === "needs_quote") return "Awaiting a quote from us";
  if (ticket.billing_status === "paid") return "Paid";
  return null;
}

export default function ClientTicketBoard({ project, initialTickets }: { project: Project; initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, title: title.trim(), description: description.trim() }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to send your request.");
        setSubmitting(false);
        return;
      }

      setTickets((prev) => [
        {
          id: json.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project_id: project.id,
          title: title.trim(),
          description: description.trim() || null,
          column_status: "client_request",
          created_by_role: "client",
          created_by_client_id: null,
          billing_status: "n/a",
          stripe_payment_link: null,
          is_milestone: false,
          published_at: null,
        },
        ...prev,
      ]);
      setTitle("");
      setDescription("");
    } catch {
      setError("Failed to send your request.");
    } finally {
      setSubmitting(false);
    }
  }

  const sorted = [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <>
      <div className="portal-page-head">
        <div>
          <h1>{project.name}</h1>
          <span className="portal-project-status">{project.status}</span>
        </div>
        <a href="/portal" className="portal-link-btn">
          ← All projects
        </a>
      </div>

      <form onSubmit={handleSubmit} className="portal-card portal-new-request-form">
        <h2>New request</h2>
        <div className="form-row form-row-light">
          <label htmlFor="t-title">What do you need?</label>
          <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-row form-row-light">
          <label htmlFor="t-desc">Details (optional)</label>
          <textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending…" : "Send request"}
        </button>
        {error && (
          <p className="form-status error" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="portal-tickets-list">
        {sorted.length === 0 ? (
          <div className="portal-empty">No requests yet — send your first one above.</div>
        ) : (
          sorted.map((t) => (
            <div key={t.id} className="portal-ticket-card">
              <div className="portal-ticket-head">
                <span className="portal-ticket-title">{t.title}</span>
                <span className={`portal-status-pill portal-status-${t.column_status}`}>{COLUMN_LABELS[t.column_status]}</span>
              </div>
              {t.description && <p className="portal-ticket-desc">{t.description}</p>}
              {(t.is_milestone || billingNote(t) || (t.billing_status === "quoted" && t.stripe_payment_link)) && (
                <div className="portal-ticket-meta">
                  {t.is_milestone && <span className="portal-milestone-badge">★ Milestone</span>}
                  {billingNote(t) && <span className="portal-billing-note">{billingNote(t)}</span>}
                  {t.billing_status === "quoted" && t.stripe_payment_link && (
                    <a href={t.stripe_payment_link} target="_blank" rel="noreferrer" className="btn btn-primary portal-pay-btn">
                      Pay now
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
