"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { recalcTRIForLearner, logActivity, checkAndAwardBadges } from "@/features/shared/recalc";

export interface MentorSessionRow {
  id: string;
  menteeId: string;
  menteeName: string;
  menteeInitials: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  topic: string | null;
  notes: string | null;
  actionItems: string[];
  menteeRating: number | null;
  menteeFeedback: string | null;
  createdAt: string;
}

function initialsOf(name: string): string {
  return name.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase();
}

export async function listIncomingSessionsAction(): Promise<
  { ok: true; data: MentorSessionRow[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const rows = await db.mentoringSession.findMany({
      where: { mentorId: session.userId },
      orderBy: { scheduledAt: "asc" },
      include: { mentee: { select: { name: true } } },
    });
    return {
      ok: true,
      data: rows.map((r) => ({
        id: r.id,
        menteeId: r.menteeId,
        menteeName: r.mentee.name,
        menteeInitials: initialsOf(r.mentee.name),
        scheduledAt: r.scheduledAt.toISOString(),
        durationMinutes: r.durationMinutes,
        status: r.status,
        topic: r.topic,
        notes: r.notes,
        actionItems: r.actionItems,
        menteeRating: r.menteeRating,
        menteeFeedback: r.menteeFeedback,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("listIncomingSessionsAction error", err);
    return { ok: false, error: "Gagal memuat sesi." };
  }
}

export interface MentorLearnerRow {
  userId: string;
  learnerId: string;
  name: string;
  initials: string;
  email: string;
  currentTRI: number;
  milestone: string;
  riskLevel: string;
  targetRole: string | null;
  lastSession: string | null;
  upcomingSessions: number;
  completedSessions: number;
  pendingActionItems: number;
}

export async function listMentorLearnersAction(): Promise<
  { ok: true; data: MentorLearnerRow[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const sessions = await db.mentoringSession.findMany({
      where: { mentorId: session.userId },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            learnerProfile: {
              select: {
                id: true,
                currentTRI: true,
                triMilestone: true,
                riskLevel: true,
                targetCareerRole: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Group by menteeId
    const map = new Map<string, MentorLearnerRow>();
    for (const s of sessions) {
      const prof = s.mentee.learnerProfile;
      if (!prof) continue;
      const existing = map.get(s.menteeId);
      const scheduledStr = s.scheduledAt.toISOString();
      if (!existing) {
        map.set(s.menteeId, {
          userId: s.mentee.id,
          learnerId: prof.id,
          name: s.mentee.name,
          initials: initialsOf(s.mentee.name),
          email: s.mentee.email,
          currentTRI: Math.round(prof.currentTRI),
          milestone: prof.triMilestone,
          riskLevel: prof.riskLevel,
          targetRole: prof.targetCareerRole?.name ?? null,
          lastSession: s.status === "COMPLETED" ? scheduledStr : null,
          upcomingSessions: s.status === "PENDING" || s.status === "ACCEPTED" ? 1 : 0,
          completedSessions: s.status === "COMPLETED" ? 1 : 0,
          pendingActionItems: s.actionItems.length,
        });
      } else {
        if (s.status === "COMPLETED" && (!existing.lastSession || scheduledStr > existing.lastSession)) {
          existing.lastSession = scheduledStr;
        }
        if (s.status === "PENDING" || s.status === "ACCEPTED") existing.upcomingSessions++;
        if (s.status === "COMPLETED") existing.completedSessions++;
        existing.pendingActionItems += s.actionItems.length;
      }
    }

    return { ok: true, data: Array.from(map.values()).sort((a, b) => b.currentTRI - a.currentTRI) };
  } catch (err) {
    console.error("listMentorLearnersAction error", err);
    return { ok: false, error: "Gagal memuat learner." };
  }
}

export async function acceptSessionAction(
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const row = await db.mentoringSession.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true, status: true, scheduledAt: true },
    });
    if (!row || row.mentorId !== session.userId) return { ok: false, error: "Akses ditolak." };
    if (row.status !== "PENDING") return { ok: false, error: "Sesi sudah diproses." };

    await db.mentoringSession.update({
      where: { id: sessionId },
      data: { status: "ACCEPTED" },
    });

    await db.notification.create({
      data: {
        userId: row.menteeId,
        type: "MENTOR_REQUEST_ACCEPTED",
        title: "Mentor menerima sesi",
        message: `Sesi ${formatDateTime(row.scheduledAt)} telah dikonfirmasi.`,
        actionUrl: "/session-prep",
      },
    });

    await logActivity(session.userId, "MENTOR_SESSION_ACCEPTED", undefined, { sessionId });

    // Recalc learner TRI — mentoring count matters
    const mentee = await db.learnerProfile.findUnique({
      where: { userId: row.menteeId },
      select: { id: true },
    });
    if (mentee) await recalcTRIForLearner(mentee.id);

    revalidatePath("/mentor/sessions");
    revalidatePath("/mentor/learners");
    return { ok: true };
  } catch (err) {
    console.error("acceptSessionAction error", err);
    return { ok: false, error: "Gagal menerima sesi." };
  }
}

export async function rejectSessionAction(
  sessionId: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const row = await db.mentoringSession.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true, status: true },
    });
    if (!row || row.mentorId !== session.userId) return { ok: false, error: "Akses ditolak." };
    if (row.status !== "PENDING") return { ok: false, error: "Sesi sudah diproses." };

    await db.mentoringSession.update({
      where: { id: sessionId },
      data: { status: "REJECTED", notes: reason ?? null },
    });

    await db.notification.create({
      data: {
        userId: row.menteeId,
        type: "MENTOR_REQUEST_REJECTED",
        title: "Mentor tidak tersedia",
        message: reason ?? "Mentor tidak bisa mengambil sesi ini. Coba mentor lain.",
        actionUrl: "/mentors",
      },
    });
    revalidatePath("/mentor/sessions");
    return { ok: true };
  } catch (err) {
    console.error("rejectSessionAction error", err);
    return { ok: false, error: "Gagal menolak sesi." };
  }
}

export async function completeSessionAction(
  sessionId: string,
  actionItems: string[],
  notes?: string,
  triContribution?: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const row = await db.mentoringSession.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true, status: true, mentorProfileId: true },
    });
    if (!row || row.mentorId !== session.userId) return { ok: false, error: "Akses ditolak." };
    if (row.status === "COMPLETED" || row.status === "REJECTED" || row.status === "CANCELLED")
      return { ok: false, error: "Sesi sudah final." };

    await db.mentoringSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        actionItems: actionItems.filter((a) => a.trim()),
        notes: notes ?? null,
        triContribution: triContribution ?? 3,
      },
    });

    // Increment mentor totalSessions
    if (row.mentorProfileId) {
      await db.mentorProfile.update({
        where: { id: row.mentorProfileId },
        data: { totalSessions: { increment: 1 } },
      });
    }

    await db.notification.create({
      data: {
        userId: row.menteeId,
        type: "GENERAL",
        title: "Sesi selesai",
        message: `Mentor menandai sesi selesai dengan ${actionItems.length} action item. Cek dashboard.`,
        actionUrl: "/dashboard",
      },
    });

    await logActivity(session.userId, "MENTOR_SESSION_COMPLETED", undefined, { sessionId, actionItems: actionItems.length });
    await logActivity(row.menteeId, "MENTOR_SESSION_COMPLETED", undefined, { sessionId });

    // Recalc mentee TRI
    const mentee = await db.learnerProfile.findUnique({
      where: { userId: row.menteeId },
      select: { id: true },
    });
    if (mentee) {
      await recalcTRIForLearner(mentee.id);
      await checkAndAwardBadges({ userId: row.menteeId, learnerId: mentee.id, event: "MENTORING_COMPLETED" });
    }

    revalidatePath("/mentor/sessions");
    revalidatePath("/mentor/learners");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("completeSessionAction error", err);
    return { ok: false, error: "Gagal menyelesaikan sesi." };
  }
}

export async function rescheduleSessionAction(
  sessionId: string,
  newScheduledAt: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor." };

  try {
    const row = await db.mentoringSession.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true, status: true },
    });
    if (!row || row.mentorId !== session.userId) return { ok: false, error: "Akses ditolak." };

    const scheduledAt = new Date(newScheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) return { ok: false, error: "Jadwal tidak valid." };

    await db.mentoringSession.update({
      where: { id: sessionId },
      data: { scheduledAt, status: "ACCEPTED" },
    });

    await db.notification.create({
      data: {
        userId: row.menteeId,
        type: "GENERAL",
        title: "Sesi dijadwalkan ulang",
        message: `Jadwal baru: ${formatDateTime(scheduledAt)}.`,
        actionUrl: "/session-prep",
      },
    });

    revalidatePath("/mentor/sessions");
    return { ok: true };
  } catch (err) {
    console.error("rescheduleSessionAction error", err);
    return { ok: false, error: "Gagal menjadwalkan ulang." };
  }
}
