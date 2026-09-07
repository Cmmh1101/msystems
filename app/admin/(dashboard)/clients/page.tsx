import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ClientsTable from "@/components/admin/ClientsTable";
import type { Client } from "@/lib/clients";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminClientsPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clients")
    .select("id,created_at,contact_id,auth_user_id,name,company,email,status,projects(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin clients fetch failed", error);
  }

  const clients = ((data ?? []) as (Client & { projects: { count: number }[] })[]).map((c) => ({
    ...c,
    projectCount: c.projects?.[0]?.count ?? 0,
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
