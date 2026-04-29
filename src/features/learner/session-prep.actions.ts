"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface SessionPrepResult {
  hasUpcoming: boolean;
  sessionId: string | null;
  mentorName: string | null;
  mentorInitials: string | null;
  scheduledAt: string | null;
  durationMinutes: number;
  hoursUntil: number;
  topic: string | null;
  pastSessionCount: number;
  openActionItems: string[];
  priorityGaps: Array<{ skill: string; current: number; target: number; weight: number }>;
  recentWins: Array<{ title: string; metric: string }>;
  suggestedQuestions: string[];
  triDelta: number;
}

export async function getSessionPrepAction(): Promise<
  { ok: true; data: SessionPrepResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const now = new Date();
    const upcoming = await db.mentoringSession.findFirst({
      where: {
        menteeId: session.userId,
        scheduledAt: { gte: now },
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        scheduledAt: true,
        durationMinutes: true,
        topic: true,
        mentor: { select: { name: true } },
      },
    });

    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        currentTRI: true,
        targetCareerRole: {
          select: {
            name: true,
            skillRequirements: {
              select: {
                targetLevel: true,
                importanceWeight: true,
                isCritical: true,
                skill: { select: { id: true, name: true, maxLevel: true } },
              },
            },
          },
        },
      },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const [pastSessions, recentTRI, openPathItems, recentProjects, snapshots] = await Promise.all([
      db.mentoringSession.findMany({
        where: { menteeId: session.userId, status: "COMPLETED" },
        orderBy: { scheduledAt: "desc" },
        take: 3,
        select: { actionItems: true, scheduledAt: true },
      }),
      db.tRIHistory.findMany({
        where: { learnerId: profile.id },
        orderBy: { recordedAt: "desc" },
        take: 2,
        select: { score: true },
      }),
      db.learningPathItem.findMany({
        where: { path: { learnerId: profile.id }, isCompleted: false },
        orderBy: [{ isMilestone: "desc" }, { sortOrder: "asc" }],
        take: 5,
        select: { id: true },
      }),
      db.portfolioProject.findMany({
        where: { learnerId: profile.id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { title: true, isValidated: true, completedAt: true, updatedAt: true },
      }),
      db.skillScoreSnapshot.findMany({
        where: { learnerId: profile.id },
        orderBy: { snapshotAt: "desc" },
        select: { skillId: true, score: true },
      }),
    ]);

    const latest = new Map<string, number>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, s.score);
    }

    const priorityGaps: SessionPrepResult["priorityGaps"] = [];
    if (profile.targetCareerRole) {
      for (const r of profile.targetCareerRole.skillRequirements) {
        const currentPct = latest.get(r.skill.id) ?? 0;
        const targetPct = (r.targetLevel / (r.skill.maxLevel || 5)) * 100;
        const gap = targetPct - currentPct;
        if (gap > 15) {
          priorityGaps.push({
            skill: r.skill.name,
            current: Math.round(currentPct),
            target: Math.round(targetPct),
            weight: r.importanceWeight + (r.isCritical ? 1 : 0),
          });
        }
      }
      priorityGaps.sort((a, b) => b.weight - a.weight);
    }

    const openActionItems = pastSessions
      .flatMap((s) => s.actionItems)
      .filter((a) => a && a.trim().length > 0)
      .slice(0, 4);

    const recentWins: SessionPrepResult["recentWins"] = [];
    recentProjects.forEach((p) => {
      recentWins.push({
        title: p.title,
        metric: p.isValidated ? "Validated ✓" : p.completedAt ? "Selesai" : "Aktif",
      });
    });
    if (openPathItems.length > 0) {
      recentWins.push({ title: `${openPathItems.length} item path aktif`, metric: "Progressing" });
    }

    const triDelta = recentTRI.length >= 2 ? recentTRI[0].score - recentTRI[1].score : 0;

    const suggestedQuestions: string[] = [];
    if (priorityGaps[0]) {
      suggestedQuestions.push(
        `Bagaimana cara terbaik mempercepat ${priorityGaps[0].skill} dari ${priorityGaps[0].current}% ke ${priorityGaps[0].target}%?`,
      );
    }
    if (profile.targetCareerRole) {
      suggestedQuestions.push(
        `Menurut pengalaman mentor, apa sinyal kuat bahwa seseorang siap masuk ke ${profile.targetCareerRole.name}?`,
      );
    }
    if (openActionItems[0]) {
      suggestedQuestions.push(`Saya masih struggle dengan "${openActionItems[0]}" — bisa kita review bareng?`);
    }
    if (recentProjects[0]) {
      suggestedQuestions.push(`Bisa minta feedback untuk proyek "${recentProjects[0].title}"?`);
    }
    if (triDelta < 0) {
      suggestedQuestions.push(`TRI saya turun ${Math.abs(triDelta).toFixed(1)} poin — bagaimana cara reset momentum?`);
    }

    const hoursUntil = upcoming
      ? Math.max(0, (upcoming.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60))
      : 0;

    const mentorName = upcoming?.mentor.name ?? null;
    const mentorInitials = mentorName
      ? mentorName
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;

    return {
      ok: true,
      data: {
        hasUpcoming: !!upcoming,
        sessionId: upcoming?.id ?? null,
        mentorName,
        mentorInitials,
        scheduledAt: upcoming?.scheduledAt.toISOString() ?? null,
        durationMinutes: upcoming?.durationMinutes ?? 60,
        hoursUntil,
        topic: upcoming?.topic ?? null,
        pastSessionCount: pastSessions.length,
        openActionItems,
        priorityGaps: priorityGaps.slice(0, 3),
        recentWins: recentWins.slice(0, 3),
        suggestedQuestions: suggestedQuestions.slice(0, 4),
        triDelta,
      },
    };
  } catch (err) {
    console.error("getSessionPrepAction error", err);
    return { ok: false, error: "Gagal menyiapkan brief sesi mentor." };
  }
}
