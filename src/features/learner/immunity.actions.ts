"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const CATEGORY_RESILIENCE: Record<string, number> = {
  // Very high resilience — stakeholder judgment, empathy, narrative
  "Soft Skills": 0.92,
  "Manajemen Proyek": 0.8,
  "Bisnis & Manajemen": 0.78,
  // High — creative and human-facing craft
  "UI/UX Design": 0.82,
  "Kreatif & Konten": 0.72,
  // Moderate — analytical with automation pressure
  "Data & Analytics": 0.66,
  "Pemasaran Digital": 0.62,
  // Medium-low — routine work increasingly automated
  "Frontend Development": 0.58,
  "Keuangan & Akuntansi": 0.55,
  Pemrograman: 0.52,
  "Backend Development": 0.48,
};
const DEFAULT_RESILIENCE = 0.6;

export type ImmunityTier = "fortress" | "resilient" | "exposed" | "vulnerable";

export interface CategoryBreakdown {
  category: string;
  resilience: number;
  avgScore: number;
  contribution: number;
  skillCount: number;
}

export interface ImmunitySkill {
  skillId: string;
  name: string;
  category: string;
  score: number;
  resilience: number;
  immunityContribution: number;
}

export interface ImmunityResult {
  immunityIndex: number;
  tier: ImmunityTier;
  tierLabel: string;
  tierTone: "success" | "brand" | "warning" | "danger";
  categoryBreakdown: CategoryBreakdown[];
  fortressSkills: ImmunitySkill[];
  exposedSkills: ImmunitySkill[];
  stackBalance: number;
  verdict: string;
  recommendation: string;
  totalSkills: number;
}

function toImmunitySkill(skill: ImmunitySkill): ImmunitySkill {
  return {
    skillId: skill.skillId,
    name: skill.name,
    category: skill.category,
    score: skill.score,
    resilience: skill.resilience,
    immunityContribution: skill.immunityContribution,
  };
}

export async function getSkillImmunityAction(): Promise<
  { ok: true; data: ImmunityResult } | { ok: false; error: string }
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

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: profile.id },
      orderBy: { snapshotAt: "desc" },
      select: {
        skillId: true,
        score: true,
        skill: {
          select: {
            name: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    const latest = new Map<string, typeof snapshots[number]>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s);
    }

    const skills: ImmunitySkill[] = [];
    for (const [skillId, s] of latest) {
      const cat = s.skill.category.name;
      const resilience = CATEGORY_RESILIENCE[cat] ?? DEFAULT_RESILIENCE;
      skills.push({
        skillId,
        name: s.skill.name,
        category: cat,
        score: Math.round(s.score),
        resilience,
        immunityContribution: (s.score * resilience) / 100,
      });
    }

    if (skills.length === 0) {
      return {
        ok: true,
        data: {
          immunityIndex: 0,
          tier: "vulnerable",
          tierLabel: "Data belum cukup",
          tierTone: "warning",
          categoryBreakdown: [],
          fortressSkills: [],
          exposedSkills: [],
          stackBalance: 0,
          verdict: "Belum ada snapshot skill untuk dievaluasi.",
          recommendation: "Selesaikan 1 assessment untuk mengaktifkan Immunity Index.",
          totalSkills: 0,
        },
      };
    }

    const totalScore = skills.reduce((a, s) => a + s.score, 0);
    const weightedResilience = skills.reduce((a, s) => a + s.score * s.resilience, 0);
    const immunityIndex = totalScore > 0 ? Math.round((weightedResilience / totalScore) * 100) : 0;

    const byCategory = new Map<string, { scores: number[]; resilience: number }>();
    for (const s of skills) {
      const entry = byCategory.get(s.category);
      if (entry) entry.scores.push(s.score);
      else byCategory.set(s.category, { scores: [s.score], resilience: s.resilience });
    }
    const categoryBreakdown: CategoryBreakdown[] = Array.from(byCategory.entries())
      .map(([category, { scores, resilience }]) => {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        return {
          category,
          resilience,
          avgScore: Math.round(avgScore),
          contribution: Math.round(avgScore * resilience),
          skillCount: scores.length,
        };
      })
      .sort((a, b) => b.contribution - a.contribution);

    const highResilienceCategories = categoryBreakdown.filter((c) => c.resilience >= 0.75).length;
    const totalCategories = categoryBreakdown.length;
    const stackBalance = totalCategories > 0
      ? Math.round((highResilienceCategories / totalCategories) * 100)
      : 0;

    const scored = skills.map((s) => ({
      ...s,
      fortressScore: s.score * s.resilience,
      exposureScore: s.score * (1 - s.resilience),
    }));

    const fortressSkills = [...scored]
      .filter((s) => s.resilience >= 0.7 && s.score >= 50)
      .sort((a, b) => b.fortressScore - a.fortressScore)
      .slice(0, 4)
      .map(toImmunitySkill);

    const exposedSkills = [...scored]
      .filter((s) => s.resilience < 0.6 && s.score >= 50)
      .sort((a, b) => b.exposureScore - a.exposureScore)
      .slice(0, 4)
      .map(toImmunitySkill);

    let tier: ImmunityTier;
    let tierLabel: string;
    let tierTone: ImmunityResult["tierTone"];
    if (immunityIndex >= 75) {
      tier = "fortress";
      tierLabel = "Fortress";
      tierTone = "success";
    } else if (immunityIndex >= 60) {
      tier = "resilient";
      tierLabel = "Resilient";
      tierTone = "brand";
    } else if (immunityIndex >= 45) {
      tier = "exposed";
      tierLabel = "Exposed";
      tierTone = "warning";
    } else {
      tier = "vulnerable";
      tierLabel = "Vulnerable";
      tierTone = "danger";
    }

    let verdict: string;
    let recommendation: string;
    if (tier === "fortress") {
      verdict = "Stack Anda didominasi skill yang sulit diotomasi.";
      recommendation = "Pertahankan keseimbangan — jangan abaikan skill teknis agar tetap relevan.";
    } else if (tier === "resilient") {
      verdict = "Stack seimbang — kombinasi teknis + human-essential.";
      recommendation = exposedSkills.length > 0
        ? `Pertimbangkan tambah skill human-essential untuk menyeimbangkan ${exposedSkills[0]?.name ?? "skill teknis"}.`
        : "Perkuat 1–2 skill kategori Soft Skills, UI/UX, Kreatif, atau Manajemen Proyek untuk naik ke Fortress.";
    } else if (tier === "exposed") {
      verdict = "Stack condong ke skill yang rentan otomasi.";
      recommendation = "Bangun 1 skill kategori Soft Skills, Manajemen Proyek, Bisnis, atau Kreatif untuk naikkan immunity.";
    } else {
      verdict = "Stack didominasi skill yang bisa digantikan otomasi.";
      recommendation = "Prioritaskan skill komunikasi, kreatif, atau analitis sebagai pelindung karier.";
    }

    return {
      ok: true,
      data: {
        immunityIndex,
        tier,
        tierLabel,
        tierTone,
        categoryBreakdown,
        fortressSkills,
        exposedSkills,
        stackBalance,
        verdict,
        recommendation,
        totalSkills: skills.length,
      },
    };
  } catch (err) {
    console.error("getSkillImmunityAction error", err);
    return { ok: false, error: "Gagal memuat Skill Immunity." };
  }
}
