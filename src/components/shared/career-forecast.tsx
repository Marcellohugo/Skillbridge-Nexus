"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader } from "@/components/ui";

type Milestone = { label: string; score: number; color: string };
const MILESTONES: Milestone[] = [
  { label: "Developing", score: 35, color: "#B45309" },
  { label: "Progressing", score: 50, color: "#3157D5" },
  { label: "Career Ready", score: 70, color: "#0F766E" },
  { label: "Advanced Ready", score: 85, color: "#15803D" },
];

const FORECAST_ANCHOR_UTC = Date.UTC(2026, 3, 26);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weeksToReach(currentTRI: number, targetTRI: number, weeklyHours: number): number | null {
  if (currentTRI >= targetTRI) return 0;
  const gap = targetTRI - currentTRI;
  const triPerHour = 0.4;
  const weeks = gap / (weeklyHours * triPerHour);
  if (!isFinite(weeks)) return null;
  return Math.max(1, Math.ceil(weeks));
}

export function CareerForecast({
  currentTRI,
  weeklyHours,
  targetRole,
}: {
  currentTRI: number;
  weeklyHours: number;
  targetRole?: string | null;
}) {
  const { format } = useLang();
  const forecast = MILESTONES.map((m) => {
    const w = weeksToReach(currentTRI, m.score, weeklyHours);
    const etaDate = w !== null ? new Date(FORECAST_ANCHOR_UTC + w * WEEK_MS) : null;
    return { ...m, weeks: w, etaDate, reached: currentTRI >= m.score };
  });

  const next = forecast.find((f) => !f.reached);
  const pct = (v: number) => Math.min(100, Math.max(0, v));

  const fmtDate = (d: Date) => format.date(d, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Forecast kesiapan karir
            </span>
          }
          subtitle={targetRole ? `Proyeksi untuk ${targetRole}` : "Proyeksi berdasarkan kecepatan kamu"}
          action={<Badge tone="info">{weeklyHours}h/minggu</Badge>}
        />

        <div className="relative pb-6">
          <div className="h-2 overflow-hidden rounded-full bg-background-secondary">
            <div className="h-full bg-accent" style={{ width: `${pct(currentTRI)}%` }} />
          </div>
          <div className="relative mt-3 h-5">
            {MILESTONES.map((m) => (
              <div key={m.label} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${m.score}%` }}>
                <div className="h-2.5 w-2.5 rounded-full border-2 border-background" style={{ backgroundColor: m.color }} />
                <span className="mt-1 text-[10px] text-foreground-muted whitespace-nowrap">{m.score}</span>
              </div>
            ))}
            <div className="absolute -translate-x-1/2 -top-5" style={{ left: `${pct(currentTRI)}%` }}>
              <div className="inline-flex items-center rounded-md bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md">
                kamu · {currentTRI.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {next && next.weeks !== null && next.etaDate ? (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-foreground-muted">Milestone berikutnya</p>
            <p className="font-display font-bold text-lg mt-0.5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: next.color }} />
              {next.label} <span className="text-foreground-muted font-normal">· {next.score}+</span>
            </p>
            <p className="text-sm text-foreground-secondary mt-2">
              Estimasi tercapai dalam <strong>{next.weeks} minggu</strong> · {fmtDate(next.etaDate)}
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Asumsi: konsisten {weeklyHours} jam/minggu · 1 asesmen per 2 minggu.
            </p>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-success/30 bg-success-soft p-4 text-sm">
            Kamu sudah melewati semua milestone. Pertahankan momentum dan bimbing peer baru.
          </div>
        )}

        <div className="space-y-2">
          {forecast.map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
              <span className={`flex-1 ${f.reached ? "text-foreground-muted line-through" : ""}`}>{f.label}</span>
              <span className="text-xs text-foreground-muted font-mono">
                {f.reached ? "✓ tercapai" : f.weeks === null ? "—" : f.weeks === 0 ? "hari ini" : `${f.weeks} minggu`}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-foreground-muted mt-4">
          Model: TRI bertambah ~0.4 poin per jam belajar efektif. Akurasi meningkat seiring data asesmen kamu.
        </p>
      </div>
    </Card>
  );
}
