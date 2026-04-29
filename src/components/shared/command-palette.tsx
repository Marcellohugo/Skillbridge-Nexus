"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../language-provider";

export type PaletteGroupKey = "palette.nav" | "palette.actions" | "palette.help";

export type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  icon?: string;
  group: PaletteGroupKey;
  keywords?: string[];
  href?: string;
  run?: () => void;
};

function score(query: string, item: PaletteItem): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const hay = [item.label, item.hint, item.group, ...(item.keywords ?? [])].filter(Boolean).join(" ").toLowerCase();
  if (hay.includes(q)) return 100 - Math.abs(hay.indexOf(q));
  let qi = 0;
  let matched = 0;
  for (const c of hay) {
    if (c === q[qi]) {
      qi++;
      matched++;
      if (qi >= q.length) return 50 + matched;
    }
  }
  return qi >= q.length ? matched : 0;
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const { t } = useLang();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (!wrapperRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchstart", onPointerDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const filtered = React.useMemo(() => {
    const scored = items
      .map((it) => ({ it, s: score(query, it) }))
      .filter((x) => (query ? x.s > 0 : true));
    scored.sort((a, b) => b.s - a.s);
    return scored.map((x) => x.it).slice(0, 20);
  }, [items, query]);

  const grouped = React.useMemo(() => {
    const m = new Map<PaletteGroupKey, PaletteItem[]>();
    for (const it of filtered) {
      const list = m.get(it.group) ?? [];
      list.push(it);
      m.set(it.group, list);
    }
    return Array.from(m.entries());
  }, [filtered]);

  const runAt = (i: number) => {
    const it = filtered[i];
    if (!it) return;
    setOpen(false);
    if (it.href) router.push(it.href);
    else it.run?.();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-foreground-muted shadow-sm transition-colors hover:border-border-strong hover:text-foreground"
        aria-label={t("palette.searchOpen")}
        title="Ctrl/Cmd+K"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SearchIcon />
          <span className="truncate">{t("palette.search")}</span>
        </span>
        <kbd className="ml-auto hidden lg:inline-flex rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
      </button>

      {open && (
        <div role="dialog" aria-modal="false" aria-label={t("palette.searchOpen")} className="menu-panel absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span aria-hidden className="text-foreground-muted"><SearchIcon /></span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(c + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(c - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  runAt(cursor);
                }
              }}
              placeholder={t("palette.searchTitle")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted"
              aria-label={t("palette.query")}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-sm text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground"
              aria-label={t("palette.close")}
              title={t("palette.close")}
            >
              ✕
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-foreground-muted">
                {t("palette.empty")} &quot;{query}&quot;. {t("palette.tryOther")}
              </div>
            ) : (
              grouped.map(([group, list]) => (
                <div key={group} className="py-2">
                  <div className="px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">{t(group)}</div>
                  {list.map((it) => {
                    const globalIndex = filtered.indexOf(it);
                    const active = globalIndex === cursor;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onMouseEnter={() => setCursor(globalIndex)}
                        onClick={() => runAt(globalIndex)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          active ? "bg-primary/10 text-foreground" : "text-foreground-secondary hover:bg-background-secondary"
                        }`}
                      >
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-foreground-muted/40" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{it.label}</div>
                          {it.hint && <div className="text-xs text-foreground-muted truncate">{it.hint}</div>}
                        </div>
                        {active && <span className="text-xs text-primary">↵</span>}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border bg-background-secondary px-4 py-2 text-[11px] text-foreground-muted flex items-center gap-4">
            <span><kbd className="font-mono">↑↓</kbd> {t("palette.select")}</span>
            <span><kbd className="font-mono">↵</kbd> {t("palette.open")}</span>
            <span>{t("palette.close")}: klik luar / tombol ✕</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
