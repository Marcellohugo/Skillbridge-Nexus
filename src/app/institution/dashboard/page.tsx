import Link from "next/link";
import { Badge, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { DEMO_INSTITUTION, DEMO_COHORTS } from "@/lib/demo-data";

export default function InstitutionDashboardPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Institusi</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">{DEMO_INSTITUTION.name}</h1>
          <p className="mt-1 text-foreground-secondary">Pantau progres learner institusi, kelola cohort, dan ukur dampak program.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/institution/analytics" className="btn btn-secondary">Analitik</Link>
          <Link href="/institution/cohorts" className="btn btn-primary">Kelola cohort →</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total learner" value={`${DEMO_INSTITUTION.totalLearners}`} tone="brand" delta="aktif" hint="Terdaftar di platform" />
        <StatCard label="Avg TRI" value={`${DEMO_INSTITUTION.avgTRI}`} tone="accent" delta="di atas rata-rata" hint="Platform: 62.4" />
        <StatCard label="Cohort aktif" value={`${DEMO_INSTITUTION.activeCohorts}`} tone="info" delta="program berjalan" hint="Semester & bootcamp" />
        <StatCard label="Siap karir" value={`${DEMO_INSTITUTION.careerReadyPct}%`} tone="success" delta={`${DEMO_INSTITUTION.mentorsAssigned} mentor`} hint="TRI ≥ 75" />
      </div>

      <Card>
        <CardHeader title="Cohort Anda" subtitle="Progress & risk indikator per program" action={<Link href="/institution/cohorts" className="text-sm text-primary hover:underline">Semua cohort →</Link>} />
        <div className="space-y-3">
          {DEMO_COHORTS.map((c) => (
            <div key={c.name} className="rounded-xl border border-border p-4 bg-background-secondary/40">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{c.size} learner · Avg TRI {c.avgTRI}</p>
                </div>
                <Badge tone={c.status === "On Track" ? "success" : "warning"}>{c.status}</Badge>
              </div>
              <div className="grid sm:grid-cols-[1fr,auto] gap-3 items-center">
                <div>
                  <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                    <span>Progress program</span>
                    <span className="text-foreground font-semibold">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} tone={c.progress >= 60 ? "success" : c.progress >= 40 ? "brand" : "accent"} />
                </div>
                <Link href="/institution/cohorts" className="btn btn-secondary btn-sm">Detail →</Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Dampak program" subtitle="Minggu terakhir" />
          <ul className="space-y-3 text-sm">
            {[
              ["01", "Rata-rata TRI naik 4.2 poin"],
              ["02", "18 learner mencapai siap karir"],
              ["03", "72 sesi mentoring diselenggarakan"],
              ["04", "23 proyek portfolio baru divalidasi"],
            ].map(([icon, t]) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-xs font-bold text-primary">{icon}</span>
                <span className="text-foreground-secondary">{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Area perhatian" subtitle="Rekomendasi intervensi" />
          <Callout tone="warning" title="Cohort Data & Analytics">
            Progress 45% dengan TRI rata-rata 54 — <strong>di bawah benchmark</strong>. Pertimbangkan sesi mentoring kelompok fokus pada SQL & statistik dasar.
          </Callout>
          <Callout tone="info" title="Retention minggu ini" className="mt-3">
            Dropout rate 2.1% — sehat. 3 learner masuk kategori risiko tinggi dan sudah menerima intervensi otomatis.
          </Callout>
        </Card>
      </div>
    </div>
  );
}
