"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import {
  getCapstoneChallengesAction,
  type CapstoneChallenge,
  type CapstoneResult,
} from "@/features/learner/capstone.actions";

const DIFFICULTY_CONFIG: Record<CapstoneChallenge["difficulty"], { label: string; tone: "info" | "brand" | "accent"; emoji: string }> = {
  beginner: { label: "Beginner", tone: "info", emoji: "🌱" },
  intermediate: { label: "Intermediate", tone: "brand", emoji: "🌿" },
  advanced: { label: "Advanced", tone: "accent", emoji: "🌳" },
};

export function CapstoneGenerator() {
  const [data, setData] = React.useState<CapstoneResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await getCapstoneChallengesAction();
      if (res.ok) {
        setData(res.data);
        setActiveId(res.data.challenges[0]?.id ?? null);
      } else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="🎓 Capstone Project Generator" subtitle="Menyusun proyek yang paling cocok..." />
        <div className="h-48 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data || data.challenges.length === 0) {
    return (
      <Card>
        <CardHeader title="🎓 Capstone Project Generator" />
        <p className="text-sm text-foreground-secondary">
          {err ?? "Belum cukup data untuk generate capstone. Isi target role dan selesaikan asesmen dulu."}
        </p>
      </Card>
    );
  }

  const active = data.challenges.find((c) => c.id === activeId) ?? data.challenges[0];
  const cfg = DIFFICULTY_CONFIG[active.difficulty];

  function copyBrief() {
    if (!active) return;
    const lines = [
      `🎓 Capstone: ${active.title}`,
      `${active.tagline}`,
      `Difficulty: ${active.difficulty} · ${active.estimatedWeeks} minggu · Target: ${active.targetRole}`,
      "",
      "📋 Problem Statement:",
      active.problemStatement,
      "",
      "🎯 Objectives:",
      ...active.objectives.map((o) => `  - ${o}`),
      "",
      "🛠️ Tech Stack: " + active.techStack.join(", "),
      "",
      "📅 Milestones:",
      ...active.milestones.map((m) => `  Week ${m.week} — ${m.title}: ${m.deliverable}`),
      "",
      "✅ Success Criteria:",
      ...active.successCriteria.map((s) => `  - ${s}`),
      "",
      "🚀 Stretch Goals:",
      ...active.stretchGoals.map((s) => `  - ${s}`),
      "",
      `Skills exercised: ${active.skillsExercised.join(", ")}`,
      active.gapsClosed.length > 0 ? `Gaps closed: ${active.gapsClosed.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader
        title="🎓 Capstone Project Generator"
        subtitle={`Target: ${data.targetRole ?? "—"} · ${data.gapsCovered} gap bisa ditutup via proyek ini`}
        action={<Badge tone={cfg.tone}>{cfg.emoji} {cfg.label}</Badge>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {data.challenges.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeId === c.id
                ? "bg-primary text-white"
                : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-4">
        <h3 className="font-display font-bold text-xl mb-1">{active.title}</h3>
        <p className="text-sm text-foreground-secondary italic mb-3">{active.tagline}</p>
        <p className="text-sm">{active.problemStatement}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
            🎯 Objectives
          </div>
          <ul className="stack stack-xs">
            {active.objectives.map((o, i) => (
              <li key={`objective-${i}`} className="text-sm flex items-start gap-2">
                <span className="text-success shrink-0">✓</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
            ✅ Success Criteria
          </div>
          <ul className="stack stack-xs">
            {active.successCriteria.map((s, i) => (
              <li key={`deliverable-${i}`} className="text-sm flex items-start gap-2">
                <span className="text-primary shrink-0">◆</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
          🛠️ Tech Stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {active.techStack.map((t) => (
            <Badge key={t} tone="info">{t}</Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
          📅 Milestones ({active.estimatedWeeks} minggu)
        </div>
        <ol className="relative border-l-2 border-primary/40 ml-3 stack stack-sm">
          {active.milestones.map((m, i) => (
            <li key={`milestone-${m.week}-${i}`} className="ml-4 pl-2">
              <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold">
                {m.week}
              </span>
              <div className="text-sm font-semibold">{m.title}</div>
              <div className="text-xs text-foreground-secondary">{m.deliverable}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
            🚀 Stretch Goals
          </div>
          <ul className="stack stack-xs">
            {active.stretchGoals.map((s, i) => (
              <li key={`rubric-${i}`} className="text-xs flex items-start gap-2">
                <span className="text-accent shrink-0">★</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
            💪 Skill yang dilatih
          </div>
          <div className="flex flex-wrap gap-1.5">
            {active.skillsExercised.map((s) => (
              <Badge key={s} tone="brand">{s}</Badge>
            ))}
          </div>
          {active.gapsClosed.length > 0 && (
            <>
              <div className="mt-3 text-xs font-bold uppercase tracking-wider text-success mb-1.5">
                🎯 Gap yang ditutup
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.gapsClosed.map((g) => (
                  <Badge key={g} tone="success">{g}</Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button size="sm" onClick={copyBrief}>
          {copied ? "✓ Tersalin" : "📋 Copy brief"}
        </Button>
        <span className="text-xs text-foreground-muted">
          Template berbasis target role + TRI — adaptif per learner
        </span>
      </div>
    </Card>
  );
}
