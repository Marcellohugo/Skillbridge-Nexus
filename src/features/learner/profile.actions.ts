"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ProfileUpdatePayload {
  name: string;
  educationStatus: string;
  targetRoleSlug?: string;
  learningStyle: string;
  mentoringStyle: string;
  weeklyHours: number;
  languagePreference: string;
}

export async function getLearnerProfileAction() {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false as const, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        targetCareerRole: { select: { slug: true } },
        user: { select: { email: true, name: true } },
      },
    });
    if (!profile) return { ok: false as const, error: "Profil learner tidak ditemukan." };

    return {
      ok: true as const,
      data: {
        careerTargetSlug: profile.targetCareerRole?.slug ?? "",
        educationStatus: profile.educationStatus,
        email: profile.user.email,
        language: profile.languagePreference,
        learningStyle: profile.learningStyle,
        mentoringStyle: profile.mentoringStyle,
        name: profile.user.name || profile.fullName,
        weeklyHours: profile.weeklyHours,
      },
    };
  } catch (err) {
    console.error("getLearnerProfileAction error", err);
    return { ok: false as const, error: "Gagal memuat profil." };
  }
}

export async function updateLearnerProfileAction(payload: ProfileUpdatePayload) {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false as const, error: "Sesi tidak valid." };
  }

  const name = payload.name.trim();
  if (!name) return { ok: false as const, error: "Nama tidak boleh kosong." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false as const, error: "Profil learner tidak ditemukan." };

    const targetRole = payload.targetRoleSlug
      ? await db.careerRole.findUnique({ where: { slug: payload.targetRoleSlug }, select: { id: true } })
      : null;

    await db.user.update({
      where: { id: session.userId },
      data: { name },
    });

    await db.learnerProfile.update({
      where: { id: profile.id },
      data: {
        fullName: name,
        educationStatus: payload.educationStatus,
        targetCareerRoleId: targetRole?.id ?? undefined,
        learningStyle: payload.learningStyle,
        mentoringStyle: payload.mentoringStyle,
        weeklyHours: Math.max(1, Math.min(60, Number(payload.weeklyHours) || 5)),
        languagePreference: payload.languagePreference,
        lastActiveAt: new Date(),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { ok: true as const };
  } catch (err) {
    console.error("updateLearnerProfileAction error", err);
    return { ok: false as const, error: "Gagal menyimpan perubahan." };
  }
}
