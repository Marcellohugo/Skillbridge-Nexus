# Model Data

Data model SkillBridge Nexus berada di `prisma/schema.prisma`. Saya membaginya menjadi beberapa domain agar alur readiness dapat dilacak dari user, assessment, learning, mentoring, portfolio, sampai analytics.

## Domain Auth & Security

| Model | Fungsi |
|---|---|
| `User` | Akun utama, email, password hash, role, status aktif |
| `AuthToken` | Token recovery dan verification yang disimpan sebagai hash |
| `SecurityEvent` | Audit event untuk login, reset, rate limit, dan aktivitas sensitif |

## Domain Profile

| Model | Fungsi |
|---|---|
| `LearnerProfile` | Target role, TRI, milestone, risk, preferensi belajar |
| `MentorProfile` | Bio mentor, pengalaman, industri, topik, rating, availability status |
| `AccessibilityProfile` | Preferensi aksesibilitas yang disimpan di DB |

## Domain Institution

| Model | Fungsi |
|---|---|
| `Institution` | Entitas institusi |
| `Cohort` | Kelompok learner dalam program |
| `InstitutionMember` | Relasi user ke institusi/cohort |

## Domain Skill Graph

| Model | Fungsi |
|---|---|
| `SkillCategory` | Kategori skill, misalnya Frontend, Data, Soft Skills |
| `Skill` | Skill utama dengan level maksimum |
| `SubSkill` | Pecahan skill yang lebih detail |
| `SkillDependency` | Relasi prerequisite atau recommended antar skill |

## Domain Career Role

| Model | Fungsi |
|---|---|
| `CareerRole` | Role karir target dan adjacent roles |
| `CareerRoleSkillRequirement` | Requirement skill per role, target level, bobot, critical/foundational |

## Domain Assessment

| Model | Fungsi |
|---|---|
| `Assessment` | Template asesmen |
| `AssessmentQuestion` | Pertanyaan asesmen |
| `AssessmentOption` | Pilihan jawaban |
| `AssessmentQuestionSkillMapping` | Mapping pertanyaan ke skill |
| `AssessmentSession` | Attempt learner |
| `AssessmentResponse` | Jawaban learner |
| `ConfidenceRating` | Confidence per skill/response |

## Domain Readiness Snapshot

| Model | Fungsi |
|---|---|
| `SkillScoreSnapshot` | Nilai skill learner pada titik waktu tertentu |
| `SkillGapSnapshot` | Gap antara skill current dan target role |
| `TRIHistory` | Riwayat TRI dan breakdown komponen |
| `InterventionRecord` | Risiko dan rekomendasi intervensi |
| `ActivityLog` | Aktivitas learner untuk consistency dan audit |

## Domain Learning

| Model | Fungsi |
|---|---|
| `LearningModule` | Modul belajar |
| `LearningModuleSkillMapping` | Skill yang dilatih oleh modul |
| `LearningPath` | Path personal learner |
| `LearningPathItem` | Item modul di dalam path |

## Domain Mentoring

| Model | Fungsi |
|---|---|
| `MentorExpertiseSkill` | Skill yang dikuasai mentor |
| `MentorAvailability` | Slot ketersediaan mentor |
| `MentoringSession` | Sesi learner-mentor dan lifecycle-nya |

## Domain Portfolio & Achievement

| Model | Fungsi |
|---|---|
| `PortfolioProject` | Project evidence milik learner |
| `PortfolioEvidenceSkill` | Skill yang dibuktikan oleh project |
| `Badge` | Definisi achievement |
| `UserBadge` | Badge yang sudah diperoleh user |
| `Notification` | Inbox dan bell notification |

## Relasi Penting

- `User` punya satu `LearnerProfile` atau `MentorProfile` sesuai role.
- `LearnerProfile` terhubung ke `CareerRole` sebagai target.
- `CareerRoleSkillRequirement` menentukan standar skill target.
- `AssessmentSession` menghasilkan `SkillScoreSnapshot`.
- `SkillScoreSnapshot` dan `CareerRoleSkillRequirement` menghasilkan `SkillGapSnapshot`.
- `LearningPathItem`, `MentoringSession`, dan `PortfolioProject` ikut memengaruhi `TRIHistory`.
- `InstitutionMember` menghubungkan learner ke cohort dan institusi.

## Prinsip Data

1. Snapshot tidak ditimpa, tetapi ditambahkan agar histori bisa dianalisis.
2. Data yang memengaruhi TRI harus memiliki jejak event.
3. Token recovery tidak disimpan mentah.
4. Relasi role dan ownership harus dicek di server action.
5. Seed data dibuat lintas domain agar semua fitur demo punya konteks realistis.
