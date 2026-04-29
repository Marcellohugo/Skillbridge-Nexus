"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getWeeklyPlanAction, type WeeklyPlanResult } from "@/features/learner/weekly-plan.actions";

const TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬",
  ARTICLE: "📄",
  INTERACTIVE: "🧪",
  PROJECT: "🛠️",
  QUIZ: "❓",
  WORKSHOP: "🧑‍🏫",
  PODCAST: "🎧",
};

export function WeeklyPlan() {
  const { format } = useLang();
  const [data, setData] = React.useState<WeeklyPlanResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getWeeklyPlanAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Weekly study plan" subtitle="Menyusun jadwal…" />
        <div className="h-40 animate-pulse bg-background-secondary rounded-xl" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Weekly study plan" subtitle="Jadwal belajar minggu ini" />
        <p className="text-sm text-foreground-muted">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  const fillPct = Math.round((data.totalPlanned / (data.weeklyHours * 60)) * 100);

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <span aria-hidden>🗓️</span> Weekly study plan
            </span>
          }
          subtitle={`${format.number(data.totalPlanned / 60, { maximumFractionDigits: 1 })} / ${data.weeklyHours} jam terjadwal · minggu dimulai ${format.date(data.weekStart, { day: "numeric", month: "short" })}`}
          action={<Badge tone={fillPct >= 80 ? "success" : fillPct >= 50 ? "brand" : "warning"}>{fillPct}% terisi</Badge>}
        />

        <div className="mb-3 h-2 rounded-full bg-background-secondary overflow-hidden">
          <div className="h-full bg-linear-to-r from-primary to-accent" style={{ width: `${Math.min(100, fillPct)}%` }} />
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {data.days.map((d) => {
            const utilPct = Math.min(100, (d.totalMinutes / Math.max(d.capacityMinutes, 1)) * 100);
            return (
              <div
                key={d.date}
                className={`rounded-lg border p-2 min-h-24 ${
                  d.isToday ? "border-primary bg-primary/5" : "border-border bg-background-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${d.isToday ? "text-primary" : "text-foreground-muted"}`}>
                    {d.label}
                  </span>
                  {d.isToday && <span className="text-[9px] text-primary font-bold">hari ini</span>}
                </div>
                <div className="h-1 rounded-full bg-background overflow-hidden mb-2">
                  <div
                    className={`h-full ${d.totalMinutes > 0 ? "bg-primary" : "bg-transparent"}`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {d.blocks.length === 0 ? (
                    <p className="text-[10px] text-foreground-muted italic">—</p>
                  ) : (
                    d.blocks.map((b) => (
                      <div
                        key={b.id}
                        title={`${b.title} · ${b.minutes} menit`}
                        className={`rounded border text-[10px] px-1.5 py-1 leading-tight ${
                          b.isMilestone
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : b.isQuickWin
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-border bg-background text-foreground-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span aria-hidden>{TYPE_ICONS[b.contentType] ?? "📘"}</span>
                          <span className="truncate">{b.title}</span>
                        </div>
                        <div className="text-foreground-muted tabular-nums mt-0.5">{b.minutes}m</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-foreground-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-accent/60" /> Milestone
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-success/60" /> Quick win
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-foreground-muted/40" /> Regular
            </span>
          </div>
          {data.leftover > 0 && (
            <span className="text-warning">
              {Math.ceil(data.leftover / 60)} jam modul belum masuk jadwal
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
