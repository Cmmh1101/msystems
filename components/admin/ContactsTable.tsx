"use client";

import { useMemo, useState } from "react";

export interface Contact {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  source: string;
  status: string;
  notes: string | null;
  subscribed: boolean;
  newsletter_opt_in: boolean;
  tags: string[] | null;
}

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

async function patchContact(id: string, update: Partial<Pick<Contact, "status" | "notes">>) {
  const res = await fetch(`/api/admin/contacts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return res.ok;
}

export default function ContactsTable({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const sources = useMemo(() => Array.from(new Set(contacts.map((c) => c.source))), [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (q && !`${c.name} ${c.email} ${c.company ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [contacts, search, statusFilter, sourceFilter]);

  function updateLocal(id: string, patch: Partial<Contact>) {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function handleStatusChange(id: string, status: string) {
    updateLocal(id, { status });
    setSavingId(id);
    const ok = await patchContact(id, { status });
    setSavingId(null);
    if (!ok) console.error("Failed to save status for", id);
  }

  async function handleNotesBlur(id: string, notes: string, original: string | null) {
    if (notes === (original ?? "")) return;
    setSavingId(id);
    const ok = await patchContact(id, { notes });
    setSavingId(null);
    if (ok) updateLocal(id, { notes });
    else console.error("Failed to save notes for", id);
  }

  return (
    <>
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-empty">No contacts match these filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>Subscribed</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td className="muted">{c.company || "—"}</td>
                  <td className="muted">{c.source}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{c.subscribed ? "Yes" : "No"}</td>
                  <td>
                    <textarea
                      className="admin-notes-input"
                      rows={2}
                      defaultValue={c.notes ?? ""}
                      onBlur={(e) => handleNotesBlur(c.id, e.target.value, c.notes)}
                      placeholder="Add a note…"
                    />
                    {savingId === c.id && <span className="admin-save-hint">Saving…</span>}
                  </td>
                  <td>
                    <a
                      className="admin-link-btn"
                      href={`/admin/clients/new?contactId=${c.id}&name=${encodeURIComponent(c.name)}&email=${encodeURIComponent(c.email)}&company=${encodeURIComponent(c.company ?? "")}`}
                    >
                      Convert to client
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
