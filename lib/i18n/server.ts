import { cookies } from "next/headers";
import { dictionaries, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./dictionary";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "es" ? "es" : DEFAULT_LOCALE;
}

export function getDictionary(locale?: Locale) {
  return dictionaries[locale ?? getLocale()];
}

export type { Locale } from "./dictionary";
