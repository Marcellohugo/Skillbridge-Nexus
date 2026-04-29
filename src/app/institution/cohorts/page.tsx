"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader, Progress, Callout } from "@/components/ui";
import { getInstitutionAnalyticsAction, type CohortSummary } from "@/features/institution/analytics.actions";

export default function InstitutionCohortsPage() {
  const { format } = useLang();
  const [cohorts, setCohorts] = React.useState<CohortSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getInstitutionAnalyticsAction();
      if (res.ok) {
        setCohorts(res.data.cohorts);
        setSelected(res.data.cohorts[0]?.id ?? null);
      } else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  const active = cohorts.find((c) => c.id === selected) ?? cohorts[0];

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Cohort Management</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Kelola Cohort</h1>
        <p className="mt-1 text-foreground-secondary">Pantau readiness, risiko, dan progres per angkatan — data dari DB.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      {cohorts.length === 0 ? (
        <Card><p className="text-center text-sm text-foreground-muted py-8">Belum ada cohort terdaftar.</p></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Daftar cohort" subtitle={`${cohorts.length} cohort`} />
            <div className="space-y-3">
              {cohorts.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${selected === c.id ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong bg-background-secondary/40"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-foreground-muted">{c.program ?? "—"} · {c.learnerCount} learner</p>
                    </div>
                    <Badge tone={c.avgTRI >= 70 ? "success" : c.avgTRI >= 50 ? "brand" : "warning"}>TRI {c.avgTRI}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Mini label="Career Ready" value={`${c.careerReadyPct}%`} />
                    <Mini label="At Risk" value={`${c.atRiskCount}`} tone={c.atRiskCount > 0 ? "warning" : "muted"} />
                    <Mini label="Learner" value={`${c.learnerCount}`} />
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {active && (
            <Card elevated>
              <h3 className="font-display font-bold text-lg">{active.name}</h3>
              <p className="text-xs text-foreground-muted mb-4">{active.program ?? "Program tidak diset"}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Rata-rata TRI</p>
                  <Progress value={active.avgTRI} tone={active.avgTRI >= 70 ? "success" : "brand"} />
                  <p className="text-xs text-right mt-0.5">{active.avgTRI}/100</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-2">Milestone distribution</p>
                  <div className="space-y-1.5">
                    {active.milestoneDistribution.map((m) => (
                      <div key={m.milestone} className="flex justify-between text-xs">
                        <span>{m.milestone}</span>
                        <span className="tabular-nums">{m.count}</span>
                      </div>
                    ))}
                    {active.milestoneDistribution.length === 0 && (
                      <p className="text-xs text-foreground-muted">Belum ada learner aktif.</p>
                    )}
                  </div>
                </div>
                {active.startDate && (
                  <p className="text-xs text-foreground-muted">
                    Periode: {format.date(active.startDate)}
                    {active.endDate ? ` → ${format.date(active.endDate)}` : ""}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "warning" | "muted" }) {
  const color = tone === "warning" ? "text-warning" : tone === "muted" ? "text-foreground-muted" : "text-foreground";
  return (
    <div className="rounded-lg bg-background-tertiary/50 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}
