import type { Locale } from "./i18n/dictionary";

export interface CaseStudy {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  title_es: string | null;
  slug: string;
  summary: string;
  summary_es: string | null;
  details: string;
  details_es: string | null;
  published: boolean;
  published_at: string | null;
}

export function localizedCaseStudy(
  caseStudy: Pick<CaseStudy, "title" | "summary" | "details" | "title_es" | "summary_es" | "details_es">,
  locale: Locale
) {
  if (locale === "es" && caseStudy.title_es) {
    return {
      title: caseStudy.title_es,
      summary: caseStudy.summary_es || caseStudy.summary,
      details: caseStudy.details_es || caseStudy.details,
    };
  }
  return { title: caseStudy.title, summary: caseStudy.summary, details: caseStudy.details };
}
