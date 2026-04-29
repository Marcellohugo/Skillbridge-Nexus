"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const STRONG_THRESHOLD = 65;
const WEAK_THRESHOLD = 50;
const MIN_PAIR_ROLES = 2;

export type SynergyState = "unlocked" | "bridge" | "foundation";

export interface SynergyPair {
  key: string;
  skillAName: string;
  skillAScore: number;
  skillBName: string;
  skillBScore: number;
  roles: string[];
  state: SynergyState;
  unlockValue: number;
  insight: string;
}

export interface SynergyResult {
  opportunities: SynergyPair[];
  unlocked: SynergyPair[];
  foundation: SynergyPair[];
  synergyIndex: number;
  totalActivePairs: number;
  unlockedCount: number;
  opportunityCount: number;
  verdict: string;
  verdictTone: "success" | "brand" | "warning";
}

export async function getSkillSynergyAction(): Promise<
  { ok: true; data: SynergyResult } | { ok: false; error: string }
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
      select: { skillId: true, score: true },
    });
    const latest = new Map<string, number>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);
    }

    const roles = await db.careerRole.findMany({
      select: {
        name: true,
        skillRequirements: {
          where: { importanceWeight: { gte: 0.6 } },
          select: {
            skillId: true,
            importanceWeight: true,
            skill: { select: { name: true } },
          },
        },
      },
    });

    const pairMap = new Map<
      string,
      {
        skillAId: string;
        skillAName: string;
        skillBId: string;
        skillBName: string;
        roles: Set<string>;
        weight: number;
      }
    >();

    for (const role of roles) {
      const reqs = role.skillRequirements;
      for (let i = 0; i < reqs.length; i++) {
        for (let j = i + 1; j < reqs.length; j++) {
          const [a, b] =
            reqs[i].skillId < reqs[j].skillId
              ? [reqs[i], reqs[j]]
              : [reqs[j], reqs[i]];
          const key = `${a.skillId}:${b.skillId}`;
          const existing = pairMap.get(key);
          const weight = (a.importanceWeight + b.importanceWeight) / 2;
          if (existing) {
            existing.roles.add(role.name);
            existing.weight += weight;
          } else {
            pairMap.set(key, {
              skillAId: a.skillId,
              skillAName: a.skill.name,
              skillBId: b.skillId,
              skillBName: b.skill.name,
              roles: new Set([role.name]),
              weight,
            });
          }
        }
      }
    }

    const opportunities: SynergyPair[] = [];
    const unlocked: SynergyPair[] = [];
    const foundation: SynergyPair[] = [];

    for (const [key, p] of pairMap) {
      if (p.roles.size < MIN_PAIR_ROLES) continue;

      const scoreA = latest.get(p.skillAId) ?? 0;
      const scoreB = latest.get(p.skillBId) ?? 0;
      const rolesArr = Array.from(p.roles);

      const strongA = scoreA >= STRONG_THRESHOLD;
      const strongB = scoreB >= STRONG_THRESHOLD;
      const weakA = scoreA < WEAK_THRESHOLD;
      const weakB = scoreB < WEAK_THRESHOLD;

      let orderedA = { name: p.skillAName, score: scoreA };
      let orderedB = { name: p.skillBName, score: scoreB };
      if (scoreB > scoreA) {
        orderedA = { name: p.skillBName, score: scoreB };
        orderedB = { name: p.skillAName, score: scoreA };
      }

      const base = {
        key,
        skillAName: orderedA.name,
        skillAScore: Math.round(orderedA.score),
        skillBName: orderedB.name,
        skillBScore: Math.round(orderedB.score),
        roles: rolesArr,
      };

      if (strongA && strongB) {
        unlocked.push({
          ...base,
          state: "unlocked",
          unlockValue: (scoreA + scoreB) / 2,
          insight: `Pasangan aktif — Anda siap untuk peran yang menuntut kombinasi ${orderedA.name} + ${orderedB.name}.`,
        });
      } else if ((strongA && weakB) || (strongB && weakA)) {
        const strongSide = strongA ? orderedA : orderedB;
        const weakSide = strongA ? orderedB : orderedA;
        const gap = STRONG_THRESHOLD - weakSide.score;
        const unlockValue = p.roles.size * gap * (p.weight / p.roles.size);
        opportunities.push({
          ...base,
          state: "bridge",
          unlockValue,
          insight: `${strongSide.name} sudah kuat (${Math.round(strongSide.score)}). Tingkatkan ${weakSide.name} +${Math.round(gap)} poin untuk membuka ${p.roles.size} peran.`,
        });
      } else if (weakA && weakB) {
        foundation.push({
          ...base,
          state: "foundation",
          unlockValue: scoreA + scoreB,
          insight: `Pondasi belum terbentuk. Mulai dari salah satu skill untuk membuka jalur ${p.roles.size} peran.`,
        });
      }
    }

    opportunities.sort((a, b) => b.unlockValue - a.unlockValue);
    unlocked.sort((a, b) => b.unlockValue - a.unlockValue);
    foundation.sort((a, b) => b.unlockValue - a.unlockValue);

    const totalActivePairs = opportunities.length + unlocked.length + foundation.length;
    const synergyIndex =
      totalActivePairs > 0
        ? Math.round(
            ((unlocked.length + opportunities.length * 0.5) / totalActivePairs) * 100,
          )
        : 0;

    let verdict: string;
    let verdictTone: SynergyResult["verdictTone"];
    if (synergyIndex >= 70) {
      verdict = "Stack Anda terintegrasi — skill saling menguatkan.";
      verdictTone = "success";
    } else if (synergyIndex >= 40) {
      verdict = "Ada momentum — fokus ke bridging pair terbesar untuk lompatan berikutnya.";
      verdictTone = "brand";
    } else if (opportunities.length >= 2) {
      verdict = "Peluang sinergi tinggi — satu bridging pair bisa membuka banyak peran.";
      verdictTone = "brand";
    } else {
      verdict = "Fokus bangun pondasi dulu — sinergi muncul setelah skill menyentuh 65+.";
      verdictTone = "warning";
    }

    return {
      ok: true,
      data: {
        opportunities: opportunities.slice(0, 5),
        unlocked: unlocked.slice(0, 4),
        foundation: foundation.slice(0, 3),
        synergyIndex,
        totalActivePairs,
        unlockedCount: unlocked.length,
        opportunityCount: opportunities.length,
        verdict,
        verdictTone,
      },
    };
  } catch (err) {
    console.error("getSkillSynergyAction error", err);
    return { ok: false, error: "Gagal memuat Skill Synergy." };
  }
}
