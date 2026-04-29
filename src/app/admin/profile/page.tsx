"use client";

import { useState } from "react";
import { Badge, Card, CardHeader, Callout } from "@/components/ui";

const SYSTEM_SETTINGS = [
  { key: "Registrasi publik", value: "Aktif", desc: "Learner dan mentor dapat mendaftar sendiri" },
  { key: "Verifikasi email", value: "Nonaktif", desc: "Email langsung terverifikasi saat registrasi" },
  { key: "Maks sesi per mentor/minggu", value: "20", desc: "Batas sesi mentoring per minggu" },
  { key: "Auto-intervention threshold", value: "Risk Score ≥ 6", desc: "Trigger InterventionRecord untuk at-risk learner" },
  { key: "TRI recalculation", value: "Manual", desc: "TRI belum di-trigger otomatis oleh event" },
];

export default function AdminProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Admin Settings</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Pengaturan Admin</h1>
          <p className="mt-1 text-foreground-secondary">Konfigurasi platform dan profil administrator</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Badge tone="success">Tersimpan!</Badge>}
          <button onClick={handleSave} className="btn btn-primary">Simpan Perubahan</button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Profil administrator" subtitle="Informasi akun admin" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama</label>
                <input className="input" defaultValue="Admin SkillBridge" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input className="input" defaultValue="admin@skillbridge.id" readOnly />
                <p className="text-xs text-foreground-muted mt-1">Email admin tidak dapat diubah</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input className="input" value="ADMIN" readOnly />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Pengaturan platform" subtitle="Konfigurasi sistem global" />
            <div className="space-y-4">
              {SYSTEM_SETTINGS.map((s) => (
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

          <Card>
            <CardHeader title="Database & system" subtitle="Status teknis" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Database</span>
                <span className="font-semibold">PostgreSQL 16</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">ORM</span>
                <span className="font-semibold">Prisma 6.19.3</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Framework</span>
                <span className="font-semibold">Next.js 16.2.3</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border">
                <span className="text-foreground-muted">Runtime</span>
                <span className="font-semibold">Node.js 22</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-foreground-muted">Deployment</span>
                <span className="font-semibold">Docker Standalone</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-[#1E40AF] grid place-items-center text-white font-bold text-2xl mx-auto">AS</div>
              <h3 className="mt-3 font-display font-bold text-lg">Admin SkillBridge</h3>
              <p className="text-sm text-foreground-muted">Platform Administrator</p>
              <Badge tone="success" className="mt-2">Super Admin</Badge>
            </div>
          </Card>

          <Callout tone="info" title="Hak akses admin">
            Akun admin memiliki akses penuh ke seluruh platform termasuk manajemen pengguna, skill, dan analitik. Akun ini hanya bisa dibuat via database seed.
          </Callout>

          <Card>
            <CardHeader title="Aksi cepat" />
            <div className="space-y-2">
              <button className="btn btn-secondary w-full">🔄 Refresh Cache</button>
              <button className="btn btn-secondary w-full">📊 Export Analytics</button>
              <button className="btn btn-secondary w-full">🌱 Re-seed Demo Data</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
