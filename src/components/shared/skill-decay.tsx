"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getSkillDecayAction,
  type SkillDecayResult,
  type DecayTier,
} from "@/features/learner/skill-decay.actions";

const TIER_TONE: Record<DecayTier, "success" | "brand" | "warning" | "danger"> = {
  fresh: "success",
  warming: "brand",
  fading: "warning",
  decayed: "danger",
};

const TIER_FILL: Record<DecayTier, string> = {
  fresh: "bg-linear-to-r from-success to-emerald-400",
  warming: "bg-linear-to-r from-primary to-cyan-400",
  fading: "bg-linear-to-r from-warning to-amber-400",
  decayed: "bg-linear-to-r from-danger to-rose-400",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export function SkillDecay({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<SkillDecayResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getSkillDecayAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Skill Decay Monitor" subtitle="Melacak skill yang mulai memudar" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Skill Decay Monitor" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  if (data.skills.length === 0) {
    return (
      <Card>
        <CardHeader title="Skill Decay Monitor" subtitle="Butuh skill-score snapshot untuk analisis" />
        <p className="text-sm text-foreground-secondary">
          Belum ada snapshot skill untuk diukur. Selesaikan satu assessment atau unggah
          evidence untuk mulai melacak retensi skill Anda.
        </p>
      </Card>
    );
  }

  const topSkills = compact ? data.skills.slice(0, 4) : data.skills.slice(0, 10);

  return (
    <Card>
      <CardHeader
        title="Skill Decay Monitor"
        subtitle={
          data.targetRoleName
            ? `Forgetting curve · prioritas ${data.targetRoleName}`
            : "Forgetting curve · skill Anda"
        }
        action={
          <Badge tone={data.atRiskCount > 0 ? "warning" : "success"}>
            {data.atRiskCount > 0
              ? `${data.atRiskCount} skill butuh refresh`
              : "Semua skill terjaga"}
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricTile label="Retensi rata-rata" value={`${data.averageRetention}%`} tone="brand" />
        <MetricTile label="Health score" value={String(data.healthScore)} tone="accent" />
        <MetricTile label="Terakhir praktik" value={timeAgo(data.lastTouch)} tone="muted" />
      </div>

      <div className="space-y-3">
        {topSkills.map((s) => (
          <div key={s.skillId} className="rounded-xl border border-border p-3 bg-background-secondary/40">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-semibold truncate">{s.name}</p>
                {s.isTargetSkill && <Badge tone="brand">Target</Badge>}
                <Badge tone={TIER_TONE[s.tier]}>{s.tierLabel}</Badge>
              </div>
              <span className="text-xs text-foreground-muted shrink-0">
                {s.daysSince === 0 ? "baru saja" : `${s.daysSince} hari`}
              </span>
            </div>

            <div className="relative h-2 rounded-full bg-background-tertiary overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${TIER_FILL[s.tier]}`}
                style={{ width: `${Math.round(s.retention * 100)}%` }}
              />
              <div
                className="absolute inset-y-0 w-px bg-foreground-muted/40"
                style={{ left: `${s.lastScore}%` }}
                title={`Skor awal ${s.lastScore}`}
              />
            </div>

            <div className="flex items-center justify-between mt-1.5 text-xs text-foreground-muted">
              <span>
                Efektif: <span className="text-foreground font-semibold">{s.effectiveScore}</span> / {s.lastScore}
              </span>
              <span>Half-life ~{s.halfLifeDays}h</span>
            </div>

            {!compact && (
              <p className="text-xs text-foreground-secondary mt-2">
                <span className="chip mr-2">{s.refreshMinutes} menit</span>
                {s.suggestedAction}
              </p>
            )}
          </div>
        ))}
      </div>

      {compact && data.skills.length > topSkills.length && (
        <p className="text-xs text-foreground-muted mt-3">
          +{data.skills.length - topSkills.length} skill lain di analisis penuh.
        </p>
      )}
    </Card>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "brand" | "accent" | "muted";
}) {
  const bg =
    tone === "brand" ? "bg-primary-soft" : tone === "accent" ? "bg-accent-soft" : "bg-background-tertiary";
  const fg = tone === "muted" ? "text-foreground" : tone === "brand" ? "text-primary" : "text-accent";
  return (
    <div className={`rounded-xl ${bg} p-3 border border-border`}>
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted">{label}</p>
      <p className={`mt-1 text-lg font-display font-bold ${fg}`}>{value}</p>
    </div>
  );
}
