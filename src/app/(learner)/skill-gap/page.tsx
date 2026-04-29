"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { DEMO_LEARNER, DEMO_LEARNING_PATH, DEMO_ROLE_FIT_ROLES, DEMO_SKILL_GAPS, type SkillGapItem } from "@/lib/demo-data";

type Sort = "priority" | "gap" | "skill";
type Filter = "all" | "critical" | "important" | "optional";

const IMPORTANCE_LABEL: Record<1 | 2 | 3, { label: string; tone: "danger" | "warning" | "muted" }> = {
  3: { label: "Critical", tone: "danger" },
  2: { label: "Important", tone: "warning" },
  1: { label: "Optional", tone: "muted" },
};

const TREND_ICON: Record<SkillGapItem["trend"], string> = { up: "↑", flat: "→", down: "↓" };
const TREND_TONE: Record<SkillGapItem["trend"], string> = {
  up: "text-success",
  flat: "text-foreground-muted",
  down: "text-danger",
};

export default function SkillGapPage() {
  const [sort, setSort] = React.useState<Sort>("priority");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [activeRole, setActiveRole] = React.useState(DEMO_ROLE_FIT_ROLES[0].role);

  const filtered = React.useMemo(() => {
    let arr = DEMO_SKILL_GAPS;
    if (filter !== "all") {
      const map = { critical: 3, important: 2, optional: 1 } as const;
      arr = arr.filter((s) => s.importance === map[filter]);
    }
    return [...arr].sort((a, b) => {
      if (sort === "priority") return b.importance * (b.target - b.current) - a.importance * (a.target - a.current);
      if (sort === "gap") return (b.target - b.current) - (a.target - a.current);
      return a.skill.localeCompare(b.skill);
    });
  }, [sort, filter]);

  const totals = React.useMemo(() => {
    const critical = DEMO_SKILL_GAPS.filter((s) => s.importance === 3);
    const avgCurrent = Math.round(DEMO_SKILL_GAPS.reduce((s, x) => s + x.current, 0) / DEMO_SKILL_GAPS.length);
    const avgTarget = Math.round(DEMO_SKILL_GAPS.reduce((s, x) => s + x.target, 0) / DEMO_SKILL_GAPS.length);
    const totalGap = DEMO_SKILL_GAPS.reduce((s, x) => s + Math.max(0, x.target - x.current), 0);
    const blockers = critical.filter((s) => s.target - s.current > 20).length;
    return { critical: critical.length, avgCurrent, avgTarget, totalGap, blockers };
  }, []);

  const byCategory = React.useMemo(() => {
    const map: Record<string, SkillGapItem[]> = {};
    for (const s of DEMO_SKILL_GAPS) (map[s.category] ??= []).push(s);
    return Object.entries(map).map(([cat, skills]) => ({
      category: cat,
      avgCurrent: Math.round(skills.reduce((a, b) => a + b.current, 0) / skills.length),
      avgTarget: Math.round(skills.reduce((a, b) => a + b.target, 0) / skills.length),
      count: skills.length,
    }));
  }, []);

  const recommendedModules = React.useMemo(() => {
    const topGaps = [...DEMO_SKILL_GAPS]
      .sort((a, b) => b.importance * (b.target - b.current) - a.importance * (a.target - a.current))
      .slice(0, 3)
      .map((g) => g.skill);
    return DEMO_LEARNING_PATH.filter((m) =>
      m.skillsCovered.some((s) => topGaps.includes(s)) && m.status !== "completed",
    ).slice(0, 4);
  }, []);

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Skill Gap Analysis</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Analisis Skill Gap</h1>
          <p className="mt-1 text-foreground-secondary">
            Membandingkan skill Anda dengan target peran <span className="text-foreground font-semibold">{DEMO_LEARNER.careerTarget}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/assessment" className="btn btn-secondary">Ambil Asesmen</Link>
          <Link href="/learning-path" className="btn btn-primary">Lihat Learning Path →</Link>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Skill Critical" value={`${totals.critical}`} tone="danger" delta="prioritas" hint="Wajib ditutup untuk peran target" />
        <StatCard label="Skor rata-rata" value={`${totals.avgCurrent}/${totals.avgTarget}`} tone="brand" delta={`gap ${totals.avgTarget - totals.avgCurrent}`} hint="Current vs target average" />
        <StatCard label="Total gap (poin)" value={`${totals.totalGap}`} tone="warning" delta="kumulatif" hint="Akumulasi seluruh gap" />
        <StatCard label="Blocker" value={`${totals.blockers}`} tone={totals.blockers > 0 ? "danger" : "success"} delta="perlu fokus" hint="Critical & gap >20 poin" />
      </div>

      {/* Role explorer */}
      <Card>
        <CardHeader title="Role Fit Explorer" subtitle="Bandingkan kesiapan Anda dengan peran lain" action={<Link href="/learning-path" className="text-sm text-primary hover:underline">Lihat path →</Link>} />
        <div className="flex flex-wrap gap-2 mb-5">
          {DEMO_ROLE_FIT_ROLES.map((r) => {
            const on = r.role === activeRole;
            return (
              <button
                key={r.role}
                onClick={() => setActiveRole(r.role)}
                className={`px-3 h-9 rounded-lg text-sm font-medium border transition-colors ${
                  on ? "bg-primary text-white border-primary" : "bg-background-secondary border-border text-foreground-muted hover:text-foreground"
                }`}
              >
                {r.role} <span className={`ml-1.5 text-xs ${on ? "text-white/80" : "text-foreground-muted"}`}>{r.score}%</span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEMO_ROLE_FIT_ROLES.filter((r) => r.role === activeRole).map((r) => (
            <React.Fragment key={r.role}>
              <Stat label="Career Fit" value={`${r.score}%`} accent />
              <Stat label="Demand" value={r.demand} />
              <Stat label="Growth" value={r.growth} />
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Category radar (text version) */}
      <Card>
        <CardHeader title="Per kategori" subtitle="Rata-rata skor per cluster skill" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {byCategory.map((c) => (
            <div key={c.category} className="rounded-xl border border-border bg-background-secondary/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{c.category}</p>
                <span className="text-xs text-foreground-muted">{c.count} skill</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-display font-bold">{c.avgCurrent}</span>
                <span className="text-xs text-foreground-muted">/ {c.avgTarget}</span>
              </div>
              <Progress value={c.avgCurrent} tone={c.avgCurrent >= 70 ? "success" : c.avgCurrent >= 50 ? "brand" : "warning"} className="mt-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Filters + skill list */}
      <Card>
        <CardHeader
          title="Daftar Skill Gap"
          subtitle={`${filtered.length} skill ditampilkan`}
          action={
            <div className="flex gap-2">
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input h-9 text-sm py-0">
                <option value="priority">Sort: Prioritas</option>
                <option value="gap">Sort: Ukuran gap</option>
                <option value="skill">Sort: Nama skill</option>
              </select>
              <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="input h-9 text-sm py-0">
                <option value="all">Filter: Semua</option>
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="optional">Optional</option>
              </select>
            </div>
          }
        />
        <div className="space-y-5">
          {filtered.map((s) => {
            const gap = s.target - s.current;
            const importance = IMPORTANCE_LABEL[s.importance];
            return (
              <div key={s.id} className="rounded-xl border border-border p-4 bg-background-secondary/30">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{s.skill}</p>
                      <Badge tone={importance.tone}>{importance.label}</Badge>
                      <span className="chip">{s.category}</span>
                    </div>
                    <p className={`text-xs mt-1 ${TREND_TONE[s.trend]}`}>
                      <span aria-hidden>{TREND_ICON[s.trend]}</span>{" "}
                      {s.trend === "up" ? "Sedang naik" : s.trend === "flat" ? "Stagnan" : "Menurun"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-foreground-muted">Current / Target</p>
                    <p className="text-lg font-display font-bold">
                      {s.current} <span className="text-foreground-muted">/</span> {s.target}
                    </p>
                  </div>
                </div>

                <div className="relative h-2.5 rounded-full bg-background-tertiary overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-cyan-400 rounded-full"
                    style={{ width: `${s.current}%` }}
                  />
                  <div className="absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${s.target}%` }} title={`Target ${s.target}`} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-foreground-muted">
                  <span>0</span>
                  <span>Gap: <span className="text-foreground font-semibold">{gap > 0 ? gap : 0}</span> poin</span>
                  <span>100</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-foreground-muted text-center py-6">Tidak ada skill yang cocok dengan filter ini.</p>
          )}
        </div>
      </Card>

      {/* Recommended modules */}
      <Card>
        <CardHeader title="Modul rekomendasi untuk menutup gap" subtitle="Berdasarkan 3 skill prioritas tertinggi" action={<Link href="/learning-path" className="text-sm text-primary hover:underline">Lihat semua →</Link>} />
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendedModules.map((m) => (
            <div key={m.id} className="rounded-xl border border-border p-4 bg-background-secondary/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-sm">{m.title}</p>
                <Badge tone="brand">{m.durationHrs}h</Badge>
              </div>
              <p className="text-xs text-foreground-muted mb-3">Menutup: {m.skillsCovered.join(", ")}</p>
              <div className="flex items-center gap-3">
                <Progress value={m.progress} className="flex-1" />
                <Link href="/learning-path" className="text-xs text-primary hover:underline">Buka →</Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Callout tone="brand" title="💡 Smart Intervention" icon={<span>🎯</span>}>
        Fokus 2 minggu ke depan: <strong>Accessibility (WCAG)</strong> dan <strong>Testing</strong>. Keduanya critical untuk peran target dengan gap terbesar. Estimasi kombinasi modul + 1 sesi mentor: <strong>~11 jam</strong>.
      </Callout>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary/50 px-4 py-3">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={`text-xl font-display font-bold mt-0.5 ${accent ? "glow-text" : ""}`}>{value}</p>
    </div>
  );
}
