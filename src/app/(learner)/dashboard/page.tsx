import Link from "next/link";
import { Badge, Card, CardHeader, Progress, RingMetric, StatCard, Callout } from "@/components/ui";
import { DailyDigest } from "@/components/shared/daily-digest";
import { DailyChallenge } from "@/components/shared/daily-challenge";
import { FocusTimer } from "@/components/shared/focus-timer";
import { StudyHeatmap } from "@/components/shared/study-heatmap";
import { PeerPulse } from "@/components/shared/peer-pulse";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function LearnerDashboardPage() {
  const session = await getSession();
  const profile = session
    ? await db.learnerProfile.findUnique({
        where: { userId: session.userId },
        include: {
          targetCareerRole: { select: { name: true } },
          learningPath: {
            include: {
              items: {
                include: { module: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      })
    : null;

  if (!session || !profile) {
    return (
      <div className="container-app py-8">
        <Callout tone="warning" title="Profil learner belum tersedia">
          Lengkapi onboarding untuk membuat dashboard personal.
        </Callout>
      </div>
    );
  }

  const [gapRows, history, activities, mentorSessions, portfolioCount] = await Promise.all([
    db.skillGapSnapshot.findMany({
      where: { learnerId: profile.id },
      include: { skill: { include: { category: true } } },
      orderBy: { snapshotAt: "desc" },
      take: 40,
    }),
    db.tRIHistory.findMany({
      where: { learnerId: profile.id },
      orderBy: { recordedAt: "desc" },
      take: 8,
    }),
    db.activityLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.mentoringSession.count({ where: { menteeId: session.userId, status: { in: ["PENDING", "ACCEPTED"] } } }),
    db.portfolioProject.count({ where: { learnerId: profile.id } }),
  ]);

  const latestGaps = Array.from(
    gapRows.reduce((map, row) => {
      if (!map.has(row.skillId)) map.set(row.skillId, row);
      return map;
    }, new Map<string, (typeof gapRows)[number]>()),
  ).map(([, row]) => row);
  const criticalGaps = latestGaps.filter((gap) => gap.isCritical || gap.isBlocker);
  const topGaps = [...latestGaps].sort((a, b) => b.weightedGap - a.weightedGap).slice(0, 4);
  const pathItems = profile.learningPath?.items ?? [];
  const completedModules = pathItems.filter((item) => item.isCompleted).length;
  const nextModule = pathItems.find((item) => !item.isCompleted);
  const previousTRI = history[1]?.score ?? profile.currentTRI;
  const triDelta = Math.round(profile.currentTRI - previousTRI);

  return (
    <div className="container-app py-6 lg:py-8 stack-xl stack">
      <section className="dashboard-hero p-5 sm:p-7 lg:p-8">
        <div className="dashboard-hero-layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="dashboard-hero-copy">
            <div className="dashboard-hero-kicker flex flex-wrap items-center gap-2">
              <Badge tone="success">Selamat datang kembali</Badge>
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">
                Target: {profile.targetCareerRole?.name ?? "Belum diatur"}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-display font-black leading-tight sm:text-4xl lg:text-5xl">
              Halo, {profile.fullName.split(" ")[0]}. Fokus hari ini dari progres aktual.
            </h1>
            <p className="mt-3 max-w-2xl text-white/80">
              {profile.educationStatus} · {criticalGaps.length} gap prioritas · {mentorSessions} sesi mentoring aktif.
            </p>
            <div className="dashboard-hero-signals mt-6 grid gap-3 sm:grid-cols-3">
              <HeroSignal label="TRI" value={Math.round(profile.currentTRI)} />
              <HeroSignal label="Role fit" value={`${Math.round(profile.careerFitScore)}%`} />
              <HeroSignal label="Streak" value={`${profile.streakDays} hari`} />
            </div>
            <div className="dashboard-hero-actions mt-6 flex flex-wrap gap-3">
              <Link href="/learning-path" className="btn btn-primary">Lanjut belajar</Link>
              <Link href="/assessment" className="btn btn-secondary">Ambil asesmen</Link>
            </div>
          </div>

          <div className="dashboard-milestone-panel rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">Milestone TRI</p>
                <p className="mt-1 font-display text-2xl font-black text-white">{profile.triMilestone.replaceAll("_", " ")}</p>
              </div>
              <Badge tone={profile.riskLevel === "LOW" ? "success" : "warning"}>{profile.riskLevel}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <Progress value={profile.currentTRI} tone={profile.currentTRI >= 70 ? "success" : "accent"} />
              <p className="text-sm text-white/75">TRI saat ini {Math.round(profile.currentTRI)}. Perubahan terakhir {triDelta >= 0 ? "+" : ""}{triDelta} poin.</p>
            </div>
          </div>
        </div>
      </section>

      <DailyDigest />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card elevated className="lg:col-span-2">
          <div className="grid gap-7 md:grid-cols-[auto,1fr] md:items-center">
            <RingMetric value={Math.round(profile.currentTRI)} label="Talent Readiness Index" sublabel={profile.triMilestone.replaceAll("_", " ")} size={170} />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="brand">Role fit: {Math.round(profile.careerFitScore)}%</Badge>
                <Badge tone={triDelta >= 0 ? "success" : "warning"}>{triDelta >= 0 ? "+" : ""}{triDelta} poin</Badge>
              </div>
              <h2 className="mb-2 text-xl font-display font-bold">Readiness berdasarkan data terbaru</h2>
              <p className="mb-5 text-sm text-foreground-secondary">Learning path, assessment, mentor, dan portfolio dihitung dari database aktif.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricProgress label="TRI" value={Math.round(profile.currentTRI)} />
                <MetricProgress label="Career fit" value={Math.round(profile.careerFitScore)} />
                <MetricProgress label="Learning path" value={pathItems.length ? Math.round((completedModules / pathItems.length) * 100) : 0} />
                <MetricProgress label="Portfolio" value={Math.min(100, portfolioCount * 20)} />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard label="Gap prioritas" value={`${criticalGaps.length}`} tone={criticalGaps.length ? "warning" : "success"} delta="critical/blocker" />
          <StatCard label="Streak belajar" value={`${profile.streakDays} hari`} tone="accent" delta="aktif" />
          <StatCard label="Risiko" value={profile.riskLevel} tone={profile.riskLevel === "LOW" ? "success" : "warning"} />
          <StatCard label="Modul selesai" value={`${completedModules}/${pathItems.length}`} tone="info" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <DailyChallenge />
        <Card>
          <CardHeader title="Gap teratas" subtitle="Diurutkan dari weighted gap" action={<Link href="/skill-gap" className="text-sm text-primary hover:underline">Detail -&gt;</Link>} />
          <div className="space-y-4">
            {topGaps.map((gap) => (
              <div key={gap.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold">{gap.skill.name}</span>
                  <span className="text-xs text-foreground-muted">{Math.round(gap.currentLevel)} / {Math.round(gap.targetLevel)}</span>
                </div>
                <Progress value={Math.round((gap.currentLevel / Math.max(gap.targetLevel, 1)) * 100)} tone={gap.isCritical ? "warning" : "brand"} />
              </div>
            ))}
            {topGaps.length === 0 && <p className="text-sm text-foreground-muted">Belum ada gap snapshot. Ambil asesmen untuk memulai.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <FocusTimer />
        <Card>
          <CardHeader title="Lanjutkan belajar" subtitle="Modul aktif berikutnya" action={<Link href="/learning-path" className="text-sm text-primary hover:underline">Learning path -&gt;</Link>} />
          {nextModule ? (
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="brand">{nextModule.module.contentType}</Badge>
                <Badge tone="muted">{nextModule.module.estimatedMinutes} menit</Badge>
              </div>
              <h3 className="text-2xl font-display font-bold">{nextModule.module.title}</h3>
              <p className="mt-2 text-sm text-foreground-secondary">{nextModule.whyReason ?? nextModule.module.description}</p>
              <Link href="/learning-path" className="btn btn-primary mt-4">Buka modul -&gt;</Link>
            </div>
          ) : (
            <Callout tone="info" title="Belum ada modul aktif">Generate learning path setelah asesmen untuk mendapatkan modul prioritas.</Callout>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudyHeatmap />
        <PeerPulse />
      </div>

      <Card>
        <CardHeader title="Aktivitas terbaru" subtitle="Timeline dari ActivityLog" />
        <ol className="relative ml-2 space-y-5 border-l border-border">
          {activities.map((activity) => (
            <li key={activity.id} className="ml-5">
              <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px]" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm">{activity.description ?? activity.action}</p>
                <Badge tone="muted">{activity.action}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-foreground-muted">{activity.createdAt.toLocaleString("id-ID")}</p>
            </li>
          ))}
          {activities.length === 0 && <p className="py-4 text-sm text-foreground-muted">Belum ada aktivitas tercatat.</p>}
        </ol>
      </Card>
    </div>
  );
}

function HeroSignal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dashboard-hero-signal">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricProgress({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-foreground-muted">
        <span>{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <Progress value={value} tone={value >= 70 ? "success" : value >= 50 ? "brand" : "warning"} />
    </div>
  );
}
