import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiagnosticQuiz from "@/components/diagnostic/DiagnosticQuiz";

export const metadata: Metadata = {
  title: "Free Systems Check — Montano Systems",
  description:
    "Six quick questions to see how much tool sprawl is costing your business, and what to fix first.",
};

export default function DiagnosticPage() {
  return (
    <>
      <Header />
      <main>
        <section className="diagnostic-section section">
          <div className="container diagnostic-container">
            <DiagnosticQuiz />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
