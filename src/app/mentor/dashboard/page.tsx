import Link from "next/link";
import { Badge, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { DEMO_MENTOR, DEMO_MENTOR_SESSIONS, DEMO_MENTOR_LEARNERS } from "@/lib/demo-data";

export default function MentorDashboardPage() {
  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Ruang Mentor</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Halo, {DEMO_MENTOR.name.split(" ")[0]}</h1>
          <p className="mt-1 text-foreground-secondary">{DEMO_MENTOR.title} · Rating {DEMO_MENTOR.rating}★ · {DEMO_MENTOR.totalSessions} sesi</p>
        </div>
        <div className="flex gap-2">
          <Link href="/mentor/sessions" className="btn btn-secondary">Atur Ketersediaan</Link>
          <Link href="/mentor/sessions" className="btn btn-primary">Kelola Sesi →</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Learner aktif" value={`${DEMO_MENTOR.activeLearners}`} tone="brand" delta="minggu ini" hint="Sedang dibimbing" />
        <StatCard label="Jam bulan ini" value={`${DEMO_MENTOR.hoursThisMonth}h`} tone="accent" delta="mentoring" hint="Total waktu terdedikasi" />
        <StatCard label="Rating" value={`${DEMO_MENTOR.rating}★`} tone="success" delta={`${DEMO_MENTOR.totalSessions} sesi`} hint="Rata-rata feedback" />
        <StatCard label="Permintaan baru" value={`${DEMO_MENTOR.pendingRequests}`} tone={DEMO_MENTOR.pendingRequests > 0 ? "warning" : "muted"} delta="butuh respon" hint="Pending ≤ 24 jam" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sesi mendatang"
            subtitle="Konfirmasikan atau atur ulang jadwal"
            action={<Link href="/mentor/sessions" className="text-sm text-primary hover:underline">Semua sesi →</Link>}
          />
          <div className="space-y-3">
            {DEMO_MENTOR_SESSIONS.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-background-secondary/40 p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold shrink-0">
                  {s.learner.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{s.learner}</p>
                    <Badge tone={s.status === "confirmed" ? "success" : "warning"}>{s.status === "confirmed" ? "Terkonfirmasi" : "Pending"}</Badge>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5">{s.topic}</p>
                  <p className="text-xs text-foreground-secondary mt-1">{s.when}</p>
                </div>
                <button className="btn btn-secondary btn-sm">Detail</button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Callout tone="brand" title="Tip mentor">
            Respon permintaan mentoring dalam 24 jam meningkatkan match score Anda untuk learner selanjutnya. 3 permintaan menunggu.
          </Callout>
          <Card>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2">Akses cepat</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/mentor/learners" className="btn btn-secondary btn-sm">Learner</Link>
              <Link href="/mentor/sessions" className="btn btn-secondary btn-sm">Sesi</Link>
              <Link href="/mentor/profile" className="btn btn-secondary btn-sm">Profil</Link>
              <Link href="/mentor/profile" className="btn btn-secondary btn-sm">Jadwal</Link>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Progres learner Anda" subtitle="TRI dan tren terbaru" action={<Link href="/mentor/learners" className="text-sm text-primary hover:underline">Kelola learner →</Link>} />
        <div className="grid gap-3 md:grid-cols-2">
          {DEMO_MENTOR_LEARNERS.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-background-secondary/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{l.name}</p>
                  <p className="text-xs text-foreground-muted">{l.focus}</p>
                </div>
                <span className="text-xl font-display font-bold glow-text">{l.tri}</span>
              </div>
              <Progress value={l.tri} tone={l.tri >= 70 ? "success" : l.tri >= 50 ? "brand" : "accent"} />
              <p className="text-xs text-success mt-2">{l.trend}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
