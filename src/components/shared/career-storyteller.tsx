"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import {
  getCareerStoryAction,
  type StorytellerResult,
  type StoryTone,
  type StoryVariant,
} from "@/features/learner/storyteller.actions";

const TABS: Array<{ tone: StoryTone; emoji: string }> = [
  { tone: "professional", emoji: "💼" },
  { tone: "casual", emoji: "✨" },
  { tone: "aspirational", emoji: "🌟" },
];

const FORMATS: Array<{ id: "body" | "elevator" | "linkedinAbout"; label: string; hint: string }> = [
  { id: "body", label: "Personal Story", hint: "3 paragraf untuk bio / about" },
  { id: "elevator", label: "Elevator Pitch", hint: "30-detik intro" },
  { id: "linkedinAbout", label: "LinkedIn About", hint: "dengan CTA + hashtags" },
];

export function CareerStoryteller() {
  const [data, setData] = React.useState<StorytellerResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [activeTone, setActiveTone] = React.useState<StoryTone>("professional");
  const [activeFormat, setActiveFormat] = React.useState<"body" | "elevator" | "linkedinAbout">("body");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await getCareerStoryAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="🎬 Career Storyteller" subtitle="Merangkum perjalananmu..." />
        <div className="h-48 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="🎬 Career Storyteller" />
        <p className="text-sm text-danger">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  const variant = data.variants.find((v) => v.tone === activeTone) as StoryVariant;
  const content = variant[activeFormat];
  const textWithHashtags =
    activeFormat === "linkedinAbout"
      ? `${content}\n\n${variant.hashtags.join(" ")}`
      : content;

  function copy() {
    navigator.clipboard?.writeText(textWithHashtags).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const d = data.dataPoints;

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title="🎬 Career Storyteller"
          subtitle="Narasi otomatis dari data karier kamu — siap untuk bio, LinkedIn, atau pitch"
          action={
            <Badge tone="brand">TRI {d.triScore.toFixed(0)}</Badge>
          }
        />

        <div className="flex flex-wrap gap-2 mb-3">
          {TABS.map((t) => (
            <button
              key={t.tone}
              onClick={() => setActiveTone(t.tone)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTone === t.tone
                  ? "bg-primary text-white"
                  : "bg-background-secondary text-foreground-muted hover:bg-background-tertiary"
              }`}
            >
              {t.emoji} {data.variants.find((v) => v.tone === t.tone)?.toneLabel}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFormat(f.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeFormat === f.id
                  ? "bg-accent text-white"
                  : "bg-background-secondary/60 text-foreground-muted hover:bg-background-tertiary"
              }`}
              title={f.hint}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-background-secondary/30 p-4 mb-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground-muted">
            {variant.headline}
          </div>
          <p className="text-sm whitespace-pre-line leading-relaxed">{content}</p>
          {activeFormat === "linkedinAbout" && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {variant.hashtags.map((h) => (
                <span key={h} className="text-xs font-semibold text-primary">{h}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button size="sm" onClick={copy}>
            {copied ? "✓ Tersalin" : "📋 Copy"}
          </Button>
          <span className="text-xs text-foreground-muted">
            {textWithHashtags.length} karakter
          </span>
        </div>

        <details className="text-xs text-foreground-muted">
          <summary className="cursor-pointer hover:text-foreground">
            Data points yang dipakai ({d.topSkills.length} skill · {d.validatedProjects} proyek validated · {d.mentorSessions} sesi · {d.badgeCount} badge)
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 pl-4">
            <li>Nama: {d.fullName}</li>
            <li>Target: {d.targetRole ?? "—"}</li>
            <li>Pendidikan: {d.education ?? "—"}</li>
            <li>Aktif: {d.weeksActive} minggu</li>
            <li>Milestone: {d.triMilestone.replace("_", " ")}</li>
            <li>Top skills: {d.topSkills.slice(0, 3).join(", ") || "—"}</li>
          </ul>
        </details>
      </div>
    </Card>
  );
}
