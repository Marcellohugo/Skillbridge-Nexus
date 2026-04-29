"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CoachReply {
  ok: true;
  intent: string;
  reply: string;
  suggestions: { label: string; href: string }[];
  chips: string[];
}
export type CoachResponse = CoachReply | { ok: false; error: string };

const INTENT_PATTERNS: { intent: string; keywords: string[] }[] = [
  { intent: "next_step", keywords: ["selanjutnya", "langkah", "mulai", "mulai dari mana", "pertama"] },
  { intent: "skill_gap", keywords: ["gap", "lemah", "kurang", "perlu", "skill mana"] },
  { intent: "career", keywords: ["karir", "job", "kerja", "interview", "portfolio", "cv"] },
  { intent: "motivation", keywords: ["lelah", "males", "bosan", "stuck", "menyerah", "bingung"] },
  { intent: "mentor", keywords: ["mentor", "tanya ke siapa", "bantuan ahli"] },
  { intent: "plan", keywords: ["jadwal", "rencana", "waktu", "berapa lama", "kapan"] },
  { intent: "assessment", keywords: ["asesmen", "assessment", "tes", "ujian", "skor"] },
];

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  for (const p of INTENT_PATTERNS) {
    if (p.keywords.some((k) => t.includes(k))) return p.intent;
  }
  return "general";
}

export async function coachChatAction(message: string): Promise<CoachResponse> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  const text = message.trim().slice(0, 1000);
  if (!text) return { ok: false, error: "Pesan kosong." };

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        targetCareerRole: { select: { name: true, description: true, slug: true } },
        skillGapSnapshots: {
          orderBy: { snapshotAt: "desc" },
          take: 10,
          include: { skill: { select: { name: true } } },
        },
        triHistory: { orderBy: { recordedAt: "desc" }, take: 1 },
        learningPath: {
          include: {
            items: {
              where: { isCompleted: false },
              take: 3,
              include: { module: { select: { title: true } } },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const tri = profile.currentTRI || 0;
    const milestone = profile.triMilestone;
    const target = profile.targetCareerRole?.name ?? "peran target Anda";
    const weeklyHours = profile.weeklyHours || 5;
    const topGaps = profile.skillGapSnapshots
      .filter((g) => g.isCritical || g.weightedGap >= 2)
      .slice(0, 3)
      .map((g) => g.skill.name);
    const nextModules = profile.learningPath?.items.map((i) => i.module.title) ?? [];

    const intent = detectIntent(text);
    const reply = buildReply(intent, { tri, milestone, target, weeklyHours, topGaps, nextModules, name: profile.fullName });
    const suggestions = buildSuggestions(intent);
    const chips = ["Apa langkah saya selanjutnya?", "Skill mana yang paling lemah?", "Bagaimana menuju Career Ready?", "Cari mentor yang cocok"];

    return { ok: true, intent, reply, suggestions, chips };
  } catch (err) {
    console.error("coachChatAction error", err);
    return { ok: false, error: "Coach sedang beristirahat, coba lagi sebentar." };
  }
}

function buildReply(
  intent: string,
  ctx: { tri: number; milestone: string; target: string; weeklyHours: number; topGaps: string[]; nextModules: string[]; name: string },
): string {
  const gapList = ctx.topGaps.length ? ctx.topGaps.join(", ") : "belum ada data gap (lakukan asesmen dulu ya)";
  const nextList = ctx.nextModules.length ? ctx.nextModules.join(", ") : "belum ada modul aktif";
  const nameFirst = ctx.name?.split(" ")[0] ?? "kamu";

  switch (intent) {
    case "next_step":
      return `Halo ${nameFirst}! TRI kamu sekarang ${ctx.tri.toFixed(0)} (${ctx.milestone.replace(/_/g, " ").toLowerCase()}). Langkah paling berdampak: **fokus ke gap terbesar** — ${gapList}. Mulai dari modul terdekat di path kamu: ${nextList}. Kalau waktu kamu ${ctx.weeklyHours} jam/minggu, target 1 modul per 7-10 hari realistis.`;
    case "skill_gap":
      return `Gap kritikal kamu saat ini: **${gapList}**. Prioritaskan yang importance-nya tinggi dulu — itu yang paling mempengaruhi kecocokan kamu dengan ${ctx.target}. Setelah asesmen ulang, gap ini akan ter-update otomatis.`;
    case "career":
      return `Untuk ${ctx.target}, tiga hal yang paling diperhatikan recruiter adalah: (1) bukti nyata di portfolio, (2) konsistensi belajar (streak kamu dan TRI), (3) kemampuan kolaborasi. Dengan TRI ${ctx.tri.toFixed(0)}, kamu di level ${ctx.milestone.replace(/_/g, " ").toLowerCase()} — target minimum interview-ready biasanya 70+.`;
    case "motivation":
      return `Kamu tidak sendiri, ${nameFirst}. Saat stuck: (1) kecilkan target — 25 menit fokus hari ini saja, (2) review yang sudah kamu capai — TRI ${ctx.tri.toFixed(0)} bukan nol, (3) ambil quick-win module supaya ada progress visible. Mau saya sarankan satu modul kecil?`;
    case "mentor":
      return `Berdasarkan gap kamu (${gapList}), cari mentor dengan keahlian di area itu. Filter di halaman Mentors pakai expertise — mentor dengan 5+ tahun pengalaman di ${ctx.target} biasanya paling membantu untuk fase ini.`;
    case "plan":
      return `Dengan ${ctx.weeklyHours} jam/minggu dan TRI ${ctx.tri.toFixed(0)}, perkiraan ke Career Ready (TRI 70+): ${Math.max(2, Math.round((Math.max(0, 70 - ctx.tri) * 7) / Math.max(1, ctx.weeklyHours)))} minggu bila konsisten. Kuncinya: 1 asesmen/minggu + 1 modul selesai + 1 sesi mentor/bulan.`;
    case "assessment":
      return `Asesmen adaptif mengukur skill-specific — bukan sekadar nilai global. Setelah submit, TRI kamu auto-update dan gap-list ter-recalculate. Saran: ambil asesmen ulang setiap 2-3 minggu atau setelah menyelesaikan modul baru.`;
    default:
      return `Aku coach kamu di Nexus, ${nameFirst}. Aku melihat TRI kamu ${ctx.tri.toFixed(0)} dengan target ${ctx.target}. Aku bisa bantu terkait: langkah selanjutnya, skill gap, rencana belajar, atau rekomendasi mentor. Pilih chip di bawah atau tanya langsung ya.`;
  }
}

function buildSuggestions(intent: string): { label: string; href: string }[] {
  switch (intent) {
    case "skill_gap":
      return [
        { label: "Lihat gap penuh", href: "/skill-gap" },
        { label: "Mulai modul rekomendasi", href: "/learning-path" },
      ];
    case "career":
      return [
        { label: "Update portfolio", href: "/portfolio" },
        { label: "Ambil asesmen", href: "/assessment" },
      ];
    case "mentor":
      return [
        { label: "Cari mentor", href: "/mentors" },
      ];
    case "plan":
      return [
        { label: "Lihat learning path", href: "/learning-path" },
        { label: "Atur preferensi", href: "/profile" },
      ];
    case "assessment":
      return [
        { label: "Mulai asesmen", href: "/assessment" },
      ];
    case "motivation":
      return [
        { label: "Quick-win modul", href: "/learning-path" },
      ];
    case "next_step":
      return [
        { label: "Lanjut modul aktif", href: "/learning-path" },
        { label: "Lihat dashboard", href: "/dashboard" },
      ];
    default:
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Asesmen", href: "/assessment" },
      ];
  }
}
