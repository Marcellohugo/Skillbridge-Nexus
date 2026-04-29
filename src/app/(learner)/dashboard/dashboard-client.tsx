"use client";

import Link from "next/link";
import { DailyChallenge } from "@/components/shared/daily-challenge";
import { SkillRadar } from "@/components/shared/skill-radar";
import { FocusTimer } from "@/components/shared/focus-timer";
import { CareerForecast } from "@/components/shared/career-forecast";

interface DashboardData {
  learnerName: string;
  currentTRI: number;
  triMilestone: string;
  careerFitScore: number;
  riskLevel: string;
  targetRole: string | null;
  weeklyHours: number;
  streakDays: number;
  lastActiveAt: string | null;
}

const TRIMilestoneColors: Record<string, string> = {
  EMERGING: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  DEVELOPING: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  PROGRESSING: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  CAREER_READY: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
  ADVANCED_READY: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
};

const RiskLevelColors: Record<string, string> = {
  LOW: "text-green-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
};

const RiskLevelBg: Record<string, string> = {
  LOW: "bg-green-500/10 border-green-500/20",
  MEDIUM: "bg-yellow-500/10 border-yellow-500/20",
  HIGH: "bg-orange-500/10 border-orange-500/20",
  CRITICAL: "bg-red-500/10 border-red-500/20",
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  const triPercentage = (data.currentTRI / 100) * 100;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background-secondary px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Selamat datang, {data.learnerName}!</h1>
          <p className="text-foreground-secondary">Pantau perkembangan kompetensi dan kesiapan karir Anda</p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* TRI Score Card */}
          <div className="card">
            <p className="text-sm text-foreground-secondary mb-3">Talent Readiness Index</p>
            <div className="mb-4">
              <div className="text-4xl font-display font-bold text-primary">{data.currentTRI.toFixed(1)}</div>
              <div className={`inline-block px-3 py-1 rounded-full border mt-2 text-xs font-medium ${TRIMilestoneColors[data.triMilestone]}`}>
                {data.triMilestone.replace(/_/g, " ")}
              </div>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${triPercentage}%` }}
              />
            </div>
          </div>

          {/* Career Fit Score */}
          <div className="card">
            <p className="text-sm text-foreground-secondary mb-3">Kecocokan Karir</p>
            <div className="mb-4">
              <div className="text-4xl font-display font-bold text-accent">{data.careerFitScore.toFixed(1)}%</div>
              {data.targetRole && (
                <p className="text-xs text-foreground-secondary mt-2">untuk {data.targetRole}</p>
              )}
            </div>
            <Link href="/skill-gap" className="text-xs text-primary hover:underline">
              Lihat gap analysis →
            </Link>
          </div>

          {/* Streak */}
          <div className="card">
            <p className="text-sm text-foreground-secondary mb-3">Konsistensi Belajar</p>
            <div className="mb-4">
              <div className="text-4xl font-display font-bold text-success">{data.streakDays}</div>
              <p className="text-xs text-foreground-secondary mt-2">hari konsisten</p>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < (data.streakDays % 7) ? "bg-success" : "bg-background"}`}
                />
              ))}
            </div>
          </div>

          {/* Risk Status */}
          <div className={`card border ${RiskLevelBg[data.riskLevel]}`}>
            <p className="text-sm text-foreground-secondary mb-3">Status Risiko</p>
            <div className="mb-4">
              <div className={`text-3xl font-display font-bold ${RiskLevelColors[data.riskLevel]}`}>
                {data.riskLevel}
              </div>
              <p className="text-xs text-foreground-secondary mt-2">Tidak ada peringatan</p>
            </div>
            <button className="text-xs text-primary hover:underline">Lihat detail →</button>
          </div>
        </div>

        {/* Daily Challenge + Skill Radar */}
        <div className="grid gap-6 lg:grid-cols-[1fr,380px] mb-8">
          <DailyChallenge />
          <SkillRadar
            title="Radar kompetensi"
            skills={[
              { name: "React", current: 72, target: 85 },
              { name: "TS", current: 58, target: 80 },
              { name: "Testing", current: 35, target: 70 },
              { name: "A11y", current: 42, target: 75 },
              { name: "Perf", current: 48, target: 75 },
              { name: "System", current: 30, target: 60 },
            ]}
          />
        </div>

        {/* Focus Timer + Career Forecast */}
        <div className="grid gap-6 lg:grid-cols-[380px,1fr] mb-8">
          <FocusTimer />
          <CareerForecast
            currentTRI={data.currentTRI}
            weeklyHours={data.weeklyHours}
            targetRole={data.targetRole}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Critical Skill Gaps */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Gap Skill Kritis</h2>
              <Link href="/skill-gap" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { name: "React Hooks Advanced", current: 45, target: 85, importance: "Sangat Tinggi" },
                { name: "TypeScript Generics", current: 35, target: 80, importance: "Tinggi" },
                { name: "Testing & TDD", current: 40, target: 75, importance: "Tinggi" },
              ].map((skill, idx) => (
                <div key={idx} className="pb-4 border-b border-border last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{skill.name}</p>
                      <p className="text-xs text-foreground-secondary">{skill.importance}</p>
                    </div>
                    <span className="text-xs font-mono bg-background px-2 py-1 rounded text-primary">
                      {skill.current}% → {skill.target}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${skill.current}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent/50 h-full"
                        style={{ width: `${skill.target}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full py-2 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Mulai Learning Path →
            </button>
          </div>

          {/* Next Milestone */}
          <div className="card border-l-2 border-l-accent">
            <h3 className="font-display font-bold mb-4">Milestone Berikutnya</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground-secondary mb-1">Target Saat Ini</p>
                <p className="font-medium text-lg">TRI 75+ (Career Ready)</p>
              </div>
              <div className="bg-background rounded-lg p-3">
                <p className="text-xs text-foreground-secondary mb-2">Pencapaian dalam</p>
                <p className="font-display font-bold text-lg text-accent">6.5 poin</p>
                <p className="text-xs text-foreground-secondary mt-1">~3 minggu dengan target 12 jam/minggu</p>
              </div>
              <div>
                <p className="text-xs text-foreground-secondary mb-2">Komponen Penting</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Selesaikan 2 modul advanced
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Hubungi 1 mentor mingguan
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Jaga konsistensi 3 minggu penuh
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress & Recommendations */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Learning Path Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Learning Path Aktif</h2>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">7/12 selesai</span>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { name: "React Fundamentals", status: "completed", progress: 100 },
                { name: "ES6+ Features", status: "completed", progress: 100 },
                { name: "Async Programming", status: "in-progress", progress: 65 },
                { name: "React Hooks Deep Dive", status: "pending", progress: 0 },
                { name: "TypeScript Basics", status: "pending", progress: 0 },
              ].map((module, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{module.name}</span>
                    <span className="text-xs text-foreground-secondary">{module.progress}%</span>
                  </div>
                  <div className="bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        module.status === "completed"
                          ? "bg-success"
                          : module.status === "in-progress"
                            ? "bg-primary"
                            : "bg-muted/30"
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
              Lanjutkan Pembelajaran
            </button>
          </div>

          {/* Mentor Recommendations */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Rekomendasi Mentor</h2>
              <Link href="/mentors" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="space-y-4 mb-6">
              {[
                {
                  name: "Sarah Chen",
                  expertise: "React & Frontend Architecture",
                  availability: "2 sesi/minggu",
                  match: 95,
                },
                {
                  name: "Budi Santoso",
                  expertise: "TypeScript & System Design",
                  availability: "1 sesi/minggu",
                  match: 88,
                },
              ].map((mentor, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{mentor.name}</p>
                      <p className="text-xs text-foreground-secondary">{mentor.expertise}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary">{mentor.match}% match</p>
                      <p className="text-xs text-foreground-secondary">{mentor.availability}</p>
                    </div>
                  </div>
                  <button className="w-full text-xs py-2 px-2 rounded border border-primary text-primary hover:bg-primary/10 transition-colors">
                    Hubungi Mentor
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Jelajahi Mentor Lainnya
            </button>
          </div>
        </div>

        {/* Portfolio & Accessibility */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Portfolio Evidence */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Portfolio Evidence</h2>
              <span className="text-sm bg-success/10 text-success px-3 py-1 rounded-full font-medium">3 proyek</span>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { title: "E-Commerce Platform", skills: 5, status: "Validated" },
                { title: "Task Management App", skills: 4, status: "Pending" },
                { title: "API Gateway System", skills: 3, status: "In Review" },
              ].map((project, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{project.title}</p>
                      <p className="text-xs text-foreground-secondary mt-1">{project.skills} skills mapped</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        project.status === "Validated"
                          ? "bg-success/10 text-success"
                          : project.status === "In Review"
                            ? "bg-primary/10 text-primary"
                            : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
              Tambah Proyek Portfolio
            </button>
          </div>

          {/* Accessibility & Preferences */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold">Preferensi & Aksesibilitas</h2>
              <Link href="/profile" className="text-sm text-primary hover:underline">
                Edit
              </Link>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-foreground-secondary mb-2">GAYA BELAJAR</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Visual</span>
                  <span className="px-3 py-1 rounded-full bg-background text-foreground-secondary text-xs">Hands-On</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-foreground-secondary mb-2">TARGET JAM BELAJAR</p>
                <p className="text-sm font-medium">{data.weeklyHours} jam per minggu</p>
              </div>

              <div>
                <p className="text-xs text-foreground-secondary mb-2">AKSESIBILITAS</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-background border border-border">Reduced Motion</span>
                  <span className="text-xs px-2 py-1 rounded bg-background border border-border">Regular Fonts</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-foreground-secondary mb-2">PREFERENSI MENTORING</p>
                <p className="text-sm font-medium">Structured mentoring</p>
              </div>
            </div>

            <Link
              href="/profile"
              className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors text-center inline-block"
            >
              Customize Preferences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
