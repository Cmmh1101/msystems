import { redirect } from "next/navigation";
import { requireClient } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Project } from "@/lib/clients";
import type { Ticket } from "@/lib/tickets";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PortalDashboardPage() {
  const client = await requireClient();
  if (!client) {
    redirect("/portal/login");
  }

  const admin = getSupabaseAdmin();
  const { data: projects } = await admin
    .from("projects")
    .select("id,created_at,client_id,name,status")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const projectIds = (projects ?? []).map((p) => p.id);

  let milestones: Ticket[] = [];
  if (projectIds.length > 0) {
    const { data } = await admin
      .from("tickets")
      .select(
        "id,created_at,updated_at,project_id,title,description,column_status,created_by_role,created_by_client_id,billing_status,stripe_payment_link,is_milestone,published_at"
      )
      .in("project_id", projectIds)
      .eq("is_milestone", true)
      .order("published_at", { ascending: false })
      .limit(10);
    milestones = (data as Ticket[]) ?? [];
  }

  return (
    <>
      <h1>Welcome, {client.name}</h1>
      <p className="portal-sub">{client.company || "Here's what's in progress."}</p>

      {!projects || projects.length === 0 ? (
        <div className="portal-empty">No projects yet — check back soon.</div>
      ) : (
        (projects as Project[]).map((project) => (
          <a key={project.id} href={`/portal/projects/${project.id}`} className="portal-card portal-card-link">
            <h2>{project.name}</h2>
            <span className="portal-project-status">{project.status}</span>
          </a>
        ))
      )}

      {milestones.length > 0 && (
        <>
          <h2 className="portal-section-heading">Recent milestones</h2>
          <div className="portal-milestone-list">
            {milestones.map((m) => (
              <div key={m.id} className="portal-milestone-item">
                <span className="portal-milestone-badge">★</span>
                <div>
                  <div className="portal-milestone-title">{m.title}</div>
                  {m.description && <p className="portal-ticket-desc">{m.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
