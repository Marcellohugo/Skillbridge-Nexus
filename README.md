# SkillBridge Nexus

SkillBridge Nexus adalah **Pathway Readiness Platform** untuk membantu siswa, mahasiswa, lulusan SMA, fresh graduate, career switcher, dan pekerja awal mendiagnosis kesiapan, memilih jalur, dan menjalankannya dengan dukungan mentor, evidence, serta intervensi berbasis data.

Produk ini bukan hanya untuk learner di bidang informatika. Domain awal (career role IT) tetap tersedia, namun arah pengembangan memperluas cakupan ke pathway lintas jenjang: SMA ke kuliah, SMK ke kerja, mahasiswa ke magang, fresh graduate ke kerja, lulusan SMA ke sertifikasi, career switcher, dan pekerja awal ke jenjang berikutnya.

## Siapa Yang Dilayani

| Segmen | Pathway Utama |
|---|---|
| Siswa SMA | Masuk kuliah, beasiswa, sertifikasi |
| Siswa SMK | Kerja entry-level, PKL, sertifikasi vokasi |
| Mahasiswa awal | Adaptasi kampus, magang awal |
| Mahasiswa akhir | Magang, kerja entry-level, lanjut studi |
| Fresh graduate | Kerja, sertifikasi, pivot pertama |
| Lulusan SMA non-kuliah | Kerja, sertifikasi, wirausaha mikro |
| Career switcher | Pindah role atau industri |
| Pekerja awal | Naik jenjang berikutnya |

Lihat [docs/PATHWAY_READINESS.md](docs/PATHWAY_READINESS.md) untuk detail pathway, taxonomy readiness, dan use case per segmen.

## Inti Produk Saat Ini

| Pilar | Implementasi |
|---|---|
| Diagnosis | Diagnostic assessment, confidence rating, skill snapshot, skill gap, blocker |
| Readiness scoring | Talent Readiness Index (TRI) dengan 6 komponen, history, milestone |
| Personalisasi | Learning path generator berbasis gap dan dependency, weekly plan |
| Mentorship | Marketplace mentor explainable, lifecycle sesi, action items, validasi portfolio |
| Evidence | Portfolio project, evidence strength, validasi mentor, badge |
| Intelligence | Career Compass, Ladder, Opportunity Radar, Market Value, Forecast, Simulator, Skill Tree, Synergy, Decay, Calibration, Immunity, Velocity |
| Engagement | Daily Challenge, Focus Timer, Reflection, Heatmap, Achievement Wall, AI Coach internal |
| Institutional | Cohort health, member list, blind spot kurikulum, intervention queue |
| Operational | Auth + recovery, role guard, JWT cookie, security event, rate limit, env validation |
| UX | AppShell, command palette, page pins, theme, language switcher, accessibility panel |

Status implementasi terverifikasi ada di [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Arah Ekspansi

Pengembangan berikutnya memperluas konsep:

- **Career Role → Pathway Target** (kuliah, beasiswa, magang, kerja, sertifikasi, wirausaha, pindah karier).
- **TRI → PRI (Pathway Readiness Index)** untuk membaca kesiapan lintas pathway.
- **Skill Taxonomy → Readiness Taxonomy** (Academic, Digital, Career, Vocational, Higher Education, Entrepreneurship, Life).
- **Portfolio → Evidence Bank** (rapor, sertifikat, project, PKL, lomba, organisasi, kerja informal, video, esai, link publik).
- **Mentor Marketplace → Support Network** (mentor industri, guru BK, dosen wali, alumni, orang tua, training provider, scholarship officer, employer, komunitas).
- **Mentor Content Studio & Reward Engine** untuk membuka kontribusi mentor terhadap materi dan dampaknya.

Detail roadmap ada di [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

| Area | Teknologi |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript strict, Tailwind CSS v4 |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT cookie httpOnly, bcryptjs, jose |
| Server logic | Server Actions, tRPC scaffold |
| Testing | Node test runner, tsx, Playwright UI smoke test |
| Deployment | Docker, Docker Compose, Next standalone output |

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

## Menjalankan Dengan Docker

Mode production-like:

```bash
cp .env.example .env
docker compose up --build -d
```

Mode development hot-reload:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Default development container:

- App: `http://localhost:3000`
- PostgreSQL host: `localhost:5433`

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillbridge.id` | `password123` |
| Mentor | `mentor@skillbridge.id` | `password123` |
| Admin | `admin@skillbridge.id` | `password123` |
| Institution | `institution@skillbridge.id` | `password123` |

## Perintah Penting

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:ui
npm run db:migrate
npm run db:migrate:deploy
npm run db:seed
```

## Dokumentasi

Dokumentasi lengkap ada di folder [docs](docs/README.md):

- [Gambaran Produk](docs/PRODUCT_OVERVIEW.md)
- [Visi Produk & Repositioning](docs/PRODUCT_VISION.md)
- [Pathway Readiness](docs/PATHWAY_READINESS.md)
- [Fitur](docs/FEATURES.md)
- [Status Implementasi](docs/IMPLEMENTATION_STATUS.md)
- [Roadmap](docs/ROADMAP.md)
- [Mentor Content Studio](docs/MENTOR_CONTENT_STUDIO.md)
- [Role & Permission Expansion](docs/ROLE_AND_PERMISSION_EXPANSION.md)
- [Non-functional Requirements](docs/NONFUNCTIONAL_REQUIREMENTS.md)
- [Impact & KPI](docs/IMPACT_AND_KPI.md)
- [Arsitektur](docs/ARCHITECTURE.md)
- [Model Data](docs/DATA_MODEL.md)
- [API & Logika Server](docs/API_AND_SERVER_LOGIC.md)
- [Algoritma & Scoring](docs/ALGORITHMS_AND_SCORING.md)
- [User Roles & Permissions](docs/USER_ROLES_AND_PERMISSIONS.md)
- [User Flows](docs/USER_FLOWS.md)
- [UI/UX](docs/UI_UX_STRUCTURE.md)
- [Aksesibilitas](docs/ACCESSIBILITY.md)
- [Setup Lokal](docs/SETUP_AND_LOCAL_DEVELOPMENT.md)
- [Operasi Produksi](docs/PRODUCTION_OPERATIONS.md)
- [Demo Guide](docs/DEMO_GUIDE.md)
