"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type CalibrationZone = "impostor" | "calibrated" | "overconfident";

export interface CalibratedSkill {
  skillId: string;
  name: string;
  actualScore: number;
  confidence: number;
  expectedFromConfidence: number;
  delta: number;
  zone: CalibrationZone;
  zoneLabel: string;
  insight: string;
}

export interface CalibrationResult {
  skills: CalibratedSkill[];
  calibrationIndex: number;
  zoneCounts: Record<CalibrationZone, number>;
  impostorHighlights: CalibratedSkill[];
  blindSpotHighlights: CalibratedSkill[];
  overallVerdict: string;
  verdictTone: "success" | "brand" | "warning";
  averageConfidence: number;
  averageScore: number;
}

const CALIBRATED_BAND = 10;

function expectedFromConfidence(confidence: number): number {
  const clamped = Math.max(1, Math.min(5, confidence));
  return Math.round(20 + (clamped - 1) * 20);
}

function zoneFor(delta: number): { zone: CalibrationZone; label: string } {
  if (delta > CALIBRATED_BAND) return { zone: "overconfident", label: "Overconfident" };
  if (delta < -CALIBRATED_BAND) return { zone: "impostor", label: "Hidden strength" };
  return { zone: "calibrated", label: "Terkalibrasi" };
}

function insightFor(name: string, score: number, confidence: number, delta: number): string {
  if (delta > CALIBRATED_BAND) {
    return `Confidence ${confidence.toFixed(1)}/5 terasa tinggi, tapi skor aktual ${name} baru ${score}. Uji dengan 1 latihan nyata untuk kalibrasi ulang.`;
  }
  if (delta < -CALIBRATED_BAND) {
    return `Skor ${name} ${score} tapi confidence baru ${confidence.toFixed(1)}/5 — Anda meremehkan kemampuan sendiri. Gunakan ini di portfolio atau mentoring.`;
  }
  return `Persepsi selaras dengan performa — confidence ${confidence.toFixed(1)}/5, skor ${score}. Pertahankan.`;
}

export async function getCalibrationAction(): Promise<
  { ok: true; data: CalibrationResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const me = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!me) return { ok: false, error: "Profil learner tidak ditemukan." };

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: me.id },
      orderBy: { snapshotAt: "desc" },
      select: {
        skillId: true,
        score: true,
        confidence: true,
        skill: { select: { name: true } },
      },
    });

    const latest = new Map<string, (typeof snapshots)[number]>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s);
    }

    const skills: CalibratedSkill[] = Array.from(latest.values()).map((s) => {
      const actualScore = Math.round(s.score);
      const expected = expectedFromConfidence(s.confidence);
      const delta = expected - actualScore;
      const { zone, label } = zoneFor(delta);
      return {
        skillId: s.skillId,
        name: s.skill.name,
        actualScore,
        confidence: Math.round(s.confidence * 10) / 10,
        expectedFromConfidence: expected,
        delta,
        zone,
        zoneLabel: label,
        insight: insightFor(s.skill.name, actualScore, s.confidence, delta),
      };
    });

    const zoneCounts: Record<CalibrationZone, number> = {
      impostor: 0,
      calibrated: 0,
      overconfident: 0,
    };
    let totalAbsDelta = 0;
    let totalConf = 0;
    let totalScore = 0;
    for (const s of skills) {
      zoneCounts[s.zone] += 1;
      totalAbsDelta += Math.abs(s.delta);
      totalConf += s.confidence;
      totalScore += s.actualScore;
    }

    const calibrationIndex = skills.length
      ? Math.max(0, Math.round(100 - totalAbsDelta / skills.length))
      : 100;

    const impostorHighlights = skills
      .filter((s) => s.zone === "impostor")
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 3);

    const blindSpotHighlights = skills
      .filter((s) => s.zone === "overconfident")
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 3);

    let overallVerdict: string;
    let verdictTone: CalibrationResult["verdictTone"];
    if (skills.length === 0) {
      overallVerdict = "Butuh snapshot skill untuk mengkalibrasi persepsi.";
      verdictTone = "brand";
    } else if (calibrationIndex >= 85) {
      overallVerdict = "Persepsi Anda akurat — siap mengambil keputusan karir berbasis data diri.";
      verdictTone = "success";
    } else if (calibrationIndex >= 70) {
      overallVerdict = "Kalibrasi cukup baik, tapi ada beberapa titik buta yang perlu divalidasi.";
      verdictTone = "brand";
    } else if (zoneCounts.impostor > zoneCounts.overconfident) {
      overallVerdict = "Pola impostor: Anda cenderung meremehkan kemampuan. Rayakan pencapaian lebih eksplisit.";
      verdictTone = "warning";
    } else {
      overallVerdict = "Beberapa skill dinilai lebih tinggi dari performa aktual — validasi lewat project atau mock interview.";
      verdictTone = "warning";
    }

    return {
      ok: true,
      data: {
        skills,
        calibrationIndex,
        zoneCounts,
        impostorHighlights,
        blindSpotHighlights,
        overallVerdict,
        verdictTone,
        averageConfidence: skills.length ? Math.round((totalConf / skills.length) * 10) / 10 : 0,
        averageScore: skills.length ? Math.round(totalScore / skills.length) : 0,
      },
    };
  } catch (err) {
    console.error("getCalibrationAction error", err);
    return { ok: false, error: "Gagal memuat kalibrasi." };
  }
}
