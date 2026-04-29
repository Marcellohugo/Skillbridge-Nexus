"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getSkillSynergyAction,
  type SynergyPair,
  type SynergyResult,
} from "@/features/learner/synergy.actions";

export function SkillSynergyMap({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<SynergyResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getSkillSynergyAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Skill Synergy Map" subtitle="Kombinasi skill yang saling menguatkan" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Skill Synergy Map" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  if (data.totalActivePairs === 0) {
    return (
      <Card>
        <CardHeader title="Skill Synergy Map" subtitle="Butuh data skill + role requirement" />
        <p className="text-sm text-foreground-secondary">
          Map ini membutuhkan snapshot skill Anda serta kebutuhan skill per peran (role
          requirement). Selesaikan 1 assessment untuk mengaktifkan sinergi.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Skill Synergy Map"
        subtitle="Pasangan skill yang membuka banyak peran sekaligus"
        action={<Badge tone={data.verdictTone}>Synergy {data.synergyIndex}</Badge>}
      />

      <div className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-foreground-muted">Synergy Index</p>
          <p className="text-xs text-foreground-muted">
            {data.unlockedCount} aktif · {data.opportunityCount} peluang · {data.totalActivePairs} total pair
          </p>
        </div>
        <p className="text-3xl font-display font-bold">{data.synergyIndex}</p>
        <p className="text-sm text-foreground-secondary mt-1">{data.verdict}</p>
      </div>

      {data.opportunities.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">Bridging opportunities</p>
            <span className="text-xs text-foreground-muted">
              Satu skill sudah kuat — dekatkan pasangannya
            </span>
          </div>
          <div className="space-y-3">
            {(compact ? data.opportunities.slice(0, 2) : data.opportunities).map((p) => (
              <PairCard key={p.key} pair={p} />
            ))}
          </div>
        </section>
      )}

      {!compact && data.unlocked.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">Unlocked synergies</p>
            <span className="text-xs text-foreground-muted">Pasangan aktif — sudah beroperasi</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.unlocked.map((p) => (
              <PairCard key={p.key} pair={p} />
            ))}
          </div>
        </section>
      )}

      {!compact && data.foundation.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-bold text-sm">Foundation pairs</p>
            <span className="text-xs text-foreground-muted">Belum aktif — mulai dari satu skill</span>
          </div>
          <div className="space-y-2">
            {data.foundation.map((p) => (
              <PairRow key={p.key} pair={p} />
            ))}
          </div>
        </section>
      )}
    </Card>
  );
}

function PairCard({ pair }: { pair: SynergyPair }) {
  const tone =
    pair.state === "unlocked"
      ? { dot: "bg-success", label: "Active", badge: "success" as const }
      : pair.state === "bridge"
        ? { dot: "bg-brand", label: "Bridge", badge: "brand" as const }
        : { dot: "bg-warning", label: "Foundation", badge: "warning" as const };

  return (
    <div className="rounded-xl border border-border bg-background-secondary/30 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2 w-2 rounded-full shrink-0 ${tone.dot}`} />
          <p className="font-display font-semibold text-sm truncate">
            {pair.skillAName} <span className="text-foreground-muted">×</span> {pair.skillBName}
          </p>
        </div>
        <Badge tone={tone.badge}>{tone.label}</Badge>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <ScoreChip score={pair.skillAScore} label={pair.skillAName} />
        <span className="text-foreground-muted text-xs">+</span>
        <ScoreChip score={pair.skillBScore} label={pair.skillBName} />
      </div>

      <p className="text-xs text-foreground-secondary mb-3">{pair.insight}</p>

      <div className="flex flex-wrap gap-1.5">
        {pair.roles.map((r) => (
          <span
            key={`role-${r}`}
            className="text-[10px] uppercase tracking-wider rounded-full border border-border px-2 py-0.5 text-foreground-secondary"
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function PairRow({ pair }: { pair: SynergyPair }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-border/50 last:border-0">
      <span className="truncate font-medium">
        {pair.skillAName} × {pair.skillBName}
      </span>
      <span className="text-foreground-muted shrink-0">
        {pair.skillAScore} · {pair.skillBScore} · {pair.roles.length} peran
      </span>
    </div>
  );
}

function ScoreChip({ score, label }: { score: number; label: string }) {
  const tone =
    score >= 65
      ? "border-success/40 text-success"
      : score >= 50
        ? "border-brand/40 text-brand"
        : "border-warning/40 text-warning";
  return (
    <span
      title={label}
      className={`text-[11px] font-semibold rounded-md border px-2 py-1 bg-background-tertiary/40 ${tone}`}
    >
      {score}
    </span>
  );
}
