import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedCaseStudy } from "@/lib/caseStudies";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata(): Metadata {
  const t = getDictionary().results;
  return {
    title: `${t.heading} — Montano Systems`,
    description: "Real systems we've built, and what changed for the businesses running them.",
  };
}

interface CaseStudyListItem {
  id: string;
  title: string;
  title_es: string | null;
  slug: string;
  summary: string;
  summary_es: string | null;
  details: string;
  details_es: string | null;
  published_at: string;
}

export default async function ResultsIndexPage() {
  const locale = getLocale();
  const t = getDictionary(locale).results;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("case_studies")
    .select("id,title,title_es,slug,summary,summary_es,details,details_es,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("results index fetch failed", error);
  }

  const caseStudies = (data as CaseStudyListItem[]) ?? [];

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="blog-hero section">
          <div className="container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              {t.eyebrow}
            </p>
            <h1>{t.heading}</h1>
          </div>
        </section>

        <section className="blog-list section">
          <div className="container">
            {caseStudies.length === 0 ? (
              <p className="blog-empty">{t.empty}</p>
            ) : (
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
