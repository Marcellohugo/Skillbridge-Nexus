"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";

type DayStat = { date: string; count: number; minutes: number };

const STORAGE_KEY = "nexus.studyActivity.v1";
const WEEKS = 12;

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function offsetDayKey(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
}

function loadActivity(): Record<string, DayStat> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DayStat>;
  } catch {
    return {};
  }
}

function mergeSources(base: Record<string, DayStat>): Record<string, DayStat> {
  const merged = { ...base };
  if (typeof window === "undefined") return merged;

  try {
    const focus = window.localStorage.getItem("nexus.focusTimer.v1");
    if (focus) {
      const f = JSON.parse(focus) as { date: string; focusMinutes: number; sessions: number };
      if (f?.date && f.sessions > 0) {
        const existing = merged[f.date] ?? { date: f.date, count: 0, minutes: 0 };
        merged[f.date] = {
          date: f.date,
          count: Math.max(existing.count, f.sessions),
          minutes: Math.max(existing.minutes, f.focusMinutes),
        };
      }
    }
  } catch {}

  try {
    const dc = window.localStorage.getItem("nexus.dailyChallenge.v1");
    if (dc) {
      const parsed = JSON.parse(dc) as { history?: Array<{ date: string; correct: boolean | null }> };
      parsed.history?.forEach((h) => {
        if (h.correct === null) return;
        const existing = merged[h.date] ?? { date: h.date, count: 0, minutes: 0 };
        merged[h.date] = { date: h.date, count: existing.count + 1, minutes: existing.minutes };
      });
    }
  } catch {}

  return merged;
}

export function logStudyActivity(minutes: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, DayStat>) : {};
    const key = todayKey();
    const existing = parsed[key] ?? { date: key, count: 0, minutes: 0 };
    parsed[key] = { date: key, count: existing.count + 1, minutes: existing.minutes + minutes };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const LEVEL_STYLES: Record<number, string> = {
  0: "bg-background-secondary border border-border/60",
  1: "bg-accent/20",
  2: "bg-accent/40",
  3: "bg-accent/70",
  4: "bg-accent",
};

function buildGrid(activity: Record<string, DayStat>) {
  const days: Array<DayStat & { level: 0 | 1 | 2 | 3 | 4 }> = [];
  const start = -(WEEKS * 7 - 1);
  for (let i = start; i <= 0; i++) {
    const key = offsetDayKey(i);
    const stat = activity[key] ?? { date: key, count: 0, minutes: 0 };
    days.push({ ...stat, level: levelFor(stat.count) });
  }
  const weeks: Array<Array<(typeof days)[number]>> = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }
  return { days, weeks };
}

function summarize(days: Array<{ date: string; count: number; minutes: number }>) {
  const totalActive = days.filter((d) => d.count > 0).length;
  const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);
  let best = 0;
  let cur = 0;
  for (const d of days) {
    if (d.count > 0) {
      cur++;
      if (cur > best) best = cur;
    } else cur = 0;
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else break;
  }
  return { totalActive, totalMinutes, best, current };
}

const WEEKDAY_LABELS = ["Sen", "", "Rab", "", "Jum", "", "Min"];

export function StudyHeatmap() {
  const [mounted, setMounted] = React.useState(false);
  const [activity, setActivity] = React.useState<Record<string, DayStat>>({});

  React.useEffect(() => {
    setMounted(true);
    setActivity(mergeSources(loadActivity()));
  }, []);

  const { days, weeks } = React.useMemo(() => buildGrid(activity), [activity]);
  const summary = React.useMemo(() => summarize(days), [days]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader title="Heatmap aktivitas" subtitle="Memuat…" />
        <div className="h-32 animate-pulse rounded-lg bg-background-secondary" />
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Heatmap konsistensi
            </span>
          }
          subtitle={`${WEEKS} minggu terakhir · ${summary.totalActive} hari aktif`}
          action={<Badge tone="brand">{summary.current} hari beruntun</Badge>}
        />

        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-1 text-[10px] text-foreground-muted">
            {WEEKDAY_LABELS.map((l, i) => (
              <span key={`weekday-${i}`} className="h-3 leading-3">{l}</span>
            ))}
          </div>
          <div
            className="grid gap-1 flex-1"
            style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`${summary.totalActive} hari aktif dari ${WEEKS * 7} hari terakhir`}
          >
            {weeks.map((col, wi) => (
              <div key={`week-${wi}`} className="grid grid-rows-7 gap-1">
                {col.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} · ${d.count} aktivitas${d.minutes ? ` · ${d.minutes} menit` : ""}`}
                    className={`h-3 w-full rounded-sm ${LEVEL_STYLES[d.level]} transition-colors`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-foreground-muted">
          <span>Kurang</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((lv) => (
              <div key={`legend-${lv}`} className={`h-3 w-3 rounded-sm ${LEVEL_STYLES[lv]}`} />
            ))}
          </div>
          <span>Lebih</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border bg-background-secondary/50 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Streak saat ini</p>
            <p className="font-display font-bold text-lg mt-0.5">{summary.current}<span className="text-xs text-foreground-muted ml-1">hari</span></p>
          </div>
          <div className="rounded-lg border border-border bg-background-secondary/50 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Rekor</p>
            <p className="font-display font-bold text-lg mt-0.5">{summary.best}<span className="text-xs text-foreground-muted ml-1">hari</span></p>
          </div>
          <div className="rounded-lg border border-border bg-background-secondary/50 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Total menit</p>
            <p className="font-display font-bold text-lg mt-0.5">{summary.totalMinutes}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
