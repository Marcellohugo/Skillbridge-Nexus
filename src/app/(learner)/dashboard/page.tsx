import Link from "next/link";
import { Badge, Card, CardHeader, Progress, RingMetric, StatCard, Callout } from "@/components/ui";
import { StudyHeatmap } from "@/components/shared/study-heatmap";
import { PeerPulse } from "@/components/shared/peer-pulse";
import { DailyChallenge } from "@/components/shared/daily-challenge";
import { SkillRadar } from "@/components/shared/skill-radar";
import { FocusTimer } from "@/components/shared/focus-timer";
import { CareerForecast } from "@/components/shared/career-forecast";
import { DailyDigest } from "@/components/shared/daily-digest";
import {
  DEMO_LEARNER,
  DEMO_TRI,
  DEMO_TRI_COMPONENTS,
  DEMO_TRI_MILESTONE,
  DEMO_TRI_TIMELINE,
  DEMO_SKILL_GAPS,
  DEMO_LEARNING_PATH,
  DEMO_MENTORS,
  DEMO_NEXT_MILESTONE,
  DEMO_ACTIVITY,
  DEMO_ROLE_FIT_ROLES,
} from "@/lib/demo-data";

const COMPONENT_LABELS: Record<keyof typeof DEMO_TRI_COMPONENTS, string> = {
  assessmentScore: "Asesmen",
  roleFitScore: "Kecocokan role",
  learningProgress: "Belajar",
  mentoringContribution: "Mentoring",
  portfolioStrength: "Portofolio",
  consistencyStreak: "Konsistensi",
};

const ADVANCED_TOOLS = [
  { href: "/career-compass", title: "Kompas karir", desc: "Bandingkan role target dan arah kompetensi." },
  { href: "/skill-tree", title: "Peta skill", desc: "Lihat dependency skill dan prasyarat." },
  { href: "/session-prep", title: "Persiapan sesi", desc: "Susun agenda sebelum bertemu mentor." },
  { href: "/market-value", title: "Nilai pasar", desc: "Estimasi sinyal demand dari role target." },
  { href: "/learning-twin", title: "Simulasi belajar", desc: "Bandingkan ritme belajar dengan pola peer." },
  { href: "/capstone", title: "Proyek akhir", desc: "Bangun brief portofolio berbasis gap utama." },
  { href: "/resume", title: "Resume otomatis", desc: "Kompilasi skill, proyek, dan readiness." },
  { href: "/mock-interview", title: "Simulasi interview", desc: "Latih jawaban dengan konteks role target." },
];

export default function LearnerDashboardPage() {
  const inProgress = DEMO_LEARNING_PATH.filter((m) => m.status === "in_progress");
  const nextModule = inProgress[0] ?? DEMO_LEARNING_PATH.find((m) => m.status === "upcoming");
  const topMentor = DEMO_MENTORS[0];
  const topGaps = [...DEMO_SKILL_GAPS].sort((a, b) => b.importance * (b.target - b.current) - a.importance * (a.target - a.current)).slice(0, 4);
  const topRole = DEMO_ROLE_FIT_ROLES[0];

  return (
    <div className="container-app py-6 lg:py-8 stack-xl stack">
      <section className="dashboard-hero p-5 sm:p-7 lg:p-8">
        <div className="dashboard-hero-layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="dashboard-hero-copy">
            <div className="dashboard-hero-kicker flex flex-wrap items-center gap-2">
              <Badge tone="success">Selamat datang kembali</Badge>
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">
                Target: {topRole.role}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-display font-black leading-tight sm:text-4xl lg:text-5xl">
              Halo, {DEMO_LEARNER.name.split(" ")[0]}. Fokus hari ini sudah disusun.
            </h1>
            <p className="mt-3 max-w-2xl text-white/80">
              {DEMO_LEARNER.educationStatus} · Target: {DEMO_LEARNER.careerTarget}. Selesaikan aksi berdampak tinggi untuk mendorong TRI ke milestone berikutnya.
            </p>
            <div className="dashboard-hero-signals mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["TRI", DEMO_TRI],
                ["Role fit", `${topRole.score}%`],
                ["Streak", `${DEMO_TRI_COMPONENTS.consistencyStreak / 4 | 0} hari`],
              ].map(([label, value]) => (
                <div key={label} className="dashboard-hero-signal">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="dashboard-hero-actions mt-6 flex flex-wrap gap-3">
              <Link href="/learning-path" className="btn btn-primary">Lanjut belajar</Link>
              <Link href="/assessment" className="btn btn-secondary">Lanjutkan Asesmen</Link>
            </div>
          </div>

          <div className="dashboard-milestone-panel rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">Next milestone</p>
                <p className="mt-1 font-display text-2xl font-black text-white">{DEMO_NEXT_MILESTONE.name}</p>
              </div>
              <Badge tone="warning">{DEMO_NEXT_MILESTONE.weeksLeft} minggu</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {DEMO_NEXT_MILESTONE.checklist.slice(0, 3).map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold ${item.done ? "bg-white text-success" : "bg-white/20 text-white"}`}>
                    {item.done ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{item.label}</p>
                    {!item.done && <Progress value={item.progress} tone="accent" className="mt-1.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DAILY DIGEST */}
      <DailyDigest />

      {/* TRI HERO */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card elevated className="lg:col-span-2">
          <div className="grid gap-7 md:grid-cols-[auto,1fr] md:items-center">
            <RingMetric value={DEMO_TRI} label="Talent Readiness Index" sublabel={DEMO_TRI_MILESTONE} size={170} />
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="brand">Milestone: {DEMO_TRI_MILESTONE.replace("_", " ")}</Badge>
                <Badge tone="success">+7.2 minggu ini</Badge>
              </div>
              <h2 className="mb-2 text-xl font-display font-bold">Readiness naik, tapi masih ada gap prioritas yang harus ditutup</h2>
              <p className="mb-5 text-sm text-foreground-secondary">Anda butuh sekitar {DEMO_NEXT_MILESTONE.weeksLeft} minggu lagi untuk mencapai milestone berikutnya. Modul WCAG dan satu sesi mentoring menjadi akselerator utama.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(DEMO_TRI_COMPONENTS).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-background/70 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-foreground-muted">
                      <span>{COMPONENT_LABELS[k as keyof typeof DEMO_TRI_COMPONENTS]}</span>
                      <span className="font-semibold text-foreground">{v}</span>
                    </div>
                    <Progress value={v} tone={v >= 70 ? "success" : v >= 50 ? "brand" : "accent"} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard label="Kecocokan karir" value={`${topRole.score}%`} tone="brand" delta={topRole.role} hint={`Permintaan: ${topRole.demand} · ${topRole.growth}`} />
          <StatCard label="Streak Belajar" value={`${DEMO_TRI_COMPONENTS.consistencyStreak / 4 | 0} hari`} tone="accent" delta="aktif" hint="Konsistensi terbaik bulan ini" />
          <StatCard label="Risiko berhenti" value="Rendah" tone="success" delta="Sehat" hint="Aktivitas teratur, gap menurun" />
          <StatCard label="Modul Selesai" value={`${DEMO_LEARNING_PATH.filter(m => m.status === "completed").length}/${DEMO_LEARNING_PATH.length}`} tone="info" delta={`${inProgress.length} sedang berjalan`} />
        </div>
      </div>

      {/* TRI TIMELINE */}
      <Card className="overflow-hidden">
        <CardHeader title="Perjalanan TRI Anda" subtitle="8 minggu terakhir" action={<Link href="/skill-gap" className="text-sm text-primary hover:underline">Lihat detail →</Link>} />
        <TriSparkline data={DEMO_TRI_TIMELINE} />
      </Card>

      <section>
        <div className="mb-4">
          <span className="eyebrow">Fokus minggu ini</span>
          <h2 className="mt-2 text-2xl font-display font-bold">Pilih aksi kecil yang paling berdampak</h2>
        </div>
      </section>

      {/* DAILY CHALLENGE + SKILL RADAR */}
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <DailyChallenge />
        <SkillRadar
          title="Radar kompetensi"
          skills={[
            { name: "React", current: 72, target: 85 },
            { name: "TS", current: 58, target: 80 },
            { name: "Testing", current: 35, target: 70 },
            { name: "A11y", current: 42, target: 75 },
            { name: "Perf", current: 48, target: 75 },
            { name: "System", current: 30, target: 60 },
          ]}
        />
      </div>

      {/* FOCUS TIMER + CAREER FORECAST */}
      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <FocusTimer />
        <CareerForecast currentTRI={DEMO_TRI} weeklyHours={8} targetRole={DEMO_LEARNER.careerTarget} />
      </div>

      {/* CONSISTENCY + PEER PULSE */}
      <section>
        <div className="mb-4">
          <span className="eyebrow">Insight lanjutan</span>
          <h2 className="mt-2 text-2xl font-display font-bold">Pantau ritme, risiko, dan peluang berikutnya</h2>
        </div>
      </section>

      {/* CONSISTENCY + PEER PULSE */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StudyHeatmap />
        <PeerPulse />
      </div>

      <Card className="surface-panel">
        <CardHeader
          title="Perangkat lanjutan"
          subtitle="Dashboard dibuat lebih ringkas. Modul eksplorasi tetap tersedia saat dibutuhkan."
          action={<Link href="/coach" className="text-sm text-primary hover:underline">Tanya AI Coach →</Link>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANCED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="menu-item rounded-lg border border-border bg-background/70 p-4 transition-colors hover:border-primary/50 hover:bg-background-secondary"
            >
              <p className="font-display text-sm font-bold">{tool.title}</p>
              <p className="mt-1 text-xs text-foreground-secondary">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </Card>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Skill Gap Prioritas"
            subtitle="Diurutkan berdasarkan importance × ukuran gap"
            action={<Link href="/skill-gap" className="text-sm text-primary hover:underline">Analisis penuh →</Link>}
          />
          <div className="space-y-4">
            {topGaps.map((g) => {
              const gap = g.target - g.current;
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{g.skill}</span>
                      <Badge tone={g.importance === 3 ? "danger" : g.importance === 2 ? "warning" : "muted"}>
                        {g.importance === 3 ? "Critical" : g.importance === 2 ? "Important" : "Optional"}
                      </Badge>
                    </div>
                    <span className="text-xs text-foreground-muted">{g.current} / {g.target}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-background-tertiary">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${g.current}%` }} />
                    <div className="absolute inset-y-0 w-0.5 bg-warning" style={{ left: `${g.target}%` }} title={`Target ${g.target}`} />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-foreground-muted">
                    <span>{g.category}</span>
                    <span>Gap: <span className="text-foreground font-semibold">{gap}</span> poin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Milestone Berikutnya" subtitle={`Target: ${DEMO_NEXT_MILESTONE.name} · TRI ${DEMO_NEXT_MILESTONE.targetTRI}`} />
          <div className="space-y-3">
            {DEMO_NEXT_MILESTONE.checklist.map((c, i) => (
              <div key={`milestone-${i}`} className="flex items-start gap-3">
            <div className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full text-xs ${c.done ? "bg-success-soft text-success" : "border border-border bg-background-tertiary text-foreground-muted"}`}>
                  {c.done ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${c.done ? "line-through text-foreground-muted" : ""}`}>{c.label}</p>
                  {!c.done && <Progress value={c.progress} className="mt-1.5" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-foreground-muted mb-2">Estimasi waktu</p>
            <p className="text-2xl font-display font-bold">{DEMO_NEXT_MILESTONE.weeksLeft} minggu</p>
            <p className="text-xs text-foreground-muted mt-1">dengan pace saat ini</p>
          </div>
        </Card>
      </div>

      {/* CONTINUE LEARNING + MENTOR PICK */}
      <div className="grid gap-6 lg:grid-cols-3">
        {nextModule && (
          <Card className="lg:col-span-2 card-hover insight-strip">
            <div className="flex items-start gap-2 mb-3">
              <Badge tone="brand">Lanjutkan Belajar</Badge>
              <Badge tone="muted">{nextModule.category}</Badge>
              <Badge tone="muted">{nextModule.durationHrs}h</Badge>
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">{nextModule.title}</h3>
            <p className="text-sm text-foreground-secondary mb-4">Modul ini menutup gap pada: {nextModule.skillsCovered.join(", ")}.</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Progress value={nextModule.progress} />
                <p className="text-xs text-foreground-muted mt-1">{nextModule.progress}% selesai</p>
              </div>
              <Link href="/learning-path" className="btn btn-primary">Lanjutkan →</Link>
            </div>
          </Card>
        )}

        <Card className="card-hover">
          <span className="eyebrow">Mentor Match</span>
          <div className="mt-3 flex items-center gap-3">
            <div className="brand-mark brand-mark-md">{topMentor.avatarInitials}</div>
            <div className="flex-1">
              <p className="font-display font-bold">{topMentor.name}</p>
              <p className="text-xs text-foreground-muted">{topMentor.title} · {topMentor.company}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-foreground-muted">Match score</span>
            <span className="text-2xl font-display font-bold glow-text">{topMentor.matchScore}%</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-foreground-secondary">
            {topMentor.reasons.slice(0, 2).map((r) => <li key={r} className="flex gap-2"><span className="text-success">✓</span> {r}</li>)}
          </ul>
          <Link href="/mentors" className="btn btn-secondary w-full mt-4">Lihat Semua Mentor →</Link>
        </Card>
      </div>

      {/* ACTIVITY + INTERVENTION */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Aktivitas Terbaru" subtitle="Timeline pembelajaran Anda" />
          <ol className="relative border-l border-border ml-2 space-y-5">
            {DEMO_ACTIVITY.map((a) => (
              <li key={a.id} className="ml-5">
                <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary text-[10px]">{a.icon}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm">{a.text}</p>
                  <Badge tone="muted">{a.tag}</Badge>
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">{a.at}</p>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Callout tone="brand" title="Smart Intervention">
            Skill <strong>Testing</strong> Anda masih jauh dari target. Kami sarankan modul <strong>Testing Komponen React</strong> minggu ini (~7 jam).
          </Callout>
          <Callout tone="accent" title="Pertahankan Streak">
            Anda sudah konsisten 18 hari. Selesaikan 1 aktivitas hari ini untuk menjaga streak.
          </Callout>
          <Card>
            <p className="mb-2 text-xs uppercase text-foreground-muted">Akses cepat</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/career-compass" className="btn btn-secondary btn-sm">Compass</Link>
              <Link href="/skill-tree" className="btn btn-secondary btn-sm">Skill Tree</Link>
              <Link href="/session-prep" className="btn btn-secondary btn-sm">Session Prep</Link>
              <Link href="/skill-gap" className="btn btn-secondary btn-sm">Skill Gap</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TriSparkline({ data }: { data: { week: string; tri: number }[] }) {
  const max = Math.max(...data.map((d) => d.tri), 100);
  const min = 0;
  const W = 600;
  const H = 120;
  const PAD_X = 16;
  const chartW = W - PAD_X * 2;
  const stepX = chartW / (data.length - 1);
  const xOf = (i: number) => PAD_X + i * stepX;
  const yOf = (v: number) => H - ((v - min) / (max - min)) * H;
  const points = data.map((d, i) => `${xOf(i)},${yOf(d.tri)}`).join(" ");
  const area = `M ${PAD_X},${H} L ${points} L ${W - PAD_X},${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-auto" role="img" aria-label="Grafik perjalanan TRI 8 minggu terakhir">
        <defs>
          <linearGradient id="triFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#triFill)" />
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.week}>
            <circle cx={xOf(i)} cy={yOf(d.tri)} r="4" fill="var(--accent)" />
            <text x={xOf(i)} y={H + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.week}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
