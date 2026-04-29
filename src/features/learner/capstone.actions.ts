"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CapstoneMilestone {
  week: number;
  title: string;
  deliverable: string;
}

export interface CapstoneChallenge {
  id: string;
  title: string;
  tagline: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedWeeks: number;
  targetRole: string;
  problemStatement: string;
  objectives: string[];
  techStack: string[];
  milestones: CapstoneMilestone[];
  successCriteria: string[];
  stretchGoals: string[];
  skillsExercised: string[];
  gapsClosed: string[];
}

export interface CapstoneResult {
  challenges: CapstoneChallenge[];
  targetRole: string | null;
  topSkillsUsed: string[];
  gapsCovered: number;
}

interface Blueprint {
  slug: string;
  titles: string[];
  taglines: string[];
  problemTemplates: string[];
  objectivesBase: string[];
  techHints: string[];
  stretchGoals: string[];
  fallbackSkills: string[];
}

const BLUEPRINTS: Record<string, Blueprint> = {
  "frontend-developer": {
    slug: "frontend-developer",
    titles: [
      "Aksesibel Recipe Explorer",
      "Learning Dashboard for UMKM",
      "Offline-First Kanban",
    ],
    taglines: [
      "Cari resep dengan filter cerdas — dan tetap terbaca oleh screen reader",
      "Dashboard sederhana untuk UMKM kecil pantau pesanan & stok",
      "Board task yang tetap jalan tanpa internet",
    ],
    problemTemplates: [
      "Banyak website resep lambat, tidak aksesibel, dan kesulitan difilter. Bangun SPA yang memperlakukan a11y sebagai first-class.",
      "UMKM kecil butuh dashboard yang bisa dibuka dari HP seluler, tidak butuh login ribet, dan terbaca di koneksi 3G.",
      "Tim remote di area sinyal buruk butuh board yang sinkron saat online kembali tanpa kehilangan state lokal.",
    ],
    objectivesBase: [
      "Render 100+ item dengan virtualized list",
      "Lulus audit Lighthouse a11y ≥ 95",
      "Implementasi keyboard navigation penuh",
      "Skor Lighthouse Performance ≥ 90 di 3G",
    ],
    techHints: ["React", "Next.js", "TypeScript", "Tailwind", "Radix UI", "React Query"],
    stretchGoals: [
      "Tambahkan voice search",
      "PWA + install prompt",
      "Dukungan dark mode otomatis",
    ],
    fallbackSkills: ["React.js", "HTML & CSS", "Responsive Design", "JavaScript"],
  },
  "backend-developer": {
    slug: "backend-developer",
    titles: [
      "API Gateway untuk Mikro-komunitas",
      "Rate-Limited Public Data API",
      "Event-Sourced Audit Log",
    ],
    taglines: [
      "Gateway yang handle auth + rate-limit untuk 10k user konkuren",
      "API publik untuk data BPS dengan cache dan quota",
      "Sistem audit log yang bisa di-replay ke state manapun",
    ],
    problemTemplates: [
      "Mikro-komunitas butuh SDK dan API gateway yang dikelola vendor-agnostic, kuat di auth dan rate limiting.",
      "Banyak data BPS sulit dikonsumsi developer. Bangun API publik dengan caching cerdas + dokumentasi OpenAPI.",
      "Tim compliance butuh audit log yang bisa merekonstruksi state database pada timestamp manapun.",
    ],
    objectivesBase: [
      "API response p95 < 200ms",
      "Rate-limit per IP + per token",
      "100% dokumentasi OpenAPI terkurasi",
      "Test coverage ≥ 80%",
    ],
    techHints: ["Node.js", "Express", "PostgreSQL", "Redis", "Prisma", "Zod"],
    stretchGoals: [
      "GraphQL layer di atas REST",
      "Deploy multi-region",
      "Real-time subscriptions via WebSocket",
    ],
    fallbackSkills: ["Node.js", "REST API", "SQL", "JavaScript"],
  },
  "data-analyst": {
    slug: "data-analyst",
    titles: [
      "Indonesia Digital Literacy Dashboard",
      "Ecommerce Churn Playbook",
      "Public Health Signal Tracker",
    ],
    taglines: [
      "Visualisasi tingkat literasi digital per provinsi dari data BPS + Susenas",
      "Analisis churn dan playbook intervensi untuk retention team",
      "Gabung data publik kesehatan untuk deteksi anomali mingguan",
    ],
    problemTemplates: [
      "Tidak ada dashboard publik yang menjelaskan digital divide Indonesia lintas provinsi secara narrative-friendly.",
      "Tim retention sebuah ecommerce butuh alat yang mengidentifikasi user berisiko churn dan merekomendasikan intervensi.",
      "Dinas kesehatan daerah butuh sistem sederhana untuk memantau anomali keluhan kesehatan mingguan.",
    ],
    objectivesBase: [
      "ETL pipeline ≥ 3 sumber data",
      "SQL window functions untuk analisis cohort",
      "Visualisasi interaktif (drill-down)",
      "Executive summary 1 halaman",
    ],
    techHints: ["Python", "Pandas", "SQL", "Jupyter", "Plotly", "Streamlit"],
    stretchGoals: [
      "Model prediksi churn + SHAP explanation",
      "Automasi refresh harian",
      "Export insight ke slide deck",
    ],
    fallbackSkills: ["SQL", "Python", "Statistics", "Data Analysis"],
  },
  "ui-ux-designer": {
    slug: "ui-ux-designer",
    titles: [
      "Design System untuk Produk Gov-Tech",
      "Usability Redesign: Apotek Online",
      "Inclusive Onboarding Flow",
    ],
    taglines: [
      "Design system open-source untuk aplikasi pemerintah daerah",
      "Redesign flow checkout apotek online yang bingungin user lansia",
      "Onboarding yang inclusive buat low-literacy user",
    ],
    problemTemplates: [
      "Aplikasi pemerintah daerah punya tampilan yang tidak konsisten dan sulit di-maintain tim internal.",
      "Flow checkout apotek online punya drop-off 45% di step pembayaran, terutama untuk pengguna 55+.",
      "30% user baru keluar dari onboarding karena step terlalu text-heavy dan tidak ada preview.",
    ],
    objectivesBase: [
      "Research 5+ user via wawancara semi-struktur",
      "Token design + 20+ komponen Figma",
      "Prototype hi-fi + usability test (≥ 3 user)",
      "Dokumentasi design rationale",
    ],
    techHints: ["Figma", "FigJam", "Maze", "Notion", "Lottie"],
    stretchGoals: [
      "Accessibility audit WCAG 2.2",
      "Handoff spec untuk developer",
      "Components in Storybook",
    ],
    fallbackSkills: ["Figma", "Design Thinking", "Communication"],
  },
};

function pickBlueprint(slug: string | null): Blueprint {
  if (slug && BLUEPRINTS[slug]) return BLUEPRINTS[slug];
  return BLUEPRINTS["frontend-developer"];
}

function difficultyFromTRI(tri: number): CapstoneChallenge["difficulty"] {
  if (tri >= 70) return "advanced";
  if (tri >= 50) return "intermediate";
  return "beginner";
}

function weeksFromDifficulty(d: CapstoneChallenge["difficulty"]): number {
  return d === "beginner" ? 3 : d === "intermediate" ? 5 : 7;
}

function buildMilestones(difficulty: CapstoneChallenge["difficulty"], blueprint: Blueprint): CapstoneMilestone[] {
  const weeks = weeksFromDifficulty(difficulty);
  const base: CapstoneMilestone[] = [
    { week: 1, title: "Discovery & spec", deliverable: "Problem brief + stakeholder map + success metrics" },
    { week: 2, title: "Prototype inti", deliverable: "Skeleton working end-to-end dengan data dummy" },
  ];
  if (weeks >= 4) {
    base.push({ week: 3, title: "Integrasi", deliverable: `Hubungkan dengan ${blueprint.techHints.slice(0, 2).join(" + ")}` });
  }
  if (weeks >= 5) {
    base.push({ week: weeks - 2, title: "Polish & aksesibilitas", deliverable: "QA manual + fix 10 issue prioritas + a11y pass" });
  }
  base.push({ week: weeks - 1, title: "User testing", deliverable: "3 sesi usability + iterasi satu putaran" });
  base.push({ week: weeks, title: "Demo & dokumentasi", deliverable: "Video demo ≤ 3 menit + README + retrospektif" });
  return base;
}

export async function getCapstoneChallengesAction(): Promise<
  { ok: true; data: CapstoneResult } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "LEARNER") {
    return { ok: false, error: "Sesi tidak valid." };
  }

  try {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        currentTRI: true,
        targetCareerRole: {
          select: {
            slug: true,
            name: true,
            skillRequirements: {
              select: {
                targetLevel: true,
                importanceWeight: true,
                skill: { select: { id: true, name: true, maxLevel: true } },
              },
            },
          },
        },
      },
    });
    if (!profile) return { ok: false, error: "Profil learner tidak ditemukan." };

    const snapshots = await db.skillScoreSnapshot.findMany({
      where: { learnerId: profile.id },
      orderBy: { snapshotAt: "desc" },
      select: { skillId: true, score: true, skill: { select: { name: true } } },
    });
    const latest = new Map<string, { score: number; name: string }>();
    for (const s of snapshots) {
      if (!latest.has(s.skillId)) latest.set(s.skillId, { score: s.score, name: s.skill.name });
    }

    const topSkills = [...latest.values()].sort((a, b) => b.score - a.score).slice(0, 5).map((s) => s.name);

    const gaps: string[] = [];
    if (profile.targetCareerRole) {
      for (const r of profile.targetCareerRole.skillRequirements) {
        const currentPct = latest.get(r.skill.id)?.score ?? 0;
        const targetPct = (r.targetLevel / (r.skill.maxLevel || 5)) * 100;
        if (targetPct - currentPct > 15) {
          gaps.push(r.skill.name);
        }
      }
    }

    const blueprint = pickBlueprint(profile.targetCareerRole?.slug ?? null);
    const difficulty = difficultyFromTRI(profile.currentTRI);
    const weeks = weeksFromDifficulty(difficulty);

    const challenges: CapstoneChallenge[] = blueprint.titles.map((title, i) => {
      const skillsExercised = [...new Set([...topSkills, ...blueprint.fallbackSkills])].slice(0, 5);
      const gapsClosed = gaps.slice(0, Math.min(3, gaps.length));
      return {
        id: `${blueprint.slug}-${i + 1}`,
        title,
        tagline: blueprint.taglines[i],
        difficulty,
        estimatedWeeks: weeks,
        targetRole: profile.targetCareerRole?.name ?? "Generalist",
        problemStatement: blueprint.problemTemplates[i],
        objectives: blueprint.objectivesBase.slice(0, 4),
        techStack: blueprint.techHints.slice(0, 4 + i).slice(0, 5),
        milestones: buildMilestones(difficulty, blueprint),
        successCriteria: [
          "Demo bekerja end-to-end",
          "Dokumentasi README dengan setup + trade-offs",
          "Minimal 1 feedback loop dari user riil",
          "Retrospektif tertulis (apa yang berhasil + apa yang diubah)",
        ],
        stretchGoals: blueprint.stretchGoals,
        skillsExercised,
        gapsClosed,
      };
    });

    return {
      ok: true,
      data: {
        challenges,
        targetRole: profile.targetCareerRole?.name ?? null,
        topSkillsUsed: topSkills,
        gapsCovered: gaps.length,
      },
    };
  } catch (err) {
    console.error("getCapstoneChallengesAction error", err);
    return { ok: false, error: "Gagal menghasilkan capstone." };
  }
}
