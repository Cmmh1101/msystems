"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm({
  contactId,
  initialName,
  initialEmail,
  initialCompany,
}: {
  contactId?: string;
  initialName?: string;
  initialEmail?: string;
  initialCompany?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [company, setCompany] = useState(initialCompany ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, contactId }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/admin/clients/${json.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-editor">
      <div className="form-row form-row-light">
        <label htmlFor="name">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-row form-row-light">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-row form-row-light">
        <label htmlFor="company">Company (optional)</label>
        <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <div className="admin-editor-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create client"}
        </button>
        <a href="/admin/clients" className="admin-link-btn">
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
