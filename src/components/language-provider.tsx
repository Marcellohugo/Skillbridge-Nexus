"use client";

import * as React from "react";
import {
  createI18nFormatters,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  translate,
  type I18nFormatters,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";

export type Lang = Locale;

interface LangContextValue {
  lang: Locale;
  setLang: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  format: I18nFormatters;
}

const LangContext = React.createContext<LangContextValue | null>(null);
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : null;
}

function readBrowserLocale(): Locale {
  const cookieLocale = readCookie(LOCALE_COOKIE);
  if (isLocale(cookieLocale)) return cookieLocale;

  try {
    return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return resolveLocale(undefined);
  }
}

function persistBrowserLocale(locale: Locale) {
  document.documentElement.setAttribute("lang", locale);
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {}
}

export function LanguageProvider({
  children,
  initialLocale = "id",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [lang, setLangState] = React.useState<Locale>(() => resolveLocale(initialLocale));
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setLangState(readBrowserLocale());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    persistBrowserLocale(lang);
  }, [lang, hydrated]);

  const setLang = React.useCallback((locale: Locale) => {
    setLangState(resolveLocale(locale));
  }, []);

  const t = React.useCallback((key: TranslationKey) => translate(lang, key), [lang]);
  const format = React.useMemo(() => createI18nFormatters(lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, format }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
