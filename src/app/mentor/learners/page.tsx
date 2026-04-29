"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader, Progress, StatCard, Callout } from "@/components/ui";
import { listMentorLearnersAction, type MentorLearnerRow } from "@/features/mentor/session.actions";

type Sort = "tri-desc" | "tri-asc" | "name" | "risk";

export default function MentorLearnersPage() {
  const { format } = useLang();
  const [rows, setRows] = React.useState<MentorLearnerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>("tri-desc");
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await listMentorLearnersAction();
      if (res.ok) {
        setRows(res.data);
        setSelected(res.data[0]?.userId ?? null);
      } else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  const sorted = React.useMemo(() => {
    const arr = [...rows];
    if (sort === "tri-desc") arr.sort((a, b) => b.currentTRI - a.currentTRI);
    else if (sort === "tri-asc") arr.sort((a, b) => a.currentTRI - b.currentTRI);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else {
      const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      arr.sort((a, b) => (rank[a.riskLevel] ?? 99) - (rank[b.riskLevel] ?? 99));
    }
    return arr;
  }, [rows, sort]);

  const selectedRow = sorted.find((r) => r.userId === selected) ?? sorted[0];
  const avgTRI = rows.length ? Math.round(rows.reduce((s, r) => s + r.currentTRI, 0) / rows.length) : 0;
  const careerReady = rows.filter((r) => r.currentTRI >= 70).length;
  const atRisk = rows.filter((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length;

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Learner Management</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Learner Anda</h1>
        <p className="mt-1 text-foreground-secondary">Learner yang pernah sesi dengan Anda. Data real-time dari DB.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total learner" value={`${rows.length}`} tone="brand" delta="pernah sesi" />
        <StatCard label="Avg TRI" value={`${avgTRI}`} tone="accent" />
        <StatCard label="Career Ready" value={`${careerReady}`} tone="success" delta={`${rows.length > 0 ? Math.round((careerReady / rows.length) * 100) : 0}%`} />
        <StatCard label="At risk" value={`${atRisk}`} tone="warning" delta="HIGH/CRITICAL" />
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-sm text-foreground-muted">
            Belum ada learner. Learner yang request sesi akan muncul di sini.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Daftar learner" subtitle="Klik untuk detail" action={
              <select aria-label="Sort learner" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input text-sm h-9 w-auto">
                <option value="tri-desc">TRI tinggi → rendah</option>
                <option value="tri-asc">TRI rendah → tinggi</option>
                <option value="risk">Risk tertinggi dulu</option>
                <option value="name">Nama A-Z</option>
              </select>
            } />
            <div className="space-y-2">
              {sorted.map((l) => (
                <button
                  type="button"
                  key={l.userId}
                  onClick={() => setSelected(l.userId)}
                  className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-colors ${selected === l.userId ? "border-primary bg-primary-soft" : "border-border bg-background-secondary/40 hover:border-border-strong"}`}
                >
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-sm shrink-0">{l.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm">{l.name}</p>
                      <Badge tone={l.currentTRI >= 70 ? "success" : l.currentTRI >= 50 ? "brand" : "warning"}>{l.milestone}</Badge>
                      {(l.riskLevel === "HIGH" || l.riskLevel === "CRITICAL") && <Badge tone="danger">{l.riskLevel}</Badge>}
                    </div>
                    <p className="text-xs text-foreground-muted truncate">{l.targetRole ?? "Target belum diset"}</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      {l.completedSessions} sesi selesai · {l.upcomingSessions} mendatang · {l.pendingActionItems} action item
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-display font-bold glow-text">{l.currentTRI}</p>
                    <p className="text-[10px] text-foreground-muted">TRI</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {selectedRow && (
              <Card>
                <div className="text-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-xl mx-auto">{selectedRow.initials}</div>
                  <h3 className="mt-3 font-display font-bold text-lg">{selectedRow.name}</h3>
                  <p className="text-xs text-foreground-muted">{selectedRow.email}</p>
                  <p className="text-sm text-foreground-muted">{selectedRow.targetRole ?? "—"}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">TRI</span>
                    <span className="font-bold">{selectedRow.currentTRI}</span>
                  </div>
                  <Progress value={selectedRow.currentTRI} tone={selectedRow.currentTRI >= 70 ? "success" : selectedRow.currentTRI >= 50 ? "brand" : "accent"} />
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Milestone</span>
                    <Badge tone="brand">{selectedRow.milestone}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Sesi total</span>
                    <span>{selectedRow.completedSessions + selectedRow.upcomingSessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Risk</span>
                    <Badge tone={selectedRow.riskLevel === "LOW" ? "success" : selectedRow.riskLevel === "MEDIUM" ? "warning" : "danger"}>{selectedRow.riskLevel}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Action items pending</span>
                    <span>{selectedRow.pendingActionItems}</span>
                  </div>
                  {selectedRow.lastSession && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Sesi terakhir</span>
                      <span>{format.date(selectedRow.lastSession)}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
