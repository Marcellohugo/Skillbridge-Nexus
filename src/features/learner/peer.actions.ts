"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface PeerPulseResult {
  cohort: "target_role" | "global";
  cohortLabel: string;
  peerCount: number;
  yourTRI: number;
  percentile: number;
  rank: number;
  medianTRI: number;
  topTRI: number;
  distribution: { bucket: string; count: number; isYou: boolean }[];
  risingStar: boolean;
}

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "0–20", min: 0, max: 20 },
  { label: "20–40", min: 20, max: 40 },
  { label: "40–55", min: 40, max: 55 },
  { label: "55–70", min: 55, max: 70 },
  { label: "70–85", min: 70, max: 85 },
  { label: "85–100", min: 85, max: 100.01 },
];

function bucketOf(tri: number): number {
  return BUCKETS.findIndex((b) => tri >= b.min && tri < b.max);
}

export async function getPeerPulseAction(): Promise<
  { ok: true; data: PeerPulseResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const me = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: { currentTRI: true, targetCareerRoleId: true, targetCareerRole: { select: { name: true } } },
    });
    if (!me) return { ok: false, error: "Profil tidak ditemukan." };

    const where = me.targetCareerRoleId
      ? { targetCareerRoleId: me.targetCareerRoleId }
      : {};

    const peers = await db.learnerProfile.findMany({
      where,
      select: { userId: true, currentTRI: true },
      take: 500,
    });

    const peerScores = peers
      .filter((p) => p.userId !== session.userId)
      .map((p) => p.currentTRI ?? 0);

    const yourTRI = me.currentTRI ?? 0;

    let percentile = 100;
    if (peerScores.length > 0) {
      const below = peerScores.filter((s) => s < yourTRI).length;
      percentile = Math.round((below / peerScores.length) * 100);
    }

    const sorted = [...peerScores, yourTRI].sort((a, b) => b - a);
    const rank = sorted.indexOf(yourTRI) + 1;

    const mid = Math.floor(peerScores.length / 2);
    const sortedAsc = [...peerScores].sort((a, b) => a - b);
    const medianTRI = peerScores.length === 0 ? yourTRI : sortedAsc[mid];
    const topTRI = peerScores.length === 0 ? yourTRI : Math.max(...peerScores);

    const myBucket = bucketOf(yourTRI);
    const distribution = BUCKETS.map((b, idx) => {
      const count = peerScores.filter((s) => s >= b.min && s < b.max).length + (idx === myBucket ? 1 : 0);
      return { bucket: b.label, count, isYou: idx === myBucket };
    });

    const recentGrowth = await db.tRIHistory.findMany({
      where: { learner: { userId: session.userId } },
      orderBy: { recordedAt: "desc" },
      take: 4,
      select: { score: true },
    });
    const risingStar =
      recentGrowth.length >= 2 &&
      recentGrowth[0].score - recentGrowth[recentGrowth.length - 1].score >= 4;

    return {
      ok: true,
      data: {
        cohort: me.targetCareerRoleId ? "target_role" : "global",
        cohortLabel: me.targetCareerRole?.name ?? "Semua learner",
        peerCount: peerScores.length,
        yourTRI,
        percentile,
        rank,
        medianTRI,
        topTRI,
        distribution,
        risingStar,
      },
    };
  } catch (err) {
    console.error("getPeerPulseAction error", err);
    return { ok: false, error: "Gagal memuat perbandingan peer." };
  }
}
