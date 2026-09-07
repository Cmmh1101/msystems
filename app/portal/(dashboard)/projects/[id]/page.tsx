import { notFound } from "next/navigation";
import { requireClient } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ClientTicketBoard from "@/components/portal/ClientTicketBoard";
import type { Project } from "@/lib/clients";
import type { Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PortalProjectPage({ params }: { params: { id: string } }) {
  const client = await requireClient();
  if (!client) notFound();

  const admin = getSupabaseAdmin();

  const { data: project } = await admin
    .from("projects")
    .select("id,created_at,client_id,name,status")
    .eq("id", params.id)
    .single();

  if (!project || project.client_id !== client.id) {
    notFound();
  }

  const { data: tickets } = await admin
    .from("tickets")
    .select(
      "id,created_at,updated_at,project_id,title,description,column_status,created_by_role,created_by_client_id,billing_status,stripe_payment_link,is_milestone,published_at"
    )
    .eq("project_id", params.id)
    .or(`created_by_client_id.eq.${client.id},is_milestone.eq.true`)
    .order("created_at", { ascending: true });

  return <ClientTicketBoard project={project as Project} initialTickets={(tickets as Ticket[]) ?? []} />;
}
