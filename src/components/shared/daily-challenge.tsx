"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { ASSESSMENTS, type Question } from "@/lib/assessment-bank";

type Entry = {
  date: string;
  questionId: string;
  correct: boolean | null;
};
type ChallengeState = {
  streak: number;
  best: number;
  totalSolved: number;
  lastSolvedDate: string | null;
  history: Entry[];
};

const STORAGE_KEY = "nexus.dailyChallenge.v1";
const ALL_QUESTIONS: Question[] = ASSESSMENTS.flatMap((a) => a.questions);

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}
function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function pickQuestionForDay(dateKey: string): Question {
  const idx = hashString(dateKey) % ALL_QUESTIONS.length;
  return ALL_QUESTIONS[idx];
}
function loadState(): ChallengeState {
  if (typeof window === "undefined") return { streak: 0, best: 0, totalSolved: 0, lastSolvedDate: null, history: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 0, best: 0, totalSolved: 0, lastSolvedDate: null, history: [] };
    return JSON.parse(raw) as ChallengeState;
  } catch {
    return { streak: 0, best: 0, totalSolved: 0, lastSolvedDate: null, history: [] };
  }
}
function saveState(s: ChallengeState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

export function DailyChallenge() {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<ChallengeState>({ streak: 0, best: 0, totalSolved: 0, lastSolvedDate: null, history: [] });
  const [selected, setSelected] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const today = todayKey();
  const question = React.useMemo(() => pickQuestionForDay(today), [today]);

  React.useEffect(() => {
    setMounted(true);
    const s = loadState();
    setState(s);
    const todayEntry = s.history.find((h) => h.date === today);
    if (todayEntry) {
      setRevealed(true);
      setSelected(null);
    }
  }, [today]);

  const todayEntry = state.history.find((h) => h.date === today);
  const alreadyDone = !!todayEntry;

  const onPick = (optId: string) => {
    if (revealed) return;
    setSelected(optId);
  };

  const onSubmit = () => {
    if (!selected || revealed) return;
    const correct = !!question.options.find((o) => o.id === selected)?.correct;

    const yesterday = yesterdayKey();
    const newEntry: Entry = { date: today, questionId: question.id, correct };
    const newStreak =
      state.lastSolvedDate === yesterday || state.lastSolvedDate === today
        ? state.streak + (state.lastSolvedDate === today ? 0 : 1)
        : 1;
    const next: ChallengeState = {
      streak: newStreak,
      best: Math.max(state.best, newStreak),
      totalSolved: state.totalSolved + 1,
      lastSolvedDate: today,
      history: [newEntry, ...state.history].slice(0, 30),
    };
    setState(next);
    saveState(next);
    setRevealed(true);
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader title="Tantangan harian" subtitle="Memuat…" />
        <div className="h-24 animate-pulse rounded-lg bg-background-secondary" />
      </Card>
    );
  }

  const correct = question.options.find((o) => o.correct);
  const isCorrect = todayEntry?.correct ?? (selected ? !!question.options.find((o) => o.id === selected)?.correct : null);
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = todayKey(d);
    return { key: k, entry: state.history.find((h) => h.date === k) };
  });

  return (
    <Card elevated className="relative overflow-hidden">
      <div className="relative">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Tantangan harian
            </span>
          }
          subtitle={`${question.skill} · ${question.category}`}
          action={
            <div className="flex items-center gap-2">
              <Badge tone="warning">🔥 {state.streak}-day streak</Badge>
              {state.best > 0 && <Badge tone="muted">Rekor {state.best}</Badge>}
            </div>
          }
        />

        <p className="font-display font-semibold text-base mb-4">{question.text}</p>

        <div role="radiogroup" aria-label="Pilih jawaban" className="space-y-2">
          {question.options.map((opt, i) => {
            const isSelected = selected === opt.id;
            const isCorrectOpt = revealed && opt.correct;
            const isWrongPick = revealed && isSelected && !opt.correct;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onPick(opt.id)}
                disabled={revealed}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  isCorrectOpt
                    ? "border-success bg-success-soft"
                    : isWrongPick
                      ? "border-danger bg-danger-soft"
                      : isSelected
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-border-strong"
                } ${revealed ? "cursor-default" : ""}`}
              >
                <span
                  className={`mt-0.5 h-6 w-6 grid place-items-center rounded-lg text-xs font-bold flex-shrink-0 ${
                    isCorrectOpt ? "bg-success text-white" : isWrongPick ? "bg-danger text-white" : "bg-background-tertiary text-foreground-muted"
                  }`}
                >
                  {isCorrectOpt ? "✓" : isWrongPick ? "✕" : i + 1}
                </span>
                <span className="text-sm">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {!revealed && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-foreground-muted">Satu pertanyaan · Reset setiap hari · Jaga streak</p>
            <Button onClick={onSubmit} disabled={!selected}>
              Kunci jawaban
            </Button>
          </div>
        )}

        {revealed && (
          <div className="mt-4 space-y-3">
            <div className={`rounded-lg p-3 border text-sm ${isCorrect ? "bg-success-soft border-success/40" : "bg-warning-soft border-warning/40"}`}>
              <p className="font-semibold mb-1">
                {isCorrect ? "Tepat." : "Jawaban yang benar:"} {!isCorrect && <span className="font-normal">{correct?.text}</span>}
              </p>
              <p className="text-foreground-secondary">{question.explanation}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted mb-2">7 hari terakhir</p>
              <div className="flex gap-1.5">
                {last7.map((d) => (
                  <div
                    key={d.key}
                    className={`flex-1 h-8 rounded-md grid place-items-center text-xs font-bold border ${
                      d.entry?.correct
                        ? "bg-success text-white border-success"
                        : d.entry
                          ? "bg-warning/20 text-warning border-warning/40"
                          : d.key === today
                            ? "bg-primary/10 text-primary border-primary/40"
                            : "bg-background-secondary text-foreground-muted border-border"
                    }`}
                    title={d.key}
                  >
                    {d.entry?.correct ? "✓" : d.entry ? "·" : ""}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-foreground-muted">
              Sudah {state.totalSolved} tantangan diselesaikan. Kembali besok untuk tantangan baru!
            </p>
          </div>
        )}

        {alreadyDone && <span className="sr-only">Tantangan hari ini sudah diselesaikan.</span>}
      </div>
    </Card>
  );
}
