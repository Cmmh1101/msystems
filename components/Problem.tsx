import { getDictionary } from "@/lib/i18n/server";

export default function Problem() {
  const t = getDictionary().problem;

  return (
    <section className="problem section">
      <div className="container">
        <p className="eyebrow" style={{ color: "var(--ink)" }}>
          {t.eyebrow}
        </p>
        <p className="problem-statement">
          {t.pre}
          <span className="accent">{t.accent}</span>
          {t.post}
        </p>
      </div>
    </section>
  );
}
