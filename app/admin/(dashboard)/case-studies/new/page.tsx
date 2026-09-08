import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import CaseStudyEditor from "@/components/admin/CaseStudyEditor";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function NewCaseStudyPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("id,name").order("name", { ascending: true }),
    supabase.from("projects").select("id,name,client_id").order("name", { ascending: true }),
  ]);

  return (
    <>
      <h1>New case study</h1>
      <p className="admin-page-sub">Save as a draft, or publish immediately.</p>
      <CaseStudyEditor clients={clients ?? []} projects={projects ?? []} />
    </>
  );
}
