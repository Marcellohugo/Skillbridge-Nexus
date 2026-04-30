# Dokumentasi SkillBridge Nexus

Dokumentasi ini merangkum keseluruhan SkillBridge Nexus: tujuan produk, arsitektur, data model, server logic, algoritma, UI/UX, aksesibilitas, setup lokal, operasi produksi, status implementasi, panduan demo, repositioning ke Pathway Readiness Platform, roadmap, NFR, role baru, dan KPI dampak.

## Identitas Proyek

| Item | Detail |
|---|---|
| Nama produk | SkillBridge Nexus |
| Positioning | Pathway Readiness Platform untuk siswa SMA/SMK, mahasiswa, lulusan SMA, fresh graduate, career switcher, dan pekerja awal |
| Versi | 0.1.0 |
| Stack utama | Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Tailwind CSS v4 |
| Mode deployment | Node/Next standalone melalui Docker |
| Bahasa utama UI | Indonesia, dengan fondasi i18n untuk Inggris |

## Peta Dokumentasi

### Strategi & Visi

| Dokumen | Isi |
|---|---|
| [Ringkasan Eksekutif](EXECUTIVE_SUMMARY.md) | Ringkasan tujuan, nilai utama, status produk, stack, dan demo cepat |
| [Gambaran Produk](PRODUCT_OVERVIEW.md) | Latar belakang, visi awal, pengguna inti |
| [Visi Produk & Repositioning](PRODUCT_VISION.md) | Repositioning ke Pathway Readiness Platform |
| [Pathway Readiness](PATHWAY_READINESS.md) | Pathway, segmen user, PRI, Readiness Taxonomy, Evidence Bank, Support Network, use case |
| [Mentor Content Studio](MENTOR_CONTENT_STUDIO.md) | Studio mentor + reward + content review |
| [Roadmap](ROADMAP.md) | MVP saat ini + sprint berikutnya, prioritas P0–P3, effort |
| [Impact & KPI](IMPACT_AND_KPI.md) | KPI per stakeholder + KPI dampak untuk lomba/pitch |

### Fitur & Status

| Dokumen | Isi |
|---|---|
| [Fitur](FEATURES.md) | Katalog per role + Recommended Feature Expansion |
| [Status Implementasi](IMPLEMENTATION_STATUS.md) | Status terverifikasi: Implemented / Partial / Recommended / Not implemented |

### Pengguna & Permission

| Dokumen | Isi |
|---|---|
| [User Roles & Permissions](USER_ROLES_AND_PERMISSIONS.md) | Role saat ini, route guard, permission |
| [Role & Permission Expansion](ROLE_AND_PERMISSION_EXPANSION.md) | Role baru (Teacher/BK, Parent, Lecturer, Employer, Training Provider, Scholarship Officer) + matriks permission + consent |
| [Alur Pengguna](USER_FLOWS.md) | Alur end-to-end role saat ini |

### Arsitektur & Data

| Dokumen | Isi |
|---|---|
| [Arsitektur](ARCHITECTURE.md) | Struktur aplikasi, layer, data flow |
| [Model Data](DATA_MODEL.md) | Ringkasan schema Prisma |
| [API & Logika Server](API_AND_SERVER_LOGIC.md) | Server Actions, auth, email, rate limit |
| [Algoritma & Scoring](ALGORITHMS_AND_SCORING.md) | TRI, gap, matching, forecast, dst. |

### UI/UX & Aksesibilitas

| Dokumen | Isi |
|---|---|
| [Struktur UI/UX](UI_UX_STRUCTURE.md) | Design system, AppShell, navigasi, responsive |
| [Aksesibilitas](ACCESSIBILITY.md) | Preferensi aksesibilitas dan target WCAG |

### Operasional & Kualitas

| Dokumen | Isi |
|---|---|
| [Setup & Pengembangan Lokal](SETUP_AND_LOCAL_DEVELOPMENT.md) | Cara menjalankan project lokal dan Docker |
| [Operasi Produksi](PRODUCTION_OPERATIONS.md) | Checklist production, env, migration, security |
| [Non-Functional Requirements](NONFUNCTIONAL_REQUIREMENTS.md) | Security, privacy, performance, scalability, observability, accessibility, reliability, backup, testing, maintainability |
| [Panduan Demo](DEMO_GUIDE.md) | Cara mempresentasikan proyek |

## Cara Membaca

| Audiens | Mulai dari |
|---|---|
| Penilai produk / juri lomba | [EXECUTIVE_SUMMARY](EXECUTIVE_SUMMARY.md) → [PRODUCT_VISION](PRODUCT_VISION.md) → [PATHWAY_READINESS](PATHWAY_READINESS.md) → [FEATURES](FEATURES.md) → [IMPACT_AND_KPI](IMPACT_AND_KPI.md) → [DEMO_GUIDE](DEMO_GUIDE.md) |
| Stakeholder pitch | [EXECUTIVE_SUMMARY](EXECUTIVE_SUMMARY.md) → [PRODUCT_VISION](PRODUCT_VISION.md) → [ROADMAP](ROADMAP.md) → [IMPACT_AND_KPI](IMPACT_AND_KPI.md) → [MENTOR_CONTENT_STUDIO](MENTOR_CONTENT_STUDIO.md) |
| Developer baru | [ARCHITECTURE](ARCHITECTURE.md) → [DATA_MODEL](DATA_MODEL.md) → [API_AND_SERVER_LOGIC](API_AND_SERVER_LOGIC.md) → [SETUP_AND_LOCAL_DEVELOPMENT](SETUP_AND_LOCAL_DEVELOPMENT.md) |
| Reviewer UI/UX | [UI_UX_STRUCTURE](UI_UX_STRUCTURE.md) → [ACCESSIBILITY](ACCESSIBILITY.md) |
| Operasi production | [PRODUCTION_OPERATIONS](PRODUCTION_OPERATIONS.md) → [NONFUNCTIONAL_REQUIREMENTS](NONFUNCTIONAL_REQUIREMENTS.md) → [SETUP_AND_LOCAL_DEVELOPMENT](SETUP_AND_LOCAL_DEVELOPMENT.md) |
| Tim pengembangan ekspansi | [ROADMAP](ROADMAP.md) → [PATHWAY_READINESS](PATHWAY_READINESS.md) → [ROLE_AND_PERMISSION_EXPANSION](ROLE_AND_PERMISSION_EXPANSION.md) → [MENTOR_CONTENT_STUDIO](MENTOR_CONTENT_STUDIO.md) |

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillbridge.id` | `password123` |
| Mentor | `mentor@skillbridge.id` | `password123` |
| Admin | `admin@skillbridge.id` | `password123` |
| Institution | `institution@skillbridge.id` | `password123` |

## Standar Penulisan

- Bahasa Indonesia profesional, ringkas, aktif.
- Status fitur dilabeli: **Implemented / Partial / Planned / Recommended / Not implemented**.
- Prioritas roadmap dilabeli: **P0 / P1 / P2 / P3**.
- Fitur Recommended tidak boleh disajikan seolah sudah ada.
- Tabel dipakai untuk role, fitur, status, dan roadmap.
- Setiap dokumen menyertakan tautan ke dokumen terkait.
