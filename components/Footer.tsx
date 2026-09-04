import { getDictionary } from "@/lib/i18n/server";

export default function Footer() {
  const year = new Date().getFullYear();
  const t = getDictionary().footer;

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a href="/" className="wordmark" style={{ fontSize: "15px" }}>
          MONTANO <span>SYSTEMS</span>
        </a>
        <nav className="footer-links" aria-label="Footer">
          <a href="/#modules">{t.services}</a>
          <a href="/#about">{t.about}</a>
          <a href="/blog">{t.blog}</a>
          <a href="/diagnostic">{t.freeCheck}</a>
          <a href="/#cta">{t.contact}</a>
        </nav>
        <span className="footer-fine">
          © {year} {t.copyright}
        </span>
      </div>
      <div className="container footer-legal">{t.legal}</div>
    </footer>
  );
}
