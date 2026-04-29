"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";

type Entry = {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  insight: string;
};

const STORAGE_KEY = "nexus.reflection.v1";
const MOOD_EMOJI = ["😵", "😔", "😐", "🙂", "🤩"];
const FOCUS_LABEL = ["kacau", "lemah", "oke", "bagus", "deep"];

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function ReflectionJournal() {
  const [mounted, setMounted] = React.useState(false);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [mood, setMood] = React.useState<1 | 2 | 3 | 4 | 5>(3);
  const [focus, setFocus] = React.useState<1 | 2 | 3 | 4 | 5>(3);
  const [insight, setInsight] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    const loaded = loadEntries();
    setEntries(loaded);
    const today = loaded.find((e) => e.date === todayKey());
    if (today) {
      setMood(today.mood);
      setFocus(today.focus);
      setInsight(today.insight);
    }
  }, []);

  function save() {
    const today = todayKey();
    const next = entries.filter((e) => e.date !== today);
    next.unshift({ date: today, mood, focus, insight: insight.trim() });
    const trimmed = next.slice(0, 30);
    setEntries(trimmed);
    saveEntries(trimmed);
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader title="Reflection journal" subtitle="Memuat…" />
        <div className="h-40 animate-pulse bg-background-secondary rounded-xl" />
      </Card>
    );
  }

  const recent = entries.slice(0, 14).reverse();
  const avgMood = recent.length > 0 ? recent.reduce((s, e) => s + e.mood, 0) / recent.length : 0;
  const avgFocus = recent.length > 0 ? recent.reduce((s, e) => s + e.focus, 0) / recent.length : 0;
  const todaySaved = entries.some((e) => e.date === todayKey());

  const moodTrend = recent.map((e, i) => ({ x: i, y: e.mood }));
  const focusTrend = recent.map((e, i) => ({ x: i, y: e.focus }));
  const W = 320;
  const H = 60;
  const stepX = recent.length > 1 ? W / (recent.length - 1) : W;
  const yOf = (v: number) => H - ((v - 1) / 4) * H;
  const moodPath = moodTrend.map((p) => `${p.x * stepX},${yOf(p.y)}`).join(" ");
  const focusPath = focusTrend.map((p) => `${p.x * stepX},${yOf(p.y)}`).join(" ");

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <span aria-hidden>📝</span> Reflection journal
            </span>
          }
          subtitle={todaySaved ? "Sudah tersimpan hari ini — ubah kapan saja" : "Catat 30 detik sebelum tidur"}
          action={
            recent.length > 2 && (
              <Badge tone={avgMood >= 4 ? "success" : avgMood >= 3 ? "brand" : "warning"}>
                Mood avg {avgMood.toFixed(1)}/5
              </Badge>
            )
          }
        />

        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-wider text-foreground-muted mb-1.5">
            Mood hari ini
          </label>
          <div className="flex gap-2">
            {MOOD_EMOJI.map((emoji, idx) => {
              const v = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMood(v)}
                  className={`h-11 flex-1 rounded-lg border text-xl transition-all ${
                    mood === v
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background-secondary/40 hover:border-primary/50"
                  }`}
                  aria-label={`Mood ${v}: ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-wider text-foreground-muted mb-1.5">
            Kualitas fokus belajar · {FOCUS_LABEL[focus - 1]}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={focus}
            onChange={(e) => setFocus(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            className="w-full"
            aria-label="Focus quality slider"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-wider text-foreground-muted mb-1.5">
            Satu insight (opsional)
          </label>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Apa yang kamu pelajari hari ini?"
            className="input w-full resize-none text-sm"
          />
          <p className="text-[10px] text-foreground-muted mt-1 text-right">{insight.length}/200</p>
        </div>

        <Button onClick={save} size="sm" className="w-full">
          {todaySaved ? "💾 Update hari ini" : "💾 Simpan refleksi"}
        </Button>

        {recent.length >= 2 && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
                Trend {recent.length} hari terakhir
              </p>
              <p className="text-[11px] text-foreground-muted">
                Focus avg <span className="text-foreground font-semibold">{avgFocus.toFixed(1)}</span>
              </p>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" role="img" aria-label="Trend mood dan fokus">
              <defs>
                <linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline points={moodPath} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              <polyline points={focusPath} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div className="flex items-center gap-4 text-[10px] text-foreground-muted mt-1">
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-primary" /> Mood
              </span>
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-success border-dashed" style={{ borderTop: "1px dashed #10B981" }} /> Fokus
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
