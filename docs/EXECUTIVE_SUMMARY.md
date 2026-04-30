# SkillBridge Nexus - Ringkasan Eksekutif

Dokumen ini adalah ringkasan eksekutif SkillBridge Nexus, platform untuk menjembatani gap antara pembelajaran, kesiapan karier, dan validasi kompetensi. Versi teknis lengkap tersedia di [docs/README.md](README.md).

## Tujuan Produk

SkillBridge Nexus dirancang untuk menjawab masalah umum pada learner dan institusi:

- Learner sulit mengetahui gap skill terhadap role karier yang dituju.
- Learning path sering terlalu generik dan tidak membaca prioritas personal.
- Mentor matching biasanya tidak transparan dan tidak berbasis bukti.
- Portfolio sering hanya menjadi etalase, bukan evidence yang terhubung ke kompetensi.
- Institusi butuh dashboard untuk melihat readiness cohort, risiko, dan blind spot kurikulum.

## Nilai Utama

| Pilar | Implementasi |
|---|---|
| Competency intelligence | Skill graph, career role requirement, skill snapshot, dan skill gap |
| Readiness scoring | Talent Readiness Index dengan 6 komponen utama |
| Personalized learning | Learning path berbasis gap, dependency, dan progress |
| Mentorship | Matching mentor explainable dan lifecycle sesi mentoring |
| Evidence | Portfolio project dengan evidence strength dan validasi mentor |
| Inklusivitas | Preferensi aksesibilitas, responsive UI, dan fondasi i18n/l10n |
| Operations | Docker, environment validation, migration, seed, test, lint, typecheck |

## Stack

- Next.js 16 App Router dan React 19.
- TypeScript strict mode.
- Tailwind CSS v4 untuk design system.
- PostgreSQL dan Prisma.
- JWT cookie httpOnly untuk session.
- Server Actions sebagai jalur utama mutation.
- Playwright untuk smoke test UI.

## Status Produk

Produk sudah melewati tahap template. Saat ini aplikasi memiliki alur auth, onboarding, assessment, learning path, mentoring, portfolio, admin analytics, institution analytics, panel aksesibilitas, perapihan navigasi, dan fondasi i18n/l10n. Beberapa area lanjutan seperti profile role tertentu dan integrasi eksternal masih menjadi kandidat pengembangan berikutnya.

## Demo Cepat

1. Jalankan aplikasi dengan `npm run dev` atau Docker.
2. Masuk melalui `/login`.
3. Gunakan akun demo:

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillbridge.id` | `password123` |
| Mentor | `mentor@skillbridge.id` | `password123` |
| Admin | `admin@skillbridge.id` | `password123` |
| Institution | `institution@skillbridge.id` | `password123` |

## Catatan

Dokumentasi ini disimpan di folder `docs` agar root repository hanya memiliki satu README utama. Penjelasan lengkap tentang arsitektur, data model, algoritma, UI/UX, aksesibilitas, setup, dan operasi produksi berada di folder [docs](README.md).
