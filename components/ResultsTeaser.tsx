import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedCaseStudy } from "@/lib/caseStudies";

interface TeaserItem {
  id: string;
  title: string;
  title_es: string | null;
  slug: string;
  summary: string;
  summary_es: string | null;
  details: string;
  details_es: string | null;
}

export default async function ResultsTeaser() {
  const locale = getLocale();
  const t = getDictionary(locale).results;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("case_studies")
    .select("id,title,title_es,slug,summary,summary_es,details,details_es")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  const caseStudies = (data as TeaserItem[]) ?? [];
  if (caseStudies.length === 0) return null;

  return (
    <section className="results-teaser section">
      <div className="container">
        <h2>{t.teaserHeading}</h2>
        <div className="blog-list-grid">
          {caseStudies.map((c) => {
            const localized = localizedCaseStudy(c, locale);
            return (
              <a key={c.id} href={`/results/${c.slug}`} className="blog-card">
                <div className="blog-card-body">
                  <h2>{localized.title}</h2>
                  {localized.summary && <p>{localized.summary}</p>}
                </div>
              </a>
            );
          })}
        </div>
        <a href="/results" className="about-link">
          {t.seeAll}
        </a>
      </div>
    </section>
  );
}
