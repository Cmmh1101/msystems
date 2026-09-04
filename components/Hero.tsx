import HeroDiagram from "./HeroDiagram";
import { getDictionary } from "@/lib/i18n/server";

export default function Hero() {
  const t = getDictionary().hero;

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.headline}</h1>
            <p className="lede">
              {t.ledePre}
              <em style={{ fontStyle: "normal", color: "var(--line)" }}>{t.ledeOne}</em>
              {t.ledePost}
            </p>
            <div className="hero-ctas">
              <a href="/diagnostic" className="btn btn-primary">
                {t.ctaPrimary}
              </a>
              <a href="#cta" className="btn btn-ghost">
                {t.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="diagram-wrap">
            <HeroDiagram />
          </div>
        </div>

        <div className="stepbar">
          <div className="container">
            {t.steps.map((step, i) => (
              <span className="step" key={step}>
                <b>{String(i + 1).padStart(2, "0")}</b>&nbsp;{step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
