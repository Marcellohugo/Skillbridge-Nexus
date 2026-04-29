"use client";

import * as React from "react";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { pickInterviewSet, type InterviewQuestion } from "@/lib/interview-bank";

type AnswerState = { rating: number; notes: string; revealed: boolean };

const CATEGORY_LABELS: Record<string, { label: string; tone: "brand" | "info" | "accent" | "success" }> = {
  behavioral: { label: "Behavioral", tone: "brand" },
  technical: { label: "Technical", tone: "info" },
  situational: { label: "Situational", tone: "accent" },
  culture: { label: "Culture", tone: "success" },
};

export function MockInterviewClient({
  targetRoleSlug,
  targetRoleName,
}: {
  targetRoleSlug: string | null;
  targetRoleName: string | null;
}) {
  const [questions, setQuestions] = React.useState<InterviewQuestion[]>(() => pickInterviewSet(targetRoleSlug));
  const [answers, setAnswers] = React.useState<Record<string, AnswerState>>({});
  const [current, setCurrent] = React.useState(0);
  const [done, setDone] = React.useState(false);

  function regenerate() {
    setQuestions(pickInterviewSet(targetRoleSlug));
    setAnswers({});
    setCurrent(0);
    setDone(false);
  }

  function updateAnswer(id: string, patch: Partial<AnswerState>) {
    setAnswers((prev) => {
      const existing: AnswerState = prev[id] ?? { rating: 0, notes: "", revealed: false };
      return { ...prev, [id]: { ...existing, ...patch } };
    });
  }

  const q = questions[current];
  const ans: AnswerState = answers[q.id] ?? { rating: 0, notes: "", revealed: false };
  const progress = ((current + (done ? 1 : 0)) / questions.length) * 100;

  function next() {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  if (done) {
    const ratings = Object.values(answers).map((a) => a.rating).filter((r) => r > 0);
    const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;

    return (
      <div className="stack stack-lg">
        <Card className="relative overflow-hidden">
          <div className="relative">
            <CardHeader
              title="🎉 Sesi selesai"
              subtitle={`${ratings.length}/${questions.length} pertanyaan kamu self-rate`}
              action={<Badge tone={avg >= 4 ? "success" : avg >= 3 ? "brand" : "warning"}>Avg {avg.toFixed(1)}/5</Badge>}
            />
            <div className="space-y-3">
              {questions.map((item, i) => {
                const a = answers[item.id];
                const cat = CATEGORY_LABELS[item.category];
                return (
                  <div key={item.id} className="rounded-lg border border-border p-3 bg-background-secondary/30">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-sm font-semibold flex-1">
                        {i + 1}. {item.text}
                      </p>
                      <Badge tone={cat.tone}>{cat.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-foreground-muted">Self-rating:</span>
                      <span className="font-mono tabular-nums">{a?.rating ?? 0}/5</span>
                      {a?.notes && <span className="text-foreground-muted italic truncate flex-1">&ldquo;{a.notes}&rdquo;</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={regenerate}>🎲 Generate set baru</Button>
              <Button variant="secondary" onClick={() => { setDone(false); setCurrent(0); }}>
                Review jawaban
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const cat = CATEGORY_LABELS[q.category];

  return (
    <div className="stack stack-lg">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge tone="muted">Pertanyaan {current + 1}/{questions.length}</Badge>
            <Badge tone={cat.tone}>{cat.label}</Badge>
            {targetRoleName && <Badge tone="info">{targetRoleName}</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={regenerate}>🎲 Acak ulang</Button>
        </div>

        <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden mb-5">
          <div className="h-full bg-linear-to-r from-primary to-accent transition-all" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="font-display font-bold text-xl mb-2">{q.text}</h2>
        <p className="text-sm text-foreground-secondary mb-5">💡 {q.tip}</p>

        <div className="mb-5">
          <label className="block text-xs uppercase tracking-wider text-foreground-muted mb-1.5">
            Catatan jawaban kamu (opsional)
          </label>
          <textarea
            value={ans.notes}
            onChange={(e) => updateAnswer(q.id, { notes: e.target.value })}
            rows={4}
            placeholder="Tulis poin utama jawaban — STAR format sangat membantu."
            className="input w-full resize-none"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs uppercase tracking-wider text-foreground-muted mb-2">
            Rate kepercayaan diri jawaban kamu
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateAnswer(q.id, { rating: r })}
                className={`h-10 flex-1 rounded-lg border font-display font-bold text-lg transition-all ${
                  ans.rating === r
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background-secondary/50 text-foreground-muted hover:border-primary/50"
                }`}
                aria-label={`Rating ${r}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {!ans.revealed ? (
          <Button variant="secondary" onClick={() => updateAnswer(q.id, { revealed: true })}>
            🔍 Tampilkan STAR hint
          </Button>
        ) : (
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2">STAR framework</p>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-xs text-foreground-muted">Situation</dt>
                <dd>{q.starHint.situation}</dd>
              </div>
              <div>
                <dt className="font-semibold text-xs text-foreground-muted">Task</dt>
                <dd>{q.starHint.task}</dd>
              </div>
              <div>
                <dt className="font-semibold text-xs text-foreground-muted">Action</dt>
                <dd>{q.starHint.action}</dd>
              </div>
              <div>
                <dt className="font-semibold text-xs text-foreground-muted">Result</dt>
                <dd>{q.starHint.result}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            ← Sebelumnya
          </Button>
          <Button onClick={next} disabled={ans.rating === 0}>
            {current + 1 >= questions.length ? "Selesai →" : "Berikutnya →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
