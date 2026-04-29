"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface AchievementItem {
  id: string;
  name: string;
  description: string;
  color: string;
  category: string;
  criteria: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  progressHint: string;
}

interface ProgressContext {
  tri: number;
  streakDays: number;
  completedModules: number;
  assessmentsCompleted: number;
  portfolioValidated: number;
  mentorSessions: number;
}

function inferProgress(name: string, criteria: string, ctx: ProgressContext): { pct: number; hint: string } {
  const k = (name + " " + criteria).toLowerCase();

  if (k.includes("streak") || k.includes("konsisten")) {
    const target = k.includes("30") ? 30 : k.includes("14") ? 14 : 7;
    return { pct: Math.min(100, Math.round((ctx.streakDays / target) * 100)), hint: `${ctx.streakDays}/${target} hari` };
  }
  if (k.includes("career ready") || k.includes("career_ready")) {
    return { pct: Math.min(100, Math.round((ctx.tri / 70) * 100)), hint: `TRI ${ctx.tri.toFixed(0)}/70` };
  }
  if (k.includes("advanced")) {
    return { pct: Math.min(100, Math.round((ctx.tri / 85) * 100)), hint: `TRI ${ctx.tri.toFixed(0)}/85` };
  }
  if (k.includes("developing")) {
    return { pct: Math.min(100, Math.round((ctx.tri / 35) * 100)), hint: `TRI ${ctx.tri.toFixed(0)}/35` };
  }
  if (k.includes("progressing")) {
    return { pct: Math.min(100, Math.round((ctx.tri / 50) * 100)), hint: `TRI ${ctx.tri.toFixed(0)}/50` };
  }
  if (k.includes("assessment") || k.includes("asesmen")) {
    const target = 5;
    return {
      pct: Math.min(100, Math.round((ctx.assessmentsCompleted / target) * 100)),
      hint: `${ctx.assessmentsCompleted}/${target} asesmen`,
    };
  }
  if (k.includes("portfolio") || k.includes("evidence")) {
    const target = 3;
    return {
      pct: Math.min(100, Math.round((ctx.portfolioValidated / target) * 100)),
      hint: `${ctx.portfolioValidated}/${target} tervalidasi`,
    };
  }
  if (k.includes("mentor")) {
    const target = 3;
    return { pct: Math.min(100, Math.round((ctx.mentorSessions / target) * 100)), hint: `${ctx.mentorSessions}/${target} sesi` };
  }
  if (k.includes("module") || k.includes("modul") || k.includes("learning")) {
    const target = 10;
    return { pct: Math.min(100, Math.round((ctx.completedModules / target) * 100)), hint: `${ctx.completedModules}/${target} modul` };
  }
  return { pct: 0, hint: "Belum terbuka" };
}

export async function getAchievementsAction(): Promise<
  { ok: true; items: AchievementItem[]; stats: { earned: number; total: number; nextPct: number } } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesi tidak valid." };

  try {
    const [allBadges, userBadges, profile] = await Promise.all([
      db.badge.findMany({ orderBy: { category: "asc" } }),
      db.userBadge.findMany({ where: { userId: session.userId }, select: { badgeId: true, earnedAt: true } }),
      db.learnerProfile.findUnique({
        where: { userId: session.userId },
        select: {
          id: true,
          currentTRI: true,
          streakDays: true,
        },
      }),
    ]);

    const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.earnedAt]));

    const ctx: ProgressContext = {
      tri: profile?.currentTRI ?? 0,
      streakDays: profile?.streakDays ?? 0,
      completedModules: 0,
      assessmentsCompleted: 0,
      portfolioValidated: 0,
      mentorSessions: 0,
    };

    if (profile) {
      const [modules, sessions, portfolio, mentorSessions] = await Promise.all([
        db.learningPathItem.count({ where: { path: { learnerId: profile.id }, isCompleted: true } }),
        db.assessmentSession.count({ where: { learnerId: profile.id, status: "completed" } }),
        db.portfolioProject.count({ where: { learnerId: profile.id, isValidated: true } }),
        db.mentoringSession.count({ where: { menteeId: session.userId, status: "COMPLETED" } }),
      ]);
      ctx.completedModules = modules;
      ctx.assessmentsCompleted = sessions;
      ctx.portfolioValidated = portfolio;
      ctx.mentorSessions = mentorSessions;
    }

    const items: AchievementItem[] = allBadges.map((b) => {
      const earnedAt = earnedMap.get(b.id) ?? null;
      const earned = !!earnedAt;
      const { pct, hint } = earned ? { pct: 100, hint: "Terbuka" } : inferProgress(b.name, b.criteria, ctx);
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        color: b.color,
        category: b.category,
        criteria: b.criteria,
        earned,
        earnedAt: earnedAt ? earnedAt.toISOString() : null,
        progress: pct,
        progressHint: hint,
      };
    });

    const earnedCount = items.filter((i) => i.earned).length;
    const locked = items.filter((i) => !i.earned);
    const nextPct = locked.length > 0 ? Math.max(...locked.map((i) => i.progress)) : 100;

    return {
      ok: true,
      items,
      stats: { earned: earnedCount, total: items.length, nextPct },
    };
  } catch (err) {
    console.error("getAchievementsAction error", err);
    return { ok: false, error: "Gagal memuat achievements." };
  }
}
