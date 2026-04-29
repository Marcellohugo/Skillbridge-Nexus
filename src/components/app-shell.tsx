"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/auth.actions";
import { useA11y } from "./accessibility-provider";
import { useTheme, type Theme } from "./theme-provider";
import { useLang, type Lang } from "./language-provider";
import { CommandPalette, type PaletteItem } from "./shared/command-palette";
import { NotificationBell } from "./shared/notification-bell";
import { PagePins } from "./shared/page-pins";
import { buildNavSections, splitNavItems, type NavItem } from "@/lib/navigation";
import type { TranslationKey } from "@/lib/i18n";

export type { NavItem };

export interface ShellProps {
  brandHref: string;
  navItems: NavItem[];
  user: { name: string; role: string; roleKey?: TranslationKey; initials: string };
  children: React.ReactNode;
}

function navGlyphOf(label: string) {
  const words = label
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ brandHref, navItems, user, children }: ShellProps) {
  const pathname = usePathname();
  const { t } = useLang();
  const [a11yOpen, setA11yOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const labelOf = React.useCallback(
    (n: NavItem) => (n.labelKey ? t(n.labelKey) : n.label),
    [t],
  );

  const { primary, secondary } = React.useMemo(() => splitNavItems(navItems, 5), [navItems]);
  const navSections = React.useMemo(() => buildNavSections(secondary), [secondary]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const profileHref =
    navItems.find((n) => n.labelKey === "nav.profile")?.href ??
    navItems.find((n) => /profile|profil/i.test(n.href))?.href ??
    "/profile";

  const paletteItems = React.useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = navItems.map((n) => ({
      id: `nav:${n.href}`,
      label: labelOf(n),
      hint: `${t("palette.openHint")} ${n.href}`,
      group: "palette.nav",
      href: n.href,
      keywords: [labelOf(n), n.href],
    }));
    const actions: PaletteItem[] = [
      {
        id: "act:a11y",
        label: t("palette.a11y"),
        group: "palette.actions",
        run: () => setA11yOpen(true),
        keywords: ["a11y", "accessibility", "aksesibilitas"],
      },
      {
        id: "act:profile",
        label: t("palette.profile"),
        group: "palette.actions",
        href: profileHref,
        keywords: ["profile", "profil"],
      },
      {
        id: "act:logout",
        label: t("palette.logout"),
        group: "palette.actions",
        run: () => {
          const f = document.getElementById("logout-form") as HTMLFormElement | null;
          f?.requestSubmit();
        },
        keywords: ["logout", "signout", "keluar"],
      },
      {
        id: "help:shortcuts",
        label: t("palette.shortcut"),
        group: "palette.help",
        keywords: ["shortcut", "keyboard"],
      },
    ];
    return [...nav, ...actions];
  }, [navItems, profileHref, labelOf, t]);

  const roleLabel = user.roleKey ? t(user.roleKey) : user.role;
  const activeNavItem = navItems.find((n) => isActive(n.href));
  const activeNavLabel = activeNavItem ? labelOf(activeNavItem) : roleLabel;

  return (
    <div className="min-h-dvh flex flex-col app-backdrop text-foreground">
      <header className="shell-header sticky top-0 z-40">
        <div className="shell-topbar">
          <div className="container-app flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                className="lg:hidden btn btn-ghost btn-sm -ml-1 px-2"
                onClick={() => setMobileOpen(true)}
                aria-label={t("shell.menuOpen")}
                aria-expanded={mobileOpen}
              >
                <MenuIcon />
              </button>
              <Link href={brandHref} className="flex items-center gap-2.5 min-w-0">
                <div className="brand-mark">
                  SN
                </div>
                <span className="hidden sm:inline font-display font-bold text-lg truncate">
                  SkillBridge <span className="glow-text">Nexus</span>
                </span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 justify-center px-2 lg:px-6">
              <div className="w-full max-w-xl">
                <CommandPalette items={paletteItems} />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <NotificationBell />
              <SettingsMenu navItems={navItems} labelOf={labelOf} onOpenA11y={() => setA11yOpen(true)} />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background/80 py-1 pl-1 pr-2 shadow-sm transition-colors hover:border-border-strong hover:bg-background"
                >
                  <span className="brand-mark brand-mark-sm">
                    {user.initials}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium pr-1 truncate max-w-[8rem]">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div role="menu" className="menu-panel absolute right-0 mt-2 w-64 z-50 p-2">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-foreground-muted">{roleLabel}</p>
                      </div>
                      <Link href={profileHref} className="menu-item block px-3 py-2 text-sm hover:bg-background-tertiary">
                        {t("shell.profile")}
                      </Link>
                      <button
                        onClick={() => {
                          setA11yOpen(true);
                          setMenuOpen(false);
                        }}
                        className="menu-item w-full text-left px-3 py-2 text-sm hover:bg-background-tertiary"
                      >
                        {t("shell.a11y")}
                      </button>
                      <form id="logout-form" action={logoutAction}>
                        <button type="submit" className="menu-item w-full text-left px-3 py-2 text-sm hover:bg-danger-soft text-danger">
                          {t("shell.logout")}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        labelOf={labelOf}
        isActive={isActive}
        user={{ name: user.name, role: roleLabel, initials: user.initials }}
        profileHref={profileHref}
        onOpenA11y={() => setA11yOpen(true)}
      />

      <div className="shell-body">
        <aside className="shell-sidebar hidden lg:block" data-role="sidebar">
          <div className="shell-sidebar-sticky">
            <div className="shell-sidebar-context">
              <span className="shell-nav-dot" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-foreground-muted">{roleLabel}</p>
                <p className="truncate text-sm font-semibold text-foreground">{activeNavLabel}</p>
              </div>
            </div>

            <nav className="side-nav" aria-label={t("shell.primary")}>
              <div className="side-nav-section">
                <p className="side-nav-heading">{t("shell.primary")}</p>
                <div className="side-nav-list">
                  {primary.map((n) => {
                    const active = isActive(n.href);
                    const label = labelOf(n);
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={`side-nav-link ${active ? "side-nav-link-active" : ""}`}
                      >
                        <span className="side-nav-glyph" aria-hidden="true">{navGlyphOf(label)}</span>
                        <span className="side-nav-label truncate">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {navSections.map((section) => (
                <div key={section.key} className="side-nav-section">
                  <p className="side-nav-heading">{t(section.key)}</p>
                  <div className="side-nav-list">
                    {section.items.map((n) => {
                      const active = isActive(n.href);
                      const label = labelOf(n);
                      return (
                        <Link
                          key={n.href}
                          href={n.href}
                          aria-current={active ? "page" : undefined}
                          className={`side-nav-link ${active ? "side-nav-link-active" : ""}`}
                        >
                          <span className="side-nav-glyph" aria-hidden="true">{navGlyphOf(label)}</span>
                          <span className="side-nav-label truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="shell-sidebar-footer">
              <p className="text-[11px] font-bold uppercase text-foreground-muted">{t("shell.sidebarCueTitle")}</p>
              <p className="mt-1 text-xs text-foreground-secondary">{t("shell.sidebarCueHint")}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="shell-kbd">Ctrl</span>
                <span className="shell-kbd">K</span>
              </div>
            </div>
          </div>
        </aside>

        <main id="main" className="shell-main flex-1 w-full">{children}</main>
      </div>

      <A11yPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  navItems,
  labelOf,
  isActive,
  user,
  profileHref,
  onOpenA11y,
}: {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  labelOf: (n: NavItem) => string;
  isActive: (href: string) => boolean;
  user: { name: string; role: string; initials: string };
  profileHref: string;
  onOpenA11y: () => void;
}) {
  const { t } = useLang();
  const { primary, secondary } = React.useMemo(() => splitNavItems(navItems, 5), [navItems]);
  const navSections = React.useMemo(() => buildNavSections(secondary), [secondary]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={t("shell.mobile")} className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-full max-w-sm bg-background border-r border-border overflow-y-auto animate-panel-left">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="brand-mark">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-foreground-muted truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label={t("shell.menuClose")}>
            <CloseIcon />
          </button>
        </div>

        <nav className="p-3 space-y-4" aria-label={t("shell.primary")}>
          <MobileNavSection
            title={t("shell.primary")}
            items={primary}
            labelOf={labelOf}
            isActive={isActive}
            onClose={onClose}
          />
          {navSections.map((section) => (
            <MobileNavSection
              key={section.key}
              title={t(section.key)}
              items={section.items}
              labelOf={labelOf}
              isActive={isActive}
              onClose={onClose}
            />
          ))}
        </nav>

        <div className="mt-2 border-t border-border p-3 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-2 px-1">
              {t("shell.theme")}
            </p>
            <ThemeSegment />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-2 px-1">
              {t("shell.language")}
            </p>
            <LangSegment />
          </div>
          <button
            onClick={() => {
              onOpenA11y();
              onClose();
            }}
            className="w-full btn btn-secondary"
          >
            {t("shell.a11y")}
          </button>
          <Link href={profileHref} onClick={onClose} className="menu-item block text-sm px-3 py-2 hover:bg-background-tertiary">
            {t("shell.profile")}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="menu-item w-full text-left px-3 py-2 text-sm hover:bg-danger-soft text-danger">
              {t("shell.logout")}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

function SettingsMenu({
  navItems,
  labelOf,
  onOpenA11y,
}: {
  navItems: NavItem[];
  labelOf: (n: NavItem) => string;
  onOpenA11y: () => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("shell.settings")}
        title={t("shell.settings")}
        className="btn btn-ghost btn-sm px-2"
      >
        <SettingsIcon />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="menu-panel absolute right-0 mt-2 w-72 z-50 p-3">
            <div className="mb-3 px-1">
              <p className="text-sm font-semibold">{t("shell.settings")}</p>
              <p className="text-xs text-foreground-muted">{t("shell.settingsHint")}</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-2 px-1">
                  {t("pins.title")}
                </p>
                <div className="-mx-1">
                  <PagePins navItems={navItems} labelOf={labelOf} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-2 px-1">
                  {t("shell.language")}
                </p>
                <LangSegment />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-2 px-1">
                  {t("shell.theme")}
                </p>
                <ThemeSegment />
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenA11y();
                }}
                className="w-full btn btn-secondary justify-center"
              >
                <A11yIcon />
                {t("shell.a11y")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileNavSection({
  title,
  items,
  labelOf,
  isActive,
  onClose,
}: {
  title: string;
  items: NavItem[];
  labelOf: (n: NavItem) => string;
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((n) => {
          const active = isActive(n.href);
          const label = labelOf(n);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={`menu-item flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-foreground text-background font-semibold"
                  : "text-foreground-secondary hover:bg-background-secondary"
              }`}
            >
              <span className="side-nav-glyph" aria-hidden="true">{navGlyphOf(label)}</span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ThemeSegment() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const options: { value: Theme; label: string }[] = [
    { value: "light", label: t("shell.theme.light") },
    { value: "dark", label: t("shell.theme.dark") },
    { value: "system", label: t("shell.theme.system") },
  ];
  return (
    <div role="radiogroup" aria-label={t("shell.theme")} className="grid grid-cols-3 gap-1 p-1 bg-background-tertiary border border-border rounded-lg">
      {options.map((o) => {
        const on = o.value === theme;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setTheme(o.value)}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              on ? "bg-background border border-primary/40 text-foreground" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function LangSegment() {
  const { lang, setLang, t } = useLang();
  const options: { value: Lang; label: string }[] = [
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English" },
  ];
  return (
    <div role="radiogroup" aria-label={t("shell.language")} className="grid grid-cols-2 gap-1 p-1 bg-background-tertiary border border-border rounded-lg">
      {options.map((o) => {
        const on = o.value === lang;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setLang(o.value)}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              on ? "bg-background border border-primary/40 text-foreground" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Icons ─── */

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
function A11yIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <path d="M5 9h14M9 9l1.5 5M15 9l-1.5 5M9 22l1.5-8M15 22l-1.5-8" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6l-.04.06a2 2 0 1 1-3.92 0L10 20a1.8 1.8 0 0 0-1-.6 1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1l-.06-.04a2 2 0 1 1 0-3.92L4 10a1.8 1.8 0 0 0 .6-1 1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6l.04-.06a2 2 0 1 1 3.92 0L14 4a1.8 1.8 0 0 0 1 .6 1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c.22.37.43.62.6 1l.06.04a2 2 0 1 1 0 3.92L20 14a1.8 1.8 0 0 0-.6 1Z" />
    </svg>
  );
}

/* ─── A11y panel ─── */

function A11yPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { prefs, update, reset } = useA11y();
  const { t } = useLang();
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="a11y-title" className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border overflow-y-auto animate-panel-right">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="a11y-title" className="font-display font-bold text-lg">{t("a11y.title")}</h2>
            <p className="text-xs text-foreground-muted mt-0.5">{t("a11y.subtitle")}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label={t("a11y.close")}>
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Field label={t("a11y.fontScale")} hint={t("a11y.fontScale.hint")}>
            <SegmentedGroup
              name="fontScale"
              value={prefs.fontScale}
              onChange={(v) => update({ fontScale: v as A11yPrefs["fontScale"] })}
              options={[
                { value: "sm", label: "S" },
                { value: "md", label: "M" },
                { value: "lg", label: "L" },
                { value: "xl", label: "XL" },
              ]}
            />
          </Field>

          <Field label={t("a11y.motion")} hint={t("a11y.motion.hint")}>
            <SegmentedGroup
              name="motion"
              value={prefs.motion}
              onChange={(v) => update({ motion: v as A11yPrefs["motion"] })}
              options={[
                { value: "normal", label: t("a11y.motion.normal") },
                { value: "reduced", label: t("a11y.motion.reduced") },
              ]}
            />
          </Field>

          <Field label={t("a11y.contrast")} hint={t("a11y.contrast.hint")}>
            <SegmentedGroup
              name="contrast"
              value={prefs.contrast}
              onChange={(v) => update({ contrast: v as A11yPrefs["contrast"] })}
              options={[
                { value: "normal", label: t("a11y.contrast.normal") },
                { value: "high", label: t("a11y.contrast.high") },
              ]}
            />
          </Field>

          <Toggle
            label={t("a11y.dyslexia")}
            hint={t("a11y.dyslexia.hint")}
            checked={prefs.dyslexia}
            onChange={(v) => update({ dyslexia: v })}
          />

          <Toggle
            label={t("a11y.focus")}
            hint={t("a11y.focus.hint")}
            checked={prefs.focusMode}
            onChange={(v) => update({ focusMode: v })}
          />

          <div className="pt-4 border-t border-border flex gap-2">
            <button onClick={reset} className="btn btn-secondary flex-1">{t("a11y.reset")}</button>
            <button onClick={onClose} className="btn btn-primary flex-1">{t("a11y.done")}</button>
          </div>

          <p className="text-xs text-foreground-muted">{t("a11y.persist")}</p>
        </div>
      </aside>
    </div>
  );
}

type A11yPrefs = ReturnType<typeof useA11y>["prefs"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold">{label}</label>
      </div>
      {children}
      {hint && <p className="text-xs text-foreground-muted mt-2">{hint}</p>}
    </div>
  );
}

function SegmentedGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="grid gap-1 p-1 bg-background-tertiary border border-border rounded-lg"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`h-9 rounded-lg text-sm font-medium transition-colors ${
              on ? "bg-background border border-primary/40 text-foreground" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label className="text-sm font-semibold">{label}</label>
        {hint && <p className="text-xs text-foreground-muted mt-1">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 ${
          checked
            ? "bg-primary border-primary"
            : "bg-foreground-muted/25 border-foreground-muted/45 hover:bg-foreground-muted/35"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full border border-foreground-muted/35 bg-background-secondary shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
