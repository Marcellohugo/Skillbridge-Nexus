"use client";

import { useState } from "react";
import { Badge, Card, CardHeader, Callout, StatCard } from "@/components/ui";
import { DEMO_INSTITUTION } from "@/lib/demo-data";

const PROGRAM_SETTINGS = [
  { key: "Durasi program default", value: "16 minggu", desc: "Durasi standar untuk kohort baru" },
  { key: "Maks learner per kohort", value: "50", desc: "Batas kapasitas per kohort" },
  { key: "Rasio mentor:learner", value: "1:8", desc: "Target rasio mentoring yang ideal" },
  { key: "TRI target minimum", value: "70", desc: "Target TRI Career Ready untuk learner" },
  { key: "Auto-alert threshold", value: "TRI < 40", desc: "Trigger notifikasi untuk learner at-risk" },
  { key: "Sesi mentoring/minggu", value: "2", desc: "Rekomendasi minimum sesi per learner" },
];

const CONTACT_INFO = [
  { label: "Alamat", value: "Jl. Teknologi No. 42, Jakarta Selatan 12930" },
  { label: "Telepon", value: "+62 21 555 0042" },
  { label: "Website", value: "utn.ac.id" },
  { label: "Akreditasi", value: "A (BAN-PT)" },
];

export default function InstitutionProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Institution Settings</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Profil Institusi</h1>
          <p className="mt-1 text-foreground-secondary">Kelola informasi dan pengaturan institusi</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Badge tone="success">Tersimpan!</Badge>}
          <button onClick={handleSave} className="btn btn-primary">Simpan Perubahan</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total learner" value={DEMO_INSTITUTION.totalLearners} tone="brand" />
        <StatCard label="Kohort aktif" value={DEMO_INSTITUTION.activeCohorts} tone="accent" />
        <StatCard label="Mentor" value={DEMO_INSTITUTION.mentorsAssigned} tone="success" />
        <StatCard label="Career Ready" value={`${DEMO_INSTITUTION.careerReadyPct}%`} tone="info" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Informasi institusi" subtitle="Data profil organisasi" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Institusi</label>
                <input className="input" defaultValue={DEMO_INSTITUTION.name} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Admin</label>
                  <input className="input" defaultValue="admin@utn.ac.id" readOnly />
                  <p className="text-xs text-foreground-muted mt-1">Hubungi support untuk mengubah</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipe</label>
                  <input className="input" value="Universitas" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea className="input min-h-20" defaultValue="Universitas Teknologi Nusantara adalah institusi pendidikan tinggi yang berfokus pada teknologi dan inovasi digital. Program SkillBridge membantu mahasiswa mengembangkan keterampilan industri." />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Kontak & alamat" subtitle="Informasi kontak institusi" />
            <div className="space-y-3">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-sm text-foreground-muted">{c.label}</span>
                  <span className="text-sm font-semibold">{c.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Pengaturan program" subtitle="Konfigurasi standar untuk kohort dan mentoring" />
            <div className="space-y-4">
              {PROGRAM_SETTINGS.map((s) => (
                <div key={s.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{s.key}</p>
                    <p className="text-xs text-foreground-muted mt-0.5">{s.desc}</p>
                  </div>
                  <Badge tone="brand">{s.value}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-2xl mx-auto">UTN</div>
              <h3 className="mt-3 font-display font-bold text-lg">{DEMO_INSTITUTION.name}</h3>
              <p className="text-sm text-foreground-muted">Institution Partner</p>
              <Badge tone="success" className="mt-2">Verified</Badge>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ringkasan" subtitle="Statistik keanggotaan" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Learner aktif</span>
                <span className="font-semibold">{DEMO_INSTITUTION.totalLearners}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Mentor ditugaskan</span>
                <span className="font-semibold">{DEMO_INSTITUTION.mentorsAssigned}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Kohort berjalan</span>
                <span className="font-semibold">{DEMO_INSTITUTION.activeCohorts}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Rata-rata TRI</span>
                <span className="font-semibold">{DEMO_INSTITUTION.avgTRI}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-foreground-muted">Bergabung sejak</span>
                <span className="font-semibold">Sep 2025</span>
              </div>
            </div>
          </Card>

          <Callout tone="info" title="Paket institusi">
            Anda menggunakan paket <strong>Academic Pro</strong> yang mencakup unlimited kohort, analytics lanjutan, dan dedicated support. Hubungi account manager untuk upgrade.
          </Callout>

          <Card>
            <CardHeader title="Aksi cepat" />
            <div className="space-y-2">
              <button className="btn btn-secondary w-full">📤 Export Data Learner</button>
              <button className="btn btn-secondary w-full">📊 Download Laporan</button>
              <button className="btn btn-secondary w-full">➕ Buat Kohort Baru</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
