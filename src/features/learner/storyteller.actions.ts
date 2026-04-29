"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type StoryTone = "professional" | "casual" | "aspirational";

export interface StoryVariant {
  tone: StoryTone;
  toneLabel: string;
  headline: string;
  body: string;
  elevator: string;
  linkedinAbout: string;
  hashtags: string[];
}

export interface StorytellerResult {
  variants: StoryVariant[];
  dataPoints: {
    fullName: string;
    targetRole: string | null;
    education: string | null;
    topSkills: string[];
    projectCount: number;
    validatedProjects: number;
    badgeCount: number;
    mentorSessions: number;
    triScore: number;
    triMilestone: string;
    weeksActive: number;
  };
}

function labelTone(t: StoryTone): string {
  return t === "professional" ? "Profesional" : t === "casual" ? "Santai" : "Aspirasional";
}

function joinAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, dan ${items[items.length - 1]}`;
}

function renderVariant(tone: StoryTone, d: StorytellerResult["dataPoints"]): StoryVariant {
  const top = d.topSkills.slice(0, 3);
  const skillPhrase = top.length > 0 ? joinAnd(top) : "fundamental pemrograman";
  const target = d.targetRole ?? "karier digital";
  const wins: string[] = [];
  if (d.validatedProjects > 0) wins.push(`${d.validatedProjects} proyek tervalidasi`);
  if (d.mentorSessions > 0) wins.push(`${d.mentorSessions} sesi mentoring`);
  if (d.badgeCount > 0) wins.push(`${d.badgeCount} badge pencapaian`);
  const winPhrase = wins.length > 0 ? joinAnd(wins) : `${d.weeksActive} minggu konsisten belajar`;

  if (tone === "professional") {
    const headline = `${target} in the making — ${d.triMilestone.replace("_", " ").toLowerCase()} trajectory`;
    const body = [
      `Saya ${d.fullName}, ${d.education ?? "pembelajar mandiri"} yang sedang membangun kompetensi ${skillPhrase} untuk transisi ke peran ${target}.`,
      `Dengan Talent Readiness Index ${d.triScore.toFixed(0)} dan pencapaian terdokumentasi (${winPhrase}), saya berkomitmen pada pembelajaran berbasis outcome — bukan sekadar menyelesaikan kursus, tapi membangun portfolio yang dapat diverifikasi.`,
      `Fokus 90 hari ke depan: memperdalam ${top[0] ?? skillPhrase} dan menyelesaikan proyek capstone yang mensimulasikan problem ${target} di industri.`,
    ].join("\n\n");
    const elevator = `${target}-in-training dengan kekuatan ${top[0] ?? skillPhrase}. TRI ${d.triScore.toFixed(0)} · ${winPhrase}. Saya mencari kesempatan untuk menerapkan skill ini pada problem nyata.`;
    const linkedinAbout = body + `\n\n📌 Actively seeking opportunities in ${target}.`;
    return {
      tone,
      toneLabel: labelTone(tone),
      headline,
      body,
      elevator,
      linkedinAbout,
      hashtags: ["#OpenToWork", `#${target.replace(/\s+/g, "")}`, "#ContinuousLearning", "#EvidenceBasedLearning"],
    };
  }

  if (tone === "casual") {
    const headline = `Currently leveling up ${top[0] ?? "my skills"} 🚀`;
    const body = [
      `Hai, aku ${d.fullName.split(" ")[0]}! Lagi on-journey jadi ${target}, dan sejauh ini sudah kumpul ${skillPhrase}.`,
      `Yang paling aku banggain? ${winPhrase}. Gak sempurna sih, masih banyak PR, tapi consistency is the game — TRI ${d.triScore.toFixed(0)} dan naik terus.`,
      `Kalau kamu juga lagi belajar hal serupa atau punya proyek menarik, yuk ngobrol. Aku percaya learning in public itu jauh lebih seru dari belajar sendirian 💪`,
    ].join("\n\n");
    const elevator = `${d.fullName.split(" ")[0]} here — belajar ${top[0] ?? skillPhrase}, lagi bangun ${winPhrase}. Mau jadi ${target}. Let's connect!`;
    const linkedinAbout = body;
    return {
      tone,
      toneLabel: labelTone(tone),
      headline,
      body,
      elevator,
      linkedinAbout,
      hashtags: ["#LearningInPublic", "#BuildInPublic", `#${(top[0] ?? "Coding").replace(/\s+/g, "")}`, "#JourneyNotDestination"],
    };
  }

  const headline = `${target} — tapi bukan sekadar gelar, melainkan dampak.`;
  const body = [
    `Ada banyak orang yang belajar coding. Tapi saya belajar untuk menyelesaikan problem yang peduli pada saya: ${target} yang bisa menjembatani kesenjangan digital di Indonesia.`,
    `Langkah-langkah awal saya: membangun kekuatan di ${skillPhrase}, mengumpulkan ${winPhrase}, dan mempertahankan TRI ${d.triScore.toFixed(0)} selama ${d.weeksActive} minggu.`,
    `Visi 2-3 tahun ke depan: menjadi ${target} yang tidak hanya punya technical depth, tapi juga kemampuan komunikasi yang membuat teknologi dapat diakses oleh lebih banyak orang. Perjalanan ini baru dimulai.`,
  ].join("\n\n");
  const elevator = `Saya membangun diri sebagai ${target} dengan tujuan lebih besar: menjembatani gap digital. Fondasi: ${skillPhrase}. Bukti: ${winPhrase}.`;
  const linkedinAbout = body + `\n\n✨ Driven by purpose, measured by outcome.`;
  return {
    tone,
    toneLabel: labelTone(tone),
    headline,
    body,
    elevator,
    linkedinAbout,
    hashtags: ["#PurposeDriven", "#TechForGood", `#${target.replace(/\s+/g, "")}`, "#IndonesiaDigital"],
  };
}

export async function getCareerStoryAction(): Promise<
  { ok: true; data: StorytellerResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        createdAt: true,
        learnerProfile: {
          select: {
            id: true,
            fullName: true,
            educationStatus: true,
            currentTRI: true,
            triMilestone: true,
            targetCareerRole: { select: { name: true } },
          },
        },
      },
    });
    if (!user?.learnerProfile) return { ok: false, error: "Profil learner tidak ditemukan." };
    const profile = user.learnerProfile;

    const [snapshots, projects, badges, sessions] = await Promise.all([
      db.skillScoreSnapshot.findMany({
        where: { learnerId: profile.id },
        orderBy: { snapshotAt: "desc" },
        select: { skillId: true, score: true, skill: { select: { name: true } } },
      }),
      db.portfolioProject.findMany({
        where: { learnerId: profile.id },
        select: { isValidated: true },
      }),
      db.userBadge.count({ where: { userId: session.userId } }),
      db.mentoringSession.count({
        where: { menteeId: session.userId, status: "COMPLETED" },
      }),
    ]);

    const latestBySkill = new Map<string, { score: number; name: string }>();
    for (const s of snapshots) {
      if (!latestBySkill.has(s.skillId)) {
        latestBySkill.set(s.skillId, { score: s.score, name: s.skill.name });
      }
    }
    const topSkills = [...latestBySkill.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.name);

    const now = Date.now();
    const weeksActive = Math.max(1, Math.round((now - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7)));

    const dataPoints: StorytellerResult["dataPoints"] = {
      fullName: profile.fullName || user.name || "Learner",
      targetRole: profile.targetCareerRole?.name ?? null,
      education: profile.educationStatus ?? null,
      topSkills,
      projectCount: projects.length,
      validatedProjects: projects.filter((p) => p.isValidated).length,
      badgeCount: badges,
      mentorSessions: sessions,
      triScore: profile.currentTRI,
      triMilestone: profile.triMilestone,
      weeksActive,
    };

    const variants: StoryVariant[] = (["professional", "casual", "aspirational"] as StoryTone[]).map((t) =>
      renderVariant(t, dataPoints),
    );

    return { ok: true, data: { variants, dataPoints } };
  } catch (err) {
    console.error("getCareerStoryAction error", err);
    return { ok: false, error: "Gagal generate cerita karier." };
  }
}
