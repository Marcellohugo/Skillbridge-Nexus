import Link from "next/link";
import { Badge, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import { listIncomingSessionsAction, listMentorLearnersAction } from "@/features/mentor/session.actions";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/i18n";

export default async function MentorDashboardPage() {
  const session = await getSession();
  const [sessionsResult, learnersResult] = await Promise.all([
    listIncomingSessionsAction(),
    listMentorLearnersAction(),
  ]);
  const sessions = sessionsResult.ok ? sessionsResult.data : [];
  const learners = learnersResult.ok ? learnersResult.data : [];
  const pending = sessions.filter((item) => item.status === "PENDING").length;
  const completed = sessions.filter((item) => item.status === "COMPLETED");
  const avgRating = completed.length
    ? (completed.reduce((sum, item) => sum + (item.menteeRating ?? 0), 0) / completed.filter((item) => item.menteeRating).length || 0).toFixed(1)
    : "0";

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Ruang Mentor</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Halo, {(session?.name || session?.email || "Mentor").split(" ")[0]}</h1>
          <p className="mt-1 text-foreground-secondary">Kelola sesi, learner, dan kontribusi mentoring dari data terbaru.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/mentor/profile" className="btn btn-secondary">Profil</Link>
          <Link href="/mentor/sessions" className="btn btn-primary">Kelola sesi -&gt;</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Learner aktif" value={`${learners.length}`} tone="brand" delta="terhubung" hint="Learner dengan riwayat sesi" />
        <StatCard label="Sesi total" value={`${sessions.length}`} tone="accent" delta={`${completed.length} selesai`} hint="Semua status sesi" />
        <StatCard label="Rating" value={`${avgRating}★`} tone="success" delta="rata-rata" hint="Dari sesi yang diberi rating" />
        <StatCard label="Permintaan baru" value={`${pending}`} tone={pending > 0 ? "warning" : "muted"} delta="pending" hint="Menunggu respon mentor" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Sesi mendatang" subtitle="Diurutkan berdasarkan jadwal" action={<Link href="/mentor/sessions" className="text-sm text-primary hover:underline">Semua sesi -&gt;</Link>} />
          <div className="space-y-3">
            {sessions.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border bg-background-secondary/40 p-4">
                <div className="brand-mark brand-mark-md">{item.menteeInitials}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{item.menteeName}</p>
                    <Badge tone={item.status === "ACCEPTED" ? "success" : item.status === "PENDING" ? "warning" : "muted"}>{item.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-muted">{item.topic ?? "Sesi mentoring"}</p>
                  <p className="mt-1 text-xs text-foreground-secondary">{formatDateTime(new Date(item.scheduledAt))}</p>
                </div>
                <Link href="/mentor/sessions" className="btn btn-secondary btn-sm">Detail</Link>
              </div>
            ))}
            {sessions.length === 0 && <p className="py-8 text-center text-sm text-foreground-muted">Belum ada sesi mentoring.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Callout tone={pending > 0 ? "warning" : "brand"} title="Status sesi">
            {pending > 0 ? `${pending} permintaan menunggu respon.` : "Tidak ada permintaan baru saat ini."}
          </Callout>
          <Card>
            <p className="mb-2 text-xs uppercase text-foreground-muted">Akses cepat</p>
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
        <CardHeader title="Progres learner Anda" subtitle="TRI dan ringkasan sesi terbaru" action={<Link href="/mentor/learners" className="text-sm text-primary hover:underline">Kelola learner -&gt;</Link>} />
        <div className="grid gap-3 md:grid-cols-2">
          {learners.slice(0, 6).map((learner) => (
            <div key={learner.userId} className="rounded-xl border border-border bg-background-secondary/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{learner.name}</p>
                  <p className="text-xs text-foreground-muted">{learner.targetRole ?? "Target belum diatur"}</p>
                </div>
                <span className="font-display text-xl font-bold glow-text">{learner.currentTRI}</span>
              </div>
              <Progress value={learner.currentTRI} tone={learner.currentTRI >= 70 ? "success" : learner.currentTRI >= 50 ? "brand" : "warning"} />
              <p className="mt-2 text-xs text-foreground-muted">{learner.completedSessions} sesi selesai, {learner.upcomingSessions} mendatang</p>
            </div>
          ))}
          {learners.length === 0 && <p className="text-sm text-foreground-muted">Belum ada learner terhubung.</p>}
        </div>
      </Card>
    </div>
  );
}
