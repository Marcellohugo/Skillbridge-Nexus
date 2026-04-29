"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recalcTRIForLearner, logActivity } from "@/features/shared/recalc";

export interface LearningPathItemDTO {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  contentType: string;
  estimatedMinutes: number;
  difficulty: number;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  isQuickWin: boolean;
  isMilestone: boolean;
  isRescue: boolean;
  whyReason: string | null;
  skills: { skillId: string; name: string; category: string; levelGain: number; isPrimary: boolean }[];
  isLocked: boolean;
  lockReason?: string;
}

export interface LearningPathDTO {
  id: string;
  generatedAt: string;
  updatedAt: string;
  estimatedWeeks: number;
  weeklyHours: number;
  status: string;
  completionPct: number;
  items: LearningPathItemDTO[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    totalMinutes: number;
    completedMinutes: number;
    rescueCount: number;
  };
  targetRoleName: string | null;
}

// Rescue heuristic: if a gap skill has PREREQUISITE skills with currentLevel < minLevel,
// rescue modules for those prereqs are prioritised.
async function selectRescueModules(
  learnerId: string,
  gapSkillIds: string[],
): Promise<{ moduleId: string; whyReason: string; prerequisiteName: string; blockedName: string }[]> {
  if (gapSkillIds.length === 0) return [];

  const deps = await db.skillDependency.findMany({
    where: { skillId: { in: gapSkillIds }, type: "PREREQUISITE" },
    include: {
      prerequisite: { select: { id: true, name: true, maxLevel: true } },
      skill: { select: { name: true } },
    },
  });
  if (deps.length === 0) return [];

  const latest = new Map<string, number>();
  const snaps = await db.skillScoreSnapshot.findMany({
    where: { learnerId },
    orderBy: { snapshotAt: "desc" },
    select: { skillId: true, score: true },
  });
  for (const s of snaps) if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);

  const weakPrereqs: { prereqId: string; blocker: string; prereqName: string }[] = [];
  for (const d of deps) {
    const maxLevel = d.prerequisite.maxLevel || 5;
    const minPct = (d.minLevel / maxLevel) * 100;
    const currentPct = latest.get(d.prerequisiteId) ?? 0;
    if (currentPct < minPct) {
      weakPrereqs.push({
        prereqId: d.prerequisiteId,
        blocker: d.skill.name,
        prereqName: d.prerequisite.name,
      });
    }
  }
  if (weakPrereqs.length === 0) return [];

  const mods = await db.learningModuleSkillMapping.findMany({
    where: { skillId: { in: weakPrereqs.map((w) => w.prereqId) } },
    include: { module: { select: { id: true, estimatedMinutes: true, difficulty: true } } },
    orderBy: [{ isPrimary: "desc" }, { module: { difficulty: "asc" } }],
  });

  const rescue: { moduleId: string; whyReason: string; prerequisiteName: string; blockedName: string }[] = [];
  const used = new Set<string>();
  for (const w of weakPrereqs) {
    const mod = mods.find((m) => m.skillId === w.prereqId && !used.has(m.moduleId));
    if (!mod) continue;
    used.add(mod.moduleId);
    rescue.push({
      moduleId: mod.moduleId,
      whyReason: `Rescue: skill ${w.blocker} terhambat karena ${w.prereqName} belum kuat. Modul ini memperbaiki akar masalah.`,
      prerequisiteName: w.prereqName,
      blockedName: w.blocker,
    });
  }
  return rescue;
}

async function buildPathItems(learnerId: string, targetCareerRoleId: string | null) {
  // Fetch requirements, latest scores, modules
  const [gapSnapshots, moduleMappings] = await Promise.all([
    db.skillGapSnapshot.findMany({
      where: { learnerId },
      orderBy: { snapshotAt: "desc" },
      include: { skill: { select: { id: true, name: true } } },
    }),
    db.learningModuleSkillMapping.findMany({
      include: {
        module: { select: { id: true, estimatedMinutes: true, difficulty: true } },
        skill: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Take latest gap per skill
  const latestGap = new Map<string, typeof gapSnapshots[number]>();
  for (const g of gapSnapshots) if (!latestGap.has(g.skillId)) latestGap.set(g.skillId, g);

  // Pool of skills with gap > 10, sorted by weightedGap desc (critical first)
  const gapsSorted = Array.from(latestGap.values())
    .filter((g) => g.gap > 10)
    .sort((a, b) => (Number(b.isCritical) - Number(a.isCritical)) || (b.weightedGap - a.weightedGap));

  const gapSkillIds = gapsSorted.map((g) => g.skillId);
  const rescue = await selectRescueModules(learnerId, gapSkillIds);

  const items: { moduleId: string; isRescue: boolean; isQuickWin: boolean; isMilestone: boolean; whyReason: string; sortOrder: number }[] = [];
  const used = new Set<string>();

  // 1. Rescue modules first (order 0-9)
  let order = 0;
  for (const r of rescue.slice(0, 3)) {
    items.push({
      moduleId: r.moduleId,
      isRescue: true,
      isQuickWin: true,
      isMilestone: false,
      whyReason: r.whyReason,
      sortOrder: order++,
    });
    used.add(r.moduleId);
  }

  // 2. Main gap-closing modules (priority by weightedGap)
  for (const gap of gapsSorted) {
    const candidates = moduleMappings
      .filter((m) => m.skillId === gap.skillId && !used.has(m.moduleId))
      .sort((a, b) => (Number(b.isPrimary) - Number(a.isPrimary)) || (a.module.difficulty - b.module.difficulty));
    const pick = candidates[0];
    if (!pick) continue;
    used.add(pick.moduleId);
    items.push({
      moduleId: pick.moduleId,
      isRescue: false,
      isQuickWin: pick.module.estimatedMinutes <= 60,
      isMilestone: gap.isCritical,
      whyReason: `Menutup gap ${gap.skill.name} (${Math.round(gap.currentLevel)}% → ${Math.round(gap.targetLevel)}%). Impact score ${gap.weightedGap.toFixed(1)}.`,
      sortOrder: order++,
    });
    if (items.length >= 12) break;
  }

  // 3. If still empty (no gap data), seed minimal path from target role requirements
  if (items.length === 0 && targetCareerRoleId) {
    const reqs = await db.careerRoleSkillRequirement.findMany({
      where: { careerRoleId: targetCareerRoleId, isCritical: true },
      include: { skill: { select: { id: true, name: true } } },
      take: 5,
    });
    for (const r of reqs) {
      const pick = moduleMappings.find((m) => m.skillId === r.skillId && !used.has(m.moduleId));
      if (!pick) continue;
      used.add(pick.moduleId);
      items.push({
        moduleId: pick.moduleId,
        isRescue: false,
        isQuickWin: false,
        isMilestone: true,
        whyReason: `Foundational untuk peran target: ${r.skill.name}.`,
        sortOrder: order++,
      });
    }
  }

  return items;
}

export async function generateLearningPathAction(): Promise<
  { ok: true; data: LearningPathDTO } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true, weeklyHours: true, targetCareerRoleId: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const plan = await buildPathItems(profile.id, profile.targetCareerRoleId);
    if (plan.length === 0) {
      return { ok: false, error: "Belum ada data skill gap. Selesaikan asesmen diagnostik terlebih dulu." };
    }

    // Estimate weeks from total minutes / (weeklyHours*60)
    const moduleInfo = await db.learningModule.findMany({
      where: { id: { in: plan.map((p) => p.moduleId) } },
      select: { id: true, estimatedMinutes: true },
    });
    const totalMinutes = moduleInfo.reduce((s, m) => s + (m.estimatedMinutes || 45), 0);
    const estimatedWeeks = Math.max(4, Math.ceil(totalMinutes / (profile.weeklyHours * 60)));

    await db.$transaction(async (tx) => {
      const existing = await tx.learningPath.findUnique({
        where: { learnerId: profile.id },
        select: { id: true },
      });

      if (existing) {
        await tx.learningPathItem.deleteMany({ where: { pathId: existing.id } });
        await tx.learningPath.update({
          where: { id: existing.id },
          data: {
            generatedAt: new Date(),
            estimatedWeeks,
            weeklyHours: profile.weeklyHours,
            status: "active",
            completionPct: 0,
            items: { create: plan },
          },
        });
        return;
      }

      await tx.learningPath.create({
        data: {
          learnerId: profile.id,
          estimatedWeeks,
          weeklyHours: profile.weeklyHours,
          status: "active",
          items: { create: plan },
        },
      });
    });

    await logActivity(session.userId, "LEARNING_PATH_GENERATED", `Path regen: ${plan.length} modul`, {
      items: plan.length,
      estimatedWeeks,
    });

    await db.notification.create({
      data: {
        userId: session.userId,
        type: "LEARNING_PATH_GENERATED",
        title: "Learning path diperbarui",
        message: `${plan.length} modul dipilih berdasar gap terbaru. Estimasi ${estimatedWeeks} minggu @${profile.weeklyHours}h/mg.`,
        actionUrl: "/learning-path",
      },
    });

    await recalcTRIForLearner(profile.id);

    revalidatePath("/learning-path");
    revalidatePath("/dashboard");

    const dto = await getActivePathDTO(profile.id);
    if (!dto) return { ok: false, error: "Gagal memuat path baru." };
    return { ok: true, data: dto };
  } catch (err) {
    console.error("generateLearningPathAction error", err);
    return { ok: false, error: "Gagal men-generate learning path." };
  }
}

async function getActivePathDTO(learnerId: string): Promise<LearningPathDTO | null> {
  const path = await db.learningPath.findUnique({
    where: { learnerId },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          module: {
            include: {
              skillMappings: {
                include: {
                  skill: { select: { id: true, name: true, category: { select: { name: true } } } },
                },
              },
            },
          },
        },
      },
      learner: {
        select: { targetCareerRole: { select: { name: true } } },
      },
    },
  });
  if (!path) return null;

  // Compute unlock state via prerequisite skills (all prereqs of item's primary skill must be >=60%)
  const snaps = await db.skillScoreSnapshot.findMany({
    where: { learnerId },
    orderBy: { snapshotAt: "desc" },
    select: { skillId: true, score: true },
  });
  const latest = new Map<string, number>();
  for (const s of snaps) if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);

  const prereqCache = new Map<string, Array<{ prereqId: string; minLevel: number; prereqName: string; maxLevel: number }>>();
  async function loadPrereqs(skillId: string) {
    if (prereqCache.has(skillId)) return prereqCache.get(skillId)!;
    const deps = await db.skillDependency.findMany({
      where: { skillId, type: "PREREQUISITE" },
      include: { prerequisite: { select: { id: true, name: true, maxLevel: true } } },
    });
    const resolved = deps.map((d) => ({
      prereqId: d.prerequisiteId,
      minLevel: d.minLevel,
      prereqName: d.prerequisite.name,
      maxLevel: d.prerequisite.maxLevel || 5,
    }));
    prereqCache.set(skillId, resolved);
    return resolved;
  }

  const itemsWithLocks: LearningPathItemDTO[] = [];
  for (const i of path.items) {
    const primarySkill = i.module.skillMappings.find((m) => m.isPrimary) ?? i.module.skillMappings[0];
    let isLocked = false;
    let lockReason: string | undefined;
    if (primarySkill && !i.isRescue) {
      const prereqs = await loadPrereqs(primarySkill.skillId);
      for (const p of prereqs) {
        const currentPct = latest.get(p.prereqId) ?? 0;
        const minPct = (p.minLevel / p.maxLevel) * 100;
        if (currentPct < minPct) {
          isLocked = true;
          lockReason = `Prasyarat ${p.prereqName} belum ≥${Math.round(minPct)}%.`;
          break;
        }
      }
    }

    itemsWithLocks.push({
      id: i.id,
      moduleId: i.moduleId,
      title: i.module.title,
      description: i.module.description,
      contentType: i.module.contentType,
      estimatedMinutes: i.module.estimatedMinutes,
      difficulty: i.module.difficulty,
      sortOrder: i.sortOrder,
      isCompleted: i.isCompleted,
      completedAt: i.completedAt?.toISOString() ?? null,
      isQuickWin: i.isQuickWin,
      isMilestone: i.isMilestone,
      isRescue: i.isRescue,
      whyReason: i.whyReason,
      skills: i.module.skillMappings.map((sm) => ({
        skillId: sm.skillId,
        name: sm.skill.name,
        category: sm.skill.category.name,
        levelGain: sm.levelGain,
        isPrimary: sm.isPrimary,
      })),
      isLocked,
      lockReason,
    });
  }

  const completed = itemsWithLocks.filter((i) => i.isCompleted).length;
  const totalMinutes = itemsWithLocks.reduce((a, i) => a + i.estimatedMinutes, 0);
  const completedMinutes = itemsWithLocks.filter((i) => i.isCompleted).reduce((a, i) => a + i.estimatedMinutes, 0);
  const rescueCount = itemsWithLocks.filter((i) => i.isRescue).length;

  return {
    id: path.id,
    generatedAt: path.generatedAt.toISOString(),
    updatedAt: path.updatedAt.toISOString(),
    estimatedWeeks: path.estimatedWeeks,
    weeklyHours: path.weeklyHours,
    status: path.status,
    completionPct: path.completionPct,
    items: itemsWithLocks,
    stats: {
      total: itemsWithLocks.length,
      completed,
      inProgress: 0,
      totalMinutes,
      completedMinutes,
      rescueCount,
    },
    targetRoleName: path.learner.targetCareerRole?.name ?? null,
  };
}

export async function getActiveLearningPathAction(): Promise<
  { ok: true; data: LearningPathDTO | null } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const dto = await getActivePathDTO(profile.id);
    return { ok: true, data: dto };
  } catch (err) {
    console.error("getActiveLearningPathAction error", err);
    return { ok: false, error: "Gagal memuat learning path." };
  }
}

export async function toggleModuleCompleteAction(
  itemId: string,
): Promise<{ ok: true; isCompleted: boolean } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const item = await db.learningPathItem.findUnique({
      where: { id: itemId },
      include: {
        path: { select: { learnerId: true } },
        module: {
          include: {
            skillMappings: {
              select: { skillId: true, levelGain: true, isPrimary: true, skill: { select: { maxLevel: true } } },
            },
          },
        },
      },
    });
    if (!item) return { ok: false, error: "Item tidak ditemukan." };
    if (item.path.learnerId !== profile.id) return { ok: false, error: "Bukan path Anda." };

    const newCompleted = !item.isCompleted;
    await db.learningPathItem.update({
      where: { id: itemId },
      data: {
        isCompleted: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });

    // Bump SkillScoreSnapshot for completed module's skills (+levelGain% capped at 95)
    if (newCompleted) {
      const snaps = await db.skillScoreSnapshot.findMany({
        where: { learnerId: profile.id, skillId: { in: item.module.skillMappings.map((m) => m.skillId) } },
        orderBy: { snapshotAt: "desc" },
      });
      const latest = new Map<string, number>();
      for (const s of snaps) if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);

      const bumps = item.module.skillMappings.map((m) => {
        const maxLevel = m.skill.maxLevel || 5;
        const gainPct = (m.levelGain / maxLevel) * 100;
        const boost = m.isPrimary ? gainPct : gainPct * 0.5;
        const prior = latest.get(m.skillId) ?? 0;
        return {
          learnerId: profile.id,
          skillId: m.skillId,
          score: Math.min(95, Math.round(prior + boost)),
          confidence: 3.5,
          evidenceStr: 1,
        };
      });
      if (bumps.length > 0) {
        await db.skillScoreSnapshot.createMany({ data: bumps });
      }
    }

    // Update path completionPct
    const allItems = await db.learningPathItem.findMany({
      where: { pathId: item.pathId },
      select: { isCompleted: true },
    });
    const completionPct = (allItems.filter((i) => i.isCompleted).length / allItems.length) * 100;
    await db.learningPath.update({
      where: { id: item.pathId },
      data: { completionPct },
    });

    await logActivity(session.userId, newCompleted ? "MODULE_COMPLETED" : "MODULE_UNCOMPLETED", undefined, {
      itemId,
      moduleId: item.moduleId,
    });
    await recalcTRIForLearner(profile.id);

    revalidatePath("/learning-path");
    revalidatePath("/dashboard");
    return { ok: true, isCompleted: newCompleted };
  } catch (err) {
    console.error("toggleModuleCompleteAction error", err);
    return { ok: false, error: "Gagal memperbarui status modul." };
  }
}
