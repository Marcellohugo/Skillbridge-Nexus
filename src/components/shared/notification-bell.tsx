"use client";

import * as React from "react";
import {
  listNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  type NotificationItem,
} from "@/features/user/notification.actions";

const REFRESH_MS = 60_000;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

const TYPE_ICONS: Record<string, string> = {
  ASSESSMENT_COMPLETED: "🧠",
  LEARNING_PATH_GENERATED: "🛤️",
  MILESTONE_REACHED: "🏆",
  MENTOR_REQUEST_ACCEPTED: "🤝",
  MENTOR_REQUEST_REJECTED: "❌",
  INTERVENTION_RECOMMENDED: "💡",
  EVIDENCE_VALIDATED: "✅",
  BADGE_EARNED: "🎖️",
  GENERAL: "🔔",
};

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unread, setUnread] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listNotificationsAction();
    if (res.ok) {
      setItems(res.items);
      setUnread(res.unread);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const onMark = async (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    await markNotificationReadAction(id);
  };

  const onMarkAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    await markAllNotificationsReadAction();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifikasi${unread > 0 ? ` (${unread} belum dibaca)` : ""}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background shadow-sm transition-colors hover:border-border-strong"
        title="Notifikasi"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-danger text-[10px] font-bold text-white grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="menu-panel absolute right-0 mt-2 w-[min(22rem,calc(100vw-1rem))] z-50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifikasi</p>
                <p className="text-xs text-foreground-muted">{unread} belum dibaca</p>
              </div>
              {unread > 0 && (
                <button onClick={onMarkAll} className="text-xs text-primary hover:underline">
                  Tandai semua
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="p-6 text-center text-sm text-foreground-muted">Memuat…</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground-muted">
                  <p className="text-2xl mb-2" aria-hidden>📭</p>
                  <p>Belum ada notifikasi</p>
                </div>
              ) : (
                items.map((n) => (
                  <a
                    key={n.id}
                    href={n.actionUrl ?? "#"}
                    onClick={() => {
                      if (!n.isRead) onMark(n.id);
                    }}
                    className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                      n.isRead ? "bg-background" : "bg-primary/5"
                    } hover:bg-background-secondary`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-background-tertiary grid place-items-center text-base shrink-0">
                      <span aria-hidden>{TYPE_ICONS[n.type] ?? TYPE_ICONS.GENERAL}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${n.isRead ? "font-medium" : "font-semibold"}`}>{n.title}</p>
                        {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" aria-label="Belum dibaca" />}
                      </div>
                      <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-foreground-muted mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
