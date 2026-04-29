# Status Implementasi

Dokumen ini mendokumentasikan status implementasi terverifikasi terhadap source code di branch `Dev`. Tujuannya menjaga kejelasan antara fitur yang sudah dapat dipakai, fitur yang masih fondasi, dan fitur yang masih berupa rekomendasi.

## Label Status

- **Implemented** — kode aktif, dapat dipakai end-to-end melalui UI atau server action.
- **Partial** — kode/fondasi ada, beberapa subfitur atau UI lengkap belum tersedia.
- **Planned** — sudah dijadwalkan di roadmap, model atau scaffold sebagian sudah ada.
- **Recommended** — usulan baru, belum ada di kode.
- **Not implemented** — disebut dalam diskusi/dokumen lain namun tidak ditemukan di kode.

## Ringkasan Per Area

| Area | Status | Catatan |
|---|---|---|
| Auth, session, account recovery | Implemented | Login, register, logout, forgot/reset, email verification, security event |
| Learner core flow | Implemented | Onboarding → assessment → snapshot → gap → TRI → path → mentoring → portfolio |
| Mentor flow | Implemented | Sessions, learners, validasi portfolio |
| Admin flow | Implemented | User, taxonomy, platform metrics |
| Institution flow | Implemented | Cohort, member, analytics, blind spot dasar |
| UI/UX shell | Implemented | Navbar, drawer, command palette, page pins, theme, language, a11y |
| Aksesibilitas | Partial | Preferensi utama selesai, TTS via Web Speech belum aktif |
| i18n/l10n | Partial | Fondasi selesai, beberapa widget masih literal |
| Docker production-like | Implemented | Compose dev + prod, standalone build |
| CI/CD | Not implemented | Sengaja dikecualikan |
| Observability eksternal | Not implemented | Hanya log aplikasi + `SecurityEvent` |
| Backup terjadwal | Not implemented | Hanya panduan manual |
| Test coverage algoritma kompleks | Partial | Unit + UI smoke ada, perluasan diperlukan |

## Status Per Fitur — Auth & Account Recovery

| Fitur | Status | Catatan |
|---|---|---|
| Login/Register/Logout | Implemented | JWT cookie, redirect role, demo quick fill |
| Forgot/Reset Password | Implemented | Token hashed di `AuthToken`, expiry, email builder |
| Email Verification | Implemented | Halaman `/verify-email`, token service |
| Rate limit flow auth | Implemented | In-memory + Upstash adapter |
| Security Event Log | Implemented | Model `SecurityEvent`, indexed by action + createdAt |
| 2FA / TOTP | Recommended | Belum ada |
| Session/Device Management UI | Recommended | Belum ada |
| Suspicious login detection | Recommended | Tidak ada heuristik aktif |

## Status Per Fitur — Learner

| Fitur | Status | Catatan |
|---|---|---|
| Onboarding | Implemented | Menulis `LearnerProfile` + `AccessibilityProfile` |
| Assessment | Implemented | Persist session, score, confidence, gap, TRI |
| Skill Snapshot | Implemented | `SkillScoreSnapshot` |
| Skill Gap | Implemented | `SkillGapSnapshot` + flag critical/blocker |
| Learning Path | Implemented | Generate, toggle complete, prereq gating |
| Weekly Plan | Implemented | `weekly-plan.actions.ts` |
| Mentor Marketplace + Match | Implemented | `mentor.actions.ts`, `matchReasons` |
| Mentor Session Request | Implemented | `MentoringSession` PENDING |
| Session Prep | Implemented | `session-prep.actions.ts` |
| Portfolio CRUD | Implemented | `portfolio.actions.ts` |
| Evidence Strength | Implemented | Kalkulasi otomatis + override mentor |
| Resume Generator | Implemented | `resume.actions.ts`, route `/resume` |
| Mock Interview | Implemented | `interview-bank.ts`, route `/mock-interview` |
| Capstone Storyteller | Implemented | `capstone.actions.ts`, `storyteller.actions.ts` |
| Career Compass | Implemented | `compass.actions.ts` |
| Career Ladder | Implemented | `ladder.actions.ts` |
| Opportunity Radar | Implemented | `opportunity.actions.ts` |
| Market Value | Implemented | `market-value.actions.ts` |
| Career Forecast | Implemented | Komponen `career-forecast.tsx` |
| Career Simulator | Implemented | `simulator.actions.ts` |
| Skill Tree | Implemented | `skill-tree.actions.ts` |
| Skill Synergy | Implemented | `synergy.actions.ts` |
| Skill Decay | Implemented | `skill-decay.actions.ts` |
| Calibration | Implemented | `calibration.actions.ts` |
| Immunity Index | Implemented | `immunity.actions.ts` |
| Velocity | Implemented | `velocity.actions.ts` |
| Learning Twin | Implemented | `twin.actions.ts` |
| AI Coach internal | Implemented | `coach.actions.ts`, tanpa LLM eksternal |
| Achievements | Implemented | `achievements.actions.ts`, `Badge`, `UserBadge` |
| Peer Circle | Partial | `peer.actions.ts` ada, route/UI belum lengkap |
| Pathway Selector lintas jenjang | Recommended | Saat ini hanya `targetCareerRoleId` |
| PRI lintas pathway | Recommended | TRI sudah; PRI belum ada |
| Evidence Bank lintas tipe | Recommended | Hanya `PortfolioProject` |
| Document Kit Generator | Recommended | Hanya CV; motivation letter dll. belum |
| Application Tracker | Recommended | Belum ada |
| Opportunity Matching Hub eksternal | Recommended | Berbeda dari Opportunity Radar internal |
| Life Constraints Assessment | Recommended | Belum ada model |
| Plain language / low-literacy mode | Recommended | Belum ada content variant |

## Status Per Fitur — Mentor

| Fitur | Status | Catatan |
|---|---|---|
| Mentor Dashboard | Implemented | `/mentor/dashboard` |
| Daftar Sesi Masuk | Implemented | `session.actions.ts: listIncomingSessionsAction` |
| Accept/Reject/Reschedule/Complete | Implemented | Lifecycle penuh |
| Action Items + Notes | Implemented | `MentoringSession.actionItems`, `notes` |
| Daftar Learner | Implemented | `listMentorLearnersAction` |
| Progress Learner | Implemented | TRI, milestone, risk, action items |
| Validasi Portfolio | Implemented | `isValidated`, `validatedBy` |
| Mentor Profile Page | Partial | Route ada, edit fitur masih dasar |
| Mentor Verification Workflow | Partial | Field `validatedAt` ada, UI workflow + reviewer belum |
| Mentor Content Studio | Recommended | Belum ada model `Content`/`ContentReview` |
| Mentor Reward Engine + Contribution Score | Recommended | Belum ada |
| Mentor Quality & Capacity Dashboard | Recommended | Belum ada |

## Status Per Fitur — Admin

| Fitur | Status | Catatan |
|---|---|---|
| Admin Dashboard | Implemented | `/admin/dashboard` |
| User Management (active toggle) | Implemented | `platform.actions.ts` |
| Skill Taxonomy Overview | Implemented | `/admin/skills` |
| Platform Metrics | Implemented | User, assessment, snapshot, session, project, badge, intervention |
| Admin Profile Page | Partial | Route ada, fitur masih dasar |
| Score Simulator (formula versioning) | Recommended | Belum ada |
| Data Import (CSV) sekolah/kampus | Recommended | Belum ada |
| Public Impact Dashboard | Recommended | Belum ada |
| Governance & Consent Center | Recommended | Belum ada |
| Audit Log UI | Recommended | Data ada di `ActivityLog` & `SecurityEvent`, UI belum |

## Status Per Fitur — Institution

| Fitur | Status | Catatan |
|---|---|---|
| Institution Dashboard | Implemented | `/institution/dashboard` |
| Cohort Health | Implemented | `analytics.actions.ts` |
| Member List + Risk Badge | Implemented | `/institution/members` |
| Institution Analytics (TRI trend, milestone, blind spot, intervention queue) | Implemented | `/institution/analytics` |
| Curriculum Blind Spot Mapper (course-skill mapping) | Partial | Agregat blind spot ada, mapping kurikulum eksplisit belum |
| Intervention Center (planner, assignment, before-after, effectiveness) | Recommended | `InterventionRecord` ada, planner UI belum |
| Lecturer / Class Dashboard | Recommended | Role belum ada |
| Bulk Invite + CSV mapping | Recommended | Belum ada |
| Scholarship & Support Recommendation | Recommended | Belum ada |
| Support Case Management | Recommended | Belum ada |

## Status Per Fitur — UX & Platform

| Fitur | Status | Catatan |
|---|---|---|
| AppShell + navbar ringkas | Implemented | `app-shell.tsx` |
| Mobile drawer | Implemented |  |
| Command palette | Implemented | `command-palette.tsx` |
| Page pins | Implemented |  |
| Theme switcher | Implemented |  |
| Language switcher | Implemented | `LanguageProvider` |
| Notification bell | Implemented |  |
| Accessibility panel | Implemented |  |
| TTS Web Speech API | Partial | Marker preferensi ada, integrasi audio belum |
| Plain language / low literacy mode | Recommended | Belum ada |
| Low bandwidth mode | Recommended | Belum ada |

## Status Per Fitur — i18n / l10n

| Fitur | Status | Catatan |
|---|---|---|
| Locale constants & typed dictionary | Implemented | `src/lib/i18n.ts` |
| Locale fallback | Implemented |  |
| Formatter tanggal/angka/currency/relative time | Implemented |  |
| LanguageProvider + cookie/localStorage | Implemented |  |
| `<html lang>` update | Implemented |  |
| Localisasi auth/shell/common label | Implemented |  |
| Localisasi widget spesifik | Partial | Beberapa string literal tersisa |

## Status Per Fitur — Operasional

| Fitur | Status | Catatan |
|---|---|---|
| Dockerfile production | Implemented |  |
| Compose production-like | Implemented | `docker-compose.yml` |
| Compose dev hot-reload | Implemented | `docker-compose.dev.yml` |
| Prisma migration deploy | Implemented |  |
| Seed demo | Implemented | `prisma/seed.ts` |
| Env validation | Implemented | `src/lib/env.ts` |
| Unit test (security/env/route guard/email/rate limit/i18n) | Implemented |  |
| Lint / typecheck / build | Implemented |  |
| Playwright UI smoke | Implemented | `tests/ui` |
| CI/CD | Not implemented | Sengaja dikecualikan |
| Observability eksternal | Not implemented | Hanya log + SecurityEvent |
| Backup terjadwal & restore drill | Not implemented | Hanya panduan |
| Disaster recovery runbook | Not implemented |  |
| Analytics API + audit log UI | Recommended |  |

## Catatan Asumsi

Asumsi yang digunakan saat menyusun status:

1. Semua fitur intelligence learner (compass/ladder/opportunity/market-value/forecast/simulator/skill-tree/synergy/decay/calibration/immunity/velocity/twin) dianggap **Implemented** karena tiap action file ada di `src/features/learner/` dan setiap route ada di `src/app/(learner)/`. Cakupan UI dan kedalaman algoritma tiap fitur masih bisa diperdalam, namun struktur sudah aktif.
2. Folder `src/features/chat/` ada namun tidak memiliki route aktif. Fitur chat real-time karena itu tidak dimasukkan sebagai Implemented.
3. AI Coach disebut "tanpa LLM eksternal" sesuai keterangan internal pada `coach.actions.ts` dan dokumen lama. Tidak ada dependency LLM eksternal di `package.json` saat audit.
4. Fitur "Curriculum Blind Spot" dianggap **Partial** karena agregasi muncul di institution analytics, namun belum ada model course-skill mapping eksplisit.
5. Fitur lain di luar daftar di atas yang belum bisa diverifikasi langsung dari kode dilabeli **Recommended**, bukan **Implemented**.

## Kesimpulan

SkillBridge Nexus sudah berada pada level production-like MVP untuk learner, mentor, admin, dan institusi. Untuk mendukung repositioning sebagai Pathway Readiness Platform, langkah berikutnya adalah memperluas data model (Pathway, Readiness Taxonomy, Evidence Bank), menambah role baru (Teacher/BK, Lecturer, Parent, Employer, Training Provider, Scholarship Officer), serta membangun Mentor Content Studio + Reward Engine. Detail prioritas ada di [ROADMAP.md](ROADMAP.md).
