"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface OnboardingPayload {
  educationStatus: string;
  department?: string;
  major?: string;
  targetRoleSlug: string;
  weeklyHours: number;
  learningStyle: string;
  mentoringStyle: string;
  languagePreference: string;
  accessibility: {
    fontSize: string;
    motion: "normal" | "reduced";
    contrast: "normal" | "high";
    dyslexiaFont: boolean;
    focusMode: boolean;
    simplifiedReading?: boolean;
    textToSpeech?: boolean;
    calmView?: boolean;
  };
}

export async function completeOnboardingAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { error: "Sesi tidak valid. Silakan masuk kembali." };
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string") return { error: "Data tidak lengkap." };

  let data: OnboardingPayload;
  try {
    data = JSON.parse(raw) as OnboardingPayload;
  } catch {
    return { error: "Format data tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { error: "Profil learner tidak ditemukan." };

    const targetRole = data.targetRoleSlug
      ? await db.careerRole.findUnique({ where: { slug: data.targetRoleSlug }, select: { id: true } })
      : null;

    await db.learnerProfile.update({
      where: { userId: session.userId },
      data: {
        educationStatus: data.educationStatus,
        department: data.department || null,
        major: data.major || null,
        targetCareerRoleId: targetRole?.id ?? null,
        weeklyHours: Math.max(1, Math.min(60, Number(data.weeklyHours) || 5)),
        learningStyle: data.learningStyle,
        mentoringStyle: data.mentoringStyle,
        languagePreference: data.languagePreference,
        onboardingCompleted: true,
      },
    });

    const a11yData = {
      fontSize: data.accessibility.fontSize,
      highContrast: data.accessibility.contrast === "high",
      reducedMotion: data.accessibility.motion === "reduced",
      dyslexiaFont: data.accessibility.dyslexiaFont,
      focusMode: data.accessibility.focusMode,
      simplifiedReading: data.accessibility.simplifiedReading ?? false,
      textToSpeech: data.accessibility.textToSpeech ?? false,
      calmView: data.accessibility.calmView ?? false,
    };
    await db.accessibilityProfile.upsert({
      where: { learnerId: profile.id },
      create: { learnerId: profile.id, ...a11yData },
      update: a11yData,
    });
  } catch (err) {
    console.error("completeOnboardingAction error", err);
    return { error: "Gagal menyimpan onboarding. Coba lagi." };
  }

  redirect("/assessment");
}
