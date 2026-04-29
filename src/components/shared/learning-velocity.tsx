"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getLearningVelocityAction,
  type VelocityResult,
} from "@/features/learner/velocity.actions";

export function LearningVelocity({ compact = false }: { compact?: boolean }) {
  const { format } = useLang();
  const [data, setData] = React.useState<VelocityResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getLearningVelocityAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Learning Velocity" subtitle="Momentum & akselerasi belajar" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Learning Velocity" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Learning Velocity"
        subtitle="Kecepatan TRI per minggu + deteksi akselerasi"
        action={<Badge tone={data.momentumTone}>{data.momentumLabel}</Badge>}
      />

      <div className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-foreground-muted">Velocity</p>
          <p className="text-xs text-foreground-muted">
            {data.entriesUsed} catatan · konsistensi {data.consistencyScore}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-display font-bold">
            {data.velocity >= 0 ? "+" : ""}
            {data.velocity}
          </p>
          <p className="text-sm text-foreground-muted">TRI/minggu</p>
          {data.momentum !== "insufficient" && (
            <span
              className={`ml-2 text-xs font-semibold ${data.acceleration > 0 ? "text-success" : data.acceleration < 0 ? "text-danger" : "text-foreground-muted"}`}
            >
              {data.acceleration >= 0 ? "▲" : "▼"} {Math.abs(data.acceleration)}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground-secondary mt-1">{data.insight}</p>
      </div>

      {data.weeklyPoints.length >= 2 && <Sparkline points={data.weeklyPoints} />}

      <div className={`grid gap-3 mt-5 ${compact ? "grid-cols-2" : "sm:grid-cols-3"}`}>
        <MetricTile
          label="Recent 4w"
          value={data.recentVelocity >= 0 ? `+${data.recentVelocity}` : `${data.recentVelocity}`}
          hint="Rata-rata TRI/minggu periode terbaru"
        />
        <MetricTile
          label="Prior 4w"
          value={data.priorVelocity >= 0 ? `+${data.priorVelocity}` : `${data.priorVelocity}`}
          hint="Rata-rata TRI/minggu periode sebelumnya"
        />
        {!compact && (
          <MetricTile
            label="Best week"
            value={data.bestWeek ? `+${data.bestWeek.delta}` : "—"}
            hint={
              data.bestWeek ? format.date(data.bestWeek.weekStart) : "Belum ada"
            }
          />
        )}
      </div>

      {!compact && data.projection.weeksToNextMilestone !== null && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-foreground-muted">Projection</p>
              <p className="text-sm font-semibold mt-0.5">
                {data.projection.targetLabel}{" "}
                <span className="text-foreground-muted font-normal">
                  ({data.projection.targetScore} TRI)
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-brand">
                {data.projection.weeksToNextMilestone}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-foreground-muted">minggu</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-background-secondary/30">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted">{label}</p>
      <p className="text-xl font-display font-bold mt-1">{value}</p>
      <p className="text-[11px] text-foreground-muted mt-1 truncate">{hint}</p>
    </div>
  );
}

function Sparkline({ points }: { points: VelocityResult["weeklyPoints"] }) {
  const w = 320;
  const h = 64;
  const pad = 4;
  const min = Math.min(...points.map((p) => p.score));
  const max = Math.max(...points.map((p) => p.score));
  const range = Math.max(max - min, 1);
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const path = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (h - pad * 2) * (1 - (p.score - min) / range);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPath = `${path} L ${pad + (points.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`;
  const last = points[points.length - 1];
  const lastX = pad + (points.length - 1) * step;
  const lastY = pad + (h - pad * 2) * (1 - (last.score - min) / range);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-16"
      preserveAspectRatio="none"
      role="img"
      aria-label="Weekly TRI trend"
    >
      <defs>
        <linearGradient id="velocityFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#velocityFill)" />
      <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3" fill="var(--color-brand)" />
    </svg>
  );
}
