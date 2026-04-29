"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getOpportunityRadarAction,
  type OpportunityResult,
  type OpportunityRole,
  type OpportunityGap,
} from "@/features/learner/opportunity.actions";

export function OpportunityRadar({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<OpportunityResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getOpportunityRadarAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Opportunity Radar" subtitle="Role yang mungkin belum Anda sadari" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Opportunity Radar" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  const top = data.opportunities[0] ?? null;

  return (
    <Card>
      <CardHeader
        title="Opportunity Radar"
        subtitle="Role tersembunyi yang ternyata dekat dengan stack Anda"
        action={
          <Badge tone="brand">
            {data.crossFamilyCount} lintas-domain
          </Badge>
        }
      />

      <section className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
              Target saat ini
            </p>
            <p className="font-display font-bold text-sm truncate">
              {data.targetRoleName}
              <span className="text-foreground-muted font-normal ml-1">
                · {data.targetFamilyLabel}
              </span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
              Median fit
            </p>
            <p className="font-semibold tabular-nums text-sm">
              {data.medianFit}
              <span className="text-foreground-muted text-xs font-normal">/100</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-foreground-secondary">{data.insight}</p>
        <p className="text-xs text-foreground-muted mt-2">
          Discovered dari {data.scannedCount} role non-target/non-adjacent.
        </p>
      </section>

      {data.opportunities.length === 0 ? (
        <p className="text-sm text-foreground-secondary">
          Tidak ada role tambahan untuk di-radar — target + adjacent sudah mencakup seluruh sistem.
        </p>
      ) : (
        <section>
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-2">
            Top discoveries · diurutkan dari fit tertinggi
          </p>
          <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {data.opportunities.map((op, i) => (
              <OpportunityCard key={op.slug} op={op} rank={i + 1} compact={compact} />
            ))}
          </div>
        </section>
      )}

      {!compact && top && (
        <div className="mt-5 pt-4 border-t border-border text-sm text-foreground-secondary">
          <span className="text-[10px] uppercase tracking-wider text-foreground-muted mr-2">
            Cara membaca
          </span>
          Skor <strong>surprise</strong> = fit role ini − median fit semua role yang di-scan. Nilai
          positif berarti Anda lebih siap untuk peran ini dibanding rata-rata.
        </div>
      )}
    </Card>
  );
}

function OpportunityCard({
  op,
  rank,
  compact,
}: {
  op: OpportunityRole;
  rank: number;
  compact: boolean;
}) {
  const fitTone: "success" | "warning" | "muted" =
    op.fitScore >= 70 ? "success" : op.fitScore >= 55 ? "warning" : "muted";
  return (
    <div
      className={`rounded-xl border p-4 ${
        rank === 1 ? "border-brand bg-brand/5" : "border-border bg-background-secondary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] uppercase tracking-wider text-foreground-muted font-semibold">
              #{rank}
            </span>
            {op.crossFamily && <Badge tone="brand">lintas-domain</Badge>}
          </div>
          <p className="font-display font-bold text-sm truncate">{op.name}</p>
          <p className="text-xs text-foreground-muted truncate">
            {op.familyLabel} · demand {op.demandLevel.toLowerCase()}
          </p>
        </div>
        <Badge tone={fitTone}>{op.fitScore}%</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <MiniStat
          label="Surprise"
          value={op.surpriseScore >= 0 ? `+${op.surpriseScore}` : `${op.surpriseScore}`}
          tone={op.surpriseScore > 0 ? "success" : "muted"}
        />
        <MiniStat
          label="Gap"
          value={`${op.transitionCostPct}%`}
          tone={op.transitionCostPct < 25 ? "success" : "muted"}
        />
        <MiniStat
          label="ETA"
          value={op.estimatedWeeks !== null ? `${op.estimatedWeeks}mg` : "—"}
          tone="muted"
        />
      </div>

      {!compact && op.totalCriticalCount > 0 && (
        <p className="text-[11px] text-foreground-muted mb-2">
          Critical ready{" "}
          <strong className="tabular-nums text-foreground-secondary">
            {op.readyCriticalCount}/{op.totalCriticalCount}
          </strong>
        </p>
      )}

      {op.blockingGaps.length > 0 && !compact && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-1">
            Blocking gaps
          </p>
          <ul className="space-y-1">
            {op.blockingGaps.map((g) => (
              <GapRow key={g.skillId} gap={g} />
            ))}
          </ul>
        </div>
      )}

      {compact && op.blockingGaps.length > 0 && (
        <p className="text-[11px] text-foreground-muted truncate">
          Gap: {op.blockingGaps.map((g) => g.name).join(" · ")}
        </p>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "muted";
}) {
  const color = tone === "success" ? "text-success" : "text-foreground-secondary";
  return (
    <div className="rounded-lg bg-background-tertiary/40 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted leading-none mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold tabular-nums leading-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}

function GapRow({ gap }: { gap: OpportunityGap }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
          gap.isCritical ? "bg-warning" : "bg-brand"
        }`}
      />
      <span className="flex-1 min-w-0 truncate">
        {gap.name}
        {gap.isCritical && (
          <span className="ml-1 text-warning font-semibold">·crit</span>
        )}
      </span>
      <span className="tabular-nums text-foreground-muted">
        {gap.currentPct}→{gap.targetPct}
      </span>
    </li>
  );
}
