import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function resetDemoData(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error("Refusing to reset seed data in production. Set ALLOW_PRODUCTION_SEED=true to override.");
  }

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.mentoringSession.deleteMany(),
    prisma.mentorAvailability.deleteMany(),
    prisma.mentorExpertiseSkill.deleteMany(),
    prisma.portfolioEvidenceSkill.deleteMany(),
    prisma.portfolioProject.deleteMany(),
    prisma.learningPathItem.deleteMany(),
    prisma.learningPath.deleteMany(),
    prisma.skillScoreSnapshot.deleteMany(),
    prisma.skillGapSnapshot.deleteMany(),
    prisma.confidenceRating.deleteMany(),
    prisma.accessibilityProfile.deleteMany(),
    prisma.assessmentResponse.deleteMany(),
    prisma.assessmentSession.deleteMany(),
    prisma.assessmentOption.deleteMany(),
    prisma.assessmentQuestionSkillMapping.deleteMany(),
    prisma.assessmentQuestion.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.interventionRecord.deleteMany(),
    prisma.tRIHistory.deleteMany(),
    prisma.institutionMember.deleteMany(),
    prisma.learnerProfile.deleteMany(),
    prisma.mentorProfile.deleteMany(),
    prisma.cohort.deleteMany(),
    prisma.institution.deleteMany(),
    prisma.learningModuleSkillMapping.deleteMany(),
    prisma.learningModule.deleteMany(),
    prisma.careerRoleSkillRequirement.deleteMany(),
    prisma.careerRole.deleteMany(),
    prisma.skillDependency.deleteMany(),
    prisma.subSkill.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.skillCategory.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("🌱 Seeding SkillBridge Nexus database...");
    await resetDemoData(prisma);

    // Create users
    await prisma.user.createMany({
    data: [
      { email: "learner@skillbridge.id", name: "Andi Pratama", passwordHash: hash("password123"), role: "LEARNER", emailVerified: true },
      { email: "learner2@skillbridge.id", name: "Sari Dewi", passwordHash: hash("password123"), role: "LEARNER", emailVerified: true },
      { email: "learner3@skillbridge.id", name: "Budi Santoso", passwordHash: hash("password123"), role: "LEARNER", emailVerified: true },
      { email: "mentor@skillbridge.id", name: "Dr. Rini Kusuma", passwordHash: hash("password123"), role: "MENTOR", emailVerified: true },
      { email: "mentor2@skillbridge.id", name: "Hendra Wijaya", passwordHash: hash("password123"), role: "MENTOR", emailVerified: true },
      { email: "mentor3@skillbridge.id", name: "Maya Putri", passwordHash: hash("password123"), role: "MENTOR", emailVerified: true },
      { email: "admin@skillbridge.id", name: "Admin SkillBridge", passwordHash: hash("password123"), role: "ADMIN", emailVerified: true },
      { email: "institution@skillbridge.id", name: "Manajer Institusi", passwordHash: hash("password123"), role: "INSTITUTION_MANAGER", emailVerified: true },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Users created");

  // Create institution & cohort
  const institution = await prisma.institution.create({
    data: { name: "Universitas Indonesia", type: "university", city: "Depok", country: "ID" },
  });

  const cohort = await prisma.cohort.create({
    data: { institutionId: institution.id, name: "Angkatan 2024 - Informatika", program: "Ilmu Komputer", startDate: new Date("2024-09-01"), endDate: new Date("2025-06-30") },
  });

  console.log("✅ Institution & cohort created");

  // Create skill categories (balanced across tech, business, creative, finance)
  const categories = await Promise.all([
    prisma.skillCategory.create({ data: { name: "Pemrograman", icon: "Code2", color: "#1A3D63", sortOrder: 1 } }),
    prisma.skillCategory.create({ data: { name: "Frontend Development", icon: "Monitor", color: "#f59e0b", sortOrder: 2 } }),
    prisma.skillCategory.create({ data: { name: "Backend Development", icon: "Server", color: "#10b981", sortOrder: 3 } }),
    prisma.skillCategory.create({ data: { name: "Data & Analytics", icon: "BarChart3", color: "#3b82f6", sortOrder: 4 } }),
    prisma.skillCategory.create({ data: { name: "UI/UX Design", icon: "Palette", color: "#ec4899", sortOrder: 5 } }),
    prisma.skillCategory.create({ data: { name: "Soft Skills", icon: "Users", color: "#8b5cf6", sortOrder: 6 } }),
    prisma.skillCategory.create({ data: { name: "Bisnis & Manajemen", icon: "Briefcase", color: "#0ea5e9", sortOrder: 7 } }),
    prisma.skillCategory.create({ data: { name: "Pemasaran Digital", icon: "Megaphone", color: "#ef4444", sortOrder: 8 } }),
    prisma.skillCategory.create({ data: { name: "Keuangan & Akuntansi", icon: "Wallet", color: "#059669", sortOrder: 9 } }),
    prisma.skillCategory.create({ data: { name: "Manajemen Proyek", icon: "ClipboardList", color: "#7c3aed", sortOrder: 10 } }),
    prisma.skillCategory.create({ data: { name: "Kreatif & Konten", icon: "Sparkles", color: "#db2777", sortOrder: 11 } }),
  ]);

  // Category index helper
  const catByName = (name: string) => categories.find((c) => c.name === name)!;

  // Create skills (29 total across 11 categories)
  const skills = await Promise.all([
    // Pemrograman / Frontend / Backend / Data / Design / Soft (original 14)
    prisma.skill.create({ data: { categoryId: catByName("Pemrograman").id, name: "JavaScript", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Pemrograman").id, name: "Python", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Pemrograman").id, name: "SQL", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Frontend Development").id, name: "React.js", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Frontend Development").id, name: "HTML & CSS", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Frontend Development").id, name: "Responsive Design", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Backend Development").id, name: "Node.js", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Backend Development").id, name: "REST API", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Data & Analytics").id, name: "Data Analysis", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Data & Analytics").id, name: "Statistics", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("UI/UX Design").id, name: "Figma", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("UI/UX Design").id, name: "Design Thinking", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Soft Skills").id, name: "Communication", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Soft Skills").id, name: "Problem Solving", isFoundational: true } }),
    // Bisnis & Manajemen
    prisma.skill.create({ data: { categoryId: catByName("Bisnis & Manajemen").id, name: "Business Strategy", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Bisnis & Manajemen").id, name: "Market Research", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Bisnis & Manajemen").id, name: "Leadership", isFoundational: true } }),
    // Pemasaran Digital
    prisma.skill.create({ data: { categoryId: catByName("Pemasaran Digital").id, name: "SEO", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Pemasaran Digital").id, name: "Content Marketing", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Pemasaran Digital").id, name: "Social Media Strategy", isFoundational: false } }),
    // Keuangan & Akuntansi
    prisma.skill.create({ data: { categoryId: catByName("Keuangan & Akuntansi").id, name: "Financial Analysis", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Keuangan & Akuntansi").id, name: "Accounting Fundamentals", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Keuangan & Akuntansi").id, name: "Excel Modeling", isFoundational: true } }),
    // Manajemen Proyek
    prisma.skill.create({ data: { categoryId: catByName("Manajemen Proyek").id, name: "Agile & Scrum", isFoundational: false } }),
    prisma.skill.create({ data: { categoryId: catByName("Manajemen Proyek").id, name: "Stakeholder Management", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Manajemen Proyek").id, name: "Roadmapping", isFoundational: false } }),
    // Kreatif & Konten
    prisma.skill.create({ data: { categoryId: catByName("Kreatif & Konten").id, name: "Copywriting", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Kreatif & Konten").id, name: "Storytelling", isFoundational: true } }),
    prisma.skill.create({ data: { categoryId: catByName("Kreatif & Konten").id, name: "Brand Strategy", isFoundational: false } }),
  ]);

  console.log("✅ Skills created");

  // Skill lookup helper by name
  const skillByName = (n: string) => skills.find((s) => s.name === n)!;

  // Create skill dependencies (prerequisite graph)
  const deps: Array<[string, string, "PREREQUISITE" | "RECOMMENDED"]> = [
    ["React.js", "JavaScript", "PREREQUISITE"],
    ["React.js", "HTML & CSS", "PREREQUISITE"],
    ["Responsive Design", "HTML & CSS", "PREREQUISITE"],
    ["Node.js", "JavaScript", "PREREQUISITE"],
    ["REST API", "Node.js", "PREREQUISITE"],
    ["Data Analysis", "Python", "PREREQUISITE"],
    ["Data Analysis", "SQL", "PREREQUISITE"],
    ["Data Analysis", "Statistics", "PREREQUISITE"],
    ["Figma", "Design Thinking", "RECOMMENDED"],
    ["React.js", "Problem Solving", "RECOMMENDED"],
    // Cross-domain graph
    ["Business Strategy", "Market Research", "PREREQUISITE"],
    ["SEO", "Content Marketing", "RECOMMENDED"],
    ["Social Media Strategy", "Content Marketing", "RECOMMENDED"],
    ["Financial Analysis", "Excel Modeling", "PREREQUISITE"],
    ["Financial Analysis", "Accounting Fundamentals", "PREREQUISITE"],
    ["Roadmapping", "Stakeholder Management", "RECOMMENDED"],
    ["Agile & Scrum", "Stakeholder Management", "RECOMMENDED"],
    ["Brand Strategy", "Storytelling", "RECOMMENDED"],
    ["Content Marketing", "Copywriting", "RECOMMENDED"],
    ["Leadership", "Communication", "PREREQUISITE"],
  ];
  await prisma.skillDependency.createMany({
    data: deps.map(([dependent, prereq, type]) => ({
      skillId: skillByName(dependent).id,
      prerequisiteId: skillByName(prereq).id,
      type,
      minLevel: type === "PREREQUISITE" ? 3 : 2,
    })),
  });

  console.log("✅ Skill dependencies created");

  // Create career roles (9 total: 4 tech + 5 non-tech — marketing, product, finance, pm, content)
  const roles = await Promise.all([
    prisma.careerRole.create({
      data: { name: "Frontend Developer", slug: "frontend-developer", description: "Membangun antarmuka pengguna yang responsif dan aksesibel.", salaryRange: "Rp 6-15 juta/bulan", demandLevel: "very_high", adjacentRoles: ["UI/UX Designer", "Backend Developer", "Product Manager"] },
    }),
    prisma.careerRole.create({
      data: { name: "Backend Developer", slug: "backend-developer", description: "Merancang API dan sistem server yang scalable.", salaryRange: "Rp 7-18 juta/bulan", demandLevel: "very_high", adjacentRoles: ["Frontend Developer", "Data Analyst"] },
    }),
    prisma.careerRole.create({
      data: { name: "Data Analyst", slug: "data-analyst", description: "Menganalisis data untuk keputusan bisnis.", salaryRange: "Rp 6-15 juta/bulan", demandLevel: "high", adjacentRoles: ["Backend Developer", "Financial Analyst", "Product Manager"] },
    }),
    prisma.careerRole.create({
      data: { name: "UI/UX Designer", slug: "ui-ux-designer", description: "Merancang pengalaman pengguna yang intuitif.", salaryRange: "Rp 6-16 juta/bulan", demandLevel: "high", adjacentRoles: ["Frontend Developer", "Content Strategist", "Product Manager"] },
    }),
    prisma.careerRole.create({
      data: { name: "Digital Marketing Specialist", slug: "digital-marketing-specialist", description: "Merancang dan menjalankan kampanye pemasaran digital multi-channel berbasis data.", salaryRange: "Rp 5-13 juta/bulan", demandLevel: "high", adjacentRoles: ["Content Strategist", "Product Manager", "Data Analyst"] },
    }),
    prisma.careerRole.create({
      data: { name: "Product Manager", slug: "product-manager", description: "Menghubungkan kebutuhan pengguna, bisnis, dan engineering menjadi roadmap produk.", salaryRange: "Rp 12-30 juta/bulan", demandLevel: "very_high", adjacentRoles: ["UI/UX Designer", "Project Manager", "Digital Marketing Specialist"] },
    }),
    prisma.careerRole.create({
      data: { name: "Financial Analyst", slug: "financial-analyst", description: "Menganalisis laporan keuangan, membangun model, dan mendukung keputusan investasi.", salaryRange: "Rp 7-18 juta/bulan", demandLevel: "high", adjacentRoles: ["Data Analyst", "Project Manager"] },
    }),
    prisma.careerRole.create({
      data: { name: "Project Manager", slug: "project-manager", description: "Memimpin eksekusi lintas tim dengan discipline agile dan stakeholder management.", salaryRange: "Rp 10-24 juta/bulan", demandLevel: "high", adjacentRoles: ["Product Manager", "Financial Analyst"] },
    }),
    prisma.careerRole.create({
      data: { name: "Content Strategist", slug: "content-strategist", description: "Merancang narasi merek dan kalender konten lintas kanal.", salaryRange: "Rp 6-14 juta/bulan", demandLevel: "high", adjacentRoles: ["Digital Marketing Specialist", "UI/UX Designer"] },
    }),
  ]);

  console.log("✅ Career roles created");

  // Create career role skill requirements (for Career Compass ranking)
  const roleBySlug = (slug: string) => roles.find((r) => r.slug === slug)!;
  const requirements: Array<{
    role: string;
    skill: string;
    target: number;
    weight: number;
    critical?: boolean;
    foundational?: boolean;
  }> = [
    // Frontend Developer
    { role: "frontend-developer", skill: "JavaScript", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "frontend-developer", skill: "HTML & CSS", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "frontend-developer", skill: "React.js", target: 4, weight: 2.0, critical: true },
    { role: "frontend-developer", skill: "Responsive Design", target: 3, weight: 1.5 },
    { role: "frontend-developer", skill: "Problem Solving", target: 3, weight: 1.0 },
    { role: "frontend-developer", skill: "Communication", target: 3, weight: 0.8 },
    // Backend Developer
    { role: "backend-developer", skill: "JavaScript", target: 4, weight: 1.5, foundational: true },
    { role: "backend-developer", skill: "Node.js", target: 4, weight: 2.0, critical: true },
    { role: "backend-developer", skill: "REST API", target: 4, weight: 2.0, critical: true },
    { role: "backend-developer", skill: "SQL", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "backend-developer", skill: "Problem Solving", target: 4, weight: 1.2 },
    { role: "backend-developer", skill: "Python", target: 3, weight: 0.8 },
    // Data Analyst
    { role: "data-analyst", skill: "SQL", target: 5, weight: 2.0, critical: true, foundational: true },
    { role: "data-analyst", skill: "Python", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "data-analyst", skill: "Statistics", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "data-analyst", skill: "Data Analysis", target: 4, weight: 2.0, critical: true },
    { role: "data-analyst", skill: "Communication", target: 3, weight: 1.0 },
    { role: "data-analyst", skill: "Problem Solving", target: 4, weight: 1.2 },
    // UI/UX Designer
    { role: "ui-ux-designer", skill: "Figma", target: 4, weight: 2.0, critical: true },
    { role: "ui-ux-designer", skill: "Design Thinking", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "ui-ux-designer", skill: "HTML & CSS", target: 3, weight: 1.0 },
    { role: "ui-ux-designer", skill: "Responsive Design", target: 3, weight: 1.2 },
    { role: "ui-ux-designer", skill: "Communication", target: 4, weight: 1.5 },
    { role: "ui-ux-designer", skill: "Problem Solving", target: 3, weight: 1.0 },
    // Digital Marketing Specialist
    { role: "digital-marketing-specialist", skill: "SEO", target: 4, weight: 2.0, critical: true },
    { role: "digital-marketing-specialist", skill: "Content Marketing", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "digital-marketing-specialist", skill: "Social Media Strategy", target: 4, weight: 2.0, critical: true },
    { role: "digital-marketing-specialist", skill: "Copywriting", target: 3, weight: 1.5 },
    { role: "digital-marketing-specialist", skill: "Data Analysis", target: 3, weight: 1.2 },
    { role: "digital-marketing-specialist", skill: "Communication", target: 3, weight: 1.0 },
    // Product Manager
    { role: "product-manager", skill: "Roadmapping", target: 4, weight: 2.0, critical: true },
    { role: "product-manager", skill: "Stakeholder Management", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "product-manager", skill: "Market Research", target: 4, weight: 1.8, critical: true },
    { role: "product-manager", skill: "Agile & Scrum", target: 3, weight: 1.5 },
    { role: "product-manager", skill: "Communication", target: 4, weight: 1.5 },
    { role: "product-manager", skill: "Data Analysis", target: 3, weight: 1.2 },
    { role: "product-manager", skill: "Leadership", target: 3, weight: 1.2 },
    // Financial Analyst
    { role: "financial-analyst", skill: "Financial Analysis", target: 5, weight: 2.0, critical: true, foundational: true },
    { role: "financial-analyst", skill: "Excel Modeling", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "financial-analyst", skill: "Accounting Fundamentals", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "financial-analyst", skill: "Statistics", target: 3, weight: 1.5 },
    { role: "financial-analyst", skill: "SQL", target: 3, weight: 1.2 },
    { role: "financial-analyst", skill: "Communication", target: 3, weight: 1.0 },
    // Project Manager
    { role: "project-manager", skill: "Agile & Scrum", target: 4, weight: 2.0, critical: true },
    { role: "project-manager", skill: "Stakeholder Management", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "project-manager", skill: "Leadership", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "project-manager", skill: "Roadmapping", target: 3, weight: 1.5 },
    { role: "project-manager", skill: "Communication", target: 4, weight: 1.5 },
    { role: "project-manager", skill: "Problem Solving", target: 3, weight: 1.0 },
    // Content Strategist
    { role: "content-strategist", skill: "Copywriting", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "content-strategist", skill: "Storytelling", target: 4, weight: 2.0, critical: true, foundational: true },
    { role: "content-strategist", skill: "Brand Strategy", target: 4, weight: 2.0, critical: true },
    { role: "content-strategist", skill: "Content Marketing", target: 4, weight: 1.5, critical: true },
    { role: "content-strategist", skill: "SEO", target: 3, weight: 1.2 },
    { role: "content-strategist", skill: "Communication", target: 3, weight: 1.0 },
  ];
  await prisma.careerRoleSkillRequirement.createMany({
    data: requirements.map((r) => ({
      careerRoleId: roleBySlug(r.role).id,
      skillId: skillByName(r.skill).id,
      targetLevel: r.target,
      importanceWeight: r.weight,
      isCritical: r.critical ?? false,
      isFoundational: r.foundational ?? false,
    })),
  });

  console.log("✅ Career role skill requirements created");

  // Create learning modules
  const modules = await Promise.all([
    prisma.learningModule.create({ data: { title: "JavaScript Fundamentals", description: "Dasar-dasar JavaScript", contentType: "VIDEO", difficulty: 1, estimatedMinutes: 120, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "React.js Basics", description: "Komponen dan state React", contentType: "VIDEO", difficulty: 2, estimatedMinutes: 180, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "HTML & CSS Modern", description: "Web markup dan styling", contentType: "INTERACTIVE", difficulty: 1, estimatedMinutes: 150, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Node.js & REST API", description: "Backend dengan Node.js", contentType: "PROJECT", difficulty: 3, estimatedMinutes: 200, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "SQL Fundamentals", description: "Database queries dasar", contentType: "INTERACTIVE", difficulty: 1, estimatedMinutes: 100, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Data Analysis with Python", description: "Pandas dan analisis data", contentType: "INTERACTIVE", difficulty: 2, estimatedMinutes: 160, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Figma UI Design", description: "Design system dan prototyping", contentType: "VIDEO", difficulty: 2, estimatedMinutes: 140, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Communication Skills", description: "Komunikasi profesional", contentType: "VIDEO", difficulty: 1, estimatedMinutes: 60, provider: "SkillBridge Academy" } }),
    // Non-programming modules
    prisma.learningModule.create({ data: { title: "Digital Marketing Fundamentals", description: "SEO, content, dan social media dalam satu alur", contentType: "VIDEO", difficulty: 1, estimatedMinutes: 180, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Agile & Scrum Essentials", description: "Framework agile, ceremonies, role scrum", contentType: "INTERACTIVE", difficulty: 2, estimatedMinutes: 150, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Financial Modeling with Excel", description: "Membangun model keuangan dari dasar", contentType: "PROJECT", difficulty: 3, estimatedMinutes: 240, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Product Management 101", description: "Roadmapping, prioritisasi, dan stakeholder comms", contentType: "VIDEO", difficulty: 2, estimatedMinutes: 200, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Storytelling for Brands", description: "Merancang narasi merek yang memorable", contentType: "VIDEO", difficulty: 2, estimatedMinutes: 120, provider: "SkillBridge Academy" } }),
    prisma.learningModule.create({ data: { title: "Leadership Fundamentals", description: "Prinsip leadership untuk first-time leader", contentType: "ARTICLE", difficulty: 1, estimatedMinutes: 90, provider: "SkillBridge Academy" } }),
  ]);

  console.log("✅ Modules created");

  // Learning module skill mappings — F3 learning path generator depends on this
  const moduleByTitle = (t: string) => modules.find((m) => m.title === t)!;
  const moduleMappings: Array<{ module: string; skill: string; levelGain: number; primary?: boolean }> = [
    { module: "JavaScript Fundamentals", skill: "JavaScript", levelGain: 2, primary: true },
    { module: "React.js Basics", skill: "React.js", levelGain: 2, primary: true },
    { module: "React.js Basics", skill: "JavaScript", levelGain: 1 },
    { module: "HTML & CSS Modern", skill: "HTML & CSS", levelGain: 2, primary: true },
    { module: "HTML & CSS Modern", skill: "Responsive Design", levelGain: 1 },
    { module: "Node.js & REST API", skill: "Node.js", levelGain: 2, primary: true },
    { module: "Node.js & REST API", skill: "REST API", levelGain: 2 },
    { module: "Node.js & REST API", skill: "JavaScript", levelGain: 1 },
    { module: "SQL Fundamentals", skill: "SQL", levelGain: 2, primary: true },
    { module: "Data Analysis with Python", skill: "Data Analysis", levelGain: 2, primary: true },
    { module: "Data Analysis with Python", skill: "Python", levelGain: 1 },
    { module: "Data Analysis with Python", skill: "Statistics", levelGain: 1 },
    { module: "Figma UI Design", skill: "Figma", levelGain: 2, primary: true },
    { module: "Figma UI Design", skill: "Design Thinking", levelGain: 1 },
    { module: "Communication Skills", skill: "Communication", levelGain: 2, primary: true },
    { module: "Digital Marketing Fundamentals", skill: "Content Marketing", levelGain: 2, primary: true },
    { module: "Digital Marketing Fundamentals", skill: "SEO", levelGain: 1 },
    { module: "Digital Marketing Fundamentals", skill: "Social Media Strategy", levelGain: 1 },
    { module: "Agile & Scrum Essentials", skill: "Agile & Scrum", levelGain: 2, primary: true },
    { module: "Agile & Scrum Essentials", skill: "Stakeholder Management", levelGain: 1 },
    { module: "Financial Modeling with Excel", skill: "Excel Modeling", levelGain: 2, primary: true },
    { module: "Financial Modeling with Excel", skill: "Financial Analysis", levelGain: 2 },
    { module: "Financial Modeling with Excel", skill: "Accounting Fundamentals", levelGain: 1 },
    { module: "Product Management 101", skill: "Roadmapping", levelGain: 2, primary: true },
    { module: "Product Management 101", skill: "Stakeholder Management", levelGain: 1 },
    { module: "Product Management 101", skill: "Market Research", levelGain: 1 },
    { module: "Storytelling for Brands", skill: "Storytelling", levelGain: 2, primary: true },
    { module: "Storytelling for Brands", skill: "Brand Strategy", levelGain: 1 },
    { module: "Storytelling for Brands", skill: "Copywriting", levelGain: 1 },
    { module: "Leadership Fundamentals", skill: "Leadership", levelGain: 2, primary: true },
    { module: "Leadership Fundamentals", skill: "Communication", levelGain: 1 },
  ];
  await prisma.learningModuleSkillMapping.createMany({
    data: moduleMappings.map((m) => ({
      moduleId: moduleByTitle(m.module).id,
      skillId: skillByName(m.skill).id,
      levelGain: m.levelGain,
      isPrimary: m.primary ?? false,
    })),
  });

  console.log("✅ Module skill mappings created");

  // Create assessment
  await prisma.assessment.create({
    data: { title: "Asesmen Diagnostik Kompetensi", description: "Asesmen adaptif untuk mengukur kompetensi Anda", type: "diagnostic", totalPoints: 100 },
  });

  console.log("✅ Assessment created");

  // Create badges
  await Promise.all([
    prisma.badge.create({ data: { name: "Pejuang Pertama", description: "Menyelesaikan asesmen pertama", color: "#1A3D63", criteria: "Complete first assessment" } }),
    prisma.badge.create({ data: { name: "Konsisten", description: "7 hari belajar berturut-turut", color: "#3b82f6", criteria: "7-day streak" } }),
    prisma.badge.create({ data: { name: "Koneksi Mentor", description: "Sesi mentoring pertama", color: "#ec4899", criteria: "First mentoring session" } }),
  ]);

  console.log("✅ Badges created");

  // Create mentor profiles (mix of tech, product/pm, finance/business)
  const mentors = await prisma.user.findMany({ where: { role: "MENTOR" } });
  const mentorProfiles: Array<{
    email: string;
    biography: string;
    yearsExperience: number;
    industries: string[];
    mentoringTopics: string[];
  }> = [
    {
      email: "mentor@skillbridge.id",
      biography: "Ex-Senior Frontend Engineer di perusahaan fintech, fokus membimbing transisi ke role teknologi.",
      yearsExperience: 8,
      industries: ["Fintech", "E-commerce"],
      mentoringTopics: ["Frontend Engineering", "Career Transition", "System Design"],
    },
    {
      email: "mentor2@skillbridge.id",
      biography: "Digital Marketing Lead di agency multinasional, ahli growth & brand strategy.",
      yearsExperience: 10,
      industries: ["Marketing", "Media"],
      mentoringTopics: ["Digital Marketing", "Content Strategy", "Brand Building"],
    },
    {
      email: "mentor3@skillbridge.id",
      biography: "Product & Project Manager senior dengan latar keuangan, membimbing karir bisnis & produk.",
      yearsExperience: 12,
      industries: ["Consulting", "Banking", "SaaS"],
      mentoringTopics: ["Product Management", "Financial Analysis", "Leadership"],
    },
  ];
  for (const mentor of mentors) {
    const profile =
      mentorProfiles.find((p) => p.email === mentor.email) ?? mentorProfiles[0];
    await prisma.mentorProfile.create({
      data: {
        userId: mentor.id,
        biography: profile.biography,
        yearsExperience: profile.yearsExperience,
        industries: profile.industries,
        mentoringTopics: profile.mentoringTopics,
        isAvailable: true,
        avgRating: 4.8,
      },
    });
  }

  console.log("✅ Mentor profiles created");

  // Mentor expertise skill mappings + availability — F4 matching depends on this
  const mentorExpertise: Record<string, { skill: string; level: number }[]> = {
    "mentor@skillbridge.id": [
      { skill: "React.js", level: 5 },
      { skill: "JavaScript", level: 5 },
      { skill: "HTML & CSS", level: 5 },
      { skill: "Responsive Design", level: 4 },
      { skill: "Problem Solving", level: 5 },
      { skill: "Communication", level: 4 },
    ],
    "mentor2@skillbridge.id": [
      { skill: "Content Marketing", level: 5 },
      { skill: "SEO", level: 5 },
      { skill: "Social Media Strategy", level: 5 },
      { skill: "Copywriting", level: 4 },
      { skill: "Brand Strategy", level: 5 },
      { skill: "Storytelling", level: 4 },
      { skill: "Communication", level: 5 },
    ],
    "mentor3@skillbridge.id": [
      { skill: "Roadmapping", level: 5 },
      { skill: "Stakeholder Management", level: 5 },
      { skill: "Agile & Scrum", level: 5 },
      { skill: "Financial Analysis", level: 5 },
      { skill: "Accounting Fundamentals", level: 4 },
      { skill: "Leadership", level: 5 },
      { skill: "Market Research", level: 4 },
    ],
  };
  const mentorAvailabilityMap: Record<string, Array<{ dayOfWeek: number; startTime: string; endTime: string }>> = {
    "mentor@skillbridge.id": [
      { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
      { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "12:00" },
    ],
    "mentor2@skillbridge.id": [
      { dayOfWeek: 2, startTime: "19:00", endTime: "21:00" },
      { dayOfWeek: 4, startTime: "19:00", endTime: "21:00" },
      { dayOfWeek: 6, startTime: "14:00", endTime: "17:00" },
    ],
    "mentor3@skillbridge.id": [
      { dayOfWeek: 1, startTime: "20:00", endTime: "22:00" },
      { dayOfWeek: 5, startTime: "18:00", endTime: "21:00" },
      { dayOfWeek: 0, startTime: "10:00", endTime: "14:00" },
    ],
  };
  for (const mentor of mentors) {
    const profile = await prisma.mentorProfile.findUnique({ where: { userId: mentor.id }, select: { id: true } });
    if (!profile) continue;
    const expertise = mentorExpertise[mentor.email] ?? [];
    if (expertise.length > 0) {
      await prisma.mentorExpertiseSkill.createMany({
        data: expertise.map((e) => ({
          mentorId: profile.id,
          skillId: skillByName(e.skill).id,
          expertiseLevel: e.level,
        })),
        skipDuplicates: true,
      });
    }
    const avail = mentorAvailabilityMap[mentor.email] ?? [];
    if (avail.length > 0) {
      await prisma.mentorAvailability.createMany({
        data: avail.map((a) => ({ mentorId: profile.id, ...a })),
      });
    }
  }

  console.log("✅ Mentor expertise + availability created");

  // Create learner profiles
  const learners = await prisma.user.findMany({ where: { role: "LEARNER" } });
  // Learner 1 → Frontend Developer (tech), Learner 2 → Digital Marketing Specialist,
  // Learner 3 → Financial Analyst. Mix ensures demo covers 3 distinct career families.
  const roleBySlugSafe = (slug: string) => roles.find((r) => r.slug === slug)!;
  const learnerTargets = [
    roleBySlugSafe("frontend-developer").id,
    roleBySlugSafe("digital-marketing-specialist").id,
    roleBySlugSafe("financial-analyst").id,
  ];
  const learnerProfiles = await Promise.all(
    learners.map((learner, idx) =>
      prisma.learnerProfile.create({
        data: {
          userId: learner.id,
          fullName: learner.name,
          educationStatus: idx === 0 ? "Mahasiswa S1" : idx === 1 ? "Fresh Graduate" : "Mahasiswa S1",
          targetCareerRoleId: learnerTargets[idx] ?? learnerTargets[0],
          cohortId: cohort.id,
          onboardingCompleted: true,
          currentTRI: 50 + idx * 10,
          triMilestone: "PROGRESSING",
          careerFitScore: 0.6 + idx * 0.1,
          riskLevel: idx === 2 ? "HIGH" : "LOW",
        },
      })
    )
  );

  console.log("✅ Learner profiles created");

  // Create accessibility profiles
  for (const profile of learnerProfiles) {
    await prisma.accessibilityProfile.create({
      data: { learnerId: profile.id, fontSize: "medium", colorTheme: "system" },
    });
  }

  console.log("✅ Accessibility profiles created");

    console.log("\n✨ Seeding selesai!");
    console.log("\n📧 Demo Accounts:");
    console.log("  Learner:     learner@skillbridge.id / password123");
    console.log("  Mentor:      mentor@skillbridge.id / password123");
    console.log("  Admin:       admin@skillbridge.id / password123");
    console.log("  Institution: institution@skillbridge.id / password123");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  });
