"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Project, Client } from "@/lib/clients";
import { COLUMN_STATUSES, COLUMN_LABELS, type Ticket } from "@/lib/tickets";

function BillingSection({
  ticket,
  onQuote,
}: {
  ticket: Ticket;
  onQuote: (id: string, amount: number, description: string) => Promise<boolean>;
}) {
  const [quoting, setQuoting] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ticket.billing_status === "paid") {
    return (
      <div className="kanban-card-billing">
        <span className="kanban-billing-badge paid">Paid</span>
      </div>
    );
  }

  if (ticket.billing_status === "quoted") {
    return (
      <div className="kanban-card-billing">
        <span className="kanban-billing-badge quoted">Awaiting payment</span>
        {ticket.stripe_payment_link && (
          <a href={ticket.stripe_payment_link} target="_blank" rel="noreferrer" className="admin-link-btn">
            Payment link
          </a>
        )}
      </div>
    );
  }

  if (!quoting) {
    return (
      <div className="kanban-card-billing">
        <button type="button" className="admin-link-btn" onClick={() => setQuoting(true)}>
          Quote a fee…
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const success = await onQuote(ticket.id, parsed, description.trim());
    setSubmitting(false);
    if (success) {
      setQuoting(false);
    } else {
      setError("Failed to create the payment link.");
    }
  }

  return (
    <form className="kanban-quote-form" onSubmit={handleSubmit}>
      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        autoFocus
      />
      <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="kanban-quote-form-actions">
        <button type="submit" className="admin-link-btn" disabled={submitting}>
          {submitting ? "Creating…" : "Send quote"}
        </button>
        <button type="button" className="admin-link-btn" onClick={() => setQuoting(false)} disabled={submitting}>
          Cancel
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

function TicketCard({
  ticket,
  onToggleMilestone,
  onDelete,
  onQuote,
}: {
  ticket: Ticket;
  onToggleMilestone: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
  onQuote: (id: string, amount: number, description: string) => Promise<boolean>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 10 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className={`kanban-card ${isDragging ? "dragging" : ""}`}>
      <div className="kanban-card-drag" {...listeners} {...attributes}>
        <div className="kanban-card-title">{ticket.title}</div>
        {ticket.description && <div className="kanban-card-desc">{ticket.description}</div>}
      </div>
      <BillingSection ticket={ticket} onQuote={onQuote} />
      <div className="kanban-card-footer">
        <label className="kanban-milestone-toggle">
          <input
            type="checkbox"
            checked={ticket.is_milestone}
            onChange={(e) => onToggleMilestone(ticket.id, e.target.checked)}
          />
          Milestone
        </label>
        <button type="button" className="admin-link-btn admin-link-danger" onClick={() => onDelete(ticket.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

function NewTicketInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="kanban-new-ticket"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue("");
      }}
    >
      <input
        type="text"
        placeholder="+ Add ticket…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

function Column({
  status,
  tickets,
  onAddTicket,
  onToggleMilestone,
  onDelete,
  onQuote,
}: {
  status: string;
  tickets: Ticket[];
  onAddTicket: (status: string, title: string) => void;
  onToggleMilestone: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
  onQuote: (id: string, amount: number, description: string) => Promise<boolean>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`kanban-column ${isOver ? "over" : ""}`}>
      <div className="kanban-column-header">
        {COLUMN_LABELS[status]} <span className="kanban-count">{tickets.length}</span>
      </div>
      <div className="kanban-column-body">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onToggleMilestone={onToggleMilestone} onDelete={onDelete} onQuote={onQuote} />
        ))}
      </div>
      <NewTicketInput onAdd={(title) => onAddTicket(status, title)} />
    </div>
  );
}

export default function KanbanBoard({
  project,
  client,
  initialTickets,
}: {
  project: Project;
  client: Client | null;
  initialTickets: Ticket[];
}) {
  const [tickets, setTickets] = useState(initialTickets);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.column_status === newStatus) return;

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, column_status: newStatus } : t)));

    fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnStatus: newStatus }),
    }).then((res) => {
      if (!res.ok) {
        console.error("Failed to move ticket, reverting");
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, column_status: ticket.column_status } : t)));
      }
    });
  }

  async function handleAddTicket(columnStatus: string, title: string) {
    const tempId = `temp-${Date.now()}`;
    const optimisticTicket: Ticket = {
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: project.id,
      title,
      description: null,
      column_status: columnStatus,
      created_by_role: "admin",
      created_by_client_id: null,
      billing_status: "n/a",
      stripe_payment_link: null,
      is_milestone: false,
      published_at: null,
    };
    setTickets((prev) => [...prev, optimisticTicket]);

    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, projectId: project.id, columnStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== tempId));
        return;
      }

      setTickets((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: json.id } : t)));
    } catch {
      setTickets((prev) => prev.filter((t) => t.id !== tempId));
    }
  }

  async function handleToggleMilestone(id: string, value: boolean) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, is_milestone: value } : t)));
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMilestone: value }),
    });
    if (!res.ok) console.error("Failed to toggle milestone for", id);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this ticket? This can't be undone.")) return;
    setTickets((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/admin/tickets/${id}`, { method: "DELETE" });
    if (!res.ok) console.error("Failed to delete ticket", id);
  }

  async function handleQuote(id: string, amount: number, description: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/tickets/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        console.error("Failed to create quote for", id, json.error);
        return false;
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, billing_status: "quoted", stripe_payment_link: json.url } : t))
      );
      return true;
    } catch (err) {
      console.error("Failed to create quote for", id, err);
      return false;
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>{project.name}</h1>
          <p className="admin-page-sub">
            {client?.name}
            {client?.company ? ` · ${client.company}` : ""}
          </p>
        </div>
        <a href={`/admin/clients/${project.client_id}`} className="admin-link-btn">
          ← Back to client
        </a>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMN_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tickets={tickets.filter((t) => t.column_status === status)}
              onAddTicket={handleAddTicket}
              onToggleMilestone={handleToggleMilestone}
              onDelete={handleDelete}
              onQuote={handleQuote}
            />
          ))}
        </div>
      </DndContext>
    </>
  );
}
