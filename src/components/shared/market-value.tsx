"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getMarketValueAction, type MarketValueResult } from "@/features/learner/market-value.actions";

function fmtIDR(v: number, format: ReturnType<typeof useLang>["format"]): string {
  if (v >= 1_000_000) {
    return format.currency(v, "IDR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: v % 1_000_000 === 0 ? 0 : 1,
    });
  }
  return format.currency(v, "IDR", { maximumFractionDigits: 0 });
}

export function MarketValue() {
  const { format, lang } = useLang();
  const [data, setData] = React.useState<MarketValueResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getMarketValueAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="💰 Skill Market Value" subtitle="Menghitung nilai pasar kamu..." />
        <div className="h-32 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data || !data.topRole) {
    return (
      <Card>
        <CardHeader title="💰 Skill Market Value" />
        <p className="text-sm text-foreground-secondary">
          {err ?? "Butuh skill snapshot + role dengan requirements untuk hitung market value. Selesaikan asesmen dulu."}
        </p>
      </Card>
    );
  }

  const scoreColor =
    data.marketReadyScore >= 75
      ? "text-success"
      : data.marketReadyScore >= 55
        ? "text-brand"
        : data.marketReadyScore >= 35
          ? "text-warning"
          : "text-foreground-muted";

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title="💰 Skill Market Value"
          subtitle={`${data.readinessLabel} · ${data.totalRolesConsidered} role dianalisis`}
          action={
            <Badge tone={data.marketReadyScore >= 55 ? "success" : "muted"}>
              Market-ready {data.marketReadyScore}/100
            </Badge>
          }
        />

        <div className="mb-4 rounded-lg border border-border bg-background-secondary/30 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">
            Estimasi band untuk top-role: {data.topRole.name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl tabular-nums">
              {fmtIDR(data.estimatedLow, format)}
            </span>
            <span className="text-foreground-muted">–</span>
            <span className="font-display font-bold text-3xl tabular-nums">
              {fmtIDR(data.estimatedHigh, format)}
            </span>
            <span className="text-foreground-muted text-sm">/ bulan</span>
          </div>
          <p className="text-xs text-foreground-secondary mt-2">
            Dihitung dari band {lang === "id" ? "Rp " : "IDR "}{data.topRole.salaryRange} × fit {data.topRole.fitScore}% × demand multiplier ({data.topRole.demandLevel}).
          </p>
        </div>

        <div className={`mb-3 text-sm ${scoreColor}`}>
          <strong>💡 {data.readinessLabel}</strong> — <span className="text-foreground-secondary">{data.readinessHint}</span>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
            Breakdown by role (top {data.byRole.length})
          </div>
          <div className="stack stack-xs">
            {data.byRole.map((r) => (
              <div key={r.slug} className="rounded-md border border-border p-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate">{r.name}</span>
                    <Badge tone={r.demandLevel === "very_high" ? "success" : r.demandLevel === "high" ? "brand" : "muted"}>
                      {r.demandLevel}
                    </Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-accent"
                      style={{ width: `${r.fitScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 text-xs">
                  <div className="font-mono tabular-nums font-semibold">
                    {fmtIDR(r.estimatedLow, format)}-{fmtIDR(r.estimatedHigh, format)}
                  </div>
                  <div className="text-foreground-muted">Fit {r.fitScore}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-foreground-muted">
          ⚠️ Estimasi indikatif berdasarkan salary range publik × coverage skill × demand. Hasil aktual bergantung pada perusahaan, lokasi, dan soft skill.
        </p>
      </div>
    </Card>
  );
}
