"use client";

import { useMemo, useState } from "react";
import type { Client } from "@/lib/clients";
import { CLIENT_STATUSES } from "@/lib/clients";

type ClientRow = Client & { projectCount: number; requestCount: number; todoCount: number; pendingBillingCount: number };

export default function ClientsTable({ initialClients }: { initialClients: ClientRow[] }) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !`${c.name} ${c.email} ${c.company ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [clients, search, statusFilter]);

  async function handleStatusChange(id: string, status: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setSavingId(id);
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSavingId(null);
    if (!res.ok) console.error("Failed to save status for", id);
  }

  if (clients.length === 0) {
    return (
      <div className="admin-table-wrap">
        <div className="admin-empty">
          No clients yet — convert a contact from the Contacts page, or click &ldquo;New client&rdquo;.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-filters">
        <input type="text" placeholder="Search name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-empty">No clients match these filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Projects</th>
                <th title="Client requests awaiting your review">Requests</th>
                <th title="Tickets in To Do">To Do</th>
                <th title="Awaiting a quote or payment">Pending</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="muted">{c.email}</td>
                  <td className="muted">{c.company || "—"}</td>
                  <td className="muted">{c.projectCount}</td>
                  <td>{c.requestCount > 0 ? <span className="admin-count-badge attention">{c.requestCount}</span> : <span className="muted">0</span>}</td>
                  <td className="muted">{c.todoCount}</td>
                  <td>{c.pendingBillingCount > 0 ? <span className="admin-count-badge attention">{c.pendingBillingCount}</span> : <span className="muted">0</span>}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      {CLIENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {savingId === c.id && <span className="admin-save-hint">Saving…</span>}
                  </td>
                  <td>
                    <a className="admin-link-btn" href={`/admin/clients/${c.id}`}>
                      View
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
