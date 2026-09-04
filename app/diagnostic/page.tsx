import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiagnosticQuiz from "@/components/diagnostic/DiagnosticQuiz";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const t = getDictionary().diagnosticPage;
  return {
    title: t.title,
    description: t.description,
  };
}

export default function DiagnosticPage() {
  const locale = getLocale();

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="diagnostic-section section">
          <div className="container diagnostic-container">
            <DiagnosticQuiz locale={locale} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
