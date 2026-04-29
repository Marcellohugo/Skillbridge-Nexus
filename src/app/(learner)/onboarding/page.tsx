"use client";

import * as React from "react";
import { useActionState } from "react";
import { Badge, Button, Callout, Card, Input, Label, Progress } from "@/components/ui";
import { useA11y } from "@/components/accessibility-provider";
import { completeOnboardingAction } from "@/features/learner/onboarding.actions";

type StepId = "welcome" | "education" | "career" | "learning" | "accessibility" | "review";

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: "welcome", title: "Mulai", subtitle: "Perkenalan singkat" },
  { id: "education", title: "Pendidikan", subtitle: "Latar belakang Anda" },
  { id: "career", title: "Karir", subtitle: "Target peran impian" },
  { id: "learning", title: "Belajar", subtitle: "Cara & ritme belajar" },
  { id: "accessibility", title: "Aksesibilitas", subtitle: "Pengalaman inklusif" },
  { id: "review", title: "Review", subtitle: "Konfirmasi & mulai" },
];

const EDUCATION_OPTIONS = [
  { value: "Mahasiswa Aktif", label: "Mahasiswa Aktif", desc: "Sedang menempuh studi formal", icon: "🎓" },
  { value: "Fresh Graduate", label: "Fresh Graduate", desc: "Lulus < 2 tahun, mencari peran pertama", icon: "🆕" },
  { value: "Job Seeker", label: "Job Seeker", desc: "Aktif mencari peran baru / pivot karir", icon: "🔎" },
  { value: "Sudah Bekerja", label: "Profesional Aktif", desc: "Bekerja & ingin upskill / reskill", icon: "💼" },
];

const CAREER_OPTIONS = [
  { slug: "frontend-engineer", label: "Frontend Engineer", desc: "UI, UX implementation, web platform", demand: "Sangat Tinggi" },
  { slug: "backend-engineer", label: "Backend Engineer", desc: "API, database, sistem terdistribusi", demand: "Sangat Tinggi" },
  { slug: "fullstack-engineer", label: "Full-Stack Engineer", desc: "Frontend + backend end-to-end", demand: "Tinggi" },
  { slug: "mobile-engineer", label: "Mobile Engineer", desc: "iOS / Android / cross-platform", demand: "Tinggi" },
  { slug: "data-analyst", label: "Data Analyst", desc: "SQL, dashboards, business insights", demand: "Tinggi" },
  { slug: "data-engineer", label: "Data Engineer", desc: "Pipeline, ETL, data platform", demand: "Tinggi" },
  { slug: "product-designer", label: "Product Designer", desc: "Riset, UX, UI, design system", demand: "Sedang" },
  { slug: "devops-engineer", label: "DevOps / Platform", desc: "CI/CD, cloud, observability", demand: "Tinggi" },
];

const LEARNING_STYLES = [
  { value: "visual", label: "Visual", desc: "Diagram, video, infografik" },
  { value: "kinesthetic", label: "Hands-On", desc: "Project, lab, eksperimen langsung" },
  { value: "auditory", label: "Audio", desc: "Podcast, diskusi, narasi" },
  { value: "reading", label: "Reading", desc: "Artikel, dokumentasi, buku" },
];

const MENTORING_STYLES = [
  { value: "structured", label: "Terstruktur", desc: "Roadmap, milestone, review berkala" },
  { value: "exploratory", label: "Eksploratif", desc: "Diskusi terbuka, belajar dari konteks" },
  { value: "supportive", label: "Suportif", desc: "Coaching, motivasi, accountability" },
];

export default function OnboardingPage() {
  const { update: updateA11y } = useA11y();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, { error: "" } as { error: string });

  const [data, setData] = React.useState({
    educationStatus: "",
    department: "",
    major: "",
    targetRoleSlug: "",
    weeklyHours: 8,
    learningStyle: "visual",
    mentoringStyle: "structured",
    languagePreference: "id",
    accessibility: {
      fontSize: "medium",
      motion: "normal" as "normal" | "reduced",
      contrast: "normal" as "normal" | "high",
      dyslexiaFont: false,
      focusMode: false,
    },
  });

  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const canNext = (() => {
    if (step.id === "education") return Boolean(data.educationStatus);
    if (step.id === "career") return Boolean(data.targetRoleSlug);
    return true;
  })();

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(i - 1, 0));

  const setA11y = <K extends keyof typeof data.accessibility>(key: K, value: (typeof data.accessibility)[K]) => {
    setData((d) => ({ ...d, accessibility: { ...d.accessibility, [key]: value } }));
    if (key === "motion") updateA11y({ motion: value as "normal" | "reduced" });
    if (key === "contrast") updateA11y({ contrast: value as "normal" | "high" });
    if (key === "dyslexiaFont") updateA11y({ dyslexia: value as boolean });
    if (key === "focusMode") updateA11y({ focusMode: value as boolean });
    if (key === "fontSize") {
      const map: Record<string, "sm" | "md" | "lg" | "xl"> = { small: "sm", medium: "md", large: "lg", xlarge: "xl" };
      updateA11y({ fontScale: map[value as string] ?? "md" });
    }
  };

  const targetRole = CAREER_OPTIONS.find((c) => c.slug === data.targetRoleSlug);

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="eyebrow">Onboarding · 2 menit</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Bangun profil Anda</h1>
          <p className="mt-1 text-foreground-secondary">Profil yang akurat membuat rekomendasi modul, mentor, dan TRI Anda relevan sejak hari pertama.</p>
        </header>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
            <span>Langkah {stepIdx + 1} dari {STEPS.length}: <span className="text-foreground font-semibold">{step.title}</span></span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} tone="brand" />
          <ol className="hidden sm:flex mt-4 gap-1.5" aria-label="Progress onboarding">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => i < stepIdx && setStepIdx(i)}
                  disabled={i > stepIdx}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                    i === stepIdx
                      ? "border-primary/50 bg-primary/5"
                      : i < stepIdx
                        ? "border-border bg-background-secondary hover:border-border-strong"
                        : "border-border/60 opacity-60"
                  }`}
                >
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-foreground-muted">{s.subtitle}</div>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <Card elevated className="min-h-[420px]">
          {step.id === "welcome" && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4" aria-hidden>👋</div>
              <h2 className="text-2xl font-display font-bold mb-3">Senang bertemu Anda!</h2>
              <p className="text-foreground-secondary max-w-lg mx-auto mb-6">
                Kami akan menanyakan beberapa hal singkat tentang latar belakang, target karir, gaya belajar, dan kebutuhan aksesibilitas Anda — semua bisa diubah kapan saja di Profil.
              </p>
              <ul className="grid sm:grid-cols-3 gap-3 text-left mb-2 max-w-xl mx-auto">
                {[
                  ["🎯", "Target karir", "Personalisasi skill gap & path"],
                  ["🛤️", "Ritme belajar", "Estimasi modul mingguan realistis"],
                  ["♿", "Aksesibilitas", "Pengalaman inklusif sejak awal"],
                ].map(([icon, title, desc]) => (
                  <li key={title} className="card p-4 text-center">
                    <div className="text-2xl mb-2">{icon}</div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-foreground-muted mt-1">{desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.id === "education" && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Status pendidikan saat ini</h2>
              <p className="text-sm text-foreground-muted mb-5">Kami pakai info ini untuk menyesuaikan tingkat materi dan tone rekomendasi.</p>
              <div role="radiogroup" aria-label="Status pendidikan" className="grid sm:grid-cols-2 gap-3">
                {EDUCATION_OPTIONS.map((opt) => {
                  const on = data.educationStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setData((d) => ({ ...d, educationStatus: opt.value }))}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        on ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 grid place-items-center rounded-lg bg-background-tertiary text-xl" aria-hidden>{opt.icon}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-foreground-muted">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div>
                  <Label htmlFor="department">Fakultas / Departemen <span className="text-foreground-muted font-normal">(opsional)</span></Label>
                  <Input id="department" value={data.department} onChange={(e) => setData((d) => ({ ...d, department: e.target.value }))} placeholder="cth. Teknik Informatika" />
                </div>
                <div>
                  <Label htmlFor="major">Jurusan / Minat <span className="text-foreground-muted font-normal">(opsional)</span></Label>
                  <Input id="major" value={data.major} onChange={(e) => setData((d) => ({ ...d, major: e.target.value }))} placeholder="cth. Software Engineering" />
                </div>
              </div>
            </div>
          )}

          {step.id === "career" && (
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Target peran karir</h2>
              <p className="text-sm text-foreground-muted mb-5">Pilih satu peran untuk fokus awal — Anda bisa mengeksplorasi peran lain di halaman Skill Gap nanti.</p>
              <div role="radiogroup" aria-label="Target peran karir" className="grid sm:grid-cols-2 gap-3">
                {CAREER_OPTIONS.map((opt) => {
                  const on = data.targetRoleSlug === opt.slug;
                  return (
                    <button
                      key={opt.slug}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setData((d) => ({ ...d, targetRoleSlug: opt.slug }))}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        on ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <Badge tone={opt.demand === "Sangat Tinggi" ? "success" : opt.demand === "Tinggi" ? "brand" : "muted"}>{opt.demand}</Badge>
                      </div>
                      <p className="text-xs text-foreground-muted">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step.id === "learning" && (
            <div className="space-y-7">
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Cara belajar yang paling cocok</h2>
                <p className="text-sm text-foreground-muted mb-4">Kami akan memprioritaskan format konten yang sesuai gaya Anda.</p>
                <div role="radiogroup" aria-label="Gaya belajar" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LEARNING_STYLES.map((s) => {
                    const on = data.learningStyle === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setData((d) => ({ ...d, learningStyle: s.value }))}
                        className={`p-3 rounded-xl border text-left transition-all ${on ? "border-primary/50 bg-primary/5" : "border-border hover:border-border-strong"}`}
                      >
                        <p className="text-sm font-semibold">{s.label}</p>
                        <p className="text-xs text-foreground-muted mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-display font-bold mb-1">Pendekatan mentoring favorit</h3>
                <p className="text-sm text-foreground-muted mb-4">Mempengaruhi rekomendasi mentor match Anda.</p>
                <div role="radiogroup" aria-label="Gaya mentoring" className="grid sm:grid-cols-3 gap-2">
                  {MENTORING_STYLES.map((s) => {
                    const on = data.mentoringStyle === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setData((d) => ({ ...d, mentoringStyle: s.value }))}
                        className={`p-3 rounded-xl border text-left transition-all ${on ? "border-primary/50 bg-primary/5" : "border-border hover:border-border-strong"}`}
                      >
                        <p className="text-sm font-semibold">{s.label}</p>
                        <p className="text-xs text-foreground-muted mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between mb-2">
                  <Label htmlFor="weekly">Berapa jam per minggu yang bisa Anda dedikasikan?</Label>
                  <span className="text-2xl font-display font-bold text-primary">{data.weeklyHours}<span className="text-sm font-normal text-foreground-muted ml-1">jam</span></span>
                </div>
                <input
                  id="weekly"
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={data.weeklyHours}
                  onChange={(e) => setData((d) => ({ ...d, weeklyHours: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-foreground-muted mt-1">
                  <span>1j (santai)</span>
                  <span>15j (ideal)</span>
                  <span>30j (intens)</span>
                </div>
                <p className="text-xs text-foreground-muted mt-2">Pilih ritme yang realistis — konsistensi mengalahkan intensitas.</p>
              </div>

              <div>
                <Label htmlFor="lang">Bahasa utama konten</Label>
                <div role="radiogroup" aria-label="Bahasa" className="grid grid-cols-2 gap-2 mt-1">
                  {[{ v: "id", l: "Bahasa Indonesia" }, { v: "en", l: "English" }].map((o) => {
                    const on = data.languagePreference === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setData((d) => ({ ...d, languagePreference: o.v }))}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${on ? "border-primary/50 bg-primary/5" : "border-border hover:border-border-strong"}`}
                      >
                        {o.l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step.id === "accessibility" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-display font-bold mb-1">Aksesibilitas & kenyamanan</h2>
                <p className="text-sm text-foreground-muted">Setiap perubahan langsung diterapkan pada UI agar Anda bisa mencobanya. Anda dapat mengubah ini kapan saja melalui tombol ♿ di header.</p>
              </div>

              <Field label="Skala font" hint="Atur ukuran teks di seluruh aplikasi.">
                <Segmented
                  name="fontScale"
                  value={data.accessibility.fontSize}
                  onChange={(v) => setA11y("fontSize", v)}
                  options={[
                    { value: "small", label: "Kecil" },
                    { value: "medium", label: "Normal" },
                    { value: "large", label: "Besar" },
                    { value: "xlarge", label: "Sangat Besar" },
                  ]}
                />
              </Field>

              <Field label="Animasi" hint="Reduced motion mengurangi animasi & transisi (membantu motion sensitivity).">
                <Segmented
                  name="motion"
                  value={data.accessibility.motion}
                  onChange={(v) => setA11y("motion", v as "normal" | "reduced")}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "reduced", label: "Reduced" },
                  ]}
                />
              </Field>

              <Field label="Kontras" hint="High contrast meningkatkan keterbacaan untuk low vision.">
                <Segmented
                  name="contrast"
                  value={data.accessibility.contrast}
                  onChange={(v) => setA11y("contrast", v as "normal" | "high")}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "High" },
                  ]}
                />
              </Field>

              <Toggle
                label="Mode Ramah Disleksia"
                hint="Letter-spacing & line-height yang lebih lega."
                checked={data.accessibility.dyslexiaFont}
                onChange={(v) => setA11y("dyslexiaFont", v)}
              />

              <Toggle
                label="Focus Mode"
                hint="Sederhanakan tampilan saat fokus pada konten utama."
                checked={data.accessibility.focusMode}
                onChange={(v) => setA11y("focusMode", v)}
              />
            </div>
          )}

          {step.id === "review" && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-grid place-items-center h-14 w-14 rounded-full bg-success-soft text-success text-2xl mb-3" aria-hidden>✓</div>
                <h2 className="text-2xl font-display font-bold">Profil Anda siap</h2>
                <p className="text-sm text-foreground-muted mt-1">Periksa ringkasan di bawah, lalu lanjutkan ke asesmen awal untuk menghitung TRI pertama Anda.</p>
              </div>

              <dl className="grid sm:grid-cols-2 gap-3 mb-6">
                <Summary label="Status pendidikan" value={data.educationStatus || "—"} />
                <Summary label="Target karir" value={targetRole?.label ?? "—"} />
                <Summary label="Departemen" value={data.department || "—"} />
                <Summary label="Jurusan" value={data.major || "—"} />
                <Summary label="Gaya belajar" value={LEARNING_STYLES.find((s) => s.value === data.learningStyle)?.label ?? "—"} />
                <Summary label="Mentoring" value={MENTORING_STYLES.find((s) => s.value === data.mentoringStyle)?.label ?? "—"} />
                <Summary label="Jam / minggu" value={`${data.weeklyHours} jam`} />
                <Summary label="Bahasa" value={data.languagePreference === "id" ? "Bahasa Indonesia" : "English"} />
              </dl>

              <Callout tone="brand" title="Apa selanjutnya?">
                Setelah ini Anda akan menjalani <strong>asesmen diagnostik singkat</strong> (~10 menit) untuk mengukur level skill awal. Hasilnya membentuk TRI dan learning path personal Anda.
              </Callout>

              {state?.error && (
                <Callout tone="danger" title="Tidak dapat menyimpan" className="mt-4">{state.error}</Callout>
              )}

              <form action={formAction} className="mt-6">
                <input type="hidden" name="payload" value={JSON.stringify(data)} />
                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? "Menyimpan…" : "Simpan & Mulai Asesmen →"}
                </Button>
              </form>
            </div>
          )}
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={stepIdx === 0}>← Kembali</Button>
          {step.id !== "review" && (
            <Button onClick={next} disabled={!canNext}>
              Lanjut →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-foreground-muted mt-2">{hint}</p>}
    </div>
  );
}

function Segmented({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-1 p-1 bg-background-tertiary border border-border rounded-xl" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`h-10 rounded-lg text-sm font-medium transition-colors ${on ? "bg-background border border-primary/40 text-foreground" : "text-foreground-muted hover:text-foreground"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label className="text-sm font-semibold">{label}</label>
        {hint && <p className="text-xs text-foreground-muted mt-1">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-background-tertiary border border-border"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary/50 px-3 py-2.5">
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="text-sm font-semibold mt-0.5">{value}</dd>
    </div>
  );
}
