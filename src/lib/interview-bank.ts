export type InterviewCategory = "behavioral" | "technical" | "situational" | "culture";

export interface InterviewQuestion {
  id: string;
  text: string;
  category: InterviewCategory;
  roles: string[];
  tip: string;
  starHint: { situation: string; task: string; action: string; result: string };
}

export const INTERVIEW_BANK: InterviewQuestion[] = [
  {
    id: "b1",
    text: "Ceritakan satu project yang kamu bangga — apa peranmu dan apa hasilnya?",
    category: "behavioral",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Gunakan STAR. Fokus pada kontribusi individu + impact terukur.",
    starHint: {
      situation: "Konteks project (tim, tujuan, deadline)",
      task: "Peran spesifik kamu",
      action: "Keputusan teknis & proses",
      result: "Metric improvement / shipped feature / lesson learned",
    },
  },
  {
    id: "b2",
    text: "Ceritakan saat kamu menerima feedback keras — bagaimana kamu merespon?",
    category: "behavioral",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Tunjukkan growth mindset, bukan defensif.",
    starHint: {
      situation: "Siapa memberi feedback, konteks apa",
      task: "Apa yang perlu kamu perbaiki",
      action: "Langkah konkret respons",
      result: "Perubahan behavior yang bertahan",
    },
  },
  {
    id: "b3",
    text: "Bagaimana kamu memprioritaskan task saat deadline mepet?",
    category: "behavioral",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Sebutkan framework (Eisenhower, MoSCoW, RICE).",
    starHint: {
      situation: "Kondisi crunch",
      task: "Apa yang harus di-deliver",
      action: "Kerangka prioritas kamu",
      result: "Apa yang dikirim vs di-defer",
    },
  },
  {
    id: "b4",
    text: "Saat terakhir kamu belajar skill baru — kenapa memilih itu dan bagaimana caranya?",
    category: "behavioral",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Tampilkan metakognisi dan self-direction.",
    starHint: {
      situation: "Trigger belajar",
      task: "Gap yang ingin diisi",
      action: "Learning plan kamu",
      result: "Bukti application skill (project, assessment)",
    },
  },
  {
    id: "t1",
    text: "Bedakan useMemo dan useCallback. Kapan kamu pilih masing-masing?",
    category: "technical",
    roles: ["frontend-developer"],
    tip: "Jelaskan referential equality dan dependency array.",
    starHint: {
      situation: "Component yang re-render mahal",
      task: "Optimasi tanpa overkill",
      action: "Pilih tool berdasar jenis value (fn vs value)",
      result: "Render count turun / tidak break dep array",
    },
  },
  {
    id: "t2",
    text: "Apa trade-off Server Component vs Client Component di Next.js?",
    category: "technical",
    roles: ["frontend-developer"],
    tip: "Sebut serialization boundary, data fetching, bundle size.",
    starHint: {
      situation: "Page dengan banyak data fetch",
      task: "Keep bundle kecil + tetap interactive",
      action: "Default ke RSC, islands of 'use client'",
      result: "LCP / TTI improvement",
    },
  },
  {
    id: "t3",
    text: "Desain REST endpoint untuk upload image dengan progress tracking.",
    category: "technical",
    roles: ["backend-developer"],
    tip: "Multipart vs chunked, resumable protocol, storage strategy.",
    starHint: {
      situation: "Upload image 100MB+",
      task: "Support resume + progress",
      action: "Chunked upload + signed URL ke S3",
      result: "Success rate + UX flow",
    },
  },
  {
    id: "t4",
    text: "Kapan kamu pilih SQL JOIN vs denormalisasi?",
    category: "technical",
    roles: ["backend-developer", "data-analyst"],
    tip: "Jelaskan trade-off read/write load + konsistensi.",
    starHint: {
      situation: "Schema evolution dari normalized",
      task: "Optimize a high-volume read path",
      action: "Add materialized view / denorm table",
      result: "Latency improvement + consistency story",
    },
  },
  {
    id: "t5",
    text: "Jelaskan CTE (Common Table Expression) — beri contoh kapan kamu butuh.",
    category: "technical",
    roles: ["data-analyst"],
    tip: "Bedakan recursive vs non-recursive.",
    starHint: {
      situation: "Query kompleks multi-step",
      task: "Readability + reusability",
      action: "Pecah jadi CTE berurut",
      result: "Query plan + maintainability",
    },
  },
  {
    id: "t6",
    text: "Apa beda accessibility tree dan DOM? Mengapa penting?",
    category: "technical",
    roles: ["frontend-developer", "ui-ux-designer"],
    tip: "ARIA role, name, state exposed ke AT.",
    starHint: {
      situation: "Component kustom (combobox, modal)",
      task: "Bikin dibaca screen reader",
      action: "Map ARIA role + manage focus",
      result: "Lolos audit WCAG / user feedback",
    },
  },
  {
    id: "t7",
    text: "Bagaimana kamu mendesain heuristic evaluation untuk halaman onboarding?",
    category: "technical",
    roles: ["ui-ux-designer"],
    tip: "Sebut 10 Nielsen heuristics yang relevan.",
    starHint: {
      situation: "Drop-off tinggi di onboarding",
      task: "Cari friction points",
      action: "Heuristic audit + user testing",
      result: "Konversi naik + roadmap fix",
    },
  },
  {
    id: "s1",
    text: "Deadline dalam 2 hari, kamu tahu fitur tidak akan selesai sesuai spec. Apa yang kamu lakukan?",
    category: "situational",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Early escalation > silent slip. Tunjukkan ownership.",
    starHint: {
      situation: "Scope creep + time crunch",
      task: "Ship value tanpa burn tim",
      action: "Komunikasi + negotiate scope (MVP)",
      result: "Ship on time dengan clear known-gaps",
    },
  },
  {
    id: "s2",
    text: "Teamamu tidak setuju dengan keputusan teknis kamu. Bagaimana kamu menanganinya?",
    category: "situational",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Disagree & commit. Data > opinion.",
    starHint: {
      situation: "Debate teknis",
      task: "Capai keputusan yang bisa dieksekusi",
      action: "Write up pros/cons + eksperimen kecil",
      result: "Keputusan + buy-in tim",
    },
  },
  {
    id: "s3",
    text: "Kamu baru join tim — task pertama apa yang kamu ambil?",
    category: "situational",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Quick win + map ownership. Hindari big refactor di hari pertama.",
    starHint: {
      situation: "Hari pertama di tim baru",
      task: "Earn trust + learn system",
      action: "Ambil bug kecil + pair dengan senior",
      result: "PR pertama + pemahaman codebase",
    },
  },
  {
    id: "c1",
    text: "Kenapa kamu tertarik dengan role ini di perusahaan kami?",
    category: "culture",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Pair product value + personal growth. Tunjukkan research.",
    starHint: {
      situation: "Alignment value kamu",
      task: "Sambungkan ke misi perusahaan",
      action: "Sebutkan produk/feature yang kamu apresiasi",
      result: "Kontribusi unik kamu untuk tim",
    },
  },
  {
    id: "c2",
    text: "Apa satu hal yang membuat kamu bangkit Senin pagi untuk bekerja?",
    category: "culture",
    roles: ["frontend-developer", "backend-developer", "data-analyst", "ui-ux-designer"],
    tip: "Jujur. Cari intrinsic motivator, bukan klise.",
    starHint: {
      situation: "Moment semangat spontan",
      task: "Identify personal driver",
      action: "Bagaimana kamu pelihara",
      result: "Impact ke kerja harian",
    },
  },
];

export function pickInterviewSet(roleSlug: string | null, count = 5): InterviewQuestion[] {
  const pool = roleSlug
    ? INTERVIEW_BANK.filter((q) => q.roles.includes(roleSlug))
    : INTERVIEW_BANK;
  const fallback = pool.length < count ? INTERVIEW_BANK : pool;
  const byCategory: Record<InterviewCategory, InterviewQuestion[]> = {
    behavioral: [],
    technical: [],
    situational: [],
    culture: [],
  };
  for (const q of fallback) byCategory[q.category].push(q);

  const order: InterviewCategory[] = ["behavioral", "technical", "situational", "culture"];
  const picked: InterviewQuestion[] = [];
  const seen = new Set<string>();

  for (const cat of order) {
    const bucket = byCategory[cat];
    if (bucket.length === 0) continue;
    const pick = bucket[Math.floor(Math.random() * bucket.length)];
    if (!seen.has(pick.id)) {
      picked.push(pick);
      seen.add(pick.id);
    }
    if (picked.length >= count) break;
  }

  while (picked.length < count && fallback.length > picked.length) {
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    if (!seen.has(pick.id)) {
      picked.push(pick);
      seen.add(pick.id);
    }
  }

  return picked;
}
