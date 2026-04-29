"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Callout, Card, CardHeader, Input, Label } from "@/components/ui";
import { useA11y } from "@/components/accessibility-provider";
import { DEMO_LEARNER } from "@/lib/demo-data";
import { updateLearnerProfileAction } from "@/features/learner/profile.actions";

const LEARNING_STYLES = [
  { value: "visual", label: "Visual" },
  { value: "kinesthetic", label: "Hands-On" },
  { value: "auditory", label: "Audio" },
  { value: "reading", label: "Reading" },
];
const MENTORING_STYLES = [
  { value: "structured", label: "Terstruktur" },
  { value: "exploratory", label: "Eksploratif" },
  { value: "supportive", label: "Suportif" },
];
const CAREER_TARGETS: { slug: string; label: string }[] = [
  { slug: "frontend-developer", label: "Frontend Developer" },
  { slug: "backend-developer", label: "Backend Developer" },
  { slug: "data-analyst", label: "Data Analyst" },
  { slug: "ui-ux-designer", label: "UI/UX Designer" },
  { slug: "digital-marketing-specialist", label: "Digital Marketing Specialist" },
  { slug: "product-manager", label: "Product Manager" },
  { slug: "financial-analyst", label: "Financial Analyst" },
  { slug: "project-manager", label: "Project Manager" },
  { slug: "content-strategist", label: "Content Strategist" },
];

export default function ProfilePage() {
  const { prefs, update, reset } = useA11y();
  const [status, setStatus] = React.useState<{ kind: "idle" | "saving" | "saved" | "error"; msg?: string }>({ kind: "idle" });

  const [data, setData] = React.useState({
    name: DEMO_LEARNER.name,
    email: DEMO_LEARNER.email,
    educationStatus: DEMO_LEARNER.educationStatus,
    careerTargetSlug: "frontend-developer",
    learningStyle: "visual",
    mentoringStyle: "structured",
    weeklyHours: 12,
    language: "id",
  });

  const save = async () => {
    setStatus({ kind: "saving" });
    const res = await updateLearnerProfileAction({
      name: data.name,
      educationStatus: data.educationStatus,
      targetRoleSlug: data.careerTargetSlug,
      learningStyle: data.learningStyle,
      mentoringStyle: data.mentoringStyle,
      weeklyHours: data.weeklyHours,
      languagePreference: data.language,
    });
    if (res.ok) {
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    } else {
      setStatus({ kind: "error", msg: res.error });
    }
  };

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Profil</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Profil & Preferensi</h1>
          <p className="mt-1 text-foreground-secondary">Kelola data pribadi, preferensi belajar, dan pengaturan aksesibilitas Anda.</p>
        </div>
        <div className="flex gap-2">
          {status.kind === "saving" && <Badge tone="info">Menyimpan…</Badge>}
          {status.kind === "saved" && <Badge tone="success">✓ Tersimpan</Badge>}
          {status.kind === "error" && <Badge tone="danger">Gagal: {status.msg}</Badge>}
        </div>
      </header>

      <Card>
        <CardHeader title="Informasi dasar" subtitle="Informasi publik yang terlihat oleh mentor Anda" />
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white text-xl font-bold">{DEMO_LEARNER.avatarInitials}</div>
            <div>
              <p className="font-semibold">{data.name}</p>
              <p className="text-xs text-foreground-muted">{data.email}</p>
              <button className="text-xs text-primary hover:underline mt-1">Ganti foto →</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama lengkap</Label>
              <Input id="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={data.email} disabled />
              <p className="text-xs text-foreground-muted mt-1">Email tidak dapat diubah.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edu">Status pendidikan</Label>
              <Input id="edu" value={data.educationStatus} onChange={(e) => setData({ ...data, educationStatus: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="target">Target karir</Label>
              <select id="target" className="input" value={data.careerTargetSlug} onChange={(e) => setData({ ...data, careerTargetSlug: e.target.value })}>
                {CAREER_TARGETS.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Preferensi pembelajaran" subtitle="Memengaruhi rekomendasi modul & mentor" />
        <div className="space-y-6">
          <div>
            <Label>Gaya belajar</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {LEARNING_STYLES.map((s) => {
                const on = data.learningStyle === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setData({ ...data, learningStyle: s.value })}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${on ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:text-foreground"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Gaya mentoring</Label>
            <div className="grid sm:grid-cols-3 gap-2 mt-1">
              {MENTORING_STYLES.map((s) => {
                const on = data.mentoringStyle === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setData({ ...data, mentoringStyle: s.value })}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${on ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:text-foreground"}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-1">
              <Label htmlFor="hrs">Target jam belajar / minggu</Label>
              <span className="text-xl font-display font-bold text-primary">{data.weeklyHours}<span className="text-xs font-normal text-foreground-muted ml-1">jam</span></span>
            </div>
            <input id="hrs" type="range" min={1} max={30} value={data.weeklyHours} onChange={(e) => setData({ ...data, weeklyHours: Number(e.target.value) })} className="w-full accent-primary" />
          </div>

          <div>
            <Label htmlFor="lang">Bahasa utama</Label>
            <select id="lang" className="input" value={data.language} onChange={(e) => setData({ ...data, language: e.target.value })}>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Aksesibilitas & kenyamanan" subtitle="Diterapkan langsung ke seluruh aplikasi" action={<button onClick={reset} className="text-sm text-primary hover:underline">Reset ke default</button>} />
        <div className="space-y-6">
          <Field label="Skala font" hint="Ukuran teks di seluruh aplikasi">
            <Segmented
              value={prefs.fontScale}
              onChange={(v) => update({ fontScale: v as "sm" | "md" | "lg" | "xl" })}
              options={[{ value: "sm", label: "S" }, { value: "md", label: "M" }, { value: "lg", label: "L" }, { value: "xl", label: "XL" }]}
            />
          </Field>
          <Field label="Animasi" hint="Reduced motion mengurangi animasi & transisi">
            <Segmented
              value={prefs.motion}
              onChange={(v) => update({ motion: v as "normal" | "reduced" })}
              options={[{ value: "normal", label: "Normal" }, { value: "reduced", label: "Reduced" }]}
            />
          </Field>
          <Field label="Kontras" hint="High contrast untuk low vision">
            <Segmented
              value={prefs.contrast}
              onChange={(v) => update({ contrast: v as "normal" | "high" })}
              options={[{ value: "normal", label: "Normal" }, { value: "high", label: "High" }]}
            />
          </Field>
          <Toggle label="Mode Ramah Disleksia" hint="Letter-spacing & line-height yang lebih lega." checked={prefs.dyslexia} onChange={(v) => update({ dyslexia: v })} />
          <Toggle label="True Focus Mode" hint="Sembunyikan sidebar & widget non-esensial, layout 1 kolom." checked={prefs.focusMode} onChange={(v) => update({ focusMode: v })} />
          <Toggle label="Simplified Reading" hint="Prose lebih besar, leading lega, chip/chart disamarkan." checked={prefs.simplifiedReading} onChange={(v) => update({ simplifiedReading: v })} />
          <Toggle label="Text-to-Speech" hint="Aktifkan indikator baca untuk konten bertanda." checked={prefs.textToSpeech} onChange={(v) => update({ textToSpeech: v })} />
          <Toggle label="Calm View" hint="Saturasi rendah, tanpa animasi, cocok untuk sensory overload." checked={prefs.calmView} onChange={(v) => update({ calmView: v })} />
        </div>
      </Card>

      <Callout tone="info" title="Data & privasi">
        Preferensi aksesibilitas disimpan lokal di perangkat Anda. Data profil disimpan di akun Nexus Anda. Lihat kebijakan privasi di <a className="text-primary hover:underline" href="#">/privacy</a>.
      </Callout>

      <div className="flex gap-2">
        <Button onClick={save} size="lg" disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
        <Link href="/dashboard" className="btn btn-secondary">Batal</Link>
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

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div role="radiogroup" className="grid gap-1 p-1 bg-background-tertiary border border-border rounded-xl" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
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
