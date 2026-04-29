"use server";

import { db } from "@/lib/db";
import type { RiskLevel, InterventionType, TRIMilestone, Prisma } from "@prisma/client";

function milestoneFor(score: number): TRIMilestone {
  if (score >= 85) return "ADVANCED_READY";
  if (score >= 70) return "CAREER_READY";
  if (score >= 50) return "PROGRESSING";
  if (score >= 35) return "DEVELOPING";
  return "EMERGING";
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

export interface TRIBreakdown {
  score: number;
  milestone: TRIMilestone;
  assessmentScore: number;
  roleFitScore: number;
  learningScore: number;
  mentoringScore: number;
  portfolioScore: number;
  consistencyScore: number;
}

export async function recalcTRIForLearner(learnerId: string): Promise<TRIBreakdown> {
  const profile = await db.learnerProfile.findUnique({
    where: { id: learnerId },
    select: {
      id: true,
      userId: true,
      targetCareerRoleId: true,
      lastActiveAt: true,
      targetCareerRole: {
        select: {
          skillRequirements: {
            select: {
              skillId: true,
              targetLevel: true,
              importanceWeight: true,
              skill: { select: { maxLevel: true } },
            },
          },
        },
      },
    },
  });
  if (!profile) throw new Error("Learner not found");

  const [snapshots, pathItems, sessions, projects, triHistory, recentActivity] = await Promise.all([
    db.skillScoreSnapshot.findMany({
      where: { learnerId },
      orderBy: { snapshotAt: "desc" },
      select: { skillId: true, score: true, snapshotAt: true },
    }),
    db.learningPathItem.findMany({
      where: { path: { learnerId } },
      select: { isCompleted: true },
    }),
    db.mentoringSession.findMany({
      where: { menteeId: profile.userId },
      select: { status: true, triContribution: true },
    }),
    db.portfolioProject.findMany({
      where: { learnerId },
      select: { isValidated: true, evidenceStrength: true },
    }),
    db.tRIHistory.findFirst({
      where: { learnerId },
      orderBy: { recordedAt: "desc" },
      select: { score: true },
    }),
    db.activityLog.findMany({
      where: { userId: profile.userId, createdAt: { gte: new Date(Date.now() - 14 * 86400_000) } },
      select: { createdAt: true },
    }),
  ]);

  // Latest-wins per skill
  const latest = new Map<string, number>();
  for (const s of snapshots) if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);

  // Assessment score = mean of all snapshot scores (0-100)
  const assessmentScore =
    latest.size > 0
      ? Array.from(latest.values()).reduce((a, b) => a + b, 0) / latest.size
      : 0;

  // Role fit = weighted coverage vs target role requirements
  let roleFitScore = 0;
  if (profile.targetCareerRole && profile.targetCareerRole.skillRequirements.length > 0) {
    let weightedCoverage = 0;
    let weightedTotal = 0;
    for (const r of profile.targetCareerRole.skillRequirements) {
      const maxLevel = r.skill.maxLevel || 5;
      const targetPct = (r.targetLevel / maxLevel) * 100;
      const currentPct = latest.get(r.skillId) ?? 0;
      const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
      weightedCoverage += coverage * r.importanceWeight;
      weightedTotal += r.importanceWeight;
    }
    roleFitScore = weightedTotal > 0 ? (weightedCoverage / weightedTotal) * 100 : 0;
  }

  // Learning score = % completed of active path, or 0 if no path
  const learningScore = pathItems.length > 0
    ? (pathItems.filter((i) => i.isCompleted).length / pathItems.length) * 100
    : 0;

  // Mentoring score = (accepted or completed sessions) bounded 0-100, 10 pts per completed session
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const acceptedSessions = sessions.filter((s) => s.status === "ACCEPTED").length;
  const triContribSum = sessions.reduce((s, x) => s + (x.triContribution || 0), 0);
  const mentoringScore = clamp(
    Math.min(100, completedSessions * 15 + acceptedSessions * 5 + triContribSum),
  );

  // Portfolio = validated × 15 + evidenceStrength avg × 10, capped 100
  const validatedCount = projects.filter((p) => p.isValidated).length;
  const avgEvidenceStrength = projects.length > 0
    ? projects.reduce((s, p) => s + (p.evidenceStrength || 0), 0) / projects.length
    : 0;
  const portfolioScore = clamp(validatedCount * 15 + avgEvidenceStrength * 10);

  // Consistency = active days in last 14
  const activeDays = new Set(
    recentActivity.map((a) => a.createdAt.toISOString().slice(0, 10)),
  );
  const consistencyScore = clamp((activeDays.size / 14) * 100);

  // Weighted TRI
  const score = Math.round(
    assessmentScore * 0.2 +
      roleFitScore * 0.2 +
      learningScore * 0.15 +
      mentoringScore * 0.15 +
      portfolioScore * 0.15 +
      consistencyScore * 0.15,
  );
  const milestone = milestoneFor(score);

  // Risk level
  const lastActivityDays = profile.lastActiveAt
    ? Math.floor((Date.now() - profile.lastActiveAt.getTime()) / 86400_000)
    : 30;
  const prevScore = triHistory?.score ?? 0;
  const plateau = prevScore > 0 && Math.abs(score - prevScore) < 1;
  let risk: RiskLevel = "LOW";
  if (lastActivityDays > 14 || (plateau && lastActivityDays > 7)) risk = "CRITICAL";
  else if (lastActivityDays > 10) risk = "HIGH";
  else if (lastActivityDays > 5 || plateau) risk = "MEDIUM";

  // Persist to LearnerProfile + TRIHistory
  await db.$transaction([
    db.learnerProfile.update({
      where: { id: learnerId },
      data: {
        currentTRI: score,
        triMilestone: milestone,
        careerFitScore: roleFitScore / 100,
        riskLevel: risk,
      },
    }),
    db.tRIHistory.create({
      data: {
        learnerId,
        score,
        milestone,
        assessmentScore: Math.round(assessmentScore),
        roleFitScore: Math.round(roleFitScore),
        learningScore: Math.round(learningScore),
        mentoringScore: Math.round(mentoringScore),
        portfolioScore: Math.round(portfolioScore),
        consistencyScore: Math.round(consistencyScore),
      },
    }),
  ]);

  // Intervention auto-trigger
  if (risk === "HIGH" || risk === "CRITICAL") {
    const recentIntervention = await db.interventionRecord.findFirst({
      where: {
        learnerId,
        isResolved: false,
        createdAt: { gte: new Date(Date.now() - 3 * 86400_000) },
      },
    });
    if (!recentIntervention) {
      let type: InterventionType = "MOTIVATIONAL_REMINDER";
      let recommendation = "Luangkan 15 menit hari ini untuk kembali momentum belajar.";
      if (lastActivityDays > 10) {
        type = "MOTIVATIONAL_REMINDER";
        recommendation = `Anda tidak aktif ${lastActivityDays} hari. Mulai dengan quick-win 15 menit untuk reset streak.`;
      } else if (plateau) {
        type = "RECOMMEND_MENTOR";
        recommendation = "TRI Anda plateau. Book sesi mentor untuk membongkar blocker.";
      } else if (learningScore < 20 && pathItems.length > 0) {
        type = "QUICK_WIN_MODULE";
        recommendation = "Mulai satu modul quick-win dari learning path untuk membangkitkan momentum.";
      }
      await db.interventionRecord.create({
        data: {
          learnerId,
          type,
          riskLevel: risk,
          trigger: `Risk ${risk} — lastActivity ${lastActivityDays}d, plateau ${plateau}, learning ${Math.round(learningScore)}%`,
          recommendation,
        },
      });
      await db.notification.create({
        data: {
          userId: profile.userId,
          type: "INTERVENTION_RECOMMENDED",
          title: "Rekomendasi intervensi",
          message: recommendation,
          actionUrl: "/dashboard",
        },
      });
    }
  }

  // Milestone notification (only if milestone rose)
  if (triHistory && milestoneRank(milestone) > milestoneRank(milestoneFor(triHistory.score))) {
    await db.notification.create({
      data: {
        userId: profile.userId,
        type: "MILESTONE_REACHED",
        title: `Milestone baru: ${milestone}`,
        message: `Selamat! TRI Anda menembus ambang ${milestone}. Pertahankan momentum.`,
        actionUrl: "/dashboard",
      },
    });
  }

  return {
    score,
    milestone,
    assessmentScore: Math.round(assessmentScore),
    roleFitScore: Math.round(roleFitScore),
    learningScore: Math.round(learningScore),
    mentoringScore: Math.round(mentoringScore),
    portfolioScore: Math.round(portfolioScore),
    consistencyScore: Math.round(consistencyScore),
  };
}

function milestoneRank(m: TRIMilestone): number {
  return ["EMERGING", "DEVELOPING", "PROGRESSING", "CAREER_READY", "ADVANCED_READY"].indexOf(m);
}

export async function logActivity(
  userId: string,
  action: string,
  description?: string,
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await db.activityLog.create({
      data: { userId, action, description, metadata },
    });
    await db.learnerProfile.updateMany({
      where: { userId },
      data: { lastActiveAt: new Date() },
    });
  } catch (err) {
    console.error("logActivity error", err);
  }
}

export interface BadgeCheckContext {
  userId: string;
  learnerId?: string;
  event:
    | "ASSESSMENT_COMPLETED"
    | "MODULE_COMPLETED"
    | "PORTFOLIO_VALIDATED"
    | "MENTORING_COMPLETED"
    | "TRI_UPDATED";
}

export async function checkAndAwardBadges(ctx: BadgeCheckContext): Promise<string[]> {
  const awarded: string[] = [];
  try {
    const badges = await db.badge.findMany();
    const existing = await db.userBadge.findMany({
      where: { userId: ctx.userId },
      select: { badgeId: true },
    });
    const held = new Set(existing.map((e) => e.badgeId));

    for (const badge of badges) {
      if (held.has(badge.id)) continue;

      let earn = false;
      if (badge.criteria === "Complete first assessment" && ctx.event === "ASSESSMENT_COMPLETED") {
        const count = await db.assessmentSession.count({
          where: { learner: { userId: ctx.userId }, status: "completed" },
        });
        earn = count >= 1;
      } else if (badge.criteria === "7-day streak") {
        const profile = await db.learnerProfile.findUnique({
          where: { userId: ctx.userId },
          select: { streakDays: true },
        });
        earn = (profile?.streakDays ?? 0) >= 7;
      } else if (badge.criteria === "First mentoring session" && ctx.event === "MENTORING_COMPLETED") {
        const count = await db.mentoringSession.count({
          where: { menteeId: ctx.userId, status: "COMPLETED" },
        });
        earn = count >= 1;
      }

      if (earn) {
        await db.userBadge.create({
          data: { userId: ctx.userId, badgeId: badge.id },
        });
        await db.notification.create({
          data: {
            userId: ctx.userId,
            type: "BADGE_EARNED",
            title: `Badge baru: ${badge.name}`,
            message: badge.description,
            actionUrl: "/achievements",
          },
        });
        awarded.push(badge.name);
      }
    }
  } catch (err) {
    console.error("checkAndAwardBadges error", err);
  }
  return awarded;
}
