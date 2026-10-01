import Image from "next/image";
import { getDictionary } from "@/lib/i18n/server";

export default function About() {
  const t = getDictionary().about;

  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-portrait">
          <Image
            src="/images/carla-montano.png"
            alt="Carla Montano"
            fill
            sizes="(max-width: 800px) 260px, 35vw"
            style={{ objectFit: "cover" }}
            priority
          />
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
