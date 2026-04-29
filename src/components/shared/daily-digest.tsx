"use client";

import * as React from "react";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getPeerPulseAction, type PeerPulseResult } from "@/features/learner/peer.actions";
import {
  getWeeklyPlanAction,
  type WeeklyPlanResult,
} from "@/features/learner/weekly-plan.actions";

type Reflection = { date: string; mood: number; focus: number; insight: string };
type StudyStat = { date: string; count: number; minutes: number };

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function readReflections(): Reflection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("nexus.reflection.v1");
    return raw ? (JSON.parse(raw) as Reflection[]) : [];
  } catch {
    return [];
  }
}

function readStudy(): Record<string, StudyStat> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("nexus.studyActivity.v1");
    return raw ? (JSON.parse(raw) as Record<string, StudyStat>) : {};
  } catch {
    return {};
  }
}

export function DailyDigest() {
  const [mounted, setMounted] = React.useState(false);
  const [plan, setPlan] = React.useState<WeeklyPlanResult | null>(null);
  const [peer, setPeer] = React.useState<PeerPulseResult | null>(null);

  React.useEffect(() => {
    setMounted(true);
    (async () => {
      const [p, pr] = await Promise.all([getWeeklyPlanAction(), getPeerPulseAction()]);
      if (p.ok) setPlan(p.data);
      if (pr.ok) setPeer(pr.data);
    })();
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader title="Brief hari ini" subtitle="Memuat ringkasan belajar..." />
        <div className="h-20 rounded-lg bg-background-secondary/40 animate-pulse" />
      </Card>
    );
  }

  const reflections = readReflections();
  const study = readStudy();
  const yKey = yesterdayKey();
  const tKey = todayKey();

  const yReflection = reflections.find((r) => r.date === yKey);
  const yStudy = study[yKey];

  const todayPlan = plan?.days.find((d) => d.date === tKey);
  const todayBlocks = todayPlan?.blocks ?? [];
  const todayMinutes = todayPlan?.totalMinutes ?? 0;

  const peerLead = peer ? peer.percentile >= 65 : false;
  const peerBehind = peer ? peer.percentile <= 35 : false;

  const moods = ["Sangat rendah", "Rendah", "Stabil", "Baik", "Sangat baik"];

  const signals: Array<{ label: string; text: string; tone: "success" | "brand" | "warning" | "info" }> = [];

  if (yReflection) {
    if (yReflection.focus >= 4) signals.push({ label: "Fokus", text: `Fokus kemarin ${yReflection.focus}/5 - pertahankan momentum.`, tone: "success" });
    else if (yReflection.focus <= 2) signals.push({ label: "Fokus", text: "Fokus kemarin rendah - mulai dengan blok mudah dulu.", tone: "warning" });
  }
  if (yStudy && yStudy.minutes > 0) {
    signals.push({ label: "Belajar", text: `Kemarin belajar ${yStudy.minutes} menit - ${yStudy.count} sesi.`, tone: "info" });
  }
  if (peer && peer.peerCount > 0) {
    if (peerLead) signals.push({ label: "Peer", text: `Top ${100 - peer.percentile}% peer (${peer.cohortLabel}) - momentum bagus.`, tone: "success" });
    else if (peerBehind) signals.push({ label: "Peer", text: "Median peer lebih aktif - kejar dengan 1 sesi singkat hari ini.", tone: "warning" });
    if (peer.risingStar) signals.push({ label: "Growth", text: "Kamu ditandai rising star minggu ini.", tone: "success" });
  }
  if (todayBlocks.length > 0) {
    signals.push({ label: "Rencana", text: `${todayBlocks.length} blok hari ini · ${todayMinutes} menit.`, tone: "brand" });
  } else if (plan) {
    signals.push({ label: "Rencana", text: "Tidak ada blok wajib hari ini - gunakan untuk eksplorasi atau refleksi.", tone: "info" });
  }

  const primaryAction =
    todayBlocks[0]
      ? { title: todayBlocks[0].title, minutes: todayBlocks[0].minutes, href: "/learning-path" }
      : peerBehind
        ? { title: "Lihat peer pulse", minutes: 5, href: "/dashboard" }
        : { title: "Mulai journaling refleksi", minutes: 3, href: "/dashboard" };

  return (
    <Card>
      <div>
        <CardHeader
          title={greeting()}
          subtitle="Ringkasan singkat sebelum mulai belajar"
          action={
            yReflection ? (
              <Badge tone="muted">
                Mood kemarin: {moods[yReflection.mood - 1]}
              </Badge>
            ) : null
          }
        />

        {signals.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            Belum cukup data untuk brief — isi jurnal refleksi & selesaikan 1 blok belajar hari ini.
          </p>
        ) : (
          <ul className="stack stack-sm mb-4">
            {signals.slice(0, 4).map((s, i) => (
              <li
                key={`signal-${i}`}
                className={`flex items-start gap-2 rounded-lg border p-2.5 text-sm ${
                  s.tone === "success"
                    ? "border-success/30 bg-success/5"
                    : s.tone === "warning"
                      ? "border-warning/30 bg-warning/5"
                      : s.tone === "brand"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background-secondary/30"
                }`}
              >
                <Badge tone={s.tone}>{s.label}</Badge>
                <span className="flex-1">{s.text}</span>
              </li>
            ))}
          </ul>
        )}

        <a
          href={primaryAction.href}
          className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors"
        >
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-primary font-bold">Mulai dengan</div>
            <div className="font-semibold truncate">{primaryAction.title}</div>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-sm">
            <span className="text-foreground-muted">~{primaryAction.minutes}m</span>
            <span className="text-primary">→</span>
          </div>
        </a>

        {yReflection?.insight && (
          <p className="mt-3 text-xs italic text-foreground-muted border-l-2 border-accent pl-3">
            &ldquo;{yReflection.insight.slice(0, 120)}{yReflection.insight.length > 120 ? "…" : ""}&rdquo; — kamu, kemarin
          </p>
        )}
      </div>
    </Card>
  );
}
