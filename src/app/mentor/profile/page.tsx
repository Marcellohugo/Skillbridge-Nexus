import { Badge, Card, CardHeader, Callout, StatCard } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function initialsOf(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MT";
}

export default async function MentorProfilePage() {
  const session = await getSession();
  const profile = session
    ? await db.mentorProfile.findUnique({
        where: { userId: session.userId },
        include: {
          expertiseSkills: { include: { skill: { include: { category: true } } } },
          user: { select: { email: true, name: true } },
        },
      })
    : null;
  const sessionStats = session
    ? await db.mentoringSession.groupBy({
        by: ["status"],
        where: { mentorId: session.userId },
        _count: { _all: true },
      })
    : [];
  const activeLearners = session
    ? await db.mentoringSession.findMany({
        where: { mentorId: session.userId },
        distinct: ["menteeId"],
        select: { menteeId: true },
      })
    : [];
  const completedSessions = sessionStats.find((item) => item.status === "COMPLETED")?._count._all ?? 0;
  const name = profile?.user.name ?? session?.name ?? "Mentor";

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Profil Mentor</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Profil & Preferensi</h1>
          <p className="mt-1 text-foreground-secondary">Informasi profil publik dan pengaturan mentoring dari database.</p>
        </div>
        <Badge tone={profile?.isAvailable ? "success" : "muted"}>{profile?.isAvailable ? "Tersedia" : "Tidak tersedia"}</Badge>
      </header>

      {!profile && (
        <Callout tone="warning" title="Profil mentor belum tersedia">
          Lengkapi data mentor sebelum menerima sesi.
        </Callout>
      )}

      {profile && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total sesi" value={completedSessions} tone="brand" />
            <StatCard label="Learner aktif" value={activeLearners.length} tone="accent" />
            <StatCard label="Rating" value={`${profile.avgRating.toFixed(1)}★`} tone="success" />
            <StatCard label="Pengalaman" value={`${profile.yearsExperience} tahun`} tone="info" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader title="Informasi dasar" subtitle="Ditampilkan ke learner saat matching" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama" value={name} />
                  <Field label="Email" value={profile.user.email} />
                  <Field label="Gaya komunikasi" value={profile.communicationStyle} />
                  <Field label="Format sesi" value={profile.sessionFormat} />
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Biografi</p>
                  <p className="rounded-lg border border-border bg-background-secondary/40 p-4 text-sm text-foreground-secondary">
                    {profile.biography || "Biografi belum diisi."}
                  </p>
                </div>
              </Card>

              <Card>
                <CardHeader title="Keahlian & industri" subtitle="Mempengaruhi matching dengan learner" />
                <div className="space-y-4">
                  <ChipGroup label="Area keahlian" values={profile.expertiseSkills.map((item) => `${item.skill.name} L${item.expertiseLevel}`)} />
                  <ChipGroup label="Industri" values={profile.industries} />
                  <ChipGroup label="Topik mentoring" values={profile.mentoringTopics} />
                  <ChipGroup label="Bahasa" values={profile.languagesSpoken} />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <div className="text-center">
                  <div className="brand-mark mx-auto grid h-20 w-20 place-items-center text-2xl">{initialsOf(name)}</div>
                  <h3 className="mt-3 font-display text-lg font-bold">{name}</h3>
                  <p className="text-sm text-foreground-muted">{profile.communicationStyle} mentor</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Badge tone={profile.validatedAt ? "success" : "warning"}>{profile.validatedAt ? "Terverifikasi" : "Belum diverifikasi"}</Badge>
                    {profile.isAvailable && <Badge tone="brand">Tersedia</Badge>}
                  </div>
                </div>
              </Card>

              <Callout tone="brand" title="Profil publik">
                Profil ini dibaca dari database aktif. Perubahan permanen sebaiknya dilakukan lewat action update khusus.
              </Callout>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="input flex items-center">{value || "-"}</div>
    </div>
  );
}

function ChipGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.length ? values.map((value) => <span key={value} className="chip">{value}</span>) : <span className="text-sm text-foreground-muted">Belum diisi</span>}
      </div>
    </div>
  );
}
