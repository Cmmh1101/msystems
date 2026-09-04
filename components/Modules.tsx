import { getDictionary } from "@/lib/i18n/server";

export default function Modules() {
  const t = getDictionary().modules;

  return (
    <section className="modules section" id="modules">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.heading}</h2>
        </div>
        <div className="module-grid">
          {t.items.map((m) => (
            <div className="module" key={m.num}>
              <span className="num">{m.num}</span>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
              <span className="spec">{m.spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
