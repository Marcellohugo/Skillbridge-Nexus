"use client";

import * as React from "react";
import { Card, CardHeader, Badge, Progress, StatCard, Callout } from "@/components/ui";
import { getPlatformMetricsAction, type PlatformMetrics } from "@/features/admin/platform.actions";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = React.useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await getPlatformMetricsAction();
      if (res.ok) setMetrics(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;
  if (!metrics) {
    return (
      <div className="container-app py-8">
        <Callout tone="warning">{err ?? "Metrik belum tersedia."}</Callout>
      </div>
    );
  }

  const validationPct = metrics.totalProjects > 0 ? Math.round((metrics.validatedProjects / metrics.totalProjects) * 100) : 0;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Platform Analytics</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Metrik Platform</h1>
        <p className="mt-1 text-foreground-secondary">Angka nyata dari database — bukan proyeksi demo.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total user" value={`${metrics.totalUsers}`} tone="brand" delta={`${metrics.activeUsers} aktif`} />
        <StatCard label="Learner" value={`${metrics.learners}`} tone="info" />
        <StatCard label="Mentor" value={`${metrics.mentors}`} tone="accent" />
        <StatCard label="Avg TRI" value={`${metrics.avgTRI}`} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Aktivitas pembelajaran" />
          <div className="space-y-3">
            <Row label="Assessment selesai" value={metrics.totalAssessments} />
            <Row label="Skill snapshot" value={metrics.totalSnapshots} />
            <Row label="Sesi mentoring" value={metrics.totalSessions} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Portfolio" />
          <div className="space-y-3">
            <Row label="Proyek total" value={metrics.totalProjects} />
            <Row label="Tervalidasi" value={metrics.validatedProjects} />
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground-muted">Validation rate</span>
                <span className="tabular-nums">{validationPct}%</span>
              </div>
              <Progress value={validationPct} tone={validationPct >= 50 ? "success" : "warning"} />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Governance" />
          <div className="space-y-3">
            <Row label="Badge earned" value={metrics.totalBadges} />
            <Row label="Intervensi aktif" value={metrics.totalInterventions} tone={metrics.totalInterventions > 0 ? "warning" : "muted"} />
            <Row label="Admin" value={metrics.admins} />
            <Row label="Institution mgr" value={metrics.institutionManagers} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Role distribution" />
        <div className="space-y-2">
          {([
            { label: "Learner", v: metrics.learners, tone: "brand" as const },
            { label: "Mentor", v: metrics.mentors, tone: "accent" as const },
            { label: "Institution Manager", v: metrics.institutionManagers, tone: "info" as const },
            { label: "Admin", v: metrics.admins, tone: "success" as const },
          ]).map((r) => {
            const pct = metrics.totalUsers > 0 ? (r.v / metrics.totalUsers) * 100 : 0;
            return (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{r.label}</span>
                  <span className="tabular-nums">{r.v} ({Math.round(pct)}%)</span>
                </div>
                <Progress value={pct} tone={r.tone} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: "warning" | "muted" }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-foreground-muted">{label}</span>
      <Badge tone={tone === "warning" ? "warning" : "muted"}>{value}</Badge>
    </div>
  );
}
