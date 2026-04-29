import Link from "next/link";
import { Badge, Callout, Card, CardHeader, StatCard } from "@/components/ui";
import { DEMO_ADMIN_STATS } from "@/lib/demo-data";
import { formatNumber } from "@/lib/i18n";

export default function AdminDashboardPage() {
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
          <Link href="/admin/users" className="btn btn-primary">Kelola pengguna →</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total pengguna" value={formatNumber(DEMO_ADMIN_STATS.totalUsers)} tone="brand" delta={`+${DEMO_ADMIN_STATS.monthlyGrowth}% bulan`} hint="Semua role" />
        <StatCard label="Learner aktif" value={`${DEMO_ADMIN_STATS.activeLearners}`} tone="accent" delta={`${Math.round((DEMO_ADMIN_STATS.activeLearners / DEMO_ADMIN_STATS.totalUsers) * 100)}% dari total`} hint="Aktif 30 hari" />
        <StatCard label="Mentors" value={`${DEMO_ADMIN_STATS.mentors}`} tone="success" delta="terverifikasi" hint="Pool mentor aktif" />
        <StatCard label="Avg TRI" value={`${DEMO_ADMIN_STATS.avgTRI}`} tone="info" delta="platform-wide" hint="Rata-rata seluruh learner" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Manajemen pengguna" subtitle="Pengelompokan berdasarkan role dan status" action={<Link href="/admin/users" className="text-sm text-primary hover:underline">Kelola →</Link>} />
          <div className="space-y-2">
            {[
              { role: "Learner", count: DEMO_ADMIN_STATS.activeLearners, status: "Aktif", tone: "success" as const },
              { role: "Mentor", count: DEMO_ADMIN_STATS.mentors, status: "Aktif", tone: "success" as const },
              { role: "Manajer institusi", count: DEMO_ADMIN_STATS.institutions, status: "Aktif", tone: "success" as const },
              { role: "Ditangguhkan", count: 12, status: "Perlu cek", tone: "warning" as const },
            ].map((item) => (
              <div key={item.role} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-secondary/40">
                <div>
                  <p className="font-semibold text-sm">{item.role}</p>
                  <p className="text-xs text-foreground-muted">{item.count} pengguna</p>
                </div>
                <Badge tone={item.tone}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Manajemen konten" subtitle="Skill graph, modul, dan asesmen" action={<Link href="/admin/skills" className="text-sm text-primary hover:underline">Kelola →</Link>} />
          <div className="space-y-2">
            {[
              { type: "Kategori skill", count: 12, tone: "brand" as const },
              { type: "Skill", count: 342, tone: "brand" as const },
              { type: "Modul belajar", count: 89, tone: "warning" as const, note: "3 sedang review" },
              { type: "Asesmen", count: 34, tone: "success" as const },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-secondary/40">
                <div>
                  <p className="font-semibold text-sm">{item.type}</p>
                  <p className="text-xs text-foreground-muted">{item.count} items{item.note ? ` · ${item.note}` : ""}</p>
                </div>
                <Badge tone={item.tone}>{item.note ? "Review" : "Aktif"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Kesehatan sistem" subtitle="Dalam 60 menit terakhir" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { metric: "API Response Time", value: "142ms", status: "healthy" },
              { metric: "Database Load", value: "45%", status: "healthy" },
              { metric: "Cache Hit Rate", value: "87%", status: "healthy" },
              { metric: "Error Rate", value: "0.02%", status: "healthy" },
            ].map((m) => (
              <div key={m.metric} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-secondary/40">
                <p className="text-sm">{m.metric}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{m.value}</span>
                  <span className="h-2 w-2 rounded-full bg-success" aria-label="healthy" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Aktivitas hari ini" />
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Users baru</span><span className="font-semibold">15</span></li>
            <li className="flex justify-between"><span>Asesmen selesai</span><span className="font-semibold">42</span></li>
            <li className="flex justify-between"><span>Sesi mentoring</span><span className="font-semibold">8</span></li>
            <li className="flex justify-between"><span>Konten terbit</span><span className="font-semibold">3</span></li>
          </ul>
          <Link href="/admin/analytics" className="btn btn-secondary w-full mt-4">Lihat analitik →</Link>
        </Card>
      </div>

      <Callout tone="brand" title="Tips admin">
        Monitor <strong>learner berisiko</strong> dan <strong>cohort dengan pertumbuhan TRI rendah</strong> lewat Analitik. Intervensi dini meningkatkan retensi platform.
      </Callout>
    </div>
  );
}
