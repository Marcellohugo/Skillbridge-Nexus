"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface SkillNode {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  isFoundational: boolean;
  level: number;
  depth: number;
}

export interface SkillEdge {
  from: string;
  to: string;
  type: "PREREQUISITE" | "RECOMMENDED" | "COREQUISITE";
  unlocked: boolean;
}

export interface SkillTreeResult {
  nodes: SkillNode[];
  edges: SkillEdge[];
  unlockedCount: number;
  totalSkills: number;
  nextUnlock: { skill: string; needsLevel: number; currentLevel: number; prerequisite: string } | null;
}

export async function getSkillTreeAction(): Promise<
  { ok: true; data: SkillTreeResult } | { ok: false; error: string }
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

    const [skills, deps, snapshots] = await Promise.all([
      db.skill.findMany({
        select: {
          id: true,
          name: true,
          isFoundational: true,
          maxLevel: true,
          category: { select: { name: true, color: true } },
        },
      }),
      db.skillDependency.findMany({
        select: { skillId: true, prerequisiteId: true, type: true, minLevel: true },
      }),
      db.skillScoreSnapshot.findMany({
        where: { learnerId: profile.id },
        orderBy: { snapshotAt: "desc" },
        select: { skillId: true, score: true },
      }),
    ]);

    const latestScore = new Map<string, number>();
    for (const s of snapshots) {
      if (!latestScore.has(s.skillId)) latestScore.set(s.skillId, s.score);
    }

    const pctToLevel = (pct: number, maxLevel: number) => Math.round((pct / 100) * maxLevel);

    const prereqsBySkill = new Map<string, Array<{ prereqId: string; minLevel: number }>>();
    for (const d of deps) {
      if (d.type !== "PREREQUISITE") continue;
      const arr = prereqsBySkill.get(d.skillId) ?? [];
      arr.push({ prereqId: d.prerequisiteId, minLevel: d.minLevel });
      prereqsBySkill.set(d.skillId, arr);
    }

    const depthCache = new Map<string, number>();
    const computeDepth = (id: string, stack: Set<string> = new Set()): number => {
      if (depthCache.has(id)) return depthCache.get(id)!;
      if (stack.has(id)) return 0;
      const prereqs = prereqsBySkill.get(id) ?? [];
      if (prereqs.length === 0) {
        depthCache.set(id, 0);
        return 0;
      }
      stack.add(id);
      const d = 1 + Math.max(...prereqs.map((p) => computeDepth(p.prereqId, stack)));
      stack.delete(id);
      depthCache.set(id, d);
      return d;
    };

    const skillLookup = new Map(skills.map((s) => [s.id, s]));

    const nodes: SkillNode[] = skills.map((s) => {
      const pct = latestScore.get(s.id) ?? 0;
      return {
        id: s.id,
        name: s.name,
        categoryName: s.category.name,
        categoryColor: s.category.color ?? "#6b7280",
        isFoundational: s.isFoundational,
        level: pctToLevel(pct, s.maxLevel || 5),
        depth: computeDepth(s.id),
      };
    });

    const edges: SkillEdge[] = deps.map((d) => {
      const prereqPct = latestScore.get(d.prerequisiteId) ?? 0;
      const prereq = skillLookup.get(d.prerequisiteId);
      const prereqLevel = prereq ? pctToLevel(prereqPct, prereq.maxLevel || 5) : 0;
      return {
        from: d.prerequisiteId,
        to: d.skillId,
        type: d.type,
        unlocked: prereqLevel >= d.minLevel,
      };
    });

    const isUnlocked = (skillId: string): boolean => {
      const prereqs = prereqsBySkill.get(skillId) ?? [];
      if (prereqs.length === 0) return true;
      return prereqs.every((p) => {
        const prereq = skillLookup.get(p.prereqId);
        if (!prereq) return true;
        const lvl = pctToLevel(latestScore.get(p.prereqId) ?? 0, prereq.maxLevel || 5);
        return lvl >= p.minLevel;
      });
    };

    const unlockedCount = skills.filter((s) => isUnlocked(s.id)).length;

    let nextUnlock: SkillTreeResult["nextUnlock"] = null;
    for (const s of skills) {
      if (isUnlocked(s.id)) continue;
      const prereqs = prereqsBySkill.get(s.id) ?? [];
      const blocking = prereqs
        .map((p) => {
          const prereq = skillLookup.get(p.prereqId);
          const lvl = prereq ? pctToLevel(latestScore.get(p.prereqId) ?? 0, prereq.maxLevel || 5) : 0;
          return { prereq, minLevel: p.minLevel, lvl, gap: p.minLevel - lvl };
        })
        .filter((b) => b.gap > 0 && b.prereq)
        .sort((a, b) => a.gap - b.gap)[0];

      if (blocking && blocking.prereq) {
        if (!nextUnlock || blocking.gap < (nextUnlock.needsLevel - nextUnlock.currentLevel)) {
          nextUnlock = {
            skill: s.name,
            prerequisite: blocking.prereq.name,
            needsLevel: blocking.minLevel,
            currentLevel: blocking.lvl,
          };
        }
      }
    }

    return {
      ok: true,
      data: {
        nodes,
        edges,
        unlockedCount,
        totalSkills: skills.length,
        nextUnlock,
      },
    };
  } catch (err) {
    console.error("getSkillTreeAction error", err);
    return { ok: false, error: "Gagal memuat skill tree." };
  }
}
