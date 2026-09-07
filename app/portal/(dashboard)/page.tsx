import { redirect } from "next/navigation";
import { requireClient } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Project } from "@/lib/clients";

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

  return (
    <>
      <h1>Welcome, {client.name}</h1>
      <p className="portal-sub">{client.company || "Here's what's in progress."}</p>

      {!projects || projects.length === 0 ? (
        <div className="portal-empty">No projects yet — check back soon.</div>
      ) : (
        (projects as Project[]).map((project) => (
          <div key={project.id} className="portal-card">
            <h2>{project.name}</h2>
            <span className="portal-project-status">{project.status}</span>
          </div>
        ))
      )}
    </>
  );
}
