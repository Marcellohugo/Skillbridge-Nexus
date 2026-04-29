"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader, Progress, StatCard, Callout } from "@/components/ui";
import { getInstitutionAnalyticsAction, type InstitutionAnalyticsResult } from "@/features/institution/analytics.actions";

export default function InstitutionAnalyticsPage() {
  const { format } = useLang();
  const [data, setData] = React.useState<InstitutionAnalyticsResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getInstitutionAnalyticsAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;
  if (!data) {
    return (
      <div className="container-app py-8">
        <Callout tone="warning">{err ?? "Data belum tersedia."}</Callout>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Institution Analytics</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">{data.institutionName}</h1>
        <p className="mt-1 text-foreground-secondary">TRI, risiko, cohort health, dan curriculum blind-spot — data nyata.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Learner" value={`${data.totalLearners}`} tone="brand" />
        <StatCard label="Cohort" value={`${data.cohortCount}`} tone="accent" />
        <StatCard label="Rata-rata TRI" value={`${data.avgTRI}`} tone="info" />
        <StatCard label="Career Ready" value={`${data.careerReadyCount}`} tone="success" delta={`${data.careerReadyPct}%`} />
        <StatCard label="At Risk" value={`${data.atRiskCount}`} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="TRI trend (8 minggu)" subtitle="Rata-rata seluruh learner" />
          {data.recentTRISeries.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-4">Belum ada data history.</p>
          ) : (
            <div className="space-y-2">
              {data.recentTRISeries.slice(-14).map((p) => (
                <div key={p.date} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-foreground-muted">{format.date(p.date, { day: "numeric", month: "short" })}</span>
                  <div className="flex-1">
                    <Progress value={p.avg} tone={p.avg >= 70 ? "success" : "brand"} />
                  </div>
                  <span className="tabular-nums w-8 text-right">{p.avg}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Milestone distribution" subtitle="Learner per milestone" />
          <div className="space-y-2">
            {data.milestoneDistribution.map((m) => {
              const pct = data.totalLearners > 0 ? (m.count / data.totalLearners) * 100 : 0;
              return (
                <div key={m.milestone}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{m.milestone}</span>
                    <span className="tabular-nums">{m.count} ({Math.round(pct)}%)</span>
                  </div>
                  <Progress value={pct} tone="brand" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Cohort health" subtitle="Per-cohort risk + readiness" />
        <div className="grid gap-3 md:grid-cols-2">
          {data.cohorts.map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{c.name}</p>
                <Badge tone={c.avgTRI >= 70 ? "success" : c.avgTRI >= 50 ? "brand" : "warning"}>TRI {c.avgTRI}</Badge>
              </div>
              <Progress value={c.avgTRI} tone={c.avgTRI >= 70 ? "success" : "brand"} />
              <div className="mt-2 grid grid-cols-3 text-xs text-foreground-muted">
                <span>{c.learnerCount} learner</span>
                <span className="text-success">{c.careerReadyPct}% ready</span>
                <span className="text-warning">{c.atRiskCount} at risk</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Curriculum Blind-Spot" subtitle="Skill dengan gap terbesar lintas learner" />
        {data.curriculumBlindSpots.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-4">Belum ada data gap. Pastikan learner sudah menyelesaikan asesmen.</p>
        ) : (
          <div className="space-y-2">
            {data.curriculumBlindSpots.map((b) => (
              <div key={b.skill} className="flex items-center gap-3 text-sm">
                <span className="flex-1">{b.skill}</span>
                <span className="text-xs text-foreground-muted">{b.learnersAffected} learner</span>
                <span className="tabular-nums text-warning">{b.gapSum}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Intervention Queue" subtitle="Learner yang butuh perhatian" action={<Badge tone="warning">{data.interventionQueue.length}</Badge>} />
        {data.interventionQueue.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-4">🎉 Tidak ada intervention aktif.</p>
        ) : (
          <div className="space-y-3">
            {data.interventionQueue.map((i, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background-secondary/40 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{i.learnerName}</p>
                  <Badge tone={i.risk === "CRITICAL" ? "danger" : i.risk === "HIGH" ? "warning" : "brand"}>{i.risk}</Badge>
                </div>
                <p className="text-xs text-foreground-muted">{i.type.replace(/_/g, " ").toLowerCase()}</p>
                <p className="text-xs mt-1">{i.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
