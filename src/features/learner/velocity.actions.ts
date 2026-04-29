"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const WINDOW_WEEKS = 8;

export type Momentum = "sprinting" | "building" | "plateau" | "declining" | "insufficient";

export interface WeeklyPoint {
  weekStart: string;
  weekIndex: number;
  score: number;
  delta: number;
}

export interface VelocityResult {
  currentScore: number;
  entriesUsed: number;
  weeklyPoints: WeeklyPoint[];
  velocity: number;
  recentVelocity: number;
  priorVelocity: number;
  acceleration: number;
  consistencyScore: number;
  momentum: Momentum;
  momentumLabel: string;
  momentumTone: "success" | "brand" | "warning" | "danger";
  bestWeek: { weekStart: string; delta: number } | null;
  projection: { weeksToNextMilestone: number | null; targetScore: number | null; targetLabel: string | null };
  headline: string;
  insight: string;
}

const MILESTONE_STEPS: { max: number; label: string }[] = [
  { max: 40, label: "Developing" },
  { max: 60, label: "Progressing" },
  { max: 75, label: "Career Ready" },
  { max: 90, label: "Advanced Ready" },
  { max: 100, label: "Mastery" },
];

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const x = new Date(d);
  x.setDate(d.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getLearningVelocityAction(): Promise<
  { ok: true; data: VelocityResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true, currentTRI: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const history = await db.tRIHistory.findMany({
      where: { learnerId: profile.id },
      orderBy: { recordedAt: "asc" },
      select: { score: true, recordedAt: true },
    });

    const now = new Date();
    const startCutoff = new Date(now.getTime() - WINDOW_WEEKS * WEEK_MS);
    const inWindow = history.filter((h) => h.recordedAt.getTime() >= startCutoff.getTime());

    const buckets = new Map<number, number>();
    for (const h of inWindow) {
      const wk = startOfWeek(h.recordedAt).getTime();
      buckets.set(wk, h.score);
    }

    const orderedWeeks = Array.from(buckets.keys()).sort((a, b) => a - b);
    const points: WeeklyPoint[] = [];
    let prev: number | null = null;
    orderedWeeks.forEach((wk, i) => {
      const score = buckets.get(wk)!;
      const delta = prev == null ? 0 : score - prev;
      points.push({
        weekStart: new Date(wk).toISOString(),
        weekIndex: i,
        score: Math.round(score * 10) / 10,
        delta: Math.round(delta * 10) / 10,
      });
      prev = score;
    });

    const entriesUsed = inWindow.length;
    const currentScore =
      points.length > 0 ? points[points.length - 1].score : profile.currentTRI ?? 0;

    if (points.length < 2) {
      return {
        ok: true,
        data: {
          currentScore,
          entriesUsed,
          weeklyPoints: points,
          velocity: 0,
          recentVelocity: 0,
          priorVelocity: 0,
          acceleration: 0,
          consistencyScore: 0,
          momentum: "insufficient",
          momentumLabel: "Data belum cukup",
          momentumTone: "warning",
          bestWeek: null,
          projection: { weeksToNextMilestone: null, targetScore: null, targetLabel: null },
          headline: "Butuh minimal 2 minggu catatan TRI",
          insight:
            "Selesaikan assessment berkala agar Learning Velocity bisa mengukur momentum Anda.",
        },
      };
    }

    const deltas = points.slice(1).map((p) => p.delta);
    const velocity = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const splitIdx = Math.ceil(deltas.length / 2);
    const priorDeltas = deltas.slice(0, splitIdx);
    const recentDeltas = deltas.slice(splitIdx);
    const priorVelocity =
      priorDeltas.length > 0
        ? priorDeltas.reduce((a, b) => a + b, 0) / priorDeltas.length
        : 0;
    const recentVelocity =
      recentDeltas.length > 0
        ? recentDeltas.reduce((a, b) => a + b, 0) / recentDeltas.length
        : velocity;
    const acceleration = recentVelocity - priorVelocity;

    const mean = velocity;
    const variance =
      deltas.length > 1
        ? deltas.reduce((sum, d) => sum + (d - mean) ** 2, 0) / deltas.length
        : 0;
    const stddev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, Math.round(100 - stddev * 10));

    let momentum: Momentum;
    let momentumLabel: string;
    let momentumTone: VelocityResult["momentumTone"];
    if (velocity >= 3 && acceleration >= 0) {
      momentum = "sprinting";
      momentumLabel = "Sprinting";
      momentumTone = "success";
    } else if (velocity >= 1 && velocity < 3) {
      momentum = "building";
      momentumLabel = "Building";
      momentumTone = "brand";
    } else if (Math.abs(velocity) < 1) {
      momentum = "plateau";
      momentumLabel = "Plateau";
      momentumTone = "warning";
    } else {
      momentum = "declining";
      momentumLabel = "Declining";
      momentumTone = "danger";
    }

    let best: VelocityResult["bestWeek"] = null;
    for (const p of points.slice(1)) {
      if (!best || p.delta > best.delta) best = { weekStart: p.weekStart, delta: p.delta };
    }

    const nextMilestone = MILESTONE_STEPS.find((m) => m.max > currentScore);
    let projection: VelocityResult["projection"] = {
      weeksToNextMilestone: null,
      targetScore: null,
      targetLabel: null,
    };
    if (nextMilestone && velocity > 0.1) {
      const gap = nextMilestone.max - currentScore;
      const weeks = Math.ceil(gap / velocity);
      projection = {
        weeksToNextMilestone: weeks,
        targetScore: nextMilestone.max,
        targetLabel: nextMilestone.label,
      };
    }

    const velocityRounded = Math.round(velocity * 10) / 10;
    const accelRounded = Math.round(acceleration * 10) / 10;

    let headline: string;
    let insight: string;
    if (momentum === "sprinting") {
      headline = `+${velocityRounded} TRI/minggu · akselerasi ${accelRounded >= 0 ? "+" : ""}${accelRounded}`;
      insight = projection.weeksToNextMilestone
        ? `Di kecepatan ini, ${projection.targetLabel} tercapai dalam ${projection.weeksToNextMilestone} minggu. Pertahankan ritme.`
        : "Akselerasi positif — momentum terbaik sedang berjalan.";
    } else if (momentum === "building") {
      headline = `+${velocityRounded} TRI/minggu · stabil`;
      insight = projection.weeksToNextMilestone
        ? `${projection.targetLabel} tercapai dalam ${projection.weeksToNextMilestone} minggu. Tambah 1–2 jam/minggu untuk akselerasi.`
        : "Kecepatan stabil — ruang untuk mendorong lebih cepat.";
    } else if (momentum === "plateau") {
      headline = `Datar · ${velocityRounded} TRI/minggu`;
      insight =
        "Perubahan kecil dalam beberapa minggu terakhir. Coba assessment baru atau modul bervariasi untuk memicu gain baru.";
    } else if (momentum === "declining") {
      headline = `${velocityRounded} TRI/minggu · menurun`;
      insight =
        "TRI menurun — biasanya karena skill decay atau gap role baru. Cek Skill Decay Monitor untuk memulihkan.";
    } else {
      headline = "Data belum cukup";
      insight = "Selesaikan assessment berikutnya untuk membuka velocity tracker.";
    }

    return {
      ok: true,
      data: {
        currentScore,
        entriesUsed,
        weeklyPoints: points,
        velocity: velocityRounded,
        recentVelocity: Math.round(recentVelocity * 10) / 10,
        priorVelocity: Math.round(priorVelocity * 10) / 10,
        acceleration: accelRounded,
        consistencyScore,
        momentum,
        momentumLabel,
        momentumTone,
        bestWeek: best,
        projection,
        headline,
        insight,
      },
    };
  } catch (err) {
    console.error("getLearningVelocityAction error", err);
    return { ok: false, error: "Gagal memuat Learning Velocity." };
  }
}
