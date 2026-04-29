"use client";

import * as React from "react";
import { useLang } from "@/components/language-provider";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getSessionPrepAction, type SessionPrepResult } from "@/features/learner/session-prep.actions";

function formatWhen(iso: string, format: ReturnType<typeof useLang>["format"]) {
  const d = new Date(iso);
  const day = format.date(d, { weekday: "long", day: "numeric", month: "short" });
  const time = format.date(d, { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

function formatCountdown(hours: number, format: ReturnType<typeof useLang>["format"]) {
  if (hours < 1) return format.relativeTime(Math.max(0, Math.round(hours * 60)), "minute");
  if (hours < 24) return format.relativeTime(Math.round(hours), "hour");
  return format.relativeTime(Math.round(hours / 24), "day");
}

export function SessionPrep() {
  const { format } = useLang();
  const [data, setData] = React.useState<SessionPrepResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await getSessionPrepAction();
      if (res.ok) setData(res.data);
      else setErr(res.error);
      setLoading(false);
    })();
  }, []);

  function copyBrief() {
    if (!data) return;
    const lines = [
      `🎯 Mentor Session Prep — ${data.mentorName ?? "Mentor"}`,
      data.scheduledAt ? `📅 ${formatWhen(data.scheduledAt, format)}` : "",
      data.topic ? `💬 Topik: ${data.topic}` : "",
      "",
      "Priority Gaps:",
      ...data.priorityGaps.map((g) => `  - ${g.skill}: ${g.current}% → ${g.target}%`),
      "",
      "Open Action Items:",
      ...data.openActionItems.map((a) => `  - ${a}`),
      "",
      "Pertanyaan yang mau diangkat:",
      ...data.suggestedQuestions.map((q, i) => `  ${i + 1}. ${q}`),
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="🎯 Mentor Session Prep" subtitle="Menyusun brief..." />
        <div className="h-32 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <CardHeader title="🎯 Mentor Session Prep" />
        <p className="text-sm text-danger">{err ?? "Data tidak tersedia."}</p>
      </Card>
    );
  }

  if (!data.hasUpcoming) {
    return (
      <Card>
        <CardHeader
          title="🎯 Mentor Session Prep"
          subtitle="Tidak ada sesi terjadwal"
          action={<Badge tone="muted">{data.pastSessionCount} sesi selesai</Badge>}
        />
        <p className="text-sm text-foreground-secondary mb-3">
          Book sesi untuk mendapatkan brief otomatis: gap prioritas, open action items, dan pertanyaan yang siap ditanyakan.
        </p>
        <a href="/mentors" className="inline-block text-sm font-semibold text-primary hover:underline">
          → Cari mentor
        </a>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title="🎯 Mentor Session Prep"
          subtitle={data.scheduledAt ? formatWhen(data.scheduledAt, format) : undefined}
          action={
            <Badge tone={data.hoursUntil < 24 ? "brand" : "muted"}>
              {formatCountdown(data.hoursUntil, format)}
            </Badge>
          }
        />

        <div className="flex items-center gap-3 mb-4 rounded-lg border border-border bg-background-secondary/30 p-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            {data.mentorInitials ?? "M"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{data.mentorName}</div>
            <div className="text-xs text-foreground-muted">
              {data.durationMinutes}m session
              {data.topic ? ` · ${data.topic}` : ""}
            </div>
          </div>
          <button
            onClick={copyBrief}
            className="text-xs px-2.5 py-1 rounded bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {copied ? "✓ Tersalin" : "📋 Copy brief"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
              Priority gaps ({data.priorityGaps.length})
            </div>
            {data.priorityGaps.length === 0 ? (
              <p className="text-xs text-foreground-muted italic">Semua skill on track 🎉</p>
            ) : (
              <ul className="stack stack-xs">
                {data.priorityGaps.map((g) => (
                  <li key={g.skill} className="text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{g.skill}</span>
                    <span className="font-mono tabular-nums text-foreground-muted shrink-0">
                      {g.current}% → {g.target}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
              Recent wins
            </div>
            {data.recentWins.length === 0 ? (
              <p className="text-xs text-foreground-muted italic">Belum ada win untuk dilaporkan.</p>
            ) : (
              <ul className="stack stack-xs">
                {data.recentWins.map((w, i) => (
                  <li key={`agenda-${i}`} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate">{w.title}</span>
                    <Badge tone="success">{w.metric}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {data.openActionItems.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
              Open action items dari sesi sebelumnya
            </div>
            <ul className="stack stack-xs">
              {data.openActionItems.map((a, i) => (
                <li key={`prep-${i}`} className="text-sm flex items-start gap-2">
                  <span className="text-warning shrink-0">◈</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5">
            Pertanyaan yang bisa kamu angkat
          </div>
          <ol className="stack stack-xs list-decimal pl-4 text-sm">
            {data.suggestedQuestions.map((q, i) => (
              <li key={`question-${i}`}>{q}</li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}
