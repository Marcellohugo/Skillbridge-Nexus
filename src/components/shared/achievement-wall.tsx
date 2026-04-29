"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getAchievementsAction, type AchievementItem } from "@/features/learner/achievements.actions";

const CATEGORY_ICONS: Record<string, string> = {
  milestone: "🏆",
  consistency: "🔥",
  assessment: "🧠",
  portfolio: "🧩",
  mentoring: "🤝",
  learning: "📚",
  achievement: "⭐",
};

function iconFor(cat: string) {
  return CATEGORY_ICONS[cat?.toLowerCase()] ?? "🎖️";
}

export function AchievementWall({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = React.useState<AchievementItem[]>([]);
  const [stats, setStats] = React.useState<{ earned: number; total: number; nextPct: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | "earned" | "locked">("all");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getAchievementsAction();
      if (!alive) return;
      if (res.ok) {
        setItems(res.items);
        setStats(res.stats);
      } else setErr(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = items
    .filter((i) => {
      if (filter === "earned") return i.earned;
      if (filter === "locked") return !i.earned;
      return true;
    })
    .sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      return b.progress - a.progress;
    });

  const visible = compact ? filtered.slice(0, 6) : filtered;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Achievement wall" subtitle="Memuat…" />
        <div className="h-40 animate-pulse bg-background-secondary rounded-xl" />
      </Card>
    );
  }

  if (err || !stats) {
    return (
      <Card>
        <CardHeader title="Achievement wall" subtitle="Badge & milestone kamu" />
        <p className="text-sm text-foreground-muted">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  const progressPct = Math.round((stats.earned / Math.max(stats.total, 1)) * 100);

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <span aria-hidden>🎖️</span> Achievement wall
            </span>
          }
          subtitle={`${stats.earned}/${stats.total} badge terbuka · ${progressPct}% koleksi`}
          action={
            <div className="flex gap-1">
              {(["all", "earned", "locked"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                    filter === f
                      ? "bg-primary text-white border-primary"
                      : "bg-background-secondary border-border text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Semua" : f === "earned" ? "Terbuka" : "Terkunci"}
                </button>
              ))}
            </div>
          }
        />

        <div className="mb-4 h-2 rounded-full bg-background-secondary overflow-hidden">
          <div className="h-full bg-linear-to-r from-primary via-accent to-success" style={{ width: `${progressPct}%` }} />
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-6">Tidak ada badge di filter ini.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visible.map((a) => (
              <div
                key={a.id}
                className={`relative rounded-xl border p-3 transition-all ${
                  a.earned
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-border bg-background-secondary/30"
                }`}
                title={a.criteria}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`h-9 w-9 rounded-lg grid place-items-center text-lg ${
                      a.earned ? "shadow-md" : "opacity-40 grayscale"
                    }`}
                    style={a.earned ? { backgroundColor: a.color + "20", color: a.color } : undefined}
                  >
                    {iconFor(a.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${a.earned ? "" : "text-foreground-muted"}`}>
                      {a.name}
                    </p>
                    <p className="text-[10px] text-foreground-muted uppercase tracking-wider">{a.category}</p>
                  </div>
                </div>

                <p className="text-[11px] text-foreground-secondary line-clamp-2 mb-2">{a.description}</p>

                {a.earned ? (
                  <Badge tone="success">✓ Terbuka</Badge>
                ) : (
                  <div>
                    <div className="h-1.5 rounded-full bg-background overflow-hidden">
                      <div className="h-full bg-primary/70" style={{ width: `${a.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-foreground-muted mt-1 flex items-center justify-between">
                      <span>{a.progressHint}</span>
                      <span className="tabular-nums">{a.progress}%</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {compact && filtered.length > 6 && (
          <p className="text-[11px] text-center text-foreground-muted mt-4">
            +{filtered.length - 6} badge lagi · buka halaman achievement
          </p>
        )}
      </div>
    </Card>
  );
}
