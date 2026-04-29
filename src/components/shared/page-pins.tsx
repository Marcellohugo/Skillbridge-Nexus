"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/language-provider";
import type { NavItem } from "@/components/app-shell";

const STORAGE_KEY = "sbn.pins";
const MAX_PINS = 12;

interface Pin {
  href: string;
  label: string;
  pinnedAt: number;
}

export function PagePins({
  navItems,
  labelOf,
}: {
  navItems: NavItem[];
  labelOf: (n: NavItem) => string;
}) {
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const [pins, setPins] = React.useState<Pin[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPins(parsed.filter(isPin).slice(0, MAX_PINS));
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
    } catch {}
  }, [pins, hydrated]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentLabel = React.useMemo(() => {
    const match = navItems.find((n) => pathname === n.href);
    if (match) return labelOf(match);
    const prefix = navItems
      .filter((n) => pathname.startsWith(n.href + "/") && n.href !== "/")
      .sort((a, b) => b.href.length - a.href.length)[0];
    if (prefix) return labelOf(prefix);
    return pathname.replace(/^\//, "").replace(/[-_]/g, " ") || "Home";
  }, [pathname, navItems, labelOf]);

  const isPinnable = Boolean(pathname && pathname !== "/");
  const isPinned = pins.some((p) => p.href === pathname);
  const atLimit = pins.length >= MAX_PINS;

  const togglePin = () => {
    if (!isPinnable) return;
    setPins((prev) => {
      if (prev.some((p) => p.href === pathname)) {
        return prev.filter((p) => p.href !== pathname);
      }
      if (prev.length >= MAX_PINS) return prev;
      return [
        { href: pathname, label: currentLabel, pinnedAt: Date.now() },
        ...prev,
      ];
    });
  };

  const removePin = (href: string) => {
    setPins((prev) => prev.filter((p) => p.href !== href));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("pins.open")}
        title={t("pins.open")}
        className="btn btn-ghost btn-sm px-2 relative"
      >
        <PinIcon filled={isPinned} />
        {hydrated && pins.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-white grid place-items-center leading-none">
            {pins.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="menu-panel absolute right-0 mt-2 w-80 z-50 p-2"
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs uppercase tracking-wider text-foreground-muted">
                {t("pins.title")}
              </p>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                {t("pins.hint")}
              </p>
            </div>

            <button
              type="button"
              onClick={togglePin}
              disabled={!isPinnable || (!isPinned && atLimit)}
              className={`menu-item w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isPinned
                  ? "text-warning hover:bg-warning-soft"
                  : "text-foreground hover:bg-background-tertiary"
              }`}
            >
              <PinIcon filled={isPinned} />
              <span className="flex-1 text-left truncate">
                {isPinned ? t("pins.unpinThis") : t("pins.pinThis")}
                <span className="text-foreground-muted font-normal ml-1 truncate">
                  · {currentLabel}
                </span>
              </span>
            </button>

            {!isPinned && atLimit && (
              <p className="text-[11px] text-warning px-3 py-1">
                {t("pins.limit")} {MAX_PINS}
              </p>
            )}

            <div className="my-1 border-t border-border" />

            {pins.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-background-secondary grid place-items-center">
                  <PinIcon filled={false} />
                </div>
                <p className="text-xs text-foreground-muted">{t("pins.empty")}</p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {pins.map((p) => {
                  const active = p.href === pathname;
                  return (
                    <li key={p.href} className="flex items-stretch group">
                      <Link
                        href={p.href}
                        onClick={() => setOpen(false)}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-l-lg text-sm min-w-0 ${
                          active
                            ? "bg-background-tertiary text-foreground font-medium"
                            : "hover:bg-background-tertiary text-foreground-secondary"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removePin(p.href)}
                        aria-label={`${t("pins.remove")} ${p.label}`}
                        className="px-2 rounded-r-lg text-foreground-muted hover:text-danger hover:bg-danger-soft opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RemoveIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function isPin(v: unknown): v is Pin {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.href === "string" &&
    typeof o.label === "string" &&
    typeof o.pinnedAt === "number"
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.8l-5.5 2.7 1-6.2L3 8.9 9 8z" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
