import { getDictionary } from "@/lib/i18n/server";

export default function About() {
  const t = getDictionary().about;
  const [portraitLine1, portraitLine2] = t.portrait.split("\n");

  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-portrait">
          {portraitLine1}
          <br />
          {portraitLine2}
        </div>
        <div>
          <p className="eyebrow" style={{ color: "var(--brass)" }}>
            {t.eyebrow}
          </p>
          <h2>{t.heading}</h2>
          <p>{t.bio}</p>

          <div className="collab-note">
            <b>{t.collabLabel}</b> {t.collabRest}
          </div>
        </div>
      </div>
    </section>
  );
}
