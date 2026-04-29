"use client";

import * as React from "react";
import { Badge, Card, CardHeader, Input, StatCard, Callout } from "@/components/ui";
import { listInstitutionMembersAction, type InstitutionLearnerRow } from "@/features/institution/analytics.actions";

export default function InstitutionMembersPage() {
  const [rows, setRows] = React.useState<InstitutionLearnerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "at-risk" | "ready">("all");

  React.useEffect(() => {
    (async () => {
      const res = await listInstitutionMembersAction();
      if (res.ok) setRows(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.email.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "at-risk") return r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL";
    if (filter === "ready") return r.currentTRI >= 70;
    return true;
  });

  const stats = {
    total: rows.length,
    avgTRI: rows.length ? Math.round(rows.reduce((s, r) => s + r.currentTRI, 0) / rows.length) : 0,
    atRisk: rows.filter((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length,
    ready: rows.filter((r) => r.currentTRI >= 70).length,
  };

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Member Management</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Anggota Institusi</h1>
        <p className="mt-1 text-foreground-secondary">Daftar learner dari seluruh cohort — real-time.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total learner" value={`${stats.total}`} tone="brand" />
        <StatCard label="Rata-rata TRI" value={`${stats.avgTRI}`} tone="accent" />
        <StatCard label="Career Ready" value={`${stats.ready}`} tone="success" delta={`${stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0}%`} />
        <StatCard label="At Risk" value={`${stats.atRisk}`} tone="warning" />
      </div>

      <Card>
        <CardHeader
          title="Daftar anggota"
          subtitle={`${filtered.length}/${rows.length}`}
          action={
            <div className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/email…" className="h-9 text-sm" />
              <select aria-label="Filter learner" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="input h-9 text-sm py-0">
                <option value="all">Semua</option>
                <option value="at-risk">At Risk</option>
                <option value="ready">Career Ready</option>
              </select>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-foreground-muted py-8">Tidak ada anggota yang cocok.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <div key={r.userId} className="py-3 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-sm shrink-0">
                  {r.name.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <Badge tone={r.currentTRI >= 70 ? "success" : r.currentTRI >= 50 ? "brand" : "warning"}>{r.milestone}</Badge>
                    {(r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL") && <Badge tone="danger">{r.riskLevel}</Badge>}
                    {r.openInterventions > 0 && <Badge tone="warning">{r.openInterventions} intervensi</Badge>}
                  </div>
                  <p className="text-xs text-foreground-muted truncate">{r.email} · {r.cohortName ?? "—"} · {r.targetRole ?? "target?"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-display font-bold tabular-nums">{r.currentTRI}</p>
                  <p className="text-[10px] text-foreground-muted">TRI</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
