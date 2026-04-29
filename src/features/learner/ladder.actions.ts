"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MAX_LEVEL_DEFAULT = 5;

export interface LadderSkillDelta {
  skillId: string;
  name: string;
  currentPct: number;
  targetPct: number;
  gap: number;
  isCritical: boolean;
}

export interface LadderStep {
  slug: string;
  name: string;
  industry: string;
  demandLevel: string;
  isCurrent: boolean;
  fitScore: number;
  sharedSkillCount: number;
  newSkillCount: number;
  transitionCostPct: number;
  estimatedWeeks: number | null;
  newSkills: LadderSkillDelta[];
  upgradeSkills: LadderSkillDelta[];
  readyCriticalCount: number;
  totalCriticalCount: number;
}

export interface LadderResult {
  weeklyHours: number;
  currentRole: LadderStep;
  adjacent: LadderStep[];
  shortestTransitionSlug: string | null;
  insight: string;
}

type RoleWithReqs = {
  slug: string;
  name: string;
  industry: string;
  demandLevel: string;
  adjacentRoles: string[];
  skillRequirements: {
    skillId: string;
    targetLevel: number;
    importanceWeight: number;
    isCritical: boolean;
    skill: { name: string; maxLevel: number };
  }[];
};

function computeStep(
  role: RoleWithReqs,
  currentScores: Map<string, number>,
  currentSkillIds: Set<string>,
  weeklyHours: number,
  isCurrent: boolean,
): LadderStep {
  const reqs = role.skillRequirements;
  let weightedCoverage = 0;
  let weightedTotal = 0;
  let readyCritical = 0;
  const newSkills: LadderSkillDelta[] = [];
  const upgradeSkills: LadderSkillDelta[] = [];
  let totalGap = 0;

  for (const r of reqs) {
    const currentPct = currentScores.get(r.skillId) ?? 0;
    const targetPct = (r.targetLevel / (r.skill.maxLevel || MAX_LEVEL_DEFAULT)) * 100;
    const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
    weightedCoverage += coverage * r.importanceWeight;
    weightedTotal += r.importanceWeight;

    const gap = Math.max(0, targetPct - currentPct);
    totalGap += gap * r.importanceWeight;

    if (r.isCritical && currentPct >= targetPct - 10) readyCritical++;

    const delta: LadderSkillDelta = {
      skillId: r.skillId,
      name: r.skill.name,
      currentPct: Math.round(currentPct),
      targetPct: Math.round(targetPct),
      gap: Math.round(gap),
      isCritical: r.isCritical,
    };

    if (gap >= 5) {
      if (currentSkillIds.has(r.skillId) && currentPct > 0) {
        upgradeSkills.push(delta);
      } else {
        newSkills.push(delta);
      }
    }
  }

  newSkills.sort((a, b) => (Number(b.isCritical) - Number(a.isCritical)) || b.gap - a.gap);
  upgradeSkills.sort((a, b) => (Number(b.isCritical) - Number(a.isCritical)) || b.gap - a.gap);

  const fitScore = weightedTotal > 0 ? Math.round((weightedCoverage / weightedTotal) * 100) : 0;
  const transitionCostPct = weightedTotal > 0 ? totalGap / weightedTotal : 0;

  const sharedSkillIds = reqs.filter((r) => currentSkillIds.has(r.skillId));
  const sharedSkillCount = sharedSkillIds.length;
  const newSkillCount = reqs.length - sharedSkillCount;

  const weeksPerPct = 1 / Math.max(weeklyHours * 2, 1);
  const estimatedWeeks =
    transitionCostPct > 0 ? Math.max(1, Math.round(transitionCostPct * weeksPerPct)) : null;

  return {
    slug: role.slug,
    name: role.name,
    industry: role.industry,
    demandLevel: role.demandLevel,
    isCurrent,
    fitScore,
    sharedSkillCount,
    newSkillCount,
    transitionCostPct: Math.round(transitionCostPct),
    estimatedWeeks,
    newSkills: newSkills.slice(0, 4),
    upgradeSkills: upgradeSkills.slice(0, 4),
    readyCriticalCount: readyCritical,
    totalCriticalCount: reqs.filter((r) => r.isCritical).length,
  };
}

export async function getCareerLadderAction(): Promise<
  { ok: true; data: LadderResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        weeklyHours: true,
        targetCareerRoleId: true,
      },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };
    if (!profile.targetCareerRoleId) {
      return {
        ok: false,
        error: "Pilih target career role di profil agar Career Ladder aktif.",
      };
    }

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: profile.id },
      orderBy: { snapshotAt: "desc" },
      select: { skillId: true, score: true },
    });
    const currentScores = new Map<string, number>();
    for (const s of snapshots) {
      if (!currentScores.has(s.skillId)) currentScores.set(s.skillId, s.score);
    }
    const currentSkillIds = new Set(currentScores.keys());

    const targetRole = await db.careerRole.findUnique({
      where: { id: profile.targetCareerRoleId },
      select: {
        slug: true,
        name: true,
        industry: true,
        demandLevel: true,
        adjacentRoles: true,
        skillRequirements: {
          select: {
            skillId: true,
            targetLevel: true,
            importanceWeight: true,
            isCritical: true,
            skill: { select: { name: true, maxLevel: true } },
          },
        },
      },
    });
    if (!targetRole) {
      return { ok: false, error: "Target role tidak ditemukan." };
    }

    const weeklyHours = profile.weeklyHours || 5;
    const current = computeStep(
      targetRole as RoleWithReqs,
      currentScores,
      currentSkillIds,
      weeklyHours,
      true,
    );

    const adjacentNames = targetRole.adjacentRoles ?? [];
    const adjacentRoles =
      adjacentNames.length > 0
        ? await db.careerRole.findMany({
            where: { name: { in: adjacentNames } },
            select: {
              slug: true,
              name: true,
              industry: true,
              demandLevel: true,
              adjacentRoles: true,
              skillRequirements: {
                select: {
                  skillId: true,
                  targetLevel: true,
                  importanceWeight: true,
                  isCritical: true,
                  skill: { select: { name: true, maxLevel: true } },
                },
              },
            },
          })
        : [];

    const adjacent = adjacentRoles
      .map((r) => computeStep(r as RoleWithReqs, currentScores, currentSkillIds, weeklyHours, false))
      .sort((a, b) => a.transitionCostPct - b.transitionCostPct);

    const shortest = adjacent[0] ?? null;
    const shortestTransitionSlug = shortest?.slug ?? null;

    let insight: string;
    if (adjacent.length === 0) {
      insight =
        "Target role belum memiliki adjacent roles — tambahkan data adjacency untuk melihat jalur pivot.";
    } else if (shortest && shortest.transitionCostPct < 15) {
      insight = `Pivot ke ${shortest.name} sangat ringan — hanya ${shortest.transitionCostPct}% gap tersisa. Bisa dijadikan track sekunder.`;
    } else if (shortest && shortest.transitionCostPct < 35) {
      insight = `${shortest.name} adalah pivot termurah (${shortest.transitionCostPct}% gap · ±${shortest.estimatedWeeks} minggu).`;
    } else {
      insight = "Adjacent roles membutuhkan investasi signifikan — fokuskan dulu pada target utama.";
    }

    return {
      ok: true,
      data: {
        weeklyHours,
        currentRole: current,
        adjacent,
        shortestTransitionSlug,
        insight,
      },
    };
  } catch (err) {
    console.error("getCareerLadderAction error", err);
    return { ok: false, error: "Gagal memuat Career Ladder." };
  }
}
