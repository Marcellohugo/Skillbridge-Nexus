"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface MarketRoleBreakdown {
  slug: string;
  name: string;
  fitScore: number;
  estimatedLow: number;
  estimatedHigh: number;
  demandLevel: string;
  salaryRange: string;
}

export interface MarketValueResult {
  estimatedLow: number;
  estimatedHigh: number;
  marketReadyScore: number;
  readinessLabel: string;
  readinessHint: string;
  topRole: MarketRoleBreakdown | null;
  byRole: MarketRoleBreakdown[];
  totalRolesConsidered: number;
}

function parseSalaryRange(raw: string | null | undefined): { low: number; high: number } {
  if (!raw) return { low: 0, high: 0 };
  const matches = raw.match(/(\d+)[^0-9]+(\d+)/);
  if (!matches) return { low: 0, high: 0 };
  const low = parseInt(matches[1], 10) * 1_000_000;
  const high = parseInt(matches[2], 10) * 1_000_000;
  return { low, high };
}

export async function getMarketValueAction(): Promise<
  { ok: true; data: MarketValueResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const [snapshots, roles] = await Promise.all([
      db.skillScoreSnapshot.findMany({
        where: { learnerId: profile.id },
        orderBy: { snapshotAt: "desc" },
        select: { skillId: true, score: true },
      }),
      db.careerRole.findMany({
        select: {
          slug: true,
          name: true,
          demandLevel: true,
          salaryRange: true,
          skillRequirements: {
            select: {
              skillId: true,
              targetLevel: true,
              importanceWeight: true,
              skill: { select: { maxLevel: true } },
            },
          },
        },
      }),
    ]);

    const latest = new Map<string, number>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);
    }

    const evaluated: MarketRoleBreakdown[] = [];
    for (const role of roles) {
      if (role.skillRequirements.length === 0) continue;
      let covered = 0;
      let totalW = 0;
      for (const r of role.skillRequirements) {
        const currentPct = latest.get(r.skillId) ?? 0;
        const targetPct = (r.targetLevel / (r.skill.maxLevel || 5)) * 100;
        const coverage = Math.min(currentPct / Math.max(targetPct, 1), 1);
        covered += coverage * r.importanceWeight;
        totalW += r.importanceWeight;
      }
      const fit = totalW > 0 ? covered / totalW : 0;
      const { low, high } = parseSalaryRange(role.salaryRange);

      const demandMultiplier =
        role.demandLevel === "very_high"
          ? 1.08
          : role.demandLevel === "high"
            ? 1.0
            : role.demandLevel === "medium"
              ? 0.92
              : 0.85;

      const estLow = Math.round(low * fit * demandMultiplier);
      const estHigh = Math.round(high * fit * demandMultiplier);

      evaluated.push({
        slug: role.slug,
        name: role.name,
        fitScore: Math.round(fit * 100),
        estimatedLow: estLow,
        estimatedHigh: estHigh,
        demandLevel: role.demandLevel,
        salaryRange: role.salaryRange || "—",
      });
    }

    evaluated.sort((a, b) => b.estimatedHigh - a.estimatedHigh);

    const top = evaluated[0] ?? null;
    const avgFit =
      evaluated.length > 0
        ? evaluated.reduce((s, r) => s + r.fitScore, 0) / evaluated.length
        : 0;

    const marketReadyScore = top ? Math.round(top.fitScore * 0.7 + avgFit * 0.3) : 0;

    let readinessLabel = "Building foundation";
    let readinessHint = "Fokus membangun 2-3 skill inti untuk membuka opsi role.";
    if (marketReadyScore >= 75) {
      readinessLabel = "Market ready";
      readinessHint = "Kamu siap apply. Mulai polish resume, portfolio, dan network di target role.";
    } else if (marketReadyScore >= 55) {
      readinessLabel = "Nearly ready";
      readinessHint = "Kamu sudah di 70% jalan. Tutup gap kritis di top-role untuk maksimalkan band atas.";
    } else if (marketReadyScore >= 35) {
      readinessLabel = "Momentum phase";
      readinessHint = "Skill inti mulai tumbuh. Pertahankan konsistensi 4-8 minggu untuk breakthrough.";
    }

    return {
      ok: true,
      data: {
        estimatedLow: top?.estimatedLow ?? 0,
        estimatedHigh: top?.estimatedHigh ?? 0,
        marketReadyScore,
        readinessLabel,
        readinessHint,
        topRole: top,
        byRole: evaluated.slice(0, 5),
        totalRolesConsidered: evaluated.length,
      },
    };
  } catch (err) {
    console.error("getMarketValueAction error", err);
    return { ok: false, error: "Gagal menghitung market value." };
  }
}

