"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type DecayTier = "fresh" | "warming" | "fading" | "decayed";

export interface DecaySkill {
  skillId: string;
  name: string;
  category: string | null;
  lastScore: number;
  effectiveScore: number;
  retention: number;
  daysSince: number;
  halfLifeDays: number;
  tier: DecayTier;
  tierLabel: string;
  refreshMinutes: number;
  suggestedAction: string;
  isTargetSkill: boolean;
}

export interface SkillDecayResult {
  skills: DecaySkill[];
  atRiskCount: number;
  averageRetention: number;
  healthScore: number;
  lastTouch: string | null;
  targetRoleName: string | null;
}

const TIER_THRESHOLDS = {
  fresh: 0.9,
  warming: 0.75,
  fading: 0.5,
} as const;

function halfLifeFor(score: number, confidence: number): number {
  const base = 7;
  const scoreMultiplier = 0.5 + (score / 100) * 1.5;
  const confMultiplier = 0.7 + (confidence / 5) * 0.6;
  return Math.max(3, base * scoreMultiplier * confMultiplier);
}

function retentionOf(daysSince: number, halfLifeDays: number): number {
  if (daysSince <= 0) return 1;
  return Math.pow(0.5, daysSince / halfLifeDays);
}

function tierFor(retention: number): { tier: DecayTier; label: string } {
  if (retention >= TIER_THRESHOLDS.fresh) return { tier: "fresh", label: "Masih segar" };
  if (retention >= TIER_THRESHOLDS.warming) return { tier: "warming", label: "Mulai menghangat" };
  if (retention >= TIER_THRESHOLDS.fading) return { tier: "fading", label: "Mulai memudar" };
  return { tier: "decayed", label: "Butuh refresh" };
}

function actionFor(tier: DecayTier, name: string, daysSince: number): { minutes: number; text: string } {
  if (tier === "fresh") {
    return { minutes: 5, text: `Pertahankan dengan quick check ${name}.` };
  }
  if (tier === "warming") {
    return { minutes: 15, text: `15 menit recall: tulis ringkasan konsep utama ${name}.` };
  }
  if (tier === "fading") {
    return { minutes: 30, text: `Praktik ulang ${name} dengan 1 micro-exercise (~30 menit).` };
  }
  return { minutes: 60, text: `Jadwalkan 1 jam refresher ${name} — sudah ${daysSince} hari.` };
}

export async function getSkillDecayAction(): Promise<
  { ok: true; data: SkillDecayResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const me = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        targetCareerRoleId: true,
        targetCareerRole: { select: { name: true } },
      },
    });
    if (!me) return { ok: false, error: "Profil learner tidak ditemukan." };

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: me.id },
      orderBy: { snapshotAt: "desc" },
      select: {
        skillId: true,
        score: true,
        confidence: true,
        snapshotAt: true,
        skill: { select: { name: true, category: { select: { name: true } } } },
      },
    });

    const latestBySkill = new Map<string, (typeof snapshots)[number]>();
    for (const s of snapshots) {
      if (!latestBySkill.has(s.skillId)) latestBySkill.set(s.skillId, s);
    }

    const targetSkillIds = new Set<string>();
    if (me.targetCareerRoleId) {
      const reqs = await db.careerRoleSkillRequirement.findMany({
        where: { careerRoleId: me.targetCareerRoleId },
        select: { skillId: true },
      });
      for (const r of reqs) targetSkillIds.add(r.skillId);
    }

    const now = Date.now();
    let lastTouchMs = 0;
    const skills: DecaySkill[] = Array.from(latestBySkill.values()).map((s) => {
      const daysSince = Math.max(0, Math.floor((now - new Date(s.snapshotAt).getTime()) / 86_400_000));
      const halfLifeDays = halfLifeFor(s.score, s.confidence);
      const retention = retentionOf(daysSince, halfLifeDays);
      const effectiveScore = Math.round(s.score * retention);
      const { tier, label } = tierFor(retention);
      const action = actionFor(tier, s.skill.name, daysSince);
      const ts = new Date(s.snapshotAt).getTime();
      if (ts > lastTouchMs) lastTouchMs = ts;
      return {
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name ?? null,
        lastScore: Math.round(s.score),
        effectiveScore,
        retention: Math.round(retention * 100) / 100,
        daysSince,
        halfLifeDays: Math.round(halfLifeDays),
        tier,
        tierLabel: label,
        refreshMinutes: action.minutes,
        suggestedAction: action.text,
        isTargetSkill: targetSkillIds.has(s.skillId),
      };
    });

    skills.sort((a, b) => {
      if (a.isTargetSkill !== b.isTargetSkill) return a.isTargetSkill ? -1 : 1;
      return a.retention - b.retention;
    });

    const atRiskCount = skills.filter((s) => s.tier === "fading" || s.tier === "decayed").length;
    const averageRetention = skills.length
      ? Math.round((skills.reduce((acc, s) => acc + s.retention, 0) / skills.length) * 100)
      : 100;
    const targetSkills = skills.filter((s) => s.isTargetSkill);
    const healthBasis = targetSkills.length ? targetSkills : skills;
    const healthScore = healthBasis.length
      ? Math.round((healthBasis.reduce((acc, s) => acc + s.retention * s.lastScore, 0) / healthBasis.length))
      : 0;

    return {
      ok: true,
      data: {
        skills,
        atRiskCount,
        averageRetention,
        healthScore,
        lastTouch: lastTouchMs ? new Date(lastTouchMs).toISOString() : null,
        targetRoleName: me.targetCareerRole?.name ?? null,
      },
    };
  } catch (err) {
    console.error("getSkillDecayAction error", err);
    return { ok: false, error: "Gagal memuat skill decay monitor." };
  }
}
