import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ClientDetail from "@/components/admin/ClientDetail";
import type { Client, Project } from "@/lib/clients";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id,created_at,contact_id,auth_user_id,name,company,email,status")
    .eq("id", params.id)
    .single();

  if (clientError || !client) {
    notFound();
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id,created_at,client_id,name,status")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("client detail: projects fetch failed", projectsError);
  }

  return <ClientDetail client={client as Client} initialProjects={(projects as Project[]) ?? []} />;
}
