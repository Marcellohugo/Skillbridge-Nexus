"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recalcTRIForLearner, logActivity } from "@/features/shared/recalc";

export interface PortfolioSkill {
  skillId: string;
  name: string;
  category: string;
  strength: number;
}

export interface PortfolioProjectDTO {
  id: string;
  title: string;
  description: string;
  projectUrl: string | null;
  screenshotUrl: string | null;
  techStack: string[];
  completedAt: string | null;
  isValidated: boolean;
  validatedBy: string | null;
  validationNote: string | null;
  evidenceStrength: number;
  createdAt: string;
  updatedAt: string;
  skills: PortfolioSkill[];
}

// Evidence strength heuristic (0-10):
// +1 for having title, +1 desc > 80 chars, +2 projectUrl set,
// +2 per 2 skills up to 4, +2 validated, +1 completedAt set.
function computeEvidenceStrength(input: {
  description: string;
  projectUrl: string | null;
  skills: number;
  isValidated: boolean;
  completedAt: Date | null;
}): number {
  let s = 1; // baseline for title being present (guarded in upstream)
  if (input.description.length > 80) s += 1;
  if (input.projectUrl) s += 2;
  s += Math.min(4, Math.floor(input.skills / 2) * 2);
  if (input.isValidated) s += 2;
  if (input.completedAt) s += 1;
  return Math.min(10, s);
}

function serialize(p: Awaited<ReturnType<typeof fetchRaw>>[number]): PortfolioProjectDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    projectUrl: p.projectUrl,
    screenshotUrl: p.screenshotUrl,
    techStack: p.techStack,
    completedAt: p.completedAt?.toISOString() ?? null,
    isValidated: p.isValidated,
    validatedBy: p.validatedBy,
    validationNote: p.validationNote,
    evidenceStrength: p.evidenceStrength,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    skills: p.skillMappings.map((sm) => ({
      skillId: sm.skillId,
      name: sm.skill.name,
      category: sm.skill.category.name,
      strength: sm.strength,
    })),
  };
}

async function fetchRaw(learnerId: string) {
  return db.portfolioProject.findMany({
    where: { learnerId },
    orderBy: { createdAt: "desc" },
    include: {
      skillMappings: {
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function listPortfolioProjectsAction(): Promise<
  { ok: true; data: PortfolioProjectDTO[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesi tidak valid." };
  if (session.role !== "LEARNER") return { ok: false, error: "Role tidak diizinkan." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const rows = await fetchRaw(profile.id);
    return { ok: true, data: rows.map(serialize) };
  } catch (err) {
    console.error("listPortfolioProjectsAction error", err);
    return { ok: false, error: "Gagal memuat portfolio." };
  }
}

export interface PortfolioCreatePayload {
  title: string;
  description: string;
  projectUrl?: string;
  techStack?: string[];
  skillIds: string[];
  completedAt?: string;
}

export async function createPortfolioProjectAction(
  payload: PortfolioCreatePayload,
): Promise<{ ok: true; data: PortfolioProjectDTO } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  if (!payload.title.trim()) return { ok: false, error: "Judul wajib diisi." };
  if (!payload.description.trim()) return { ok: false, error: "Deskripsi wajib diisi." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const completedAt = payload.completedAt ? new Date(payload.completedAt) : null;
    const evidenceStrength = computeEvidenceStrength({
      description: payload.description,
      projectUrl: payload.projectUrl ?? null,
      skills: payload.skillIds.length,
      isValidated: false,
      completedAt,
    });

    const project = await db.portfolioProject.create({
      data: {
        learnerId: profile.id,
        title: payload.title.trim(),
        description: payload.description.trim(),
        projectUrl: payload.projectUrl?.trim() || null,
        techStack: payload.techStack ?? [],
        completedAt,
        evidenceStrength,
        skillMappings: {
          create: payload.skillIds.map((skillId) => ({ skillId, strength: 3 })),
        },
      },
      include: {
        skillMappings: {
          include: {
            skill: {
              select: { id: true, name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });

    await logActivity(session.userId, "PORTFOLIO_CREATED", project.title, {
      projectId: project.id,
      skillCount: payload.skillIds.length,
    });

    await recalcTRIForLearner(profile.id);

    revalidatePath("/portfolio");
    revalidatePath("/resume");
    revalidatePath("/dashboard");

    return { ok: true, data: serialize(project) };
  } catch (err) {
    console.error("createPortfolioProjectAction error", err);
    return { ok: false, error: "Gagal menyimpan proyek." };
  }
}

export interface PortfolioUpdatePayload {
  id: string;
  title?: string;
  description?: string;
  projectUrl?: string | null;
  techStack?: string[];
  skillIds?: string[];
  completedAt?: string | null;
}

export async function updatePortfolioProjectAction(
  payload: PortfolioUpdatePayload,
): Promise<{ ok: true; data: PortfolioProjectDTO } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const existing = await db.portfolioProject.findUnique({
      where: { id: payload.id },
      select: { learnerId: true, description: true, projectUrl: true, isValidated: true, completedAt: true },
    });
    if (!existing) return { ok: false, error: "Proyek tidak ditemukan." };
    if (existing.learnerId !== profile.id) return { ok: false, error: "Anda bukan pemilik proyek." };

    if (payload.skillIds) {
      await db.portfolioEvidenceSkill.deleteMany({ where: { projectId: payload.id } });
    }

    const completedAt = payload.completedAt !== undefined
      ? (payload.completedAt ? new Date(payload.completedAt) : null)
      : existing.completedAt;

    const evidenceStrength = computeEvidenceStrength({
      description: payload.description ?? existing.description,
      projectUrl: payload.projectUrl ?? existing.projectUrl,
      skills: payload.skillIds?.length ?? 0,
      isValidated: existing.isValidated,
      completedAt,
    });

    const project = await db.portfolioProject.update({
      where: { id: payload.id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
        ...(payload.projectUrl !== undefined ? { projectUrl: payload.projectUrl?.trim() || null } : {}),
        ...(payload.techStack !== undefined ? { techStack: payload.techStack } : {}),
        ...(payload.completedAt !== undefined ? { completedAt } : {}),
        evidenceStrength,
        ...(payload.skillIds
          ? {
              skillMappings: {
                create: payload.skillIds.map((skillId) => ({ skillId, strength: 3 })),
              },
            }
          : {}),
      },
      include: {
        skillMappings: {
          include: {
            skill: {
              select: { id: true, name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });

    await logActivity(session.userId, "PORTFOLIO_UPDATED", project.title, { projectId: project.id });
    await recalcTRIForLearner(profile.id);

    revalidatePath("/portfolio");
    revalidatePath("/resume");
    return { ok: true, data: serialize(project) };
  } catch (err) {
    console.error("updatePortfolioProjectAction error", err);
    return { ok: false, error: "Gagal memperbarui proyek." };
  }
}

export async function deletePortfolioProjectAction(
  projectId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") return { ok: false, error: "Sesi tidak valid." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const existing = await db.portfolioProject.findUnique({
      where: { id: projectId },
      select: { learnerId: true, title: true },
    });
    if (!existing) return { ok: false, error: "Proyek tidak ditemukan." };
    if (existing.learnerId !== profile.id) return { ok: false, error: "Anda bukan pemilik proyek." };

    await db.portfolioEvidenceSkill.deleteMany({ where: { projectId } });
    await db.portfolioProject.delete({ where: { id: projectId } });

    await logActivity(session.userId, "PORTFOLIO_DELETED", existing.title, { projectId });
    await recalcTRIForLearner(profile.id);

    revalidatePath("/portfolio");
    return { ok: true };
  } catch (err) {
    console.error("deletePortfolioProjectAction error", err);
    return { ok: false, error: "Gagal menghapus proyek." };
  }
}

export async function listSkillsForPortfolioAction(): Promise<
  { ok: true; data: { id: string; name: string; category: string }[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesi tidak valid." };

  try {
    const skills = await db.skill.findMany({
      select: { id: true, name: true, category: { select: { name: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });
    return {
      ok: true,
      data: skills.map((s) => ({ id: s.id, name: s.name, category: s.category.name })),
    };
  } catch (err) {
    console.error("listSkillsForPortfolioAction error", err);
    return { ok: false, error: "Gagal memuat daftar skill." };
  }
}

// Mentor-facing validation action
export interface ValidationPayload {
  projectId: string;
  isValidated: boolean;
  validationNote?: string;
  evidenceStrength?: number;
  skillStrengths?: { skillId: string; strength: number }[];
}

export async function validatePortfolioAction(
  payload: ValidationPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "MENTOR") return { ok: false, error: "Hanya mentor yang dapat memvalidasi." };

  try {
    const project = await db.portfolioProject.findUnique({
      where: { id: payload.projectId },
      select: { id: true, learnerId: true, title: true, learner: { select: { userId: true } } },
    });
    if (!project) return { ok: false, error: "Proyek tidak ditemukan." };

    const mentoringLink = await db.mentoringSession.findFirst({
      where: {
        mentorId: session.userId,
        menteeId: project.learner.userId,
        status: { in: ["ACCEPTED", "COMPLETED"] },
      },
      select: { id: true },
    });
    if (!mentoringLink) return { ok: false, error: "Anda belum terhubung dengan learner ini." };

    await db.portfolioProject.update({
      where: { id: payload.projectId },
      data: {
        isValidated: payload.isValidated,
        validatedBy: session.userId,
        validationNote: payload.validationNote ?? null,
        evidenceStrength: payload.evidenceStrength ?? undefined,
      },
    });

    if (payload.skillStrengths) {
      for (const s of payload.skillStrengths) {
        await db.portfolioEvidenceSkill.updateMany({
          where: { projectId: payload.projectId, skillId: s.skillId },
          data: { strength: s.strength },
        });
      }
    }

    if (payload.isValidated) {
      await db.notification.create({
        data: {
          userId: project.learner.userId,
          type: "EVIDENCE_VALIDATED",
          title: "Proyek tervalidasi",
          message: `Mentor memvalidasi proyek "${project.title}". Portfolio strength Anda bertambah.`,
          actionUrl: "/portfolio",
        },
      });
    }

    await logActivity(session.userId, "PORTFOLIO_VALIDATED", project.title, { projectId: project.id });
    await recalcTRIForLearner(project.learnerId);

    revalidatePath("/portfolio");
    revalidatePath("/mentor/learners");
    return { ok: true };
  } catch (err) {
    console.error("validatePortfolioAction error", err);
    return { ok: false, error: "Gagal memvalidasi proyek." };
  }
}
