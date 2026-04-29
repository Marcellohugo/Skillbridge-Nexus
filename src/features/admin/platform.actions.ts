"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";

export interface PlatformUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastActivity: string | null;
  currentTRI?: number;
  completedSessions?: number;
}

export async function listPlatformUsersAction(): Promise<
  { ok: true; data: PlatformUserRow[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Hanya admin." };

  try {
    const users = await db.user.findMany({
      include: {
        learnerProfile: { select: { currentTRI: true, lastActiveAt: true } },
        mentorProfile: { select: { totalSessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        lastActivity: u.learnerProfile?.lastActiveAt?.toISOString() ?? null,
        currentTRI: u.learnerProfile ? Math.round(u.learnerProfile.currentTRI) : undefined,
        completedSessions: u.mentorProfile?.totalSessions,
      })),
    };
  } catch (err) {
    console.error("listPlatformUsersAction error", err);
    return { ok: false, error: "Gagal memuat user." };
  }
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Hanya admin." };
  if (session.userId === userId && !isActive) return { ok: false, error: "Admin tidak dapat menonaktifkan akunnya sendiri." };

  try {
    await db.user.update({ where: { id: userId }, data: { isActive } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    console.error("setUserActiveAction error", err);
    return { ok: false, error: "Gagal mengubah status." };
  }
}

export interface SkillTaxonomyRow {
  id: string;
  name: string;
  isFoundational: boolean;
  maxLevel: number;
  categoryId: string;
  categoryName: string;
  prereqCount: number;
  roleCount: number;
  moduleCount: number;
}

export async function listSkillTaxonomyAction(): Promise<
  { ok: true; data: { categories: { id: string; name: string; skillCount: number }[]; skills: SkillTaxonomyRow[] } } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Hanya admin." };

  try {
    const categories = await db.skillCategory.findMany({
      include: { _count: { select: { skills: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const skills = await db.skill.findMany({
      include: {
        category: { select: { id: true, name: true } },
        _count: {
          select: {
            prerequisites: true,
            careerRequirements: true,
            moduleSkillMappings: true,
          },
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });

    return {
      ok: true,
      data: {
        categories: categories.map((c) => ({ id: c.id, name: c.name, skillCount: c._count.skills })),
        skills: skills.map((s) => ({
          id: s.id,
          name: s.name,
          isFoundational: s.isFoundational,
          maxLevel: s.maxLevel,
          categoryId: s.category.id,
          categoryName: s.category.name,
          prereqCount: s._count.prerequisites,
          roleCount: s._count.careerRequirements,
          moduleCount: s._count.moduleSkillMappings,
        })),
      },
    };
  } catch (err) {
    console.error("listSkillTaxonomyAction error", err);
    return { ok: false, error: "Gagal memuat skill taxonomy." };
  }
}

export interface PlatformMetrics {
  totalUsers: number;
  learners: number;
  mentors: number;
  admins: number;
  institutionManagers: number;
  activeUsers: number;
  totalAssessments: number;
  totalSnapshots: number;
  totalSessions: number;
  totalProjects: number;
  validatedProjects: number;
  totalBadges: number;
  totalInterventions: number;
  avgTRI: number;
}

export async function getPlatformMetricsAction(): Promise<
  { ok: true; data: PlatformMetrics } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Hanya admin." };

  try {
    const [users, assessments, snapshots, sessions, projects, validated, badges, interventions, learners] = await Promise.all([
      db.user.findMany({ select: { role: true, isActive: true } }),
      db.assessmentSession.count({ where: { status: "completed" } }),
      db.skillScoreSnapshot.count(),
      db.mentoringSession.count(),
      db.portfolioProject.count(),
      db.portfolioProject.count({ where: { isValidated: true } }),
      db.userBadge.count(),
      db.interventionRecord.count({ where: { isResolved: false } }),
      db.learnerProfile.findMany({ select: { currentTRI: true } }),
    ]);

    const avgTRI = learners.length > 0
      ? Math.round(learners.reduce((s, l) => s + l.currentTRI, 0) / learners.length)
      : 0;

    return {
      ok: true,
      data: {
        totalUsers: users.length,
        learners: users.filter((u) => u.role === "LEARNER").length,
        mentors: users.filter((u) => u.role === "MENTOR").length,
        admins: users.filter((u) => u.role === "ADMIN").length,
        institutionManagers: users.filter((u) => u.role === "INSTITUTION_MANAGER").length,
        activeUsers: users.filter((u) => u.isActive).length,
        totalAssessments: assessments,
        totalSnapshots: snapshots,
        totalSessions: sessions,
        totalProjects: projects,
        validatedProjects: validated,
        totalBadges: badges,
        totalInterventions: interventions,
        avgTRI,
      },
    };
  } catch (err) {
    console.error("getPlatformMetricsAction error", err);
    return { ok: false, error: "Gagal memuat metrik platform." };
  }
}
