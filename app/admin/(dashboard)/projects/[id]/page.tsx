import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import KanbanBoard from "@/components/admin/KanbanBoard";
import type { Project, Client } from "@/lib/clients";
import type { Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id,created_at,client_id,name,status")
    .eq("id", params.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id,name,company,email")
    .eq("id", project.client_id)
    .single();

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select(
      "id,created_at,updated_at,project_id,title,description,column_status,created_by_role,created_by_client_id,billing_status,stripe_payment_link,is_milestone,published_at"
    )
    .eq("project_id", params.id)
    .order("created_at", { ascending: true });

  if (ticketsError) {
    console.error("project detail: tickets fetch failed", ticketsError);
  }

  return (
    <KanbanBoard
      project={project as Project}
      client={client as Client | null}
      initialTickets={(tickets as Ticket[]) ?? []}
    />
  );
}
