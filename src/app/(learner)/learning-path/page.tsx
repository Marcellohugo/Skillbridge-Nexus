"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Callout, Card, CardHeader, Progress, StatCard } from "@/components/ui";
import {
  getActiveLearningPathAction,
  generateLearningPathAction,
  toggleModuleCompleteAction,
  type LearningPathDTO,
} from "@/features/learner/learning-path.actions";

const CONTENT_LABEL: Record<string, string> = {
  VIDEO: "Video",
  ARTICLE: "Artikel",
  INTERACTIVE: "Interaktif",
  PROJECT: "Proyek",
  QUIZ: "Kuis",
  WORKSHOP: "Workshop",
  PODCAST: "Podcast",
};

type Filter = "all" | "open" | "completed" | "locked" | "rescue";

export default function LearningPathPage() {
  const [data, setData] = React.useState<LearningPathDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const res = await getActiveLearningPathAction();
    setLoading(false);
    if (res.ok) {
      setData(res.data);
      setErr(null);
      if (res.data && !activeId && res.data.items.length > 0) {
        setActiveId(res.data.items.find((i) => !i.isCompleted && !i.isLocked)?.id ?? res.data.items[0].id);
      }
    } else {
      setErr(res.error);
    }
  }, [activeId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const generate = async () => {
    setGenerating(true);
    setErr(null);
    const res = await generateLearningPathAction();
    setGenerating(false);
    if (res.ok) {
      setData(res.data);
      if (res.data.items.length > 0) setActiveId(res.data.items[0].id);
    } else {
      setErr(res.error);
    }
  };

  const toggle = async (itemId: string) => {
    const res = await toggleModuleCompleteAction(itemId);
    if (res.ok) await refresh();
    else setErr(res.error);
  };

  if (loading && !data) {
    return (
      <div className="container-app py-8">
        <div className="skeleton h-40" />
      </div>
    );
  }

  // Empty state - no path yet
  if (!data) {
    return (
      <div className="container-app py-8 lg:py-10 stack-xl stack">
        <header>
          <span className="eyebrow">Jalur belajar</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Jalur Pembelajaran Anda</h1>
        </header>
        <Card elevated className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <Badge tone="brand">Langkah berikutnya</Badge>
              <h2 className="mt-4 text-2xl font-display font-bold">Susun rencana belajar dari skill gap terbaru</h2>
              <p className="mt-3 text-sm text-foreground-secondary">
                Jalur belajar akan disusun dari hasil asesmen diagnostik. Modul diurutkan berdasarkan dampak terbesar ke TRI, lalu ditambah modul prasyarat jika ada fondasi yang belum kuat.
              </p>

              {err && <Callout tone="warning" className="mt-4">{err}</Callout>}

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={generate} disabled={generating}>
                  {generating ? "Menyusun jalur..." : "Susun jalur dari gap"}
                </Button>
                <Link href="/assessment" className="btn btn-secondary">Mulai asesmen</Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Asesmen", "Baca gap skill"],
                  ["2", "Prioritas", "Urutkan dampak"],
                  ["3", "Belajar", "Pantau progres"],
                ].map(([step, title, desc]) => (
                  <div key={title} className="rounded-lg border border-border bg-background-secondary/50 p-3">
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">{step}</div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background-secondary/50 p-5">
              <p className="text-xs font-semibold uppercase text-foreground-muted">Output yang akan dibuat</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Urutan modul", "Mulai dari gap paling berdampak"],
                  ["Estimasi minggu", "Disesuaikan jam belajar Anda"],
                  ["Modul prasyarat", "Muncul saat fondasi belum kuat"],
                  ["Progress TRI", "Terhubung ke readiness score"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const filtered = data.items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "completed") return i.isCompleted;
    if (filter === "open") return !i.isCompleted && !i.isLocked;
    if (filter === "locked") return i.isLocked;
    if (filter === "rescue") return i.isRescue;
    return true;
  });
  const active = data.items.find((i) => i.id === activeId) ?? data.items[0];

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Jalur belajar</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Jalur Pembelajaran Anda</h1>
          <p className="mt-1 text-foreground-secondary">
            {data.items.length} modul menuju {data.targetRoleName ?? "target Anda"} · estimasi {data.estimatedWeeks} minggu dengan {data.weeklyHours} jam/minggu
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={generate} disabled={generating}>
            {generating ? "Menyusun..." : "Susun ulang"}
          </Button>
          <Link href="/mentors" className="btn btn-primary">Cari mentor →</Link>
        </div>
      </header>

      {err && <Callout tone="warning">{err}</Callout>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Progress total" value={`${Math.round(data.completionPct)}%`} tone="brand" delta={`${data.stats.completed}/${data.stats.total} modul`} hint="Akumulasi selesai" />
        <StatCard label="Jam belajar" value={`${Math.round(data.stats.completedMinutes / 60)}h`} tone="accent" delta={`dari ${Math.round(data.stats.totalMinutes / 60)}h`} hint="Menit selesai" />
        <StatCard label="Modul prasyarat" value={`${data.stats.rescueCount}`} tone="warning" delta="fondasi" hint="Untuk akar masalah" />
        <StatCard label="Estimasi" value={`${data.estimatedWeeks}mg`} tone="success" delta={`${data.weeklyHours}h/minggu`} hint="Kapasitas belajar" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Roadmap modul"
            subtitle="Urut dari dampak tertinggi"
            action={
              <select aria-label="Filter modul" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="input h-9 text-sm py-0">
                <option value="all">Semua ({data.items.length})</option>
                <option value="open">Terbuka ({data.items.filter((i) => !i.isCompleted && !i.isLocked).length})</option>
                <option value="completed">Selesai ({data.stats.completed})</option>
                <option value="locked">Terkunci ({data.items.filter((i) => i.isLocked).length})</option>
                <option value="rescue">Prasyarat ({data.stats.rescueCount})</option>
              </select>
            }
          />
          <ol className="relative border-l-2 border-border ml-3 space-y-3">
            {filtered.map((item, idx) => {
              const tone =
                item.isCompleted ? "bg-success border-success text-white" :
                item.isLocked ? "bg-background-tertiary border-border text-foreground-muted" :
                item.isRescue ? "bg-warning border-warning text-white" :
                "bg-primary border-primary text-white";
              const isActive = item.id === active.id;
              return (
                <li key={item.id} className="ml-5">
                  <span className={`absolute -left-[11px] grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] font-bold ${tone}`}>
                    {item.isCompleted ? "✓" : item.isRescue ? "P" : idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => !item.isLocked && setActiveId(item.id)}
                    disabled={item.isLocked}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isActive ? "border-primary/50 bg-primary/5" :
                      item.isLocked ? "border-border bg-background-secondary/30 opacity-60 cursor-not-allowed" :
                      "border-border hover:border-border-strong bg-background-secondary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="shrink-0 rounded-md bg-background-tertiary px-2 py-1 text-[11px] font-semibold text-foreground-muted">
                          {CONTENT_LABEL[item.contentType] ?? "Modul"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-semibold text-sm">{item.title}</p>
                            {item.isRescue && <Badge tone="warning">Prasyarat</Badge>}
                            {item.isMilestone && <Badge tone="brand">Milestone</Badge>}
                            {item.isQuickWin && <Badge tone="success">Cepat selesai</Badge>}
                          </div>
                          <p className="text-xs text-foreground-muted mt-0.5">
                            {CONTENT_LABEL[item.contentType] ?? "Modul"} · {item.estimatedMinutes} menit · tingkat {item.difficulty}/5
                          </p>
                          {item.whyReason && !item.isCompleted && (
                            <p className="text-xs text-foreground-secondary mt-1.5 italic line-clamp-2">{item.whyReason}</p>
                          )}
                          {item.isLocked && item.lockReason && (
                            <p className="text-xs text-warning mt-1">{item.lockReason}</p>
                          )}
                        </div>
                      </div>
                      <Badge tone={item.isCompleted ? "success" : item.isLocked ? "warning" : "brand"}>
                        {item.isCompleted ? "Selesai" : item.isLocked ? "Terkunci" : "Terbuka"}
                      </Badge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card elevated>
            <Badge tone={active.isCompleted ? "success" : active.isLocked ? "warning" : active.isRescue ? "warning" : "brand"}>
              {active.isCompleted ? "Selesai" : active.isLocked ? "Terkunci" : active.isRescue ? "Prasyarat" : "Aktif"}
            </Badge>
            <h3 className="mt-3 text-xl font-display font-bold">{active.title}</h3>
            <p className="text-sm text-foreground-secondary mt-2">{active.description}</p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Mini label="Durasi" value={`${active.estimatedMinutes}m`} />
              <Mini label="Format" value={CONTENT_LABEL[active.contentType] ?? "Modul"} />
            </div>

            {active.skills.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wider text-foreground-muted mb-2">Skill yang dibangun</p>
                <div className="flex flex-wrap gap-1.5">
                  {active.skills.map((s) => (
                    <span key={s.skillId} className={`chip ${s.isPrimary ? "!bg-primary/20" : ""}`}>{s.name}</span>
                  ))}
                </div>
              </div>
            )}

            {active.whyReason && (
              <Callout tone="brand" title="Mengapa modul ini?">
                {active.whyReason}
              </Callout>
            )}

            <div className="mt-5 flex gap-2">
              {active.isLocked ? (
                <Button variant="secondary" className="flex-1" disabled>Prasyarat belum terpenuhi</Button>
              ) : active.isCompleted ? (
                <Button variant="secondary" className="flex-1" onClick={() => toggle(active.id)}>Tandai belum selesai</Button>
              ) : (
                <Button className="flex-1" onClick={() => toggle(active.id)}>Tandai selesai</Button>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">Integrasi</p>
            <div className="space-y-2">
              <Link href="/skill-gap" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-background-tertiary transition-colors">
                <span className="text-sm">Analisis skill gap</span>
                <span className="text-xs text-primary">→</span>
              </Link>
              <Link href="/portfolio" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-background-tertiary transition-colors">
                <span className="text-sm">Tambah proyek portfolio</span>
                <span className="text-xs text-primary">→</span>
              </Link>
              <Link href="/mentors" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-background-tertiary transition-colors">
                <span className="text-sm">Cari mentor untuk modul ini</span>
                <span className="text-xs text-primary">→</span>
              </Link>
              <Link href="/assessment" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-background-tertiary transition-colors">
                <span className="text-sm">Asesmen ulang setelah selesai</span>
                <span className="text-xs text-primary">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <Progress value={data.completionPct} tone="brand" />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary/50 px-3 py-2.5">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="text-sm font-semibold mt-0.5 capitalize">{value}</p>
    </div>
  );
}
