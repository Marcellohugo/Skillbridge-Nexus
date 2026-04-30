import Link from "next/link";
import { Badge, Callout, Card, CardHeader, StatCard } from "@/components/ui";
import { formatNumber } from "@/lib/i18n";
import { getPlatformMetricsAction } from "@/features/admin/platform.actions";

export default async function AdminDashboardPage() {
  const result = await getPlatformMetricsAction();
  const metrics = result.ok ? result.data : null;

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Administrator</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Dashboard Admin</h1>
          <p className="mt-1 text-foreground-secondary">Operasional platform, kesehatan sistem, dan kurasi konten SkillBridge Nexus.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics" className="btn btn-secondary">Analitik</Link>
          <Link href="/admin/users" className="btn btn-primary">Kelola pengguna -&gt;</Link>
        </div>
      </header>

      {!metrics && (
        <Callout tone="danger" title="Metrik tidak tersedia">
          {result.ok ? "Data belum tersedia." : result.error}
        </Callout>
      )}

      {metrics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total pengguna" value={formatNumber(metrics.totalUsers)} tone="brand" delta={`${metrics.activeUsers} aktif`} hint="Semua role" />
            <StatCard label="Learner" value={formatNumber(metrics.learners)} tone="accent" delta={`${metrics.totalAssessments} asesmen`} hint="Terdaftar di platform" />
            <StatCard label="Mentor" value={formatNumber(metrics.mentors)} tone="success" delta={`${metrics.totalSessions} sesi`} hint="Sesi mentoring total" />
            <StatCard label="Avg TRI" value={`${metrics.avgTRI}`} tone="info" delta="platform-wide" hint="Rata-rata seluruh learner" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Komposisi role" subtitle="Berdasarkan user aktif di database" action={<Link href="/admin/users" className="text-sm text-primary hover:underline">Kelola -&gt;</Link>} />
              <div className="space-y-2">
                {[
                  { role: "Learner", count: metrics.learners, tone: "brand" as const },
                  { role: "Mentor", count: metrics.mentors, tone: "success" as const },
                  { role: "Admin", count: metrics.admins, tone: "info" as const },
                  { role: "Manajer institusi", count: metrics.institutionManagers, tone: "accent" as const },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between rounded-lg border border-border bg-background-secondary/40 p-3">
                    <div>
                      <p className="font-semibold text-sm">{item.role}</p>
                      <p className="text-xs text-foreground-muted">{item.count} pengguna</p>
                    </div>
                    <Badge tone={item.tone}>Aktif</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Aktivitas platform" subtitle="Data agregat dari database" action={<Link href="/admin/analytics" className="text-sm text-primary hover:underline">Analitik -&gt;</Link>} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Snapshot skill" value={metrics.totalSnapshots} />
                <Metric label="Portfolio" value={metrics.totalProjects} />
                <Metric label="Portfolio tervalidasi" value={metrics.validatedProjects} />
                <Metric label="Badge diberikan" value={metrics.totalBadges} />
                <Metric label="Intervensi terbuka" value={metrics.totalInterventions} />
                <Metric label="Sesi mentoring" value={metrics.totalSessions} />
              </div>
            </Card>
          </div>

          <Callout tone="brand" title="Prioritas operasional">
            Pantau learner berisiko dan intervensi terbuka lewat Analitik. Angka di halaman ini berasal dari database aktif.
          </Callout>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background-secondary/40 p-3">
      <p className="text-sm text-foreground-secondary">{label}</p>
      <span className="font-display text-lg font-bold">{formatNumber(value)}</span>
    </div>
  );
}
