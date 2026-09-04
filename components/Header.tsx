"use client";

import { useState } from "react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";
import LanguageToggle from "./LanguageToggle";

export default function Header({ locale }: { locale: Locale }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = dictionaries[locale].nav;

  return (
    <header className="site-header">
      <div className="container nav">
        <a href="/" className="wordmark">
          MONTANO <span>SYSTEMS</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#modules">{t.services}</a>
          <a href="/#about">{t.about}</a>
          <a href="/blog">{t.blog}</a>
          <a href="/#cta">{t.contact}</a>
        </nav>
        <div className="nav-cta">
          <span className="lang-toggle-slot">
            <LanguageToggle locale={locale} dark />
          </span>
          <a href="/diagnostic" className="btn btn-primary" style={{ padding: "10px 18px" }}>
            {t.freeCheck}
          </a>
          <button
            className="menu-toggle"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "×" : "≡"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <a href="/#modules" onClick={() => setIsMenuOpen(false)}>
            {t.services}
          </a>
          <a href="/#about" onClick={() => setIsMenuOpen(false)}>
            {t.about}
          </a>
          <a href="/blog" onClick={() => setIsMenuOpen(false)}>
            {t.blog}
          </a>
          <a href="/#cta" onClick={() => setIsMenuOpen(false)}>
            {t.contact}
          </a>
          <div className="mobile-nav-lang">
            <LanguageToggle locale={locale} dark />
          </div>
        </nav>
      )}
    </header>
  );
}
