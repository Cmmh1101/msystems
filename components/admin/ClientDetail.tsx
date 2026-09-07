"use client";

import { FormEvent, useState } from "react";
import type { Client, Project } from "@/lib/clients";
import { CLIENT_STATUSES, PROJECT_STATUSES } from "@/lib/clients";

export default function ClientDetail({ client, initialProjects }: { client: Client; initialProjects: Project[] }) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [company, setCompany] = useState(client.company ?? "");
  const [status, setStatus] = useState(client.status);
  const [saving, setSaving] = useState(false);

  const [projects, setProjects] = useState(initialProjects);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  async function saveClientField(update: Record<string, string>) {
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    setSaving(false);
    if (!res.ok) console.error("Failed to save client field", update);
  }

  async function handleAddProject(e: FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setProjectError(null);
    setCreatingProject(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim(), clientId: client.id }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setProjectError(json.error || "Failed to create the project.");
        setCreatingProject(false);
        return;
      }

      setProjects((prev) => [{ id: json.id, created_at: new Date().toISOString(), client_id: client.id, name: newProjectName.trim(), status: "active" }, ...prev]);
      setNewProjectName("");
    } catch {
      setProjectError("Failed to create the project.");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleProjectStatusChange(id: string, newStatus: string) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) console.error("Failed to save project status for", id);
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>{client.name}</h1>
          <p className="admin-page-sub">Client since {new Date(client.created_at).toLocaleDateString()}</p>
        </div>
        <a href="/admin/clients" className="admin-link-btn">
          ← All clients
        </a>
      </div>

      <div className="admin-client-fields">
        <div className="form-row form-row-light">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveClientField({ name })} />
        </div>
        <div className="form-row form-row-light">
          <label htmlFor="c-email">Email</label>
          <input id="c-email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => saveClientField({ email })} />
        </div>
        <div className="form-row form-row-light">
          <label htmlFor="c-company">Company</label>
          <input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} onBlur={() => saveClientField({ company })} />
        </div>
        <div className="form-row form-row-light">
          <label htmlFor="c-status">Status</label>
          <select
            id="c-status"
            className="admin-status-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              saveClientField({ status: e.target.value });
            }}
          >
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {saving && <span className="admin-save-hint">Saving…</span>}
      </div>

      <h2 className="admin-section-heading" style={{ marginTop: "32px" }}>
        Projects
      </h2>

      <form onSubmit={handleAddProject} className="admin-inline-form">
        <input
          type="text"
          placeholder="New project name…"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={creatingProject}>
          {creatingProject ? "Adding…" : "Add project"}
        </button>
      </form>
      {projectError && <p className="form-error">{projectError}</p>}

      <div className="admin-table-wrap">
        {projects.length === 0 ? (
          <div className="admin-empty">No projects yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={p.status}
                      onChange={(e) => handleProjectStatusChange(p.id, e.target.value)}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <a className="admin-link-btn" href={`/admin/projects/${p.id}`}>
                      View board
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
