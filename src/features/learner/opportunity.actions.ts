"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const MAX_LEVEL_DEFAULT = 5;
const TOP_N = 5;

export type RoleFamily =
  | "Tech"
  | "Design"
  | "Analytics"
  | "Marketing"
  | "Management"
  | "Other";

const FAMILY_BY_SLUG: Record<string, RoleFamily> = {
  "frontend-developer": "Tech",
  "backend-developer": "Tech",
  "ui-ux-designer": "Design",
  "data-analyst": "Analytics",
  "financial-analyst": "Analytics",
  "product-manager": "Management",
  "project-manager": "Management",
  "digital-marketing-specialist": "Marketing",
  "content-strategist": "Marketing",
};

const FAMILY_LABEL: Record<RoleFamily, string> = {
  Tech: "Tech & Engineering",
  Design: "Design",
  Analytics: "Analytics & Finance",
  Marketing: "Marketing & Content",
  Management: "Product & Project",
  Other: "Lainnya",
};

export interface OpportunityGap {
  skillId: string;
  name: string;
  currentPct: number;
  targetPct: number;
  gap: number;
  isCritical: boolean;
}

export interface OpportunityRole {
  slug: string;
  name: string;
  industry: string;
  demandLevel: string;
  family: RoleFamily;
  familyLabel: string;
  fitScore: number;
  transitionCostPct: number;
  estimatedWeeks: number | null;
  surpriseScore: number;
  crossFamily: boolean;
  readyCriticalCount: number;
  totalCriticalCount: number;
  blockingGaps: OpportunityGap[];
}

export interface OpportunityResult {
  weeklyHours: number;
  targetRoleName: string;
  targetFamily: RoleFamily;
  targetFamilyLabel: string;
  medianFit: number;
  scannedCount: number;
  crossFamilyCount: number;
  opportunities: OpportunityRole[];
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

function computeFitAndCost(
  role: RoleWithReqs,
  currentScores: Map<string, number>,
): {
  fitScore: number;
  transitionCostPct: number;
  blockingGaps: OpportunityGap[];
  readyCritical: number;
  totalCritical: number;
} {
  const reqs = role.skillRequirements;
  let weightedCoverage = 0;
  let weightedTotal = 0;
  let totalGap = 0;
  let readyCritical = 0;
  let totalCritical = 0;
  const gaps: OpportunityGap[] = [];

  for (const r of reqs) {
    const maxLevel = r.skill.maxLevel || MAX_LEVEL_DEFAULT;
    const currentPct = currentScores.get(r.skillId) ?? 0;
    const targetPct = (r.targetLevel / maxLevel) * 100;
    const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
    weightedCoverage += coverage * r.importanceWeight;
    weightedTotal += r.importanceWeight;

    const gap = Math.max(0, targetPct - currentPct);
    totalGap += gap * r.importanceWeight;

    if (r.isCritical) {
      totalCritical++;
      if (currentPct >= targetPct - 10) readyCritical++;
    }

    if (gap >= 5) {
      gaps.push({
        skillId: r.skillId,
        name: r.skill.name,
        currentPct: Math.round(currentPct),
        targetPct: Math.round(targetPct),
        gap: Math.round(gap),
        isCritical: r.isCritical,
      });
    }
  }

  gaps.sort(
    (a, b) => Number(b.isCritical) - Number(a.isCritical) || b.gap - a.gap,
  );

  return {
    fitScore:
      weightedTotal > 0 ? Math.round((weightedCoverage / weightedTotal) * 100) : 0,
    transitionCostPct: weightedTotal > 0 ? totalGap / weightedTotal : 0,
    blockingGaps: gaps,
    readyCritical,
    totalCritical,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export async function getOpportunityRadarAction(): Promise<
  { ok: true; data: OpportunityResult } | { ok: false; error: string }
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
        error: "Pilih target career role di profil agar Opportunity Radar aktif.",
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

    const targetRole = await db.careerRole.findUnique({
      where: { id: profile.targetCareerRoleId },
      select: { slug: true, name: true, adjacentRoles: true },
    });
    if (!targetRole) return { ok: false, error: "Target role tidak ditemukan." };

    const excludedNames = new Set<string>([targetRole.name]);
    for (const n of targetRole.adjacentRoles ?? []) excludedNames.add(n);

    const allRoles = await db.careerRole.findMany({
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

    const weeklyHours = profile.weeklyHours || 5;
    const weeksPerPct = 1 / Math.max(weeklyHours * 2, 1);

    const candidates = allRoles.filter((r) => !excludedNames.has(r.name));
    const allFitScores: number[] = [];
    const scored = candidates.map((r) => {
      const metrics = computeFitAndCost(r as RoleWithReqs, currentScores);
      allFitScores.push(metrics.fitScore);
      const family = FAMILY_BY_SLUG[r.slug] ?? "Other";
      return { role: r, metrics, family };
    });

    const medianFit = Math.round(median(allFitScores));
    const targetFamily = FAMILY_BY_SLUG[targetRole.slug] ?? "Other";

    const opportunities: OpportunityRole[] = scored
      .sort((a, b) => b.metrics.fitScore - a.metrics.fitScore)
      .slice(0, TOP_N)
      .map(({ role, metrics, family }) => {
        const estimatedWeeks =
          metrics.transitionCostPct > 0
            ? Math.max(1, Math.round(metrics.transitionCostPct * weeksPerPct))
            : null;
        return {
          slug: role.slug,
          name: role.name,
          industry: role.industry,
          demandLevel: role.demandLevel,
          family,
          familyLabel: FAMILY_LABEL[family],
          fitScore: metrics.fitScore,
          transitionCostPct: Math.round(metrics.transitionCostPct),
          estimatedWeeks,
          surpriseScore: Math.round(metrics.fitScore - medianFit),
          crossFamily: family !== targetFamily,
          readyCriticalCount: metrics.readyCritical,
          totalCriticalCount: metrics.totalCritical,
          blockingGaps: metrics.blockingGaps.slice(0, 2),
        };
      });

    const crossFamilyCount = opportunities.filter((o) => o.crossFamily).length;

    let insight: string;
    if (opportunities.length === 0) {
      insight =
        "Semua role di sistem sudah jadi target atau adjacent. Tambah role untuk memperluas radar.";
    } else {
      const top = opportunities[0];
      if (top.fitScore >= 70 && top.crossFamily) {
        insight = `Kejutan: Anda ${top.fitScore}% fit untuk ${top.name} di domain ${top.familyLabel} — jalur pivot lintas-domain yang nyaris siap.`;
      } else if (top.fitScore >= 70) {
        insight = `${top.name} menunjukkan fit ${top.fitScore}% meski bukan target utama. Layak dipertimbangkan sebagai track sekunder.`;
      } else if (top.fitScore >= 55) {
        insight = `Top discovery: ${top.name} pada ${top.fitScore}%. ${top.surpriseScore > 0 ? `+${top.surpriseScore}` : top.surpriseScore} di atas median — investasi ringan bisa membuka peluang.`;
      } else {
        insight =
          "Semua role non-target masih jauh dari siap. Fokuskan energi ke target utama dulu.";
      }
    }

    return {
      ok: true,
      data: {
        weeklyHours,
        targetRoleName: targetRole.name,
        targetFamily,
        targetFamilyLabel: FAMILY_LABEL[targetFamily],
        medianFit,
        scannedCount: candidates.length,
        crossFamilyCount,
        opportunities,
        insight,
      },
    };
  } catch (err) {
    console.error("getOpportunityRadarAction error", err);
    return { ok: false, error: "Gagal memuat Opportunity Radar." };
  }
}
