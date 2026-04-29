"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/features/shared/recalc";
import type { SessionStatus } from "@prisma/client";

export interface MentorMatchReason {
  kind: "skill" | "style" | "role" | "availability" | "industry";
  label: string;
}

export interface MentorCandidate {
  mentorId: string; // User.id
  mentorProfileId: string;
  name: string;
  initials: string;
  biography: string;
  yearsExperience: number;
  industries: string[];
  mentoringTopics: string[];
  languagesSpoken: string[];
  avgRating: number;
  totalSessions: number;
  communicationStyle: string;
  isAvailable: boolean;
  expertiseSkills: { skillId: string; name: string; level: number }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  matchScore: number;
  matchReasons: MentorMatchReason[];
  sharedGapSkills: string[];
}

export interface MentorSessionDTO {
  id: string;
  menteeId: string;
  mentorId: string;
  mentorName: string;
  menteeName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  topic: string | null;
  notes: string | null;
  actionItems: string[];
  menteeRating: number | null;
  menteeFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase();
}

export async function listMatchedMentorsAction(): Promise<
  { ok: true; data: MentorCandidate[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        mentoringStyle: true,
        languagePreference: true,
        targetCareerRole: { select: { name: true, industry: true } },
      },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    // Latest gap snapshots — prioritize critical first
    const gapSnapshots = await db.skillGapSnapshot.findMany({
      where: { learnerId: profile.id, gap: { gt: 10 } },
      orderBy: { snapshotAt: "desc" },
      include: { skill: { select: { id: true, name: true } } },
    });
    const latestGap = new Map<string, { skillId: string; name: string; weightedGap: number; isCritical: boolean }>();
    for (const g of gapSnapshots) {
      if (!latestGap.has(g.skillId)) {
        latestGap.set(g.skillId, {
          skillId: g.skillId,
          name: g.skill.name,
          weightedGap: g.weightedGap,
          isCritical: g.isCritical,
        });
      }
    }
    const gaps = Array.from(latestGap.values());
    const gapSkillIds = new Set(gaps.map((g) => g.skillId));

    const mentorProfiles = await db.mentorProfile.findMany({
      where: { isAvailable: true },
      include: {
        user: { select: { id: true, name: true } },
        expertiseSkills: {
          include: { skill: { select: { id: true, name: true } } },
        },
        availability: true,
      },
    });

    const candidates: MentorCandidate[] = mentorProfiles.map((mp) => {
      const overlap = mp.expertiseSkills.filter((e) => gapSkillIds.has(e.skillId));
      const overlapWeighted = overlap.reduce((acc, e) => {
        const g = latestGap.get(e.skillId);
        if (!g) return acc;
        return acc + g.weightedGap * (g.isCritical ? 2 : 1) * (e.expertiseLevel / 5);
      }, 0);

      const maxPossibleOverlap = gaps.reduce((a, g) => a + g.weightedGap * (g.isCritical ? 2 : 1), 0);
      const skillMatchScore = maxPossibleOverlap > 0 ? Math.min(100, (overlapWeighted / maxPossibleOverlap) * 100) : 0;

      const styleMatch = mp.communicationStyle === profile.mentoringStyle ? 100 : 60;
      const langMatch = mp.languagesSpoken.includes(profile.languagePreference) ? 100 : 40;
      const roleMatch = profile.targetCareerRole
        ? mp.mentoringTopics.some((t) => t.toLowerCase().includes(profile.targetCareerRole!.name.toLowerCase().split(" ")[0]))
          ? 100
          : mp.industries.some((i) => i.toLowerCase() === (profile.targetCareerRole!.industry ?? "").toLowerCase())
            ? 80
            : 40
        : 50;
      const availabilityMatch = mp.availability.length > 0 ? 80 : 40;

      const matchScore = Math.round(
        skillMatchScore * 0.5 +
          styleMatch * 0.15 +
          roleMatch * 0.2 +
          langMatch * 0.05 +
          availabilityMatch * 0.1,
      );

      const reasons: MentorMatchReason[] = [];
      if (overlap.length > 0) {
        reasons.push({
          kind: "skill",
          label: `Ahli ${overlap.length} skill dari gap Anda: ${overlap.slice(0, 2).map((o) => o.skill.name).join(", ")}${overlap.length > 2 ? `, +${overlap.length - 2}` : ""}`,
        });
      }
      if (styleMatch === 100) {
        reasons.push({ kind: "style", label: `Gaya mentoring ${mp.communicationStyle} sesuai preferensi Anda` });
      }
      if (profile.targetCareerRole && roleMatch >= 80) {
        reasons.push({ kind: "role", label: `Pengalaman di ${mp.industries[0] ?? "industri relevan"}` });
      }
      if (availabilityMatch === 80) {
        reasons.push({ kind: "availability", label: `${mp.availability.length} slot tersedia minggu ini` });
      }

      return {
        mentorId: mp.user.id,
        mentorProfileId: mp.id,
        name: mp.user.name,
        initials: initialsOf(mp.user.name),
        biography: mp.biography,
        yearsExperience: mp.yearsExperience,
        industries: mp.industries,
        mentoringTopics: mp.mentoringTopics,
        languagesSpoken: mp.languagesSpoken,
        avgRating: mp.avgRating,
        totalSessions: mp.totalSessions,
        communicationStyle: mp.communicationStyle,
        isAvailable: mp.isAvailable,
        expertiseSkills: mp.expertiseSkills.map((e) => ({
          skillId: e.skillId,
          name: e.skill.name,
          level: e.expertiseLevel,
        })),
        availability: mp.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })),
        matchScore,
        matchReasons: reasons,
        sharedGapSkills: overlap.map((o) => o.skill.name),
      };
    });

    candidates.sort((a, b) => b.matchScore - a.matchScore);
    return { ok: true, data: candidates };
  } catch (err) {
    console.error("listMatchedMentorsAction error", err);
    return { ok: false, error: "Gagal memuat mentor." };
  }
}

export interface SessionRequestPayload {
  mentorId: string;
  scheduledAt: string; // ISO
  durationMinutes?: number;
  topic?: string;
  notes?: string;
}

export async function requestMentorSessionAction(
  payload: SessionRequestPayload,
): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const mentorProfile = await db.mentorProfile.findFirst({
      where: { userId: payload.mentorId },
      select: { id: true, user: { select: { name: true } } },
    });
    if (!mentorProfile) return { ok: false, error: "Mentor tidak ditemukan." };

    const scheduledAt = new Date(payload.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      return { ok: false, error: "Jadwal tidak valid — harus waktu mendatang." };
    }

    const mentoring = await db.mentoringSession.create({
      data: {
        menteeId: session.userId,
        mentorId: payload.mentorId,
        mentorProfileId: mentorProfile.id,
        scheduledAt,
        durationMinutes: payload.durationMinutes ?? 60,
        topic: payload.topic ?? null,
        notes: payload.notes ?? null,
        status: "PENDING",
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        userId: payload.mentorId,
        type: "GENERAL",
        title: "Permintaan sesi baru",
        message: `Learner meminta sesi ${formatDateTime(scheduledAt)}${payload.topic ? ` — ${payload.topic}` : ""}.`,
        actionUrl: "/mentor/sessions",
      },
    });

    await logActivity(session.userId, "MENTOR_SESSION_REQUESTED", payload.topic ?? "Sesi", {
      sessionId: mentoring.id,
      mentorId: payload.mentorId,
    });

    revalidatePath("/mentors");
    revalidatePath("/session-prep");
    revalidatePath("/mentor/sessions");
    return { ok: true, sessionId: mentoring.id };
  } catch (err) {
    console.error("requestMentorSessionAction error", err);
    return { ok: false, error: "Gagal mengirim permintaan." };
  }
}

export async function listMyMentorSessionsAction(): Promise<
  { ok: true; data: MentorSessionDTO[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const sessions = await db.mentoringSession.findMany({
      where: { menteeId: session.userId },
      orderBy: { scheduledAt: "desc" },
      include: {
        mentor: { select: { name: true } },
        mentee: { select: { name: true } },
      },
    });
    return {
      ok: true,
      data: sessions.map((s) => ({
        id: s.id,
        menteeId: s.menteeId,
        mentorId: s.mentorId,
        mentorName: s.mentor.name,
        menteeName: s.mentee.name,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMinutes: s.durationMinutes,
        status: s.status,
        topic: s.topic,
        notes: s.notes,
        actionItems: s.actionItems,
        menteeRating: s.menteeRating,
        menteeFeedback: s.menteeFeedback,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("listMyMentorSessionsAction error", err);
    return { ok: false, error: "Gagal memuat sesi." };
  }
}

export async function rateMentorSessionAction(
  sessionId: string,
  rating: number,
  feedback?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const row = await db.mentoringSession.findUnique({
      where: { id: sessionId },
      select: { menteeId: true, mentorProfileId: true, status: true },
    });
    if (!row || row.menteeId !== session.userId) return { ok: false, error: "Akses ditolak." };
    if (row.status !== "COMPLETED") return { ok: false, error: "Sesi belum selesai." };

    await db.mentoringSession.update({
      where: { id: sessionId },
      data: { menteeRating: rating, menteeFeedback: feedback },
    });

    if (row.mentorProfileId) {
      const all = await db.mentoringSession.findMany({
        where: { mentorProfileId: row.mentorProfileId, menteeRating: { not: null } },
        select: { menteeRating: true },
      });
      const avg = all.reduce((s, r) => s + (r.menteeRating ?? 0), 0) / Math.max(1, all.length);
      await db.mentorProfile.update({
        where: { id: row.mentorProfileId },
        data: { avgRating: avg },
      });
    }

    revalidatePath("/mentors");
    return { ok: true };
  } catch (err) {
    console.error("rateMentorSessionAction error", err);
    return { ok: false, error: "Gagal menyimpan rating." };
  }
}
