import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import CaseStudyEditor from "@/components/admin/CaseStudyEditor";
import type { CaseStudy } from "@/lib/caseStudies";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EditCaseStudyPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  const [{ data: caseStudy, error }, { data: clients }, { data: projects }] = await Promise.all([
    supabase
      .from("case_studies")
      .select(
        "id,created_at,updated_at,client_id,project_id,title,title_es,slug,summary,summary_es,details,details_es,published,published_at"
      )
      .eq("id", params.id)
      .single(),
    supabase.from("clients").select("id,name").order("name", { ascending: true }),
    supabase.from("projects").select("id,name,client_id").order("name", { ascending: true }),
  ]);

  if (error || !caseStudy) {
    notFound();
  }

  return (
    <>
      <h1>Edit case study</h1>
      <CaseStudyEditor caseStudy={caseStudy as CaseStudy} clients={clients ?? []} projects={projects ?? []} />
    </>
  );
}
