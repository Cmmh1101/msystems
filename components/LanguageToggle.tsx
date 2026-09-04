"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionary";

export default function LanguageToggle({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <div className={`lang-toggle ${dark ? "on-dark" : ""}`} role="group" aria-label="Language">
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => switchTo("en")}>
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button type="button" className={locale === "es" ? "active" : ""} onClick={() => switchTo("es")}>
        ES
      </button>
    </div>
  );
}
