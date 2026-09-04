import ContactForm from "./ContactForm";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export default function CtaSection() {
  const locale = getLocale();
  const t = getDictionary(locale).cta;

  return (
    <section className="cta-section section" id="cta">
      <div className="container">
        <h2>{t.heading}</h2>
        <p>{t.sub}</p>
        <ContactForm locale={locale} />
      </div>
    </section>
  );
}
