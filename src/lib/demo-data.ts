// Realistic demo data backing all dashboards and flows.
// Structured to reflect the real product logic so judges see coherent storytelling.

import { calculateTRI, getTRIMilestone, type TRIComponents } from "./calculations";

export const DEMO_LEARNER = {
  id: "u-demo",
  name: "Aisyah Putri",
  email: "learner@skillbridge.id",
  avatarInitials: "AP",
  educationStatus: "Mahasiswa S1 - Sistem Informasi",
  careerTarget: "Frontend Engineer",
  pace: "Moderate",
  joinedWeeksAgo: 8,
};

export const DEMO_TRI_COMPONENTS: TRIComponents = {
  assessmentScore: 74,
  roleFitScore: 68,
  learningProgress: 62,
  mentoringContribution: 55,
  portfolioStrength: 48,
  consistencyStreak: 78,
};

export const DEMO_TRI = calculateTRI(DEMO_TRI_COMPONENTS);
export const DEMO_TRI_MILESTONE = getTRIMilestone(DEMO_TRI);

export type SkillGapItem = {
  id: string;
  skill: string;
  category: string;
  current: number;
  target: number;
  importance: 1 | 2 | 3;
  trend: "up" | "flat" | "down";
};

export const DEMO_SKILL_GAPS: SkillGapItem[] = [
  { id: "s1", skill: "React & Component Patterns", category: "Frontend", current: 72, target: 85, importance: 3, trend: "up" },
  { id: "s2", skill: "TypeScript Advanced",          category: "Frontend", current: 58, target: 80, importance: 3, trend: "up" },
  { id: "s3", skill: "Testing (Unit & E2E)",         category: "Quality",  current: 35, target: 70, importance: 2, trend: "flat" },
  { id: "s4", skill: "Accessibility (WCAG)",         category: "Frontend", current: 42, target: 75, importance: 3, trend: "up" },
  { id: "s5", skill: "System Design Basics",         category: "Arsitektur", current: 30, target: 60, importance: 2, trend: "flat" },
  { id: "s6", skill: "State Management (Zustand/RQ)",category: "Frontend", current: 66, target: 80, importance: 2, trend: "up" },
  { id: "s7", skill: "Performance Optimization",     category: "Frontend", current: 48, target: 75, importance: 2, trend: "flat" },
  { id: "s8", skill: "Git Workflow Kolaboratif",     category: "Kolaborasi", current: 80, target: 85, importance: 1, trend: "up" },
];

export type LearningModule = {
  id: string;
  title: string;
  category: string;
  durationHrs: number;
  status: "completed" | "in_progress" | "upcoming" | "locked";
  progress: number;
  skillsCovered: string[];
  format: "video" | "practice" | "project" | "reading";
};

export const DEMO_LEARNING_PATH: LearningModule[] = [
  { id: "m1",  title: "Foundations of Modern React",          category: "Frontend",  durationHrs: 6,  status: "completed",  progress: 100, skillsCovered: ["React & Component Patterns"], format: "video" },
  { id: "m2",  title: "TypeScript untuk React Developers",    category: "Frontend",  durationHrs: 8,  status: "completed",  progress: 100, skillsCovered: ["TypeScript Advanced"],       format: "video" },
  { id: "m3",  title: "Hooks Lanjutan & Custom Hooks",        category: "Frontend",  durationHrs: 5,  status: "completed",  progress: 100, skillsCovered: ["React & Component Patterns"], format: "practice" },
  { id: "m4",  title: "Accessibility First: WCAG Essentials", category: "Inclusive", durationHrs: 4,  status: "in_progress", progress: 62,  skillsCovered: ["Accessibility (WCAG)"],     format: "reading" },
  { id: "m5",  title: "State Management Modern",              category: "Frontend",  durationHrs: 5,  status: "in_progress", progress: 28,  skillsCovered: ["State Management (Zustand/RQ)"], format: "video" },
  { id: "m6",  title: "Testing Komponen React",               category: "Quality",   durationHrs: 7,  status: "upcoming",   progress: 0,   skillsCovered: ["Testing (Unit & E2E)"],     format: "practice" },
  { id: "m7",  title: "Performance & Rendering Optimization", category: "Frontend",  durationHrs: 6,  status: "upcoming",   progress: 0,   skillsCovered: ["Performance Optimization"], format: "video" },
  { id: "m8",  title: "Capstone Project: Accessible Dashboard", category: "Project",  durationHrs: 14, status: "locked",    progress: 0,   skillsCovered: ["React & Component Patterns","Accessibility (WCAG)"], format: "project" },
];

export type MentorSuggestion = {
  id: string;
  name: string;
  title: string;
  company: string;
  avatarInitials: string;
  matchScore: number;
  reasons: string[];
  expertise: string[];
  rating: number;
  sessions: number;
  rateHour: string;
};

export const DEMO_MENTORS: MentorSuggestion[] = [
  {
    id: "mt1", name: "Raka Adiputra", title: "Senior Frontend Engineer", company: "Gojek",
    avatarInitials: "RA", matchScore: 94, rating: 4.9, sessions: 148, rateHour: "Gratis – Program Nexus",
    expertise: ["React", "TypeScript", "Performance"],
    reasons: ["Menutup 3 gap skill utama Anda", "Fokus karir sama: Frontend Engineer", "Feedback akselerasi TRI 92%"],
  },
  {
    id: "mt2", name: "Dr. Lina Hapsari", title: "Inclusive Design Lead", company: "Tokopedia",
    avatarInitials: "LH", matchScore: 88, rating: 4.8, sessions: 92, rateHour: "Gratis – Program Nexus",
    expertise: ["Accessibility", "Design System", "WCAG"],
    reasons: ["Spesialisasi pada gap Accessibility Anda", "Profil accessibility preferences Anda aktif", "Cocok untuk modul WCAG yang sedang berjalan"],
  },
  {
    id: "mt3", name: "Bima Pratama", title: "Staff Engineer", company: "Bukalapak",
    avatarInitials: "BP", matchScore: 81, rating: 4.7, sessions: 203, rateHour: "Rp 150rb / jam",
    expertise: ["System Design", "Architecture", "Testing"],
    reasons: ["Menutup gap System Design & Testing", "Sesi 1:1 intensif untuk mid-level", "Rekomendasi riwayat belajar Anda"],
  },
  {
    id: "mt4", name: "Nadia Kusuma", title: "QA Engineer", company: "Traveloka",
    avatarInitials: "NK", matchScore: 76, rating: 4.8, sessions: 67, rateHour: "Gratis – Program Nexus",
    expertise: ["Testing", "E2E", "Playwright"],
    reasons: ["Gap Testing masih 35/70", "Program mentoring mingguan cocok dengan pace Anda"],
  },
];

export const DEMO_ACTIVITY = [
  { id: "a1", at: "2 jam lalu", icon: "🎯", text: "Menyelesaikan modul Hooks Lanjutan & Custom Hooks", tag: "Learning" },
  { id: "a2", at: "Kemarin",     icon: "🤝", text: "Sesi mentoring dengan Raka Adiputra (45 menit)",       tag: "Mentoring" },
  { id: "a3", at: "2 hari lalu", icon: "📘", text: "Memulai modul Accessibility First: WCAG Essentials",  tag: "Learning" },
  { id: "a4", at: "3 hari lalu", icon: "🧪", text: "Asesmen Testing naik 12 poin (23 → 35)",               tag: "Assessment" },
  { id: "a5", at: "5 hari lalu", icon: "🪄", text: "Portfolio baru: \"Accessible To-Do App\" diunggah",    tag: "Portfolio" },
];

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  skills: string[];
  verified: boolean;
  link?: string;
  description: string;
  at: string;
};

export const DEMO_PORTFOLIO: PortfolioItem[] = [
  { id: "p1", title: "Accessible To-Do App",              category: "Web Project", skills: ["React", "Accessibility", "TypeScript"], verified: true,  link: "#", description: "Aplikasi to-do dengan full keyboard nav, screen reader support & WCAG AA.", at: "Minggu ini" },
  { id: "p2", title: "Design System Starter Kit",         category: "OSS",         skills: ["React", "Design System"],               verified: true,  link: "#", description: "Komponen library open-source dengan Storybook & unit tests.",                at: "Bulan lalu" },
  { id: "p3", title: "Dashboard Analitik Sekolah",        category: "Capstone",    skills: ["React", "Data Viz"],                    verified: false,            description: "Dashboard untuk memvisualisasikan progres siswa — pending validasi mentor.", at: "6 minggu lalu" },
];

export const DEMO_NEXT_MILESTONE = {
  name: "Career Ready",
  targetTRI: 75,
  weeksLeft: 6,
  checklist: [
    { label: "Selesaikan modul WCAG Essentials",     done: false, progress: 62 },
    { label: "Selesaikan 2 sesi mentoring",          done: false, progress: 50 },
    { label: "Tambah 1 portfolio proyek tervalidasi", done: true,  progress: 100 },
    { label: "Naikkan skor Testing ke 60+",          done: false, progress: 45 },
  ],
};

export const DEMO_TRI_TIMELINE = [
  { week: "W1", tri: 28 }, { week: "W2", tri: 32 }, { week: "W3", tri: 41 },
  { week: "W4", tri: 47 }, { week: "W5", tri: 53 }, { week: "W6", tri: 58 },
  { week: "W7", tri: 63 }, { week: "W8", tri: DEMO_TRI },
];

export const DEMO_ROLE_FIT_ROLES = [
  { role: "Frontend Engineer",    score: 82, demand: "High",   growth: "+12%/yr" },
  { role: "UI Engineer",          score: 78, demand: "Medium", growth: "+8%/yr" },
  { role: "Accessibility Engineer", score: 71, demand: "Medium", growth: "+15%/yr" },
  { role: "Full-stack Web Dev",   score: 64, demand: "High",   growth: "+10%/yr" },
  { role: "QA Engineer",          score: 46, demand: "Medium", growth: "+6%/yr" },
];

// ─────────── Mentor dashboard ───────────
export const DEMO_MENTOR = {
  name: "Raka Adiputra",
  email: "mentor@skillbridge.id",
  title: "Senior Frontend Engineer",
  rating: 4.9,
  totalSessions: 148,
  activeLearners: 12,
  hoursThisMonth: 28,
  pendingRequests: 3,
};

export const DEMO_MENTOR_SESSIONS = [
  { id: "s1", learner: "Aisyah P.", topic: "React Performance Deep-dive", when: "Hari ini, 19:00", status: "confirmed" as const },
  { id: "s2", learner: "Dimas R.",  topic: "Review Portfolio & Karir",    when: "Besok, 20:00",    status: "confirmed" as const },
  { id: "s3", learner: "Siti A.",   topic: "Bootcamp Check-in",           when: "Jumat, 18:30",    status: "pending"   as const },
];

export const DEMO_MENTOR_LEARNERS = [
  { id: "l1", name: "Aisyah Putri", focus: "Frontend Engineer",     tri: 65, trend: "+7 minggu ini" },
  { id: "l2", name: "Dimas Raka",   focus: "Full-stack Developer",  tri: 58, trend: "+4 minggu ini" },
  { id: "l3", name: "Siti Anisa",   focus: "UI Engineer",           tri: 48, trend: "+9 minggu ini" },
  { id: "l4", name: "Fikri Jaya",   focus: "Mobile Developer",      tri: 72, trend: "+3 minggu ini" },
];

// ─────────── Admin / Institution ───────────
export const DEMO_ADMIN_STATS = {
  totalUsers: 1247,
  activeLearners: 892,
  mentors: 156,
  institutions: 24,
  avgTRI: 62.4,
  monthlyGrowth: 12,
};

export const DEMO_INSTITUTION = {
  name: "Universitas Teknologi Nusantara",
  totalLearners: 324,
  avgTRI: 68.9,
  activeCohorts: 8,
  mentorsAssigned: 34,
  careerReadyPct: 27,
};

export const DEMO_COHORTS = [
  { name: "Frontend Development 2026-Q1",    size: 42, progress: 65, avgTRI: 71, status: "On Track" as const },
  { name: "Backend & System Design",          size: 38, progress: 58, avgTRI: 66, status: "On Track" as const },
  { name: "Data & Analytics Bootcamp",        size: 35, progress: 45, avgTRI: 54, status: "At Risk" as const },
  { name: "Digital Marketing Accelerator",    size: 31, progress: 68, avgTRI: 69, status: "On Track" as const },
  { name: "Product Management Cohort",        size: 26, progress: 55, avgTRI: 64, status: "On Track" as const },
  { name: "Financial Analyst Track",          size: 24, progress: 48, avgTRI: 58, status: "On Track" as const },
];
