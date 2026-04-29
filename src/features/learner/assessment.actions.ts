"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { resolveAssessmentSkill } from "@/lib/assessment-skill-map";
import { recalcTRIForLearner, logActivity, checkAndAwardBadges } from "@/features/shared/recalc";

export interface AssessmentSubmissionPayload {
  assessmentSlug: string;
  title: string;
  totalScore: number;
  confidenceWeighted: number;
  correctCount: number;
  totalQuestions: number;
  durationSec: number;
  perSkill: { skill: string; score: number; correct: number; total: number; avgConfidence: number }[];
}

export async function saveAssessmentResultAction(payload: AssessmentSubmissionPayload) {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false as const, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true, targetCareerRoleId: true },
    });
    if (!profile) return { ok: false as const, error: "Profil learner tidak ditemukan." };

    const assessment =
      (await db.assessment.findFirst({ select: { id: true } })) ??
      (await db.assessment.create({
        data: { title: "Asesmen Diagnostik Kompetensi", type: "diagnostic", totalPoints: 100 },
        select: { id: true },
      }));

    const confidenceAvg =
      payload.perSkill.reduce((s, x) => s + x.avgConfidence, 0) /
      Math.max(1, payload.perSkill.length);

    const assessmentSession = await db.assessmentSession.create({
      data: {
        learnerId: profile.id,
        assessmentId: assessment.id,
        startedAt: new Date(Date.now() - payload.durationSec * 1000),
        completedAt: new Date(),
        totalScore: payload.totalScore,
        maxScore: 100,
        confidenceAvg,
        status: "completed",
      },
      select: { id: true },
    });

    // Resolve assessment-bank skill labels → DB Skill rows
    const skillsByName = new Map<string, { id: string; maxLevel: number }>();
    const allSkills = await db.skill.findMany({ select: { id: true, name: true, maxLevel: true } });
    for (const s of allSkills) skillsByName.set(s.name, { id: s.id, maxLevel: s.maxLevel });

    // Aggregate weighted score + confidence per DB skill
    const aggregated = new Map<string, { score: number; totalWeight: number; confidence: number; confWeight: number; sampleCount: number }>();
    for (const row of payload.perSkill) {
      const mapped = resolveAssessmentSkill(row.skill);
      for (const m of mapped) {
        const dbSkill = skillsByName.get(m.name);
        if (!dbSkill) continue;
        const entry = aggregated.get(dbSkill.id) ?? { score: 0, totalWeight: 0, confidence: 0, confWeight: 0, sampleCount: 0 };
        entry.score += row.score * m.weight;
        entry.totalWeight += m.weight;
        entry.confidence += row.avgConfidence * m.weight;
        entry.confWeight += m.weight;
        entry.sampleCount += row.total;
        aggregated.set(dbSkill.id, entry);
      }
    }

    // Write SkillScoreSnapshot per aggregated skill (blend with prior latest)
    const priorSnapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: profile.id },
      orderBy: { snapshotAt: "desc" },
      select: { skillId: true, score: true, snapshotAt: true },
    });
    const latestBySkill = new Map<string, number>();
    for (const s of priorSnapshots) if (!latestBySkill.has(s.skillId)) latestBySkill.set(s.skillId, s.score);

    const snapshotRows = Array.from(aggregated.entries()).map(([skillId, agg]) => {
      const rawScore = agg.totalWeight > 0 ? agg.score / agg.totalWeight : 0;
      const prior = latestBySkill.get(skillId) ?? 0;
      // Blend 50/50 if prior exists to smooth volatility
      const score = prior > 0 ? Math.round(prior * 0.5 + rawScore * 0.5) : Math.round(rawScore);
      const confidence = agg.confWeight > 0 ? agg.confidence / agg.confWeight : 3;
      return {
        learnerId: profile.id,
        skillId,
        score,
        confidence,
        evidenceStr: 0,
      };
    });

    if (snapshotRows.length > 0) {
      await db.skillScoreSnapshot.createMany({ data: snapshotRows });
    }

    // Write ConfidenceRating per skill
    const confidenceRows = Array.from(aggregated.entries()).map(([skillId, agg]) => ({
      learnerId: profile.id,
      skillId,
      rating: Math.round(agg.confWeight > 0 ? agg.confidence / agg.confWeight : 3),
    }));
    if (confidenceRows.length > 0) {
      await db.confidenceRating.createMany({ data: confidenceRows });
    }

    // Write SkillGapSnapshot for target role
    if (profile.targetCareerRoleId) {
      const requirements = await db.careerRoleSkillRequirement.findMany({
        where: { careerRoleId: profile.targetCareerRoleId },
        select: {
          skillId: true,
          targetLevel: true,
          importanceWeight: true,
          isCritical: true,
          skill: { select: { maxLevel: true } },
        },
      });

      // Latest score per skill INCLUDING the new snapshot we just wrote
      const freshLatest = new Map<string, number>();
      for (const r of snapshotRows) freshLatest.set(r.skillId, r.score);
      for (const [k, v] of latestBySkill) if (!freshLatest.has(k)) freshLatest.set(k, v);

      const gapRows = requirements.map((r) => {
        const maxLevel = r.skill.maxLevel || 5;
        const targetPct = (r.targetLevel / maxLevel) * 100;
        const currentPct = freshLatest.get(r.skillId) ?? 0;
        const gap = Math.max(0, targetPct - currentPct);
        return {
          learnerId: profile.id,
          skillId: r.skillId,
          currentLevel: currentPct,
          targetLevel: targetPct,
          gap,
          weightedGap: gap * r.importanceWeight,
          isCritical: r.isCritical,
          isBlocker: r.isCritical && gap > 30,
        };
      });
      if (gapRows.length > 0) {
        await db.skillGapSnapshot.createMany({ data: gapRows });
      }
    }

    // Trigger full TRI recompute now that snapshots exist
    const tri = await recalcTRIForLearner(profile.id);

    await db.notification.create({
      data: {
        userId: session.userId,
        type: "ASSESSMENT_COMPLETED",
        title: "Asesmen selesai",
        message: `Anda menyelesaikan "${payload.title}" dengan skor ${payload.totalScore}/100. TRI baru: ${tri.score} (${tri.milestone}).`,
        actionUrl: "/dashboard",
      },
    });

    await logActivity(session.userId, "ASSESSMENT_COMPLETED", payload.title, {
      sessionId: assessmentSession.id,
      totalScore: payload.totalScore,
      skillsUpdated: snapshotRows.length,
    });

    await checkAndAwardBadges({ userId: session.userId, learnerId: profile.id, event: "ASSESSMENT_COMPLETED" });

    revalidatePath("/dashboard");
    revalidatePath("/skill-gap");
    revalidatePath("/career-compass");
    revalidatePath("/calibration");
    revalidatePath("/skill-decay");
    revalidatePath("/immunity");
    revalidatePath("/opportunities");
    revalidatePath("/career-ladder");

    return {
      ok: true as const,
      newTRI: tri.score,
      milestone: tri.milestone,
      breakdown: tri,
      skillsUpdated: snapshotRows.length,
    };
  } catch (err) {
    console.error("saveAssessmentResultAction error", err);
    return { ok: false as const, error: "Gagal menyimpan hasil asesmen." };
  }
}
