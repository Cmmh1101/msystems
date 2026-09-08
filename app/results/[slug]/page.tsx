import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { localizedCaseStudy, type CaseStudy } from "@/lib/caseStudies";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PublishedCaseStudy = Pick<
  CaseStudy,
  "title" | "slug" | "summary" | "details" | "published_at" | "title_es" | "summary_es" | "details_es"
>;

async function getPublishedCaseStudy(slug: string): Promise<PublishedCaseStudy | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("case_studies")
    .select("title,slug,summary,details,published_at,title_es,summary_es,details_es")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const caseStudy = await getPublishedCaseStudy(params.slug);
  if (!caseStudy) return {};

  const locale = getLocale();
  const localized = localizedCaseStudy(caseStudy, locale);

  return {
    title: `${localized.title} — Montano Systems`,
    description: localized.summary,
  };
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const caseStudy = await getPublishedCaseStudy(params.slug);
  if (!caseStudy) notFound();

  const locale = getLocale();
  const t = getDictionary(locale).results;
  const localized = localizedCaseStudy(caseStudy, locale);

  return (
    <>
      <Header locale={locale} />
      <main>
        <article className="blog-post section">
          <div className="container blog-post-container">
            <p className="eyebrow" style={{ color: "var(--ink)" }}>
              {new Date(caseStudy.published_at!).toLocaleDateString(locale === "es" ? "es" : "en-US")}
            </p>
            <h1>{localized.title}</h1>
            <div className="blog-post-body">
              <ReactMarkdown>{localized.details}</ReactMarkdown>
            </div>
            <a href="/results" className="about-link">
              {t.backToResults}
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
