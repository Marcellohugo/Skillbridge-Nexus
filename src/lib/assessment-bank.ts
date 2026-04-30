// Diagnostic assessment bank — used by the assessment flow.
// Questions are mapped to seeded skill names for coherent assessment scoring.

export type Question = {
  id: string;
  skill: string;
  category: string;
  difficulty: 1 | 2 | 3;
  text: string;
  options: { id: string; text: string; correct?: boolean }[];
  explanation: string;
};

export type AssessmentDef = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Adaptive";
  skillsCovered: string[];
  questions: Question[];
  recommended?: boolean;
};

const FRONTEND_QUESTIONS: Question[] = [
  {
    id: "q1",
    skill: "React & Component Patterns",
    category: "Frontend",
    difficulty: 2,
    text: "Pola mana yang paling tepat untuk berbagi logika stateful antar komponen di React modern?",
    options: [
      { id: "a", text: "Higher-order components (HOC)" },
      { id: "b", text: "Custom hooks", correct: true },
      { id: "c", text: "Render props" },
      { id: "d", text: "Class mixins" },
    ],
    explanation: "Custom hooks adalah pola kanonik di React modern untuk berbagi logika stateful — lebih ringkas dan composable dibanding HOC/render props.",
  },
  {
    id: "q2",
    skill: "TypeScript Advanced",
    category: "Frontend",
    difficulty: 3,
    text: "Apa hasil dari `type T = keyof { a: 1; b: 2 }`?",
    options: [
      { id: "a", text: "1 | 2" },
      { id: "b", text: "\"a\" | \"b\"", correct: true },
      { id: "c", text: "string" },
      { id: "d", text: "never" },
    ],
    explanation: "`keyof` mengembalikan union dari nama-nama key sebagai literal types — di sini `\"a\" | \"b\"`.",
  },
  {
    id: "q3",
    skill: "Accessibility (WCAG)",
    category: "Frontend",
    difficulty: 2,
    text: "Untuk WCAG 2.1 AA, rasio kontras minimum untuk teks normal pada latar belakangnya adalah?",
    options: [
      { id: "a", text: "3:1" },
      { id: "b", text: "4.5:1", correct: true },
      { id: "c", text: "7:1" },
      { id: "d", text: "2:1" },
    ],
    explanation: "WCAG 2.1 AA mensyaratkan rasio kontras minimum 4.5:1 untuk teks normal dan 3:1 untuk teks besar.",
  },
  {
    id: "q4",
    skill: "Accessibility (WCAG)",
    category: "Frontend",
    difficulty: 1,
    text: "Atribut HTML mana yang paling tepat untuk memberi label pada ikon-only button?",
    options: [
      { id: "a", text: "title" },
      { id: "b", text: "alt" },
      { id: "c", text: "aria-label", correct: true },
      { id: "d", text: "role" },
    ],
    explanation: "`aria-label` memberikan nama yang dapat diakses screen reader untuk elemen tanpa teks visible. `title` tidak konsisten di semua AT.",
  },
  {
    id: "q5",
    skill: "State Management (Zustand/RQ)",
    category: "Frontend",
    difficulty: 2,
    text: "Library mana yang paling tepat untuk *server state* (data dari API) di aplikasi React?",
    options: [
      { id: "a", text: "Redux Toolkit" },
      { id: "b", text: "Zustand" },
      { id: "c", text: "TanStack Query (React Query)", correct: true },
      { id: "d", text: "useState" },
    ],
    explanation: "TanStack Query dirancang khusus untuk server state — caching, dedup, refetch, sinkronisasi — yang sulit ditangani oleh state manager generik.",
  },
  {
    id: "q6",
    skill: "Performance Optimization",
    category: "Frontend",
    difficulty: 3,
    text: "Manakah yang BUKAN cara mengurangi LCP (Largest Contentful Paint)?",
    options: [
      { id: "a", text: "Preload hero image" },
      { id: "b", text: "Server-side render konten utama" },
      { id: "c", text: "Lazy load image hero", correct: true },
      { id: "d", text: "Optimasi font loading dengan font-display: swap" },
    ],
    explanation: "Lazy-loading hero image justru memperburuk LCP karena element terbesar tertunda. Hero image sebaiknya di-preload, bukan di-lazy-load.",
  },
  {
    id: "q7",
    skill: "Testing (Unit & E2E)",
    category: "Quality",
    difficulty: 2,
    text: "Untuk testing komponen React, pendekatan yang direkomendasikan oleh Testing Library adalah?",
    options: [
      { id: "a", text: "Test implementation details (state internal, lifecycle)" },
      { id: "b", text: "Test berdasarkan apa yang dilihat dan dilakukan user", correct: true },
      { id: "c", text: "Mock semua child components" },
      { id: "d", text: "Snapshot testing untuk semua komponen" },
    ],
    explanation: "Testing Library memprioritaskan testing berdasarkan perilaku user — lebih tahan refactor dan menjamin UX bekerja.",
  },
  {
    id: "q8",
    skill: "Git Workflow Kolaboratif",
    category: "Kolaborasi",
    difficulty: 1,
    text: "Strategi merge mana yang menjaga sejarah linear tanpa merge commit?",
    options: [
      { id: "a", text: "Merge commit" },
      { id: "b", text: "Squash and merge" },
      { id: "c", text: "Rebase and merge", correct: true },
      { id: "d", text: "Cherry-pick" },
    ],
    explanation: "Rebase memindahkan commit ke ujung branch target, menghasilkan history linear tanpa merge commit ekstra.",
  },
  {
    id: "q9",
    skill: "System Design Basics",
    category: "Arsitektur",
    difficulty: 3,
    text: "Apa trade-off utama dari menggunakan Server Components di Next.js App Router?",
    options: [
      { id: "a", text: "Bundle JavaScript lebih besar" },
      { id: "b", text: "Tidak bisa menggunakan state/effect interaktif", correct: true },
      { id: "c", text: "Tidak bisa fetch data" },
      { id: "d", text: "Tidak bisa pakai TypeScript" },
    ],
    explanation: "Server Components dieksekusi di server saja — tidak punya state/effect interaktif. Untuk interaktivitas, Anda perlu Client Components.",
  },
  {
    id: "q10",
    skill: "React & Component Patterns",
    category: "Frontend",
    difficulty: 2,
    text: "Kapan `useMemo` benar-benar berguna untuk performa?",
    options: [
      { id: "a", text: "Untuk semua nilai turunan" },
      { id: "b", text: "Hanya untuk komputasi yang benar-benar mahal atau referential equality untuk dependency arrays", correct: true },
      { id: "c", text: "Untuk mengganti useState" },
      { id: "d", text: "Untuk side effect" },
    ],
    explanation: "useMemo bukan free — overhead memo dapat melebihi manfaatnya. Gunakan hanya saat komputasi mahal atau saat referential equality penting.",
  },
];

export const ASSESSMENTS: AssessmentDef[] = [
  {
    id: "diagnostic-frontend",
    title: "Diagnostik Frontend Engineer",
    description: "Asesmen adaptif singkat untuk mengukur level skill frontend awal Anda. Hasil membentuk TRI dan learning path personal.",
    durationMin: 12,
    difficulty: "Adaptive",
    skillsCovered: ["React & Component Patterns", "TypeScript Advanced", "Accessibility (WCAG)", "State Management (Zustand/RQ)", "Performance Optimization", "Testing (Unit & E2E)"],
    questions: FRONTEND_QUESTIONS,
    recommended: true,
  },
  {
    id: "spot-a11y",
    title: "Spot-check: Accessibility",
    description: "Asesmen 4 pertanyaan untuk mengukur pemahaman WCAG dan inclusive design.",
    durationMin: 5,
    difficulty: "Intermediate",
    skillsCovered: ["Accessibility (WCAG)"],
    questions: FRONTEND_QUESTIONS.filter((q) => q.skill === "Accessibility (WCAG)"),
  },
  {
    id: "spot-quality",
    title: "Spot-check: Quality & Testing",
    description: "Mengukur fundamental testing & kolaborasi engineering.",
    durationMin: 5,
    difficulty: "Beginner",
    skillsCovered: ["Testing (Unit & E2E)", "Git Workflow Kolaboratif"],
    questions: FRONTEND_QUESTIONS.filter((q) => q.skill === "Testing (Unit & E2E)" || q.skill === "Git Workflow Kolaboratif"),
  },
];

export function getAssessment(id: string): AssessmentDef | undefined {
  return ASSESSMENTS.find((a) => a.id === id);
}
