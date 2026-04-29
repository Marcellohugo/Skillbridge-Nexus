"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import {
  getCareerLadderAction,
  type LadderResult,
  type LadderSkillDelta,
  type LadderStep,
} from "@/features/learner/ladder.actions";

export function CareerLadder({ compact = false }: { compact?: boolean }) {
  const [data, setData] = React.useState<LadderResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getCareerLadderAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Career Ladder" subtitle="Pivot terpendek dari target role" />
        <div className="skeleton h-40" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="Career Ladder" />
        <p className="text-sm text-foreground-muted">{err ?? "Data belum tersedia."}</p>
      </Card>
    );
  }

  const current = data.currentRole;
  const shortest = data.shortestTransitionSlug;

  return (
    <Card>
      <CardHeader
        title="Career Ladder Planner"
        subtitle="Jalur pivot termurah dari target role Anda"
        action={
          <Badge tone="brand">
            {data.adjacent.length} pivot{data.adjacent.length === 1 ? "" : "s"}
          </Badge>
        }
      />

      <section className="rounded-xl border border-border p-4 bg-background-secondary/40 mb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
              Target role
            </p>
            <p className="font-display font-bold text-lg truncate">{current.name}</p>
            <p className="text-xs text-foreground-muted">
              {current.industry} · demand {current.demandLevel.toLowerCase()}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
              Fit score
            </p>
            <p className="font-display font-bold text-2xl tabular-nums leading-none">
              {current.fitScore}
              <span className="text-foreground-muted text-sm font-normal">/100</span>
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-background-tertiary overflow-hidden mb-2">
          <div
            className="h-full bg-brand"
            style={{ width: `${Math.min(100, current.fitScore)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-secondary">
          <span>
            Critical ready{" "}
            <strong className="tabular-nums">
              {current.readyCriticalCount}/{current.totalCriticalCount}
            </strong>
          </span>
          <span>
            Gap tersisa{" "}
            <strong className="tabular-nums">{current.transitionCostPct}%</strong>
          </span>
          {current.estimatedWeeks !== null && (
            <span>
              Estimasi{" "}
              <strong className="tabular-nums">±{current.estimatedWeeks}</strong> minggu @{" "}
              {data.weeklyHours}h/minggu
            </span>
          )}
        </div>
      </section>

      {data.adjacent.length === 0 ? (
        <p className="text-sm text-foreground-secondary">
          Tidak ada adjacent roles untuk target ini. Hubungi admin untuk menambahkan data
          adjacency.
        </p>
      ) : (
        <section className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-2">
            Pivot terdekat · diurutkan dari biaya transisi terendah
          </p>
          <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
            {data.adjacent.map((step) => (
              <LadderCard
                key={step.slug}
                step={step}
                isShortest={step.slug === shortest}
                weeklyHours={data.weeklyHours}
                compact={compact}
              />
            ))}
          </div>
        </section>
      )}

      <div className="rounded-xl border border-border bg-background-secondary/40 p-3 text-sm">
        <span className="text-[10px] uppercase tracking-wider text-foreground-muted mr-2">
          Insight
        </span>
        <span className="text-foreground-secondary">{data.insight}</span>
      </div>
    </Card>
  );
}

function LadderCard({
  step,
  isShortest,
  weeklyHours,
  compact,
}: {
  step: LadderStep;
  isShortest: boolean;
  weeklyHours: number;
  compact: boolean;
}) {
  const tone: "success" | "warning" | "muted" =
    step.transitionCostPct < 15
      ? "success"
      : step.transitionCostPct < 35
        ? "warning"
        : "muted";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isShortest
          ? "border-brand bg-brand/5"
          : "border-border bg-background-secondary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display font-bold text-sm truncate">{step.name}</p>
            {isShortest && <Badge tone="brand">shortest</Badge>}
          </div>
          <p className="text-xs text-foreground-muted truncate">
            {step.industry} · {step.demandLevel.toLowerCase()}
          </p>
        </div>
        <Badge tone={tone}>{step.transitionCostPct}% gap</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <Stat label="Fit" value={`${step.fitScore}`} suffix="/100" />
        <Stat label="Shared" value={`${step.sharedSkillCount}`} suffix="skill" />
        <Stat
          label="ETA"
          value={step.estimatedWeeks !== null ? `${step.estimatedWeeks}` : "—"}
          suffix={step.estimatedWeeks !== null ? "minggu" : ""}
        />
      </div>

      {!compact && step.upgradeSkills.length > 0 && (
        <SkillDeltaList
          title="Upgrade"
          items={step.upgradeSkills.slice(0, 3)}
          accent="warning"
        />
      )}
      {!compact && step.newSkills.length > 0 && (
        <SkillDeltaList
          title="Skill baru"
          items={step.newSkills.slice(0, 3)}
          accent="brand"
        />
      )}
      {compact && (step.upgradeSkills.length > 0 || step.newSkills.length > 0) && (
        <p className="text-[11px] text-foreground-muted truncate">
          {step.upgradeSkills.length + step.newSkills.length} skill gap · @{weeklyHours}h/mg
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg bg-background-tertiary/40 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted leading-none mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums leading-tight">
        {value}
        {suffix && (
          <span className="text-foreground-muted text-[10px] font-normal"> {suffix}</span>
        )}
      </p>
    </div>
  );
}

function SkillDeltaList({
  title,
  items,
  accent,
}: {
  title: string;
  items: LadderSkillDelta[];
  accent: "brand" | "warning";
}) {
  const dot = accent === "brand" ? "bg-brand" : "bg-warning";
  return (
    <div className="mt-2">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted mb-1">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((s) => (
          <li key={s.skillId} className="flex items-center gap-2 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
            <span className="flex-1 min-w-0 truncate">
              {s.name}
              {s.isCritical && (
                <span className="ml-1 text-warning font-semibold">·crit</span>
              )}
            </span>
            <span className="tabular-nums text-foreground-muted">
              {s.currentPct}→{s.targetPct}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
