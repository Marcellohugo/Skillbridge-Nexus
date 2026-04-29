"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CompassRoleRanking {
  slug: string;
  name: string;
  industry: string;
  demandLevel: string;
  fitScore: number;
  criticalMet: number;
  criticalTotal: number;
  topStrength: string | null;
  topGap: string | null;
  badge: "rising" | "stretch" | "foundation" | "explore";
  isTarget: boolean;
}

export interface CompassResult {
  rankings: CompassRoleRanking[];
  targetSlug: string | null;
  weeklyHours: number;
  totalRolesEvaluated: number;
}

export async function getCareerCompassAction(): Promise<
  { ok: true; data: CompassResult } | { ok: false; error: string }
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
        targetCareerRole: { select: { slug: true } },
      },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: profile.id },
      orderBy: { snapshotAt: "desc" },
      select: { skillId: true, score: true },
    });
    const latest = new Map<string, number>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);
    }

    const allRoles = await db.careerRole.findMany({
      select: {
        slug: true,
        name: true,
        industry: true,
        demandLevel: true,
        skillRequirements: {
          select: {
            skillId: true,
            targetLevel: true,
            importanceWeight: true,
            isCritical: true,
            isFoundational: true,
            skill: { select: { name: true, maxLevel: true } },
          },
        },
      },
    });

    const rankings: CompassRoleRanking[] = [];
    for (const role of allRoles) {
      const reqs = role.skillRequirements;
      if (reqs.length === 0) continue;

      let weightedCoverage = 0;
      let weightedTotal = 0;
      let criticalMet = 0;
      let criticalTotal = 0;
      let foundationalCoverage = 0;
      let foundationalTotal = 0;
      let bestStrength: { name: string; pct: number } | null = null;
      let worstGap: { name: string; pct: number } | null = null;

      for (const r of reqs) {
        const currentPct = latest.get(r.skillId) ?? 0;
        const targetPct = (r.targetLevel / (r.skill.maxLevel || 5)) * 100;
        const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
        weightedCoverage += coverage * r.importanceWeight;
        weightedTotal += r.importanceWeight;

        if (r.isCritical) {
          criticalTotal += 1;
          if (currentPct >= targetPct - 10) criticalMet += 1;
        }
        if (r.isFoundational) {
          foundationalCoverage += coverage;
          foundationalTotal += 1;
        }

        const relative = currentPct - targetPct;
        if (currentPct >= targetPct * 0.7 && (!bestStrength || relative > bestStrength.pct)) {
          bestStrength = { name: r.skill.name, pct: relative };
        }
        const gap = targetPct - currentPct;
        if (gap > 15 && (!worstGap || gap > worstGap.pct)) {
          worstGap = { name: r.skill.name, pct: gap };
        }
      }

      const fitScore = weightedTotal > 0 ? Math.round((weightedCoverage / weightedTotal) * 100) : 0;
      const foundationalPct = foundationalTotal > 0 ? foundationalCoverage / foundationalTotal : 0;

      let badge: CompassRoleRanking["badge"];
      if (fitScore >= 70) badge = "rising";
      else if (fitScore >= 45) badge = "stretch";
      else if (foundationalPct >= 0.6) badge = "foundation";
      else badge = "explore";

      rankings.push({
        slug: role.slug,
        name: role.name,
        industry: role.industry,
        demandLevel: role.demandLevel,
        fitScore,
        criticalMet,
        criticalTotal,
        topStrength: bestStrength?.name ?? null,
        topGap: worstGap?.name ?? null,
        badge,
        isTarget: role.slug === profile.targetCareerRole?.slug,
      });
    }

    rankings.sort((a, b) => {
      if (a.isTarget && !b.isTarget) return -1;
      if (!a.isTarget && b.isTarget) return 1;
      return b.fitScore - a.fitScore;
    });

    return {
      ok: true,
      data: {
        rankings: rankings.slice(0, 5),
        targetSlug: profile.targetCareerRole?.slug ?? null,
        weeklyHours: profile.weeklyHours || 5,
        totalRolesEvaluated: rankings.length,
      },
    };
  } catch (err) {
    console.error("getCareerCompassAction error", err);
    return { ok: false, error: "Gagal memuat Career Compass." };
  }
}
