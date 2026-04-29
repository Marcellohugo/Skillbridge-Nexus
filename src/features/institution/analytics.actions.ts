"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CohortSummary {
  id: string;
  name: string;
  program: string | null;
  learnerCount: number;
  avgTRI: number;
  careerReadyCount: number;
  careerReadyPct: number;
  atRiskCount: number;
  milestoneDistribution: { milestone: string; count: number }[];
  startDate: string | null;
  endDate: string | null;
}

export interface InstitutionLearnerRow {
  userId: string;
  learnerId: string;
  name: string;
  email: string;
  currentTRI: number;
  milestone: string;
  riskLevel: string;
  cohortName: string | null;
  targetRole: string | null;
  lastActiveAt: string | null;
  openInterventions: number;
}

export interface InstitutionAnalyticsResult {
  institutionName: string;
  totalLearners: number;
  avgTRI: number;
  careerReadyCount: number;
  careerReadyPct: number;
  atRiskCount: number;
  cohortCount: number;
  recentTRISeries: { date: string; avg: number }[];
  cohorts: CohortSummary[];
  interventionQueue: {
    learnerName: string;
    learnerId: string;
    type: string;
    risk: string;
    trigger: string;
    recommendation: string;
    createdAt: string;
  }[];
  milestoneDistribution: { milestone: string; count: number }[];
  curriculumBlindSpots: { skill: string; gapSum: number; learnersAffected: number }[];
}

async function resolveInstitutionForSession(userId: string) {
  const member = await db.institutionMember.findFirst({
    where: { userId },
    select: { institutionId: true, institution: { select: { id: true, name: true } } },
  });
  if (member) return member.institution;
  // Fallback: first institution (demo)
  return db.institution.findFirst({ select: { id: true, name: true } });
}

export async function getInstitutionAnalyticsAction(): Promise<
  { ok: true; data: InstitutionAnalyticsResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "INSTITUTION_MANAGER") return { ok: false, error: "Hanya institution manager." };

  try {
    const institution = await resolveInstitutionForSession(session.userId);
    if (!institution) return { ok: false, error: "Institution tidak ditemukan." };

    const [cohorts, learners, interventions] = await Promise.all([
      db.cohort.findMany({ where: { institutionId: institution.id } }),
      db.learnerProfile.findMany({
        where: { cohort: { institutionId: institution.id } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          cohort: { select: { id: true, name: true } },
          targetCareerRole: { select: { name: true } },
          interventionRecords: {
            where: { isResolved: false },
            select: { id: true },
          },
        },
      }),
      db.interventionRecord.findMany({
        where: { isResolved: false, learner: { cohort: { institutionId: institution.id } } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          learner: {
            include: { user: { select: { name: true } } },
          },
        },
      }),
    ]);

    const totalLearners = learners.length;
    const avgTRI = totalLearners > 0 ? Math.round(learners.reduce((s, l) => s + l.currentTRI, 0) / totalLearners) : 0;
    const careerReadyCount = learners.filter((l) => l.currentTRI >= 70).length;
    const atRiskCount = learners.filter((l) => l.riskLevel === "HIGH" || l.riskLevel === "CRITICAL").length;

    const milestoneBuckets = new Map<string, number>();
    for (const l of learners) {
      milestoneBuckets.set(l.triMilestone, (milestoneBuckets.get(l.triMilestone) ?? 0) + 1);
    }
    const milestoneDistribution = Array.from(milestoneBuckets.entries()).map(([milestone, count]) => ({ milestone, count }));

    // Cohort summaries
    const cohortSummaries: CohortSummary[] = cohorts.map((c) => {
      const members = learners.filter((l) => l.cohortId === c.id);
      const avg = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.currentTRI, 0) / members.length) : 0;
      const ready = members.filter((m) => m.currentTRI >= 70).length;
      const risk = members.filter((m) => m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL").length;
      const msBuckets = new Map<string, number>();
      for (const m of members) msBuckets.set(m.triMilestone, (msBuckets.get(m.triMilestone) ?? 0) + 1);
      return {
        id: c.id,
        name: c.name,
        program: c.program,
        learnerCount: members.length,
        avgTRI: avg,
        careerReadyCount: ready,
        careerReadyPct: members.length > 0 ? Math.round((ready / members.length) * 100) : 0,
        atRiskCount: risk,
        milestoneDistribution: Array.from(msBuckets.entries()).map(([milestone, count]) => ({ milestone, count })),
        startDate: c.startDate?.toISOString() ?? null,
        endDate: c.endDate?.toISOString() ?? null,
      };
    });

    // Recent TRI trend — last 8 weeks, avg over all learners
    const eightWeeksAgo = new Date(Date.now() - 56 * 86400_000);
    const recent = await db.tRIHistory.findMany({
      where: { learner: { cohort: { institutionId: institution.id } }, recordedAt: { gte: eightWeeksAgo } },
      orderBy: { recordedAt: "asc" },
      select: { score: true, recordedAt: true },
    });
    const bucketMap = new Map<string, { sum: number; count: number }>();
    for (const r of recent) {
      const key = r.recordedAt.toISOString().slice(0, 10);
      const ent = bucketMap.get(key) ?? { sum: 0, count: 0 };
      ent.sum += r.score;
      ent.count++;
      bucketMap.set(key, ent);
    }
    const recentTRISeries = Array.from(bucketMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, avg: Math.round(v.sum / v.count) }));

    // Curriculum blind-spot: skills with aggregate gap across learners
    const gapAgg = await db.skillGapSnapshot.findMany({
      where: { learner: { cohort: { institutionId: institution.id } } },
      include: { skill: { select: { id: true, name: true } } },
      orderBy: { snapshotAt: "desc" },
    });
    const latestGapPerLearnerSkill = new Map<string, { gap: number; skill: string }>();
    for (const g of gapAgg) {
      const key = `${g.learnerId}:${g.skillId}`;
      if (!latestGapPerLearnerSkill.has(key)) latestGapPerLearnerSkill.set(key, { gap: g.gap, skill: g.skill.name });
    }
    const blindSpotMap = new Map<string, { gapSum: number; learners: Set<string> }>();
    for (const [k, v] of latestGapPerLearnerSkill) {
      const learnerId = k.split(":")[0];
      const ent = blindSpotMap.get(v.skill) ?? { gapSum: 0, learners: new Set<string>() };
      ent.gapSum += v.gap;
      ent.learners.add(learnerId);
      blindSpotMap.set(v.skill, ent);
    }
    const curriculumBlindSpots = Array.from(blindSpotMap.entries())
      .map(([skill, v]) => ({ skill, gapSum: Math.round(v.gapSum), learnersAffected: v.learners.size }))
      .sort((a, b) => b.gapSum - a.gapSum)
      .slice(0, 8);

    const interventionQueue = interventions.map((i) => ({
      learnerName: i.learner.user.name,
      learnerId: i.learnerId,
      type: i.type,
      risk: i.riskLevel,
      trigger: i.trigger,
      recommendation: i.recommendation,
      createdAt: i.createdAt.toISOString(),
    }));

    return {
      ok: true,
      data: {
        institutionName: institution.name,
        totalLearners,
        avgTRI,
        careerReadyCount,
        careerReadyPct: totalLearners > 0 ? Math.round((careerReadyCount / totalLearners) * 100) : 0,
        atRiskCount,
        cohortCount: cohorts.length,
        recentTRISeries,
        cohorts: cohortSummaries,
        interventionQueue,
        milestoneDistribution,
        curriculumBlindSpots,
      },
    };
  } catch (err) {
    console.error("getInstitutionAnalyticsAction error", err);
    return { ok: false, error: "Gagal memuat analytics institusi." };
  }
}

export async function listInstitutionMembersAction(): Promise<
  { ok: true; data: InstitutionLearnerRow[] } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "INSTITUTION_MANAGER") return { ok: false, error: "Hanya institution manager." };

  try {
    const institution = await resolveInstitutionForSession(session.userId);
    if (!institution) return { ok: false, error: "Institution tidak ditemukan." };

    const learners = await db.learnerProfile.findMany({
      where: { cohort: { institutionId: institution.id } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        cohort: { select: { name: true } },
        targetCareerRole: { select: { name: true } },
        interventionRecords: { where: { isResolved: false }, select: { id: true } },
      },
      orderBy: { currentTRI: "desc" },
    });

    return {
      ok: true,
      data: learners.map((l) => ({
        userId: l.user.id,
        learnerId: l.id,
        name: l.user.name,
        email: l.user.email,
        currentTRI: Math.round(l.currentTRI),
        milestone: l.triMilestone,
        riskLevel: l.riskLevel,
        cohortName: l.cohort?.name ?? null,
        targetRole: l.targetCareerRole?.name ?? null,
        lastActiveAt: l.lastActiveAt?.toISOString() ?? null,
        openInterventions: l.interventionRecords.length,
      })),
    };
  } catch (err) {
    console.error("listInstitutionMembersAction error", err);
    return { ok: false, error: "Gagal memuat anggota." };
  }
}
