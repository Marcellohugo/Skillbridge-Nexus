"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";

type Phase = "focus" | "break";
type SessionLog = { date: string; focusMinutes: number; sessions: number };

const FOCUS_MIN = 25;
const BREAK_MIN = 5;
const STORAGE_KEY = "nexus.focusTimer.v1";

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function loadLog(): SessionLog {
  if (typeof window === "undefined") return { date: todayKey(), focusMinutes: 0, sessions: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), focusMinutes: 0, sessions: 0 };
    const parsed = JSON.parse(raw) as SessionLog;
    if (parsed.date !== todayKey()) return { date: todayKey(), focusMinutes: 0, sessions: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), focusMinutes: 0, sessions: 0 };
  }
}
function saveLog(s: SessionLog) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function format(mm: number, ss: number) {
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function FocusTimer() {
  const [mounted, setMounted] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("focus");
  const [running, setRunning] = React.useState(false);
  const [remaining, setRemaining] = React.useState(FOCUS_MIN * 60);
  const [log, setLog] = React.useState<SessionLog>({ date: todayKey(), focusMinutes: 0, sessions: 0 });

  React.useEffect(() => {
    setMounted(true);
    setLog(loadLog());
  }, []);

  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          const finishedPhase = phase;
          const nextPhase: Phase = finishedPhase === "focus" ? "break" : "focus";
          const nextSeconds = (nextPhase === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
          if (finishedPhase === "focus") {
            const next = { date: todayKey(), focusMinutes: log.focusMinutes + FOCUS_MIN, sessions: log.sessions + 1 };
            setLog(next);
            saveLog(next);
            try {
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("Sesi fokus selesai!", { body: "Saatnya istirahat 5 menit." });
              }
            } catch {}
          }
          setPhase(nextPhase);
          return nextSeconds;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase, log]);

  const total = (phase === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
  const progress = 1 - remaining / total;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  const start = () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining((phase === "focus" ? FOCUS_MIN : BREAK_MIN) * 60);
  };
  const skip = () => {
    const nextPhase: Phase = phase === "focus" ? "break" : "focus";
    setPhase(nextPhase);
    setRemaining((nextPhase === "focus" ? FOCUS_MIN : BREAK_MIN) * 60);
    setRunning(false);
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader title="Focus timer" subtitle="Memuat…" />
        <div className="h-40 animate-pulse rounded-lg bg-background-secondary" />
      </Card>
    );
  }

  const size = 160;
  const radius = size / 2 - 10;
  const circ = 2 * Math.PI * radius;

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Focus timer
            </span>
          }
          subtitle={phase === "focus" ? "Deep work · 25 menit" : "Break · 5 menit"}
          action={<Badge tone={phase === "focus" ? "brand" : "success"}>{phase === "focus" ? "Focus" : "Break"}</Badge>}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={8} className="text-foreground-muted" />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={phase === "focus" ? "var(--accent)" : "var(--success)"}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-display font-black text-3xl tabular-nums">{format(mm, ss)}</p>
                <p className="text-[10px] uppercase tracking-wider text-foreground-muted">{phase === "focus" ? "tersisa" : "istirahat"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!running ? (
              <Button onClick={start}>{remaining === total ? "Mulai" : "Lanjut"}</Button>
            ) : (
              <Button variant="secondary" onClick={pause}>Jeda</Button>
            )}
            <Button variant="ghost" onClick={reset}>Reset</Button>
            <Button variant="ghost" onClick={skip}>Skip →</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-background-secondary/50 border border-border p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Sesi hari ini</p>
            <p className="font-display font-bold text-xl mt-0.5">{log.sessions}</p>
          </div>
          <div className="rounded-lg bg-background-secondary/50 border border-border p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Menit fokus</p>
            <p className="font-display font-bold text-xl mt-0.5">{log.focusMinutes}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
