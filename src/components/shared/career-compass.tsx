"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getCareerCompassAction,
  type CompassRoleRanking,
  type CompassResult,
} from "@/features/learner/compass.actions";

const BADGE_CONFIG: Record<CompassRoleRanking["badge"], { label: string; tone: "success" | "brand" | "info" | "warning"; emoji: string }> = {
  rising: { label: "Rising Match", tone: "success", emoji: "🚀" },
  stretch: { label: "Stretch Goal", tone: "brand", emoji: "⛰️" },
  foundation: { label: "Foundation Ready", tone: "info", emoji: "🧱" },
  explore: { label: "Explore", tone: "warning", emoji: "🧭" },
};

export function CareerCompass() {
  const [data, setData] = React.useState<CompassResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getCareerCompassAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="🧭 Career Compass" subtitle="Menganalisis kecocokan karier..." />
        <div className="h-32 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="🧭 Career Compass" />
        <p className="text-sm text-danger">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  if (data.rankings.length === 0) {
    return (
      <Card>
        <CardHeader title="🧭 Career Compass" subtitle="Butuh skill data dulu" />
        <p className="text-sm text-foreground-secondary">
          Compass butuh skill snapshot + role dengan requirements. Selesaikan asesmen untuk mengaktifkan.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="🧭 Career Compass"
        subtitle={`Top ${data.rankings.length} dari ${data.totalRolesEvaluated} role — ranking personal`}
      />
      <div className="stack stack-sm">
        {data.rankings.map((r, idx) => {
          const cfg = BADGE_CONFIG[r.badge];
          const critPct = r.criticalTotal > 0 ? (r.criticalMet / r.criticalTotal) * 100 : 0;
          return (
            <div
              key={r.slug}
              className={`rounded-lg border p-3 transition-colors ${
                r.isTarget
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono tabular-nums text-xs text-foreground-muted">#{idx + 1}</span>
                    <h3 className="font-display font-bold truncate">{r.name}</h3>
                    {r.isTarget && <Badge tone="brand">Target</Badge>}
                  </div>
                  <p className="text-xs text-foreground-muted">{r.industry} · Demand: {r.demandLevel}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display font-bold text-2xl tabular-nums text-primary">
                    {r.fitScore}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-foreground-muted">Fit</div>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden mb-2">
                <div
                  className="h-full bg-linear-to-r from-primary to-accent transition-all"
                  style={{ width: `${r.fitScore}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Badge tone={cfg.tone}>{cfg.emoji} {cfg.label}</Badge>
                {r.criticalTotal > 0 && (
                  <Badge tone={critPct >= 75 ? "success" : critPct >= 40 ? "brand" : "muted"}>
                    Kritis: {r.criticalMet}/{r.criticalTotal}
                  </Badge>
                )}
                {r.topStrength && (
                  <span className="text-foreground-secondary">
                    💪 <span className="font-semibold">{r.topStrength}</span>
                  </span>
                )}
                {r.topGap && (
                  <span className="text-foreground-muted">
                    · 🎯 Gap: <span className="font-semibold">{r.topGap}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-foreground-muted">
        Skor dihitung dari coverage skill + bobot requirement × snapshot terbaru kamu. Target role selalu tampil di atas.
      </p>
    </Card>
  );
}
