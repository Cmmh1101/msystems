import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ClientsTable from "@/components/admin/ClientsTable";
import type { Client } from "@/lib/clients";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface TicketForCounts {
  column_status: string;
  billing_status: string;
  projects: { client_id: string } | { client_id: string }[] | null;
}

export default async function AdminClientsPage() {
  const supabase = getSupabaseAdmin();

  const [{ data, error }, { data: ticketRows, error: ticketError }] = await Promise.all([
    supabase
      .from("clients")
      .select("id,created_at,contact_id,auth_user_id,name,company,email,status,projects(count)")
      .order("created_at", { ascending: false }),
    supabase.from("tickets").select("column_status,billing_status,projects!inner(client_id)"),
  ]);

  if (error) {
    console.error("admin clients fetch failed", error);
  }
  if (ticketError) {
    console.error("admin clients ticket-count fetch failed", ticketError);
  }

  const counts = new Map<string, { requests: number; todo: number; pending: number }>();
  for (const t of (ticketRows as TicketForCounts[]) ?? []) {
    const project = Array.isArray(t.projects) ? t.projects[0] : t.projects;
    const clientId = project?.client_id;
    if (!clientId) continue;

    const entry = counts.get(clientId) ?? { requests: 0, todo: 0, pending: 0 };
    if (t.column_status === "client_request") entry.requests++;
    if (t.column_status === "to_do") entry.todo++;
    if (t.billing_status === "needs_quote" || t.billing_status === "quoted") entry.pending++;
    counts.set(clientId, entry);
  }

  const clients = ((data ?? []) as (Client & { projects: { count: number }[] })[]).map((c) => ({
    ...c,
    projectCount: c.projects?.[0]?.count ?? 0,
    requestCount: counts.get(c.id)?.requests ?? 0,
    todoCount: counts.get(c.id)?.todo ?? 0,
    pendingBillingCount: counts.get(c.id)?.pending ?? 0,
  }));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Clients</h1>
          <p className="admin-page-sub">Convert a promising contact into a client to start tracking projects.</p>
        </div>
        <a href="/admin/clients/new" className="btn btn-primary">
          New client
        </a>
      </div>
      <ClientsTable initialClients={clients} />
    </>
  );
}
