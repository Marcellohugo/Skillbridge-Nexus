"use client";

import * as React from "react";
import { Badge, Card, CardHeader, Input, StatCard, Callout } from "@/components/ui";
import { listSkillTaxonomyAction, type SkillTaxonomyRow } from "@/features/admin/platform.actions";

export default function AdminSkillsPage() {
  const [cats, setCats] = React.useState<{ id: string; name: string; skillCount: number }[]>([]);
  const [skills, setSkills] = React.useState<SkillTaxonomyRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");

  React.useEffect(() => {
    (async () => {
      const res = await listSkillTaxonomyAction();
      if (res.ok) {
        setCats(res.data.categories);
        setSkills(res.data.skills);
      } else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container-app py-8"><div className="skeleton h-32" /></div>;

  const filtered = skills.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat !== "all" && s.categoryId !== cat) return false;
    return true;
  });

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Skill Taxonomy</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Kelola Taxonomy</h1>
        <p className="mt-1 text-foreground-secondary">Semua skill, kategori, prerequisite, dan peta ke role/modul — real-time dari DB.</p>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Kategori" value={`${cats.length}`} tone="brand" />
        <StatCard label="Skill total" value={`${skills.length}`} tone="accent" />
        <StatCard label="Foundational" value={`${skills.filter((s) => s.isFoundational).length}`} tone="success" />
        <StatCard label="Tanpa module" value={`${skills.filter((s) => s.moduleCount === 0).length}`} tone="warning" delta="butuh konten" />
      </div>

      <Card>
        <CardHeader
          title="Daftar skill"
          subtitle={`${filtered.length}/${skills.length}`}
          action={
            <div className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari skill…" className="h-9 text-sm" />
              <select aria-label="Filter kategori" value={cat} onChange={(e) => setCat(e.target.value)} className="input h-9 text-sm py-0">
                <option value="all">Semua kategori</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-foreground-muted border-b border-border">
                <th className="text-left py-2">Skill</th>
                <th className="text-left py-2">Kategori</th>
                <th className="text-center py-2">Max</th>
                <th className="text-center py-2">Prereq</th>
                <th className="text-center py-2">Roles</th>
                <th className="text-center py-2">Modules</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      {s.isFoundational && <Badge tone="info">foundational</Badge>}
                    </div>
                  </td>
                  <td className="py-3 text-foreground-secondary">{s.categoryName}</td>
                  <td className="py-3 text-center tabular-nums">{s.maxLevel}</td>
                  <td className="py-3 text-center tabular-nums">{s.prereqCount}</td>
                  <td className="py-3 text-center tabular-nums">{s.roleCount}</td>
                  <td className="py-3 text-center">
                    {s.moduleCount === 0 ? (
                      <Badge tone="warning">0</Badge>
                    ) : (
                      <span className="tabular-nums">{s.moduleCount}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-sm text-foreground-muted">Tidak ada skill yang cocok.</p>}
        </div>
      </Card>
    </div>
  );
}
