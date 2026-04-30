import Link from "next/link";
import { Badge, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SkillGapPage() {
  const session = await getSession();
  const profile = session
    ? await db.learnerProfile.findUnique({
        where: { userId: session.userId },
        include: { targetCareerRole: { select: { name: true } } },
      })
    : null;

  if (!profile) {
    return (
      <div className="container-app py-8">
        <Card>
          <CardHeader title="Analisis Skill Gap" subtitle="Profil learner belum tersedia." />
          <Link href="/onboarding" className="btn btn-primary">Lengkapi onboarding</Link>
        </Card>
      </div>
    );
  }

  const rows = await db.skillGapSnapshot.findMany({
    where: { learnerId: profile.id },
    include: { skill: { include: { category: true } } },
    orderBy: { snapshotAt: "desc" },
    take: 100,
  });
  const gaps = Array.from(
    rows.reduce((map, row) => {
      if (!map.has(row.skillId)) map.set(row.skillId, row);
      return map;
    }, new Map<string, (typeof rows)[number]>()),
  )
    .map(([, row]) => row)
    .sort((a, b) => b.weightedGap - a.weightedGap);

  const critical = gaps.filter((gap) => gap.isCritical);
  const blockers = gaps.filter((gap) => gap.isBlocker);
  const avgCurrent = gaps.length ? Math.round(gaps.reduce((sum, gap) => sum + gap.currentLevel, 0) / gaps.length) : 0;
  const avgTarget = gaps.length ? Math.round(gaps.reduce((sum, gap) => sum + gap.targetLevel, 0) / gaps.length) : 0;
  const totalGap = Math.round(gaps.reduce((sum, gap) => sum + Math.max(0, gap.gap), 0));
  const categories = Array.from(
    gaps.reduce((map, gap) => {
      const key = gap.skill.category.name;
      const item = map.get(key) ?? { count: 0, current: 0, target: 0 };
      item.count++;
      item.current += gap.currentLevel;
      item.target += gap.targetLevel;
      map.set(key, item);
      return map;
    }, new Map<string, { count: number; current: number; target: number }>()),
  );

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Skill Gap Analysis</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Analisis Skill Gap</h1>
          <p className="mt-1 text-foreground-secondary">
            Membandingkan skill Anda dengan target peran <span className="font-semibold text-foreground">{profile.targetCareerRole?.name ?? "belum diatur"}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/assessment" className="btn btn-secondary">Ambil asesmen</Link>
          <Link href="/learning-path" className="btn btn-primary">Learning path -&gt;</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Skill critical" value={`${critical.length}`} tone="danger" delta="prioritas" />
        <StatCard label="Skor rata-rata" value={`${avgCurrent}/${avgTarget}`} tone="brand" delta={`gap ${Math.max(0, avgTarget - avgCurrent)}`} />
        <StatCard label="Total gap" value={`${totalGap}`} tone="warning" delta="kumulatif" />
        <StatCard label="Blocker" value={`${blockers.length}`} tone={blockers.length > 0 ? "danger" : "success"} delta="perlu fokus" />
      </div>

      <Card>
        <CardHeader title="Per kategori" subtitle="Rata-rata skor per cluster skill" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([category, value]) => {
            const current = Math.round(value.current / value.count);
            const target = Math.round(value.target / value.count);
            return (
              <div key={category} className="rounded-xl border border-border bg-background-secondary/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{category}</p>
                  <span className="text-xs text-foreground-muted">{value.count} skill</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold">{current}</span>
                  <span className="text-xs text-foreground-muted">/ {target}</span>
                </div>
                <Progress value={current} tone={current >= 70 ? "success" : current >= 50 ? "brand" : "warning"} className="mt-2" />
              </div>
            );
          })}
          {categories.length === 0 && <p className="text-sm text-foreground-muted">Belum ada kategori gap.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Daftar Skill Gap" subtitle={`${gaps.length} skill dari snapshot terbaru`} />
        <div className="space-y-5">
          {gaps.map((gap) => (
            <div key={gap.id} className="rounded-xl border border-border bg-background-secondary/30 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{gap.skill.name}</p>
                    {gap.isCritical && <Badge tone="danger">Critical</Badge>}
                    {gap.isBlocker && <Badge tone="warning">Blocker</Badge>}
                    <span className="chip">{gap.skill.category.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">Snapshot {gap.snapshotAt.toLocaleDateString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground-muted">Current / Target</p>
                  <p className="font-display text-lg font-bold">{Math.round(gap.currentLevel)} <span className="text-foreground-muted">/</span> {Math.round(gap.targetLevel)}</p>
                </div>
              </div>
              <Progress value={Math.round((gap.currentLevel / Math.max(gap.targetLevel, 1)) * 100)} tone={gap.isCritical ? "warning" : "brand"} />
              <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
                <span>Weighted gap {Math.round(gap.weightedGap)}</span>
                <span>Gap: <span className="font-semibold text-foreground">{Math.round(gap.gap)}</span> poin</span>
              </div>
            </div>
          ))}
          {gaps.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground-muted">Belum ada skill gap. Ambil asesmen untuk membuat snapshot pertama.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
