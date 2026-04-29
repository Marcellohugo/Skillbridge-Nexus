"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Callout, Card, CardHeader, Progress, RingMetric, StatCard } from "@/components/ui";
import { ASSESSMENTS, getAssessment, type AssessmentDef } from "@/lib/assessment-bank";
import { saveAssessmentResultAction } from "@/features/learner/assessment.actions";

type Mode =
  | { kind: "index" }
  | { kind: "intro"; assessmentId: string }
  | { kind: "playing"; assessmentId: string; idx: number; answers: AnswerMap }
  | { kind: "results"; assessmentId: string; answers: AnswerMap; durationSec: number };

type AnswerMap = Record<string, { optionId: string | null; confidence: 1 | 2 | 3 | 4 | 5 }>;

export default function AssessmentPage() {
  const [mode, setMode] = React.useState<Mode>({ kind: "index" });

  if (mode.kind === "index") return <Index onStart={(id) => setMode({ kind: "intro", assessmentId: id })} />;

  const assessment = getAssessment(mode.assessmentId);
  if (!assessment) return <Index onStart={(id) => setMode({ kind: "intro", assessmentId: id })} />;

  if (mode.kind === "intro") {
    return (
      <Intro
        assessment={assessment}
        onBack={() => setMode({ kind: "index" })}
        onStart={() =>
          setMode({
            kind: "playing",
            assessmentId: assessment.id,
            idx: 0,
            answers: Object.fromEntries(assessment.questions.map((q) => [q.id, { optionId: null, confidence: 3 }])) as AnswerMap,
          })
        }
      />
    );
  }

  if (mode.kind === "playing") {
    return (
      <Playing
        assessment={assessment}
        idx={mode.idx}
        answers={mode.answers}
        onAnswer={(a) => setMode({ ...mode, answers: a })}
        onNext={() => setMode({ ...mode, idx: Math.min(mode.idx + 1, assessment.questions.length - 1) })}
        onPrev={() => setMode({ ...mode, idx: Math.max(mode.idx - 1, 0) })}
        onSubmit={(durationSec) => setMode({ kind: "results", assessmentId: assessment.id, answers: mode.answers, durationSec })}
        onExit={() => setMode({ kind: "index" })}
      />
    );
  }

  return (
    <Results
      assessment={assessment}
      answers={mode.answers}
      durationSec={mode.durationSec}
      onRetake={() => setMode({ kind: "intro", assessmentId: assessment.id })}
      onDone={() => setMode({ kind: "index" })}
    />
  );
}

// ────────────────────────────── INDEX ──────────────────────────────
function Index({ onStart }: { onStart: (id: string) => void }) {
  const recommended = ASSESSMENTS.find((a) => a.recommended);

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Assessment</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Asesmen Kompetensi</h1>
        <p className="mt-1 text-foreground-secondary">Asesmen adaptif & berbasis confidence — hasil langsung memperbarui TRI dan rekomendasi modul Anda.</p>
      </header>

      {recommended && (
        <Card elevated className="relative overflow-hidden">
          <div className="relative grid md:grid-cols-[1fr,auto] gap-6 items-center">
            <div>
              <Badge tone="brand">⭐ Direkomendasikan</Badge>
              <h2 className="mt-3 text-2xl font-display font-bold">{recommended.title}</h2>
              <p className="text-sm text-foreground-secondary mt-2 max-w-xl">{recommended.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {recommended.skillsCovered.slice(0, 5).map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
                {recommended.skillsCovered.length > 5 && <span className="chip">+{recommended.skillsCovered.length - 5}</span>}
              </div>
            </div>
            <div className="flex md:flex-col gap-3 md:items-end">
              <div className="text-right">
                <p className="text-xs text-foreground-muted">Estimasi</p>
                <p className="text-2xl font-display font-bold">{recommended.durationMin}<span className="text-sm font-normal text-foreground-muted ml-1">menit</span></p>
                <p className="text-xs text-foreground-muted mt-1">{recommended.questions.length} pertanyaan · {recommended.difficulty}</p>
              </div>
              <Button onClick={() => onStart(recommended.id)} size="lg">Mulai Asesmen →</Button>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-display font-bold mb-4">Spot-check & asesmen lainnya</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENTS.filter((a) => !a.recommended).map((a) => (
            <Card key={a.id} hover className="flex flex-col">
              <h3 className="font-display font-bold text-base">{a.title}</h3>
              <p className="text-sm text-foreground-secondary mt-1.5 flex-1">{a.description}</p>
              <div className="flex items-center gap-2 mt-4 text-xs text-foreground-muted">
                <span>{a.questions.length} soal</span>
                <span aria-hidden>·</span>
                <span>{a.durationMin} mnt</span>
                <span aria-hidden>·</span>
                <span>{a.difficulty}</span>
              </div>
              <Button variant="secondary" className="w-full mt-4" onClick={() => onStart(a.id)}>Mulai →</Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Bagaimana asesmen ini bekerja?" subtitle="Transparansi penuh" />
          <ul className="space-y-2.5 text-sm">
            {[
              "Pertanyaan adaptif: tingkat kesulitan menyesuaikan performa Anda.",
              "Confidence rating: ukur seberapa yakin Anda — meningkatkan akurasi skor.",
              "Hasil dipetakan ke skill spesifik (bukan sekadar nilai global).",
              "TRI Anda otomatis ter-update setelah submit.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-0.5 h-5 w-5 grid place-items-center rounded-full bg-primary/10 text-primary text-xs flex-shrink-0">✓</span>
                <span className="text-foreground-secondary">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Tips untuk hasil terbaik" />
          <ul className="space-y-2.5 text-sm">
            {[
              ["⏱️", "Pilih waktu fokus — hindari multitasking."],
              ["💭", "Jawab jujur — hasil ini untuk Anda, bukan ujian."],
              ["📊", "Confidence rating: rendahkan jika Anda menebak."],
              ["🔄", "Bisa diambil ulang setelah menyelesaikan modul terkait."],
            ].map(([icon, t]) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-base">{icon}</span>
                <span className="text-foreground-secondary">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────── INTRO ──────────────────────────────
function Intro({ assessment, onBack, onStart }: { assessment: AssessmentDef; onBack: () => void; onStart: () => void }) {
  return (
    <div className="container-app py-8 lg:py-10">
      <button onClick={onBack} className="text-sm text-primary hover:underline mb-4">← Kembali</button>
      <div className="mx-auto max-w-2xl">
        <Card elevated className="text-center">
          <Badge tone="brand">Persiapan</Badge>
          <h1 className="mt-3 text-2xl font-display font-bold">{assessment.title}</h1>
          <p className="text-foreground-secondary mt-2">{assessment.description}</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat label="Pertanyaan" value={`${assessment.questions.length}`} />
            <Stat label="Estimasi" value={`${assessment.durationMin} mnt`} />
            <Stat label="Tingkat" value={assessment.difficulty} />
          </div>

          <div className="text-left mt-6">
            <p className="text-xs uppercase tracking-wider text-foreground-muted mb-2">Skill yang diukur</p>
            <div className="flex flex-wrap gap-2">
              {assessment.skillsCovered.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>
          </div>

          <Callout tone="info" title="Sebelum mulai" className="mt-6 text-left">
            Anda dapat menjeda dan kembali — progress disimpan di browser. Pastikan Anda dalam mode fokus, dan gunakan keyboard nav (1-9 untuk pilih opsi, →/← untuk navigasi).
          </Callout>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={onBack}>Nanti saja</Button>
            <Button className="flex-1" onClick={onStart} size="lg">Mulai sekarang →</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary/50 px-3 py-3 text-center">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="text-lg font-display font-bold mt-0.5">{value}</p>
    </div>
  );
}

// ────────────────────────────── PLAYING ──────────────────────────────
function Playing({
  assessment,
  idx,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  onExit,
}: {
  assessment: AssessmentDef;
  idx: number;
  answers: AnswerMap;
  onAnswer: (a: AnswerMap) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (durationSec: number) => void;
  onExit: () => void;
}) {
  const startedRef = React.useRef(0);
  const q = assessment.questions[idx];
  const total = assessment.questions.length;
  const current = answers[q.id];
  const isLast = idx === total - 1;
  const allAnswered = Object.values(answers).every((a) => a.optionId !== null);

  React.useEffect(() => {
    startedRef.current = Date.now();
  }, [assessment.id]);

  const select = (optionId: string) => {
    onAnswer({ ...answers, [q.id]: { ...current, optionId } });
  };
  const setConfidence = (c: 1 | 2 | 3 | 4 | 5) => {
    onAnswer({ ...answers, [q.id]: { ...current, confidence: c } });
  };

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= q.options.length) {
        select(q.options[num - 1].id);
      } else if (e.key === "ArrowRight" && current?.optionId) {
        if (!isLast) onNext();
      } else if (e.key === "ArrowLeft") {
        if (idx > 0) onPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="container-app py-8 lg:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Badge tone="brand">{assessment.title}</Badge>
            <span className="text-xs text-foreground-muted">{q.category} · Tingkat {q.difficulty}</span>
          </div>
          <button onClick={onExit} className="text-xs text-foreground-muted hover:text-foreground">Keluar & simpan</button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
            <span>Pertanyaan {idx + 1} dari {total}</span>
            <span>{Object.values(answers).filter((a) => a.optionId).length} terjawab</span>
          </div>
          <Progress value={((idx + 1) / total) * 100} tone="brand" />
        </div>

        <Card elevated>
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2">Skill: {q.skill}</p>
          <h2 className="text-lg sm:text-xl font-display font-semibold leading-snug mb-6">{q.text}</h2>

          <div role="radiogroup" aria-label="Pilih jawaban" className="space-y-2.5">
            {q.options.map((opt, i) => {
              const on = current?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => select(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    on ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border hover:border-border-strong"
                  }`}
                >
                  <span className={`mt-0.5 h-7 w-7 grid place-items-center rounded-lg text-xs font-bold flex-shrink-0 ${on ? "bg-primary text-white" : "bg-background-tertiary text-foreground-muted"}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Seberapa yakin Anda?</p>
              <span className="text-xs text-foreground-muted">{["Menebak", "Tidak yakin", "Cukup yakin", "Yakin", "Sangat yakin"][current.confidence - 1]}</span>
            </div>
            <div role="radiogroup" aria-label="Confidence" className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={current.confidence === n}
                  onClick={() => setConfidence(n as 1 | 2 | 3 | 4 | 5)}
                  className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                    current.confidence === n ? "bg-accent text-white" : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground-muted mt-2">Confidence membantu kami membedakan antara &quot;tahu&quot; dan &quot;menebak&quot; — meningkatkan akurasi TRI.</p>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onPrev} disabled={idx === 0}>← Sebelumnya</Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted hidden sm:inline">Tip: gunakan tombol angka 1-{q.options.length} & ←/→</span>
            {isLast ? (
              <Button onClick={() => onSubmit(Math.round((Date.now() - startedRef.current) / 1000))} disabled={!allAnswered} size="lg">
                Submit Asesmen
              </Button>
            ) : (
              <Button onClick={onNext} disabled={!current?.optionId}>Lanjut →</Button>
            )}
          </div>
        </div>

        {isLast && !allAnswered && (
          <p className="mt-3 text-xs text-warning text-center">
            Anda masih punya {Object.values(answers).filter((a) => !a.optionId).length} pertanyaan belum terjawab. Kembali untuk melengkapinya.
          </p>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────── RESULTS ──────────────────────────────
function Results({
  assessment,
  answers,
  durationSec,
  onRetake,
  onDone,
}: {
  assessment: AssessmentDef;
  answers: AnswerMap;
  durationSec: number;
  onRetake: () => void;
  onDone: () => void;
}) {
  const { totalScore, perSkill, correctCount, confidenceWeighted } = React.useMemo(() => {
    let totalRaw = 0;
    let weighted = 0;
    let weightSum = 0;
    let correctCount = 0;
    const perSkillMap: Record<string, { correct: number; total: number; conf: number; raw: number; }> = {};

    for (const q of assessment.questions) {
      const a = answers[q.id];
      const correct = q.options.find((o) => o.correct)?.id;
      const isCorrect = a?.optionId === correct;
      const conf = a?.confidence ?? 3;
      const point = isCorrect ? 100 : 0;
      const w = conf / 5;
      totalRaw += point;
      weighted += point * w;
      weightSum += w * 100;
      if (isCorrect) correctCount++;
      const slot = perSkillMap[q.skill] ?? { correct: 0, total: 0, conf: 0, raw: 0 };
      slot.total += 1;
      slot.raw += point;
      slot.conf += conf;
      if (isCorrect) slot.correct += 1;
      perSkillMap[q.skill] = slot;
    }

    const total = assessment.questions.length;
    const totalScore = Math.round(totalRaw / total);
    const confidenceWeighted = Math.round((weighted / weightSum) * 100);
    const perSkill = Object.entries(perSkillMap).map(([skill, v]) => ({
      skill,
      score: Math.round(v.raw / v.total),
      correct: v.correct,
      total: v.total,
      avgConfidence: +(v.conf / v.total).toFixed(1),
    })).sort((a, b) => a.score - b.score);

    return { totalScore, perSkill, correctCount, confidenceWeighted };
  }, [assessment, answers]);

  const [saveState, setSaveState] = React.useState<{ status: "idle" | "saving" | "saved" | "error"; newTRI?: number; error?: string }>({ status: "idle" });
  const savedRef = React.useRef(false);

  React.useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    setSaveState({ status: "saving" });
    saveAssessmentResultAction({
      assessmentSlug: assessment.id,
      title: assessment.title,
      totalScore,
      confidenceWeighted,
      correctCount,
      totalQuestions: assessment.questions.length,
      durationSec,
      perSkill,
    })
      .then((res) => {
        if (res.ok) setSaveState({ status: "saved", newTRI: res.newTRI });
        else setSaveState({ status: "error", error: res.error });
      })
      .catch(() => setSaveState({ status: "error", error: "Gagal menghubungi server." }));
  }, [assessment.id, assessment.title, assessment.questions.length, totalScore, confidenceWeighted, correctCount, durationSec, perSkill]);

  const milestone =
    totalScore >= 85 ? { label: "Excellent", tone: "success" as const, msg: "Anda menguasai materi ini. Saatnya project nyata & mentor advanced." } :
    totalScore >= 70 ? { label: "Strong",    tone: "brand" as const,   msg: "Fondasi solid — beberapa area perlu polish, fokus pada gap terbawah." } :
    totalScore >= 50 ? { label: "Developing", tone: "info" as const,   msg: "Sedang berkembang — modul terstruktur akan mempercepat progres." } :
                       { label: "Emerging",   tone: "warning" as const, msg: "Awal yang bagus — mulai dari modul foundational." };

  const weakest = perSkill[0];

  return (
    <div className="container-app py-8 lg:py-10 stack-xl stack">
      <header>
        <span className="eyebrow">Hasil Asesmen</span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">{assessment.title}</h1>
        <p className="mt-1 text-foreground-secondary">Selesai dalam {Math.floor(durationSec / 60)} menit {durationSec % 60} detik · {correctCount}/{assessment.questions.length} benar</p>
        <div className="mt-3">
          {saveState.status === "saving" && <Badge tone="info">Menyimpan hasil…</Badge>}
          {saveState.status === "saved" && <Badge tone="success">Tersimpan · TRI baru {saveState.newTRI}</Badge>}
          {saveState.status === "error" && <Badge tone="danger">Gagal menyimpan: {saveState.error}</Badge>}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card elevated className="lg:col-span-2 relative overflow-hidden">
          <div className="relative grid md:grid-cols-[auto,1fr] gap-8 items-center">
            <RingMetric value={totalScore} label="Skor Akhir" sublabel={milestone.label} size={170} />
            <div>
              <Badge tone={milestone.tone}>{milestone.label}</Badge>
              <h2 className="mt-3 text-xl font-display font-bold">Skor Anda: {totalScore}/100</h2>
              <p className="text-sm text-foreground-secondary mt-2">{milestone.msg}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-foreground-muted">Confidence-weighted</p>
                  <p className="font-display font-bold text-lg">{confidenceWeighted}/100</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Akurasi mentah</p>
                  <p className="font-display font-bold text-lg">{Math.round((correctCount / assessment.questions.length) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-1">
          <StatCard label="TRI Update" value={`+${Math.round(totalScore / 12)}`} tone="brand" delta="diterapkan" hint="Skor akan tercermin di Dashboard" />
          <StatCard label="Skill terlemah" value={weakest?.skill.split(" ")[0] ?? "—"} tone="warning" delta={`${weakest?.score ?? 0}/100`} hint="Direkomendasikan untuk fokus" />
        </div>
      </div>

      <Card>
        <CardHeader title="Breakdown per skill" subtitle="Diurutkan dari yang terlemah" />
        <div className="space-y-4">
          {perSkill.map((s) => (
            <div key={s.skill}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-sm font-semibold">{s.skill}</p>
                  <p className="text-xs text-foreground-muted">{s.correct}/{s.total} benar · confidence rata-rata {s.avgConfidence}/5</p>
                </div>
                <span className={`text-lg font-display font-bold ${s.score >= 70 ? "text-success" : s.score >= 50 ? "text-primary" : "text-warning"}`}>{s.score}</span>
              </div>
              <Progress value={s.score} tone={s.score >= 70 ? "success" : s.score >= 50 ? "brand" : "warning"} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Review jawaban" subtitle="Pelajari penjelasan untuk memperdalam pemahaman" />
        <div className="space-y-4">
          {assessment.questions.map((q, i) => {
            const a = answers[q.id];
            const correctOpt = q.options.find((o) => o.correct);
            const chosenOpt = q.options.find((o) => o.id === a?.optionId);
            const isCorrect = a?.optionId === correctOpt?.id;
            return (
              <details key={q.id} className="rounded-xl border border-border bg-background-secondary/40 group">
                <summary className="cursor-pointer p-4 flex items-start gap-3 list-none">
                  <span className={`mt-0.5 h-6 w-6 grid place-items-center rounded-full text-xs font-bold flex-shrink-0 ${isCorrect ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                    {isCorrect ? "✓" : "✕"}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-foreground-muted">Q{i + 1} · {q.skill}</p>
                    <p className="text-sm font-medium">{q.text}</p>
                  </div>
                  <span className="text-xs text-primary group-open:hidden">Detail</span>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
                  <p className="text-sm"><span className="text-foreground-muted">Jawaban Anda:</span> {chosenOpt?.text ?? "—"}</p>
                  {!isCorrect && <p className="text-sm"><span className="text-foreground-muted">Jawaban benar:</span> <span className="text-success font-medium">{correctOpt?.text}</span></p>}
                  <p className="text-sm text-foreground-secondary"><span className="text-foreground-muted">Penjelasan:</span> {q.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Langkah selanjutnya" subtitle="Aksi langsung berdasarkan hasil Anda" />
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/skill-gap" className="card card-hover p-4 text-left">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-semibold text-sm">Lihat Skill Gap penuh</p>
            <p className="text-xs text-foreground-muted mt-1">Bandingkan skor Anda dengan target peran.</p>
          </Link>
          <Link href="/learning-path" className="card card-hover p-4 text-left">
            <div className="text-2xl mb-2">🛤️</div>
            <p className="font-semibold text-sm">Mulai modul rekomendasi</p>
            <p className="text-xs text-foreground-muted mt-1">Path yang menutup gap terbesar Anda.</p>
          </Link>
          <Link href="/mentors" className="card card-hover p-4 text-left">
            <div className="text-2xl mb-2">🤝</div>
            <p className="font-semibold text-sm">Cari mentor</p>
            <p className="text-xs text-foreground-muted mt-1">Mentor yang spesialis di gap Anda.</p>
          </Link>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" onClick={onRetake}>Ambil ulang</Button>
          <Button onClick={onDone}>Kembali ke daftar asesmen</Button>
        </div>
      </Card>
    </div>
  );
}
