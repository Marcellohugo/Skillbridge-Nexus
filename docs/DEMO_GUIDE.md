# Panduan Demo

Dokumen ini saya siapkan untuk mempresentasikan SkillBridge Nexus secara runtut. Tujuannya agar demo terlihat seperti produk matang: mulai dari masalah, solusi, alur learner, mentor, admin, institution, sampai kesiapan teknis.

## Persiapan

1. Jalankan aplikasi.
2. Pastikan database sudah migration dan seed.
3. Buka `http://localhost:3000`.
4. Siapkan akun demo.

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillbridge.id` | `password123` |
| Mentor | `mentor@skillbridge.id` | `password123` |
| Admin | `admin@skillbridge.id` | `password123` |
| Institution | `institution@skillbridge.id` | `password123` |

## Narasi Pembuka

"Saya membangun SkillBridge Nexus sebagai platform competency intelligence untuk membantu learner membaca gap skill, menyusun learning path, terhubung ke mentor, membangun portfolio evidence, dan mengukur kesiapan karir melalui Talent Readiness Index."

## Alur Demo Learner

1. Tunjukkan landing page secara singkat.
2. Login sebagai learner.
3. Tunjukkan dashboard dan TRI.
4. Buka assessment untuk menjelaskan pipeline snapshot.
5. Buka skill gap dan learning path.
6. Buka mentors untuk menunjukkan explainable matching.
7. Buka portfolio untuk menunjukkan evidence strength.
8. Buka salah satu fitur intelligence seperti Career Compass, Opportunity Radar, atau Market Value.
9. Tunjukkan settings: theme, language, accessibility, page pins.

## Alur Demo Mentor

1. Login sebagai mentor.
2. Buka `/mentor/sessions`.
3. Jelaskan lifecycle sesi: pending, upcoming, completed.
4. Buka `/mentor/learners`.
5. Tunjukkan learner progress, TRI, risk, dan action items.

## Alur Demo Admin

1. Login sebagai admin.
2. Buka dashboard admin.
3. Buka user management.
4. Tunjukkan aktivasi/nonaktivasi user.
5. Buka skill taxonomy dan analytics.

## Alur Demo Institution

1. Login sebagai institution manager.
2. Tunjukkan cohort health.
3. Buka members.
4. Buka analytics.
5. Jelaskan curriculum blind spot dan intervention queue.

## Poin Teknis Yang Perlu Disebut

- Next.js 16 App Router dan React 19.
- Prisma dan PostgreSQL.
- Server Actions untuk mutation.
- JWT cookie httpOnly.
- Shared TRI recalculation pipeline.
- Docker production-like setup.
- Unit test, lint, typecheck, build, dan UI smoke test.
- i18n/l10n foundation dengan typed dictionary dan formatter.

## Tips Demo

- Jangan membuka semua fitur satu per satu jika waktu pendek.
- Fokuskan narasi pada loop: assess -> diagnose -> learn -> mentor -> evidence -> readiness.
- Saat menjelaskan UI, tekankan bahwa navbar sudah diringkas agar user tidak bingung.
- Saat menjelaskan production readiness, tunjukkan Docker, env, migration, dan test command.
- Akhiri dengan status jujur: produk siap demo production-like, CI/CD sengaja belum diterapkan.
