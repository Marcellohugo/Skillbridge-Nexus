"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/language-provider";
import { Badge, Button, Callout, Card, CardHeader, Input, Label, StatCard } from "@/components/ui";
import {
  listPortfolioProjectsAction,
  createPortfolioProjectAction,
  deletePortfolioProjectAction,
  listSkillsForPortfolioAction,
  type PortfolioProjectDTO,
} from "@/features/learner/portfolio.actions";

type SkillOption = { id: string; name: string; category: string };

export default function PortfolioPage() {
  const { format } = useLang();
  const [items, setItems] = React.useState<PortfolioProjectDTO[]>([]);
  const [skills, setSkills] = React.useState<SkillOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState({
    title: "",
    category: "Web Project",
    description: "",
    skillIds: [] as string[],
    link: "",
    completedAt: "",
  });

  React.useEffect(() => {
    (async () => {
      const [projRes, skillRes] = await Promise.all([
        listPortfolioProjectsAction(),
        listSkillsForPortfolioAction(),
      ]);
      if (projRes.ok) setItems(projRes.data);
      else setErr(projRes.error);
      if (skillRes.ok) setSkills(skillRes.data);
      setLoading(false);
    })();
  }, []);

  const stats = React.useMemo(() => {
    const verified = items.filter((p) => p.isValidated).length;
    const uniqueSkills = new Set(items.flatMap((p) => p.skills.map((s) => s.skillId)));
    const avgEvidence = items.length > 0
      ? items.reduce((a, p) => a + p.evidenceStrength, 0) / items.length
      : 0;
    return { total: items.length, verified, skills: uniqueSkills.size, avgEvidence };
  }, [items]);

  const toggleSkill = (id: string) => {
    setDraft((d) => ({
      ...d,
      skillIds: d.skillIds.includes(id) ? d.skillIds.filter((x) => x !== id) : [...d.skillIds, id],
    }));
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.description.trim()) return;
    setSaving(true);
    setErr(null);
    const res = await createPortfolioProjectAction({
      title: draft.title,
      description: draft.description,
      projectUrl: draft.link || undefined,
      skillIds: draft.skillIds,
      completedAt: draft.completedAt || undefined,
    });
    setSaving(false);
    if (res.ok) {
      setItems((prev) => [res.data, ...prev]);
      setCreating(false);
      setDraft({ title: "", category: "Web Project", description: "", skillIds: [], link: "", completedAt: "" });
    } else {
      setErr(res.error);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus proyek ini?")) return;
    const res = await deletePortfolioProjectAction(id);
    if (res.ok) setItems((prev) => prev.filter((p) => p.id !== id));
    else setErr(res.error);
  };

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-32" />
      </div>
    );
  }

  // Group skills by category for the toggle grid
  const skillsByCat = skills.reduce<Record<string, SkillOption[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Portfolio</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Portfolio Proyek</h1>
          <p className="mt-1 text-foreground-secondary">Bukti nyata kompetensi Anda — divalidasi mentor untuk memperkuat TRI.</p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Tambah Proyek</Button>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total proyek" value={`${stats.total}`} tone="brand" delta="koleksi" hint="Semua proyek Anda" />
        <StatCard label="Tervalidasi" value={`${stats.verified}/${stats.total || 0}`} tone="success" delta="mentor-verified" hint="Divalidasi kredibilitas" />
        <StatCard label="Skill terbukti" value={`${stats.skills}`} tone="accent" delta="unique" hint="Skill unik dari evidence" />
        <StatCard label="Avg evidence" value={`${stats.avgEvidence.toFixed(1)}/10`} tone="info" delta="strength" hint="Rata-rata kekuatan bukti" />
      </div>

      {creating && (
        <Card elevated>
          <CardHeader title="Proyek baru" subtitle="Deskripsikan proyek dan skill yang Anda gunakan" action={<button type="button" onClick={() => setCreating(false)} className="text-sm text-foreground-muted hover:text-foreground">Batal</button>} />
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" required>Judul proyek</Label>
              <Input id="title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="cth. Accessible E-Commerce Cart" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="link">Link <span className="text-foreground-muted font-normal">(opsional)</span></Label>
                <Input id="link" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label htmlFor="completedAt">Tanggal selesai <span className="text-foreground-muted font-normal">(opsional)</span></Label>
                <Input id="completedAt" type="date" value={draft.completedAt} onChange={(e) => setDraft({ ...draft, completedAt: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="description" required>Deskripsi</Label>
              <textarea
                id="description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                className="input"
                placeholder="Ceritakan masalah, solusi, dan dampaknya. Deskripsi > 80 karakter meningkatkan evidence strength."
              />
              <p className="text-xs text-foreground-muted mt-1">{draft.description.length} karakter</p>
            </div>
            <div>
              <Label>Skill yang dibuktikan</Label>
              <div className="space-y-3 mt-2">
                {Object.entries(skillsByCat).map(([cat, opts]) => (
                  <div key={cat}>
                    <p className="text-xs uppercase tracking-wider text-foreground-muted mb-1">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opts.map((s) => {
                        const on = draft.skillIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSkill(s.id)}
                            className={`px-2.5 h-7 rounded-lg text-xs font-medium border transition-colors ${on ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:text-foreground"}`}
                          >
                            {on ? "✓ " : "+ "}{s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Callout tone="info">
              Evidence strength dihitung dari deskripsi, link bukti, jumlah skill yang dihubungkan, dan validasi mentor. Proyek tervalidasi langsung menambah <strong>Portfolio Strength</strong> di TRI.
            </Callout>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCreating(false)}>Batal</Button>
              <Button onClick={save} disabled={saving || !draft.title.trim() || !draft.description.trim()} className="flex-1">
                {saving ? "Menyimpan…" : "Simpan proyek"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Card key={p.id} hover className="flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge tone={p.evidenceStrength >= 7 ? "success" : p.evidenceStrength >= 4 ? "brand" : "muted"}>
                Evidence {p.evidenceStrength}/10
              </Badge>
              {p.isValidated ? (
                <Badge tone="success">✓ Verified</Badge>
              ) : (
                <Badge tone="warning">Menunggu</Badge>
              )}
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-foreground-secondary flex-1 line-clamp-3">{p.description}</p>
            {p.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.skills.slice(0, 5).map((s) => <span key={s.skillId} className="chip text-xs">{s.name}</span>)}
                {p.skills.length > 5 && <span className="text-xs text-foreground-muted">+{p.skills.length - 5}</span>}
              </div>
            )}
            {p.validationNote && (
              <p className="mt-3 text-xs text-foreground-muted italic border-l-2 border-success pl-2">
                {p.validationNote}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-foreground-muted">{format.date(p.createdAt)}</span>
              <div className="flex gap-3">
                {p.projectUrl && (
                  <a href={p.projectUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">Lihat →</a>
                )}
                <button type="button" onClick={() => remove(p.id)} className="text-danger hover:underline">Hapus</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && !creating && (
        <Card>
          <p className="text-center text-sm text-foreground-muted py-8">
            Belum ada proyek. <button type="button" onClick={() => setCreating(true)} className="text-primary hover:underline">Tambahkan yang pertama →</button>
          </p>
        </Card>
      )}

      <Callout tone="brand" title="🎯 Cara portfolio memperkuat TRI">
        Evidence strength dari setiap proyek berkontribusi ke <strong>Portfolio Strength</strong> (salah satu dari 6 komponen TRI). Mentor dapat memvalidasi proyek Anda untuk boost tambahan.
      </Callout>

      <div className="flex gap-2">
        <Link href="/dashboard" className="btn btn-secondary">← Dashboard</Link>
        <Link href="/learning-path" className="btn btn-primary">Lanjut Belajar →</Link>
      </div>
    </div>
  );
}
