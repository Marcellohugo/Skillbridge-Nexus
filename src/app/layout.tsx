import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { LOCALE_COOKIE, resolveLocale, translate } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SkillBridge Nexus — Competency Intelligence Platform",
    template: "%s | SkillBridge Nexus",
  },
  description:
    "Diagnosis skill gap, learning path adaptif, matching mentor, dan Talent Readiness Index untuk masa depan karir yang inklusif.",
};

const EARLY_THEME_SCRIPT = `
(function () {
  try {
    function readCookie(n) {
      var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    }
    var t = localStorage.getItem('sbn.theme');
    var r = t === 'light' || t === 'dark'
      ? t
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', r);
    document.documentElement.style.colorScheme = r;
    var c = readCookie('${LOCALE_COOKIE}');
    var s = localStorage.getItem('sbn.lang');
    var l = c === 'id' || c === 'en' ? c : s;
    if (l === 'id' || l === 'en') document.documentElement.setAttribute('lang', l);
  } catch (e) {}
})();
`.trim();

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLocale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={initialLocale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main" className="skip-link">{translate(initialLocale, "shell.skip")}</a>
        <ThemeProvider>
          <LanguageProvider initialLocale={initialLocale}>
            <AccessibilityProvider>{children}</AccessibilityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
