import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Modules from "@/components/Modules";
import About from "@/components/About";
import ResultsTeaser from "@/components/ResultsTeaser";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import { getLocale } from "@/lib/i18n/server";

export default function Home() {
  const locale = getLocale();

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero />
        <Problem />
        <Modules />
        <About />
        <ResultsTeaser />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
