"use client";

import { useState } from "react";
import { Badge, Card, CardHeader, Callout } from "@/components/ui";
import { DEMO_MENTOR } from "@/lib/demo-data";

const EXPERTISE = ["React", "TypeScript", "Performance", "Accessibility", "System Design", "Testing"];
const INDUSTRIES = ["Technology", "E-commerce", "FinTech"];
const TOPICS = ["Career Guidance", "Code Review", "System Design", "Frontend Architecture", "Interview Prep"];

export default function MentorProfilePage() {
  const [saved, setSaved] = useState(false);
  const [bio, setBio] = useState("Senior Frontend Engineer dengan 8+ tahun pengalaman di perusahaan teknologi Indonesia. Fokus pada React ecosystem, accessibility, dan mentoring developer junior hingga mid-level.");
  const [style, setStyle] = useState("structured");
  const [format, setFormat] = useState("video");
  const [available, setAvailable] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Profil Mentor</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Profil & Preferensi</h1>
          <p className="mt-1 text-foreground-secondary">Kelola profil publik dan pengaturan mentoring</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Badge tone="success">Tersimpan!</Badge>}
          <button onClick={handleSave} className="btn btn-primary">Simpan Perubahan</button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Informasi dasar" subtitle="Ditampilkan ke learner saat matching" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama</label>
                <input className="input" defaultValue={DEMO_MENTOR.name} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jabatan</label>
                <input className="input" defaultValue={DEMO_MENTOR.title} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input className="input" defaultValue={DEMO_MENTOR.email} readOnly />
                <p className="text-xs text-foreground-muted mt-1">Email tidak dapat diubah</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Biografi</label>
                <textarea className="input" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} style={{ height: "auto" }} />
                <p className="text-xs text-foreground-muted mt-1">{bio.length}/500 karakter</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Keahlian & Industri" subtitle="Mempengaruhi matching dengan learner" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Area keahlian</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE.map((e) => (
                    <span key={e} className="chip">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industri</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((i) => (
                    <span key={i} className="chip">{i}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topik mentoring</label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Preferensi mentoring" />
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Gaya komunikasi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["structured", "exploratory", "supportive"] as const).map((s) => (
                    <button key={s} onClick={() => setStyle(s)} className={`h-10 rounded-lg text-sm font-medium border transition-colors ${style === s ? "border-primary bg-primary-soft text-foreground" : "border-border bg-background-secondary text-foreground-muted hover:text-foreground"}`}>
                      {s === "structured" ? "Terstruktur" : s === "exploratory" ? "Eksploratif" : "Suportif"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Format sesi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["video", "audio", "chat"] as const).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`h-10 rounded-lg text-sm font-medium border transition-colors ${format === f ? "border-primary bg-primary-soft text-foreground" : "border-border bg-background-secondary text-foreground-muted hover:text-foreground"}`}>
                      {f === "video" ? "🎥 Video Call" : f === "audio" ? "🎧 Audio" : "💬 Chat"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tersedia untuk mentoring</p>
                  <p className="text-xs text-foreground-muted mt-0.5">Tampilkan profil di halaman matching learner</p>
                </div>
                <button
                  onClick={() => setAvailable(!available)}
                  role="switch"
                  aria-checked={available}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${available ? "bg-primary" : "bg-background-tertiary border border-border"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${available ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-2xl mx-auto">RA</div>
              <h3 className="mt-3 font-display font-bold text-lg">{DEMO_MENTOR.name}</h3>
              <p className="text-sm text-foreground-muted">{DEMO_MENTOR.title}</p>
              <div className="mt-3 flex justify-center gap-2">
                <Badge tone="success">Terverifikasi</Badge>
                {available && <Badge tone="brand">Tersedia</Badge>}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm"><span className="text-foreground-muted">Rating</span><span className="font-semibold">{DEMO_MENTOR.rating} ★</span></div>
              <div className="flex justify-between text-sm"><span className="text-foreground-muted">Total sesi</span><span className="font-semibold">{DEMO_MENTOR.totalSessions}</span></div>
              <div className="flex justify-between text-sm"><span className="text-foreground-muted">Learner aktif</span><span className="font-semibold">{DEMO_MENTOR.activeLearners}</span></div>
              <div className="flex justify-between text-sm"><span className="text-foreground-muted">Jam bulan ini</span><span className="font-semibold">{DEMO_MENTOR.hoursThisMonth}h</span></div>
            </div>
          </Card>

          <Callout tone="brand" title="Profil publik">
            Profil Anda ditampilkan ke learner saat mereka mencari mentor yang cocok. Pastikan informasi selalu up-to-date.
          </Callout>
        </div>
      </div>
    </div>
  );
}
