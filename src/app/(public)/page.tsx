import Link from "next/link";
import { Badge, Progress } from "@/components/ui";

const FEATURES = [
  {
    title: "Asesmen adaptif",
    desc: "Gap skill dibaca dari performa, confidence, dan target role agar prioritas belajar tidak asal rata.",
    tone: "brand",
  },
  {
    title: "Readiness cockpit",
    desc: "TRI, role fit, ritme belajar, mentoring, dan portofolio tampil dalam satu pusat keputusan.",
    tone: "accent",
  },
  {
    title: "Mentor matching",
    desc: "Rekomendasi mentor mengikuti gap tertinggi, preferensi aksesibilitas, dan konteks karir learner.",
    tone: "success",
  },
  {
    title: "Portfolio evidence",
    desc: "Project evidence divalidasi mentor sehingga readiness naik dari bukti, bukan klaim.",
    tone: "warning",
  },
];

const STATS = [
  { value: "6D", label: "Dimensi TRI" },
  { value: "200+", label: "Modul kurasi" },
  { value: "AA", label: "Baseline WCAG" },
  { value: "1:1", label: "Mentoring" },
];

const LANDING_NAV = [
  { href: "#features", label: "Fitur" },
  { href: "#how", label: "Cara Kerja" },
  { href: "#inclusive", label: "Inklusif" },
];

const FLOW = [
  { step: "01", title: "Diagnosa", desc: "Mulai dari asesmen adaptif dan confidence check." },
  { step: "02", title: "Prioritas", desc: "Gap disusun berdasarkan dampak terbesar ke role target." },
  { step: "03", title: "Eksekusi", desc: "Belajar, mentoring, dan evidence berjalan dalam satu ritme." },
  { step: "04", title: "Validasi", desc: "TRI bergerak mengikuti data yang sudah diverifikasi." },
];

const PIPELINE = [
  ["Asesmen", 74, "Selesai"],
  ["Role fit", 68, "On track"],
  ["Learning", 62, "Berjalan"],
  ["Mentoring", 55, "Perlu sesi"],
  ["Portofolio", 48, "Mulai proyek"],
];

export default function LandingPage() {
  return (
    <div id="main" className="min-h-screen app-backdrop">
      <header className="shell-header sticky top-0 z-40">
        <div className="shell-topbar">
          <div className="container-app relative flex h-14 items-center gap-3 sm:h-16">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <div className="brand-mark shrink-0">SN</div>
              <span className="hidden font-display text-lg font-bold sm:inline">
                SkillBridge <span className="glow-text">Nexus</span>
              </span>
            </Link>

            <nav className="public-side-nav hidden lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2" aria-label="Navigasi utama">
              {LANDING_NAV.map((item) => (
                <a key={item.href} href={item.href} className="public-side-nav-link">
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Masuk</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Mulai Gratis</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="public-hero border-b border-border/80">
        <div className="container-app grid gap-8 py-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:py-12">
          <div className="public-hero-copy max-w-2xl">
            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-accent pulse-ring" />
              <span className="text-xs font-semibold text-foreground-secondary">Platform kesiapan karir berbasis bukti</span>
            </div>
            <h1 className="public-hero-title text-4xl font-display font-black leading-tight sm:text-5xl lg:text-6xl">
              Command center untuk menaikkan readiness talenta.
            </h1>
            <p className="mt-5 max-w-xl text-base text-foreground-secondary sm:text-lg">
              SkillBridge Nexus menyatukan asesmen adaptif, learning path, mentor matching, dan portfolio evidence dalam pengalaman yang rapi, terukur, dan inklusif.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary btn-lg">Mulai Diagnosa</Link>
              <Link href="/login" className="btn btn-secondary btn-lg">Coba Demo</Link>
            </div>
            <div className="public-proof-strip mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="public-proof-card metric-tile px-3 py-3">
                  <div className="font-display text-xl font-black text-foreground">{s.value}</div>
                  <div className="mt-0.5 text-xs text-foreground-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="features" className="section-band">
        <div className="container-app py-14 lg:py-20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">Kapabilitas inti</span>
              <h2 className="mt-3 text-3xl font-display font-bold sm:text-4xl">Satu alur dari diagnosis sampai validasi</h2>
              <p className="mt-3 text-foreground-secondary">
                Tiap area saling terhubung agar learner tahu apa yang harus dikerjakan hari ini dan kenapa itu penting.
              </p>
            </div>
            <Badge tone="success">TRI terhubung ke semua modul</Badge>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card card-hover">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-foreground-muted">{String(i + 1).padStart(2, "0")}</span>
                  <Badge tone={f.tone as "brand" | "accent" | "success" | "warning"}>Aktif</Badge>
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-foreground-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border">
        <div className="container-app py-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Cara kerja</span>
            <h2 className="mt-3 text-3xl font-display font-bold sm:text-4xl">Empat langkah yang mudah dipahami learner</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {FLOW.map((s) => (
              <div key={s.step} className="surface-panel p-5">
                <div className="text-sm font-mono font-bold text-accent">{s.step}</div>
                <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-foreground-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inclusive" className="section-band border-t border-border">
        <div className="container-app grid gap-8 py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:py-20">
          <div>
            <span className="eyebrow">Inklusivitas sebagai fondasi</span>
            <h2 className="mt-3 text-3xl font-display font-bold sm:text-4xl">Kontrol aksesibilitas menjadi bagian dari pengalaman utama</h2>
            <p className="mt-4 text-foreground-secondary">
              Ukuran font, kontras, motion, mode ramah disleksia, dan focus mode tersedia dekat dengan alur belajar, bukan sekadar pengaturan tersembunyi.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Skala font adaptif",
              "Kontras tinggi",
              "Reduced motion",
              "Mode ramah disleksia",
              "Navigasi keyboard",
              "Focus mode",
            ].map((i) => (
              <div key={i} className="metric-tile flex items-center gap-3 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-sm font-medium text-foreground-secondary">{i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-app py-14">
          <div className="command-surface px-5 py-8 text-center sm:px-8">
            <h2 className="mx-auto max-w-2xl text-3xl font-display font-bold sm:text-4xl">Mulai dari diagnosis, bukan tebak-tebakan.</h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
              Bangun readiness dengan data yang bisa ditindaklanjuti oleh learner, mentor, dan institusi.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary btn-lg">Buat Akun Gratis</Link>
              <Link href="/login" className="btn btn-secondary btn-lg">Masuk Demo</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container-app text-center text-sm text-foreground-muted">
          © 2026 SkillBridge Nexus - Human Capital & Future Skills Inclusivity
        </div>
      </footer>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview-wrap relative">
      <div className="product-preview command-surface overflow-hidden">
        <div className="product-preview-toolbar flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="brand-mark brand-mark-sm">SN</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Learner Command Center</p>
              <p className="text-xs text-foreground-muted">Target: Frontend Engineer</p>
            </div>
          </div>
          <Badge tone="success">On track</Badge>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="p-5 sm:p-6">
            <div className="preview-score-card rounded-lg border border-border bg-background/80 p-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-foreground-muted">Talent Readiness Index</p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-display text-5xl font-black text-foreground">68</span>
                    <span className="text-sm font-semibold text-success">+7.2 minggu ini</span>
                  </div>
                </div>
                <Link href="/login" className="btn btn-secondary btn-sm">Lihat demo</Link>
              </div>
              <div className="mt-4">
                <Progress value={68} tone="accent" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PIPELINE.map(([label, value, state]) => (
                <div key={label as string} className="preview-pipeline-card rounded-lg border border-border bg-background/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground">{label}</span>
                    <span className="text-foreground-muted">{state}</span>
                  </div>
                  <Progress value={value as number} tone={(value as number) > 70 ? "success" : (value as number) > 55 ? "brand" : "warning"} />
                </div>
              ))}
            </div>
          </div>

          <div className="preview-focus-panel border-t border-border/70 bg-background-secondary/55 p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase text-foreground-muted">Fokus hari ini</p>
            <div className="mt-3 space-y-3">
              {[
                ["Selesaikan modul WCAG", "45 menit", "brand"],
                ["Book sesi mentor", "1:1 review", "accent"],
                ["Upload evidence project", "Portfolio", "success"],
              ].map(([title, meta, tone]) => (
                <div key={title} className="rounded-lg border border-border bg-background/80 p-3">
                  <Badge tone={tone as "brand" | "accent" | "success"}>{meta}</Badge>
                  <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-background/70 p-3">
              <p className="text-xs text-foreground-muted">Mentor terbaik</p>
              <p className="mt-1 text-sm font-bold text-foreground">Nadia Prameswari</p>
              <p className="text-xs text-foreground-muted">Match score 91%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="audience-tabs mt-4 grid grid-cols-3 gap-3">
        {["Learner", "Mentor", "Institusi"].map((item) => (
          <div key={item} className="metric-tile px-3 py-2 text-center text-xs font-semibold text-foreground-secondary">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
