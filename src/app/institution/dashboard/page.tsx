import Link from "next/link";
import { Badge, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { getInstitutionAnalyticsAction } from "@/features/institution/analytics.actions";

export default async function InstitutionDashboardPage() {
  const result = await getInstitutionAnalyticsAction();
  const data = result.ok ? result.data : null;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Institusi</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">{data?.institutionName ?? "Institusi"}</h1>
          <p className="mt-1 text-foreground-secondary">Pantau progres learner institusi, kelola cohort, dan ukur dampak program.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/institution/analytics" className="btn btn-secondary">Analitik</Link>
          <Link href="/institution/cohorts" className="btn btn-primary">Kelola cohort -&gt;</Link>
        </div>
      </header>

      {!data && (
        <Callout tone="danger" title="Data institusi tidak tersedia">
          {result.ok ? "Belum ada data institusi." : result.error}
        </Callout>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total learner" value={`${data.totalLearners}`} tone="brand" delta="aktif" hint="Terdaftar di cohort institusi" />
            <StatCard label="Avg TRI" value={`${data.avgTRI}`} tone="accent" delta={`${data.atRiskCount} at-risk`} hint="Rata-rata seluruh learner" />
            <StatCard label="Cohort aktif" value={`${data.cohortCount}`} tone="info" delta="program berjalan" hint="Cohort terdaftar" />
            <StatCard label="Siap karir" value={`${data.careerReadyPct}%`} tone="success" delta={`${data.careerReadyCount} learner`} hint="TRI >= 70" />
          </div>

          <Card>
            <CardHeader title="Cohort Anda" subtitle="Progress dan risiko per program" action={<Link href="/institution/cohorts" className="text-sm text-primary hover:underline">Semua cohort -&gt;</Link>} />
            <div className="space-y-3">
              {data.cohorts.map((cohort) => (
                <div key={cohort.id} className="rounded-xl border border-border bg-background-secondary/40 p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{cohort.name}</p>
                      <p className="mt-0.5 text-xs text-foreground-muted">{cohort.learnerCount} learner · Avg TRI {cohort.avgTRI}</p>
                    </div>
                    <Badge tone={cohort.atRiskCount > 0 ? "warning" : "success"}>{cohort.atRiskCount > 0 ? `${cohort.atRiskCount} at-risk` : "On Track"}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-center">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-foreground-muted">
                        <span>Career ready</span>
                        <span className="font-semibold text-foreground">{cohort.careerReadyPct}%</span>
                      </div>
                      <Progress value={cohort.careerReadyPct} tone={cohort.careerReadyPct >= 60 ? "success" : cohort.careerReadyPct >= 40 ? "brand" : "warning"} />
                    </div>
                    <Link href="/institution/cohorts" className="btn btn-secondary btn-sm">Detail -&gt;</Link>
                  </div>
                </div>
              ))}
              {data.cohorts.length === 0 && <p className="py-6 text-center text-sm text-foreground-muted">Belum ada cohort.</p>}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Distribusi milestone" subtitle="Komposisi kesiapan learner" />
              <div className="space-y-3">
                {data.milestoneDistribution.map((item) => (
                  <div key={item.milestone} className="flex items-center justify-between rounded-lg border border-border bg-background-secondary/40 p-3">
                    <p className="text-sm font-semibold">{item.milestone.replaceAll("_", " ")}</p>
                    <Badge tone="brand">{item.count}</Badge>
                  </div>
                ))}
                {data.milestoneDistribution.length === 0 && <p className="text-sm text-foreground-muted">Belum ada milestone.</p>}
              </div>
            </Card>

            <Card>
              <CardHeader title="Area perhatian" subtitle="Intervensi dan blind spot" />
              {data.interventionQueue[0] ? (
                <Callout tone="warning" title={data.interventionQueue[0].learnerName}>
                  {data.interventionQueue[0].recommendation}
                </Callout>
              ) : (
                <Callout tone="success" title="Tidak ada intervensi terbuka">
                  Semua learner berada di luar antrean intervensi aktif.
                </Callout>
              )}
              {data.curriculumBlindSpots[0] && (
                <Callout tone="info" title={`Blind spot: ${data.curriculumBlindSpots[0].skill}`} className="mt-3">
                  {data.curriculumBlindSpots[0].learnersAffected} learner terdampak, total gap {data.curriculumBlindSpots[0].gapSum}.
                </Callout>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
