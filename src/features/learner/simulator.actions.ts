"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface RoleOption {
  slug: string;
  name: string;
  industry: string;
  demandLevel: string;
}

export interface SimulationResult {
  role: RoleOption;
  fitScore: number;
  gapPoints: number;
  criticalGaps: Array<{ skill: string; current: number; target: number }>;
  strengthMatches: Array<{ skill: string; level: number }>;
  weeksToReady: number;
  summary: string;
}

export async function listCareerRolesAction(): Promise<
  { ok: true; roles: RoleOption[] } | { ok: false; error: string }
> {
  try {
    const rows = await db.careerRole.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, industry: true, demandLevel: true },
      take: 40,
    });
    return { ok: true, roles: rows };
  } catch (err) {
    console.error("listCareerRolesAction error", err);
    return { ok: false, error: "Gagal memuat daftar role." };
  }
}

export async function simulateCareerPathAction(
  roleSlug: string,
): Promise<{ ok: true; data: SimulationResult } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const role = await db.careerRole.findUnique({
      where: { slug: roleSlug },
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
            skill: { select: { name: true, maxLevel: true } },
          },
        },
      },
    });
    if (!role) return { ok: false, error: "Role tidak ditemukan." };

    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true, weeklyHours: true },
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

    const reqs = role.skillRequirements;
    if (reqs.length === 0) {
      return {
        ok: false,
        error: "Role ini belum punya skill requirements.",
      };
    }

    let weightedCoverage = 0;
    let weightedTotal = 0;
    const criticalGaps: SimulationResult["criticalGaps"] = [];
    const strengthMatches: SimulationResult["strengthMatches"] = [];
    let totalGapUnits = 0;

    for (const r of reqs) {
      const current = latest.get(r.skillId) ?? 0;
      const targetPct = (r.targetLevel / (r.skill.maxLevel || 5)) * 100;
      const currentPct = current;
      const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
      weightedCoverage += coverage * r.importanceWeight;
      weightedTotal += r.importanceWeight;

      const gap = Math.max(0, targetPct - currentPct);
      totalGapUnits += gap * r.importanceWeight;

      if (r.isCritical && currentPct < targetPct - 10) {
        criticalGaps.push({ skill: r.skill.name, current: Math.round(currentPct), target: Math.round(targetPct) });
      } else if (currentPct >= targetPct - 5) {
        strengthMatches.push({ skill: r.skill.name, level: Math.round(currentPct) });
      }
    }

    const fitScore = weightedTotal > 0 ? Math.round((weightedCoverage / weightedTotal) * 100) : 0;
    const weeklyHours = profile.weeklyHours || 5;
    const weeksToReady = Math.max(
      1,
      Math.ceil(totalGapUnits / (weeklyHours * 2.5 * Math.max(weightedTotal, 1))),
    );

    const summary =
      fitScore >= 75
        ? `Kamu sudah cocok untuk ${role.name} — fokus pada ${criticalGaps.length} skill kritis untuk finishing.`
        : fitScore >= 50
          ? `Potensi bagus di ${role.name}. Butuh ~${weeksToReady} minggu konsisten untuk siap.`
          : `${role.name} masih jauh — pertimbangkan role lain atau investasi skill inti dulu.`;

    return {
      ok: true,
      data: {
        role: { slug: role.slug, name: role.name, industry: role.industry, demandLevel: role.demandLevel },
        fitScore,
        gapPoints: Math.round(totalGapUnits / Math.max(weightedTotal, 1)),
        criticalGaps: criticalGaps.slice(0, 4),
        strengthMatches: strengthMatches.slice(0, 4),
        weeksToReady,
        summary,
      },
    };
  } catch (err) {
    console.error("simulateCareerPathAction error", err);
    return { ok: false, error: "Gagal menjalankan simulasi." };
  }
}
