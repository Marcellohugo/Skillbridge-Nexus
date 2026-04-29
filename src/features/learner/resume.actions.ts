"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface ResumeProject {
  title: string;
  description: string;
  skills: string[];
  projectUrl: string | null;
  completedAt: string | null;
  isValidated: boolean;
  evidenceStrength: number;
}

export interface ResumeSkill {
  name: string;
  category: string;
  level: number;
  targetLevel: number;
}

export interface ResumeData {
  name: string;
  email: string;
  headline: string;
  targetRole: string | null;
  educationStatus: string;
  languages: string[];
  triScore: number;
  triMilestone: string;
  careerFitScore: number;
  projects: ResumeProject[];
  topSkills: ResumeSkill[];
  badges: { name: string; earnedAt: string }[];
  mentorshipCount: number;
}

function humanizeMilestone(m: string) {
  return m.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function compileResumeAction(): Promise<
  { ok: true; data: ResumeData } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        learnerProfile: {
          select: {
            id: true,
            fullName: true,
            educationStatus: true,
            languagePreference: true,
            currentTRI: true,
            triMilestone: true,
            careerFitScore: true,
            targetCareerRole: { select: { name: true } },
          },
        },
        badges: {
          orderBy: { earnedAt: "desc" },
          take: 6,
          select: { earnedAt: true, badge: { select: { name: true } } },
        },
      },
    });

    if (!user?.learnerProfile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const profileId = user.learnerProfile.id;

    const [projects, scores, mentorCount] = await Promise.all([
      db.portfolioProject.findMany({
        where: { learnerId: profileId },
        orderBy: [{ isValidated: "desc" }, { completedAt: "desc" }],
        take: 6,
        include: {
          skillMappings: { include: { skill: { select: { name: true } } } },
        },
      }),
      db.skillScoreSnapshot.findMany({
        where: { learnerId: profileId },
        orderBy: { snapshotAt: "desc" },
        include: { skill: { select: { name: true, category: { select: { name: true } } } } },
      }),
      db.mentoringSession.count({
        where: { menteeId: session.userId, status: "COMPLETED" },
      }),
    ]);

    const latestPerSkill = new Map<string, (typeof scores)[number]>();
    for (const s of scores) {
      if (!latestPerSkill.has(s.skillId)) latestPerSkill.set(s.skillId, s);
    }
    const topSkills: ResumeSkill[] = [...latestPerSkill.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((s) => ({
        name: s.skill.name,
        category: s.skill.category?.name ?? "General",
        level: Math.round(s.score),
        targetLevel: 100,
      }));

    const resumeProjects: ResumeProject[] = projects.map((p) => ({
      title: p.title,
      description: p.description,
      skills: p.skillMappings.map((m) => m.skill.name),
      projectUrl: p.projectUrl,
      completedAt: p.completedAt ? p.completedAt.toISOString() : null,
      isValidated: p.isValidated,
      evidenceStrength: p.evidenceStrength,
    }));

    const targetRole = user.learnerProfile.targetCareerRole?.name ?? null;
    const headline = targetRole
      ? `Aspiring ${targetRole} · ${humanizeMilestone(user.learnerProfile.triMilestone)}`
      : `Learner · ${humanizeMilestone(user.learnerProfile.triMilestone)}`;

    return {
      ok: true,
      data: {
        name: user.name,
        email: user.email,
        headline,
        targetRole,
        educationStatus: user.learnerProfile.educationStatus,
        languages: user.learnerProfile.languagePreference === "en" ? ["English", "Bahasa Indonesia"] : ["Bahasa Indonesia", "English"],
        triScore: user.learnerProfile.currentTRI,
        triMilestone: user.learnerProfile.triMilestone,
        careerFitScore: user.learnerProfile.careerFitScore,
        projects: resumeProjects,
        topSkills,
        badges: user.badges.map((b) => ({ name: b.badge.name, earnedAt: b.earnedAt.toISOString() })),
        mentorshipCount: mentorCount,
      },
    };
  } catch (err) {
    console.error("compileResumeAction error", err);
    return { ok: false, error: "Gagal menyusun resume." };
  }
}
