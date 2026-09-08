import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import CaseStudiesTable from "@/components/admin/CaseStudiesTable";
import type { CaseStudy } from "@/lib/caseStudies";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminCaseStudiesPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("case_studies")
    .select(
      "id,created_at,updated_at,client_id,project_id,title,title_es,slug,summary,summary_es,details,details_es,published,published_at"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("admin case studies fetch failed", error);
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Case studies</h1>
          <p className="admin-page-sub">Write in Markdown. Drafts stay hidden from the public /results until published.</p>
        </div>
        <a href="/admin/case-studies/new" className="btn btn-primary">
          New case study
        </a>
      </div>
      <CaseStudiesTable initialCaseStudies={(data as CaseStudy[]) ?? []} />
    </>
  );
}
