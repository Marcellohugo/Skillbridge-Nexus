"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface TwinMatch {
  anonId: string;
  displayLabel: string;
  similarity: number;
  sharedSkills: Array<{ name: string; youLevel: number; theirLevel: number }>;
  uniqueToThem: Array<{ name: string; level: number }>;
  uniqueToYou: Array<{ name: string; level: number }>;
  theirTRI: number;
  triDelta: number;
  badge: "mirror" | "accelerator" | "complementary";
  insight: string;
}

export interface TwinResult {
  matches: TwinMatch[];
  yourSkillCount: number;
  cohortSize: number;
  cohortLabel: string;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const keys = new Set<string>([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const va = a.get(k) ?? 0;
    const vb = b.get(k) ?? 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function anonLabel(idx: number): string {
  const colors = ["Biru", "Hijau", "Kuning", "Merah", "Ungu", "Jingga", "Turquoise", "Magenta"];
  const animals = ["Rusa", "Elang", "Harimau", "Paus", "Serigala", "Burung", "Kucing", "Panda"];
  return `${colors[idx % colors.length]} ${animals[Math.floor(idx / colors.length) % animals.length]}`;
}

export async function getLearningTwinAction(): Promise<
  { ok: true; data: TwinResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const me = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        currentTRI: true,
        targetCareerRoleId: true,
        targetCareerRole: { select: { name: true } },
      },
    });
    if (!me) return { ok: false, error: "Profil learner tidak ditemukan." };

    const [mySnapshots, peers] = await Promise.all([
      db.skillScoreSnapshot.findMany({
        where: { learnerId: me.id },
        orderBy: { snapshotAt: "desc" },
        select: { skillId: true, score: true, skill: { select: { name: true } } },
      }),
      db.learnerProfile.findMany({
        where: {
          id: { not: me.id },
          ...(me.targetCareerRoleId ? { targetCareerRoleId: me.targetCareerRoleId } : {}),
        },
        take: 200,
        select: {
          id: true,
          currentTRI: true,
          skillScoreSnapshots: {
            orderBy: { snapshotAt: "desc" },
            select: { skillId: true, score: true, skill: { select: { name: true } } },
          },
        },
      }),
    ]);

    const myVec = new Map<string, number>();
    const mySkillNames = new Map<string, { name: string; level: number }>();
    for (const s of mySnapshots) {
      if (!myVec.has(s.skillId)) {
        myVec.set(s.skillId, s.score);
        mySkillNames.set(s.skillId, { name: s.skill.name, level: s.score });
      }
    }

    if (myVec.size === 0) {
      return {
        ok: true,
        data: {
          matches: [],
          yourSkillCount: 0,
          cohortSize: peers.length,
          cohortLabel: me.targetCareerRole?.name ?? "Semua learner",
        },
      };
    }

    const scored = peers
      .map((p, idx) => {
        const theirVec = new Map<string, number>();
        const theirSkills = new Map<string, { name: string; level: number }>();
        for (const s of p.skillScoreSnapshots) {
          if (!theirVec.has(s.skillId)) {
            theirVec.set(s.skillId, s.score);
            theirSkills.set(s.skillId, { name: s.skill.name, level: s.score });
          }
        }
        const sim = cosine(myVec, theirVec);
        return { peer: p, theirVec, theirSkills, sim, idx };
      })
      .filter((x) => x.theirVec.size >= 2)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);

    const matches: TwinMatch[] = scored.map(({ peer, theirVec, theirSkills, sim, idx }) => {
      const sharedIds = [...myVec.keys()].filter((k) => theirVec.has(k));
      const shared = sharedIds
        .map((id) => ({
          name: mySkillNames.get(id)!.name,
          youLevel: Math.round(myVec.get(id) ?? 0),
          theirLevel: Math.round(theirVec.get(id) ?? 0),
        }))
        .sort((a, b) => b.theirLevel + b.youLevel - (a.theirLevel + a.youLevel))
        .slice(0, 4);

      const mySkillIds = new Set(mySkillNames.keys());
      const theirSkillIds = new Set(theirSkills.keys());
      const uniqueMineIds = [...mySkillIds].filter((id) => !theirSkillIds.has(id));
      const uniqueTheirIds = [...theirSkillIds].filter((id) => !mySkillIds.has(id));

      const uniqueToThemClean = uniqueTheirIds
        .map((id) => theirSkills.get(id)!)
        .sort((a, b) => b.level - a.level)
        .slice(0, 3)
        .map((s) => ({ name: s.name, level: Math.round(s.level) }));

      const uniqueToYouClean = uniqueMineIds
        .map((id) => mySkillNames.get(id)!)
        .sort((a, b) => b.level - a.level)
        .slice(0, 3)
        .map((s) => ({ name: s.name, level: Math.round(s.level) }));

      const triDelta = peer.currentTRI - me.currentTRI;
      let badge: TwinMatch["badge"];
      if (sim >= 0.9 && Math.abs(triDelta) < 5) badge = "mirror";
      else if (triDelta > 5 && sim >= 0.7) badge = "accelerator";
      else badge = "complementary";

      const insight =
        badge === "mirror"
          ? `Perjalanan paralel. Cocok buat study-buddy karena pace & skill mix mirip banget.`
          : badge === "accelerator"
            ? `Sudah lebih jauh di jalur yang sama — bisa kasih roadmap & jebakan yang sudah mereka lewati.`
            : `Skill kalian saling melengkapi — pertimbangkan pair-project untuk saling belajar.`;

      return {
        anonId: peer.id,
        displayLabel: anonLabel(idx),
        similarity: Math.round(sim * 100),
        sharedSkills: shared,
        uniqueToThem: uniqueToThemClean,
        uniqueToYou: uniqueToYouClean,
        theirTRI: peer.currentTRI,
        triDelta,
        badge,
        insight,
      };
    });

    return {
      ok: true,
      data: {
        matches,
        yourSkillCount: myVec.size,
        cohortSize: peers.length,
        cohortLabel: me.targetCareerRole?.name ?? "Semua learner",
      },
    };
  } catch (err) {
    console.error("getLearningTwinAction error", err);
    return { ok: false, error: "Gagal mencari learning twin." };
  }
}
