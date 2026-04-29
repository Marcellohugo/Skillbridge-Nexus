# Fitur

Dokumen ini adalah katalog fitur SkillBridge Nexus, dipisahkan per role dan modul. Bagian akhir berisi **Recommended Feature Expansion** untuk fitur yang belum dibangun namun direkomendasikan untuk pengembangan berikutnya.

Label status:

- **Implemented** — sudah ada di kode dan dapat diakses.
- **Partial** — fondasi sudah ada, beberapa subfitur masih dikembangkan.
- **Recommended** — usulan, belum ada di kode.
- **Future** — direncanakan untuk fase lanjutan.

## Common / Auth

| Fitur | Status | Catatan |
|---|---|---|
| Register learner dan mentor | Implemented | `src/features/auth/auth.actions.ts` |
| Login multi-role + redirect | Implemented | Mengarah ke dashboard sesuai role |
| Logout dari AppShell | Implemented | Server action |
| JWT cookie httpOnly | Implemented | `jose` + cookie `auth_token` |
| Forgot password & reset password | Implemented | Token hashed di `AuthToken` |
| Email verification token | Implemented | `AuthTokenType.EMAIL_VERIFICATION` |
| Rate limiting flow sensitif | Implemented | `src/lib/rate-limit.ts`, in-memory + Upstash adapter |
| Security event log | Implemented | Model `SecurityEvent` |
| Two-factor authentication | Recommended | Lihat NFR security hardening |
| Session/device management UI | Recommended | List active session, revoke device |

## Learner

### Onboarding & Profil

| Fitur | Status | Catatan |
|---|---|---|
| Onboarding pendidikan, target karier, preferensi belajar, mentoring style, bahasa, aksesibilitas | Implemented | `onboarding.actions.ts`, `LearnerProfile` |
| Update profile learner | Implemented | `profile.actions.ts` |
| Accessibility profile (font, motion, contrast, dyslexia, focus, simplified, calm, TTS marker, density, theme) | Implemented | Model `AccessibilityProfile` |
| Life constraints assessment (waktu, device, internet, finansial, dukungan keluarga, lokasi) | Recommended | Belum ada di schema |

### Diagnostic & Readiness

| Fitur | Status | Catatan |
|---|---|---|
| Diagnostic assessment dengan confidence rating | Implemented | `assessment.actions.ts`, MCQ + adaptive trigger |
| Skill snapshot per skill | Implemented | `SkillScoreSnapshot` |
| Skill gap terhadap target role + flag critical/blocker | Implemented | `SkillGapSnapshot` |
| Talent Readiness Index (6 komponen) | Implemented | `recalc.ts`, `TRIHistory` |
| TRI milestone (Emerging → Advanced Ready) | Implemented | Enum `TRIMilestone` |
| Confidence calibration index | Implemented | `calibration.actions.ts` |
| Pathway Readiness Index (PRI) | Recommended | Lihat `docs/PATHWAY_READINESS.md` |

### Learning & Engagement

| Fitur | Status | Catatan |
|---|---|---|
| Learning path generator | Implemented | `learning-path.actions.ts`, prereq gating |
| Module completion + progress persistence | Implemented | `LearningPathItem.isCompleted` |
| Weekly study plan | Implemented | `weekly-plan.actions.ts` |
| Daily challenge / focus timer / reflection journal / heatmap / achievement wall | Implemented | Tersebar di route learner (achievements, coach, dst.) |
| AI Coach internal | Implemented | `coach.actions.ts`, `ai-coach` route, tanpa LLM eksternal |
| Peer learning circle | Recommended | Hanya `peer.actions.ts` scaffold |

### Mentoring (sisi learner)

| Fitur | Status | Catatan |
|---|---|---|
| Mentor marketplace + sort/filter | Implemented | `/mentors` |
| Explainable mentor matching | Implemented | `mentor.actions.ts`, `matchReasons` |
| Request session | Implemented | Membuat `MentoringSession` PENDING |
| Session prep brief otomatis | Implemented | `session-prep.actions.ts` |
| Rating & feedback sesi | Implemented | `MentoringSession.menteeRating/menteeFeedback` |

### Portfolio & Resume

| Fitur | Status | Catatan |
|---|---|---|
| CRUD portfolio project | Implemented | `portfolio.actions.ts` |
| Skill mapping per project | Implemented | `PortfolioEvidenceSkill` |
| Evidence strength scoring | Implemented | Field `evidenceStrength` |
| Validasi mentor terhadap project | Implemented | `isValidated`, `validatedBy`, server action mentor |
| One-page CV generator | Implemented | `resume.actions.ts`, route `/resume` |
| Capstone storyteller | Implemented | `capstone.actions.ts`, `storyteller.actions.ts` |
| Mock interview | Implemented | Route `/mock-interview`, `interview-bank.ts` |
| Evidence Bank lintas tipe (rapor, sertifikat, PKL, lomba, video, esai, link) | Recommended | Schema baru di luar `PortfolioProject` |
| Document Kit Generator (motivation letter, esai beasiswa, cover letter, dll.) | Recommended | Belum ada |
| Evidence verification dengan QR badge | Recommended | Belum ada |

### Career & Skill Intelligence

| Fitur | Status | Catatan |
|---|---|---|
| Career Compass | Implemented | `compass.actions.ts` |
| Career Ladder | Implemented | `ladder.actions.ts` |
| Opportunity Radar | Implemented | `opportunity.actions.ts` |
| Market Value | Implemented | `market-value.actions.ts` |
| Career Forecast | Implemented | Komponen `career-forecast.tsx` |
| Career Simulator | Implemented | `simulator.actions.ts` |
| Skill Tree | Implemented | `skill-tree.actions.ts` |
| Skill Synergy Map | Implemented | `synergy.actions.ts` |
| Skill Decay Monitor | Implemented | `skill-decay.actions.ts` |
| Confidence Calibration | Implemented | `calibration.actions.ts` |
| Immunity Index | Implemented | `immunity.actions.ts` |
| Learning Velocity | Implemented | `velocity.actions.ts` |
| Learning Twin | Implemented | `twin.actions.ts` |

### Notifikasi & Achievement

| Fitur | Status | Catatan |
|---|---|---|
| Notification bell + mark-read | Implemented | Model `Notification` |
| Badge & UserBadge | Implemented | Model `Badge`, `UserBadge` |
| Activity log | Implemented | `ActivityLog` |
| Application Tracker (kampus, magang, kerja, beasiswa, sertifikasi) | Recommended | Belum ada |
| Opportunity Matching Hub | Recommended | Berbeda dari Opportunity Radar; mengelola peluang eksternal |

## Mentor

| Fitur | Status | Catatan |
|---|---|---|
| Mentor dashboard | Implemented | `/mentor/dashboard` |
| Daftar sesi masuk | Implemented | `/mentor/sessions` |
| Accept / reject / reschedule / complete session | Implemented | `session.actions.ts` |
| Action items + session notes | Implemented | `MentoringSession.actionItems`, `notes` |
| Daftar learner mentor | Implemented | `/mentor/learners` |
| Progress learner: TRI, milestone, risk, action items | Implemented | Membaca `LearnerProfile` + `InterventionRecord` |
| Validasi portfolio learner | Implemented | Server action mentor |
| Mentor Content Studio (buat & publish materi) | Recommended | Lihat `docs/MENTOR_CONTENT_STUDIO.md` |
| Mentor Reward Engine + Contribution Score | Recommended | Belum ada |
| Mentor Quality & Capacity Dashboard | Recommended | Belum ada |
| Mentor verification workflow | Partial | Field `MentorProfile.validatedAt` ada, UI workflow lengkap belum |

## Admin

| Fitur | Status | Catatan |
|---|---|---|
| Dashboard operasional platform | Implemented | `/admin/dashboard` |
| User management (activate/deactivate) | Implemented | `platform.actions.ts` |
| Skill taxonomy overview | Implemented | `/admin/skills` |
| Platform metrics: user, assessment, snapshot, session, project, badge, intervention | Implemented | `/admin/analytics` |
| Score Simulator (formula PRI/TRI versioning) | Recommended | Belum ada |
| Data Import (CSV) untuk sekolah/kampus | Recommended | Belum ada |
| Public Impact Dashboard | Recommended | Aggregat lintas tenant |
| Governance & Consent Center | Recommended | Lihat NFR |

## Institution Manager

| Fitur | Status | Catatan |
|---|---|---|
| Dashboard institusi | Implemented | `/institution/dashboard` |
| Cohort health (TRI rata-rata, career-ready %, at-risk count) | Implemented | `analytics.actions.ts` |
| Member list dengan risk badge & readiness | Implemented | `/institution/members` |
| Institution analytics: TRI trend, milestone distribution, blind spot, intervention queue | Implemented | `/institution/analytics` |
| Curriculum Blind Spot Mapper (course-skill mapping, coverage score) | Partial | Blind spot muncul di analytics; mapping kurikulum belum ada model |
| Institution Intervention Center (planner, assignment, before-after, effectiveness) | Recommended | `InterventionRecord` ada, planner UI belum |
| Class/lecturer dashboard + assignment recommendation | Recommended | Belum ada role lecturer |
| Bulk invite + class/cohort mapping CSV | Recommended | Belum ada |

## Recommended New Roles

Lihat detail di [ROLE_AND_PERMISSION_EXPANSION.md](ROLE_AND_PERMISSION_EXPANSION.md).

| Role baru | Status |
|---|---|
| Teacher / BK Counselor | Recommended |
| Parent / Guardian | Recommended |
| Lecturer / Academic Advisor | Recommended |
| Employer / Recruiter | Recommended |
| Training Provider | Recommended |
| Scholarship Officer | Recommended |

## Global Shell & UX

| Fitur | Status | Catatan |
|---|---|---|
| Navbar ringkas + grouped overflow | Implemented | `app-shell.tsx` |
| Mobile drawer | Implemented | |
| Command palette | Implemented | `command-palette.tsx`, Ctrl/Cmd + K |
| Notification bell | Implemented | |
| Page pins | Implemented | Bookmark personal route |
| Theme switcher (light/dark/system) | Implemented | |
| Language switcher (id/en) | Implemented | `LanguageProvider` |
| Panel aksesibilitas global | Implemented | `accessibility-provider.tsx` |
| Plain language / low literacy mode | Recommended | Memerlukan content variant |
| Low bandwidth mode | Recommended | Belum ada |

## i18n & l10n

| Fitur | Status | Catatan |
|---|---|---|
| Locale constants + typed dictionary | Implemented | `src/lib/i18n.ts` |
| Locale fallback | Implemented | |
| Formatter (tanggal, angka, currency, relative time) | Implemented | |
| LanguageProvider + cookie/localStorage sync | Implemented | |
| `<html lang>` update | Implemented | Root layout |
| Auth, shell, common UI, format lokal terlokalisasi | Implemented | |
| Localisasi seluruh widget spesifik | Partial | Beberapa widget masih literal |

## Operasional

| Fitur | Status | Catatan |
|---|---|---|
| Dockerfile production standalone | Implemented | |
| Docker Compose production-like | Implemented | `docker-compose.yml` |
| Docker Compose development hot-reload | Implemented | `docker-compose.dev.yml` |
| Prisma migration + seed | Implemented | |
| Environment validation | Implemented | `src/lib/env.ts` |
| Unit test (security, env, route guard, email, rate limit, i18n) | Implemented | |
| Lint + typecheck + build | Implemented | |
| Playwright UI smoke test | Implemented | `tests/ui` |
| CI/CD pipeline | Future | Sengaja dikecualikan saat ini |
| Observability eksternal (Sentry/OTel/Grafana) | Recommended | Lihat NFR |
| Backup terjadwal + restore drill | Recommended | Lihat NFR |
| Analytics API + scheduled report + audit log | Recommended | Belum ada |

## Recommended Feature Expansion (ringkas)

Daftar fitur yang **belum ada di kode** namun direkomendasikan untuk fase berikutnya. Detail per fitur ada pada dokumen terkait.

| Fitur | Prioritas | Effort | Dokumen |
|---|---|---|---|
| Pathway Selector (lintas jenjang) | P0 | Medium | PATHWAY_READINESS.md |
| Readiness Taxonomy (Academic/Digital/Career/Vocational/HE/Entrepreneurship/Life) | P0 | Medium | PATHWAY_READINESS.md |
| Pathway Readiness Index (PRI) | P0 | Medium | PATHWAY_READINESS.md |
| Evidence Bank lintas tipe | P0 | High | PATHWAY_READINESS.md |
| Mentor Content Studio + Reward Engine | P1 | High | MENTOR_CONTENT_STUDIO.md |
| Content Quality Review System | P1 | Medium | MENTOR_CONTENT_STUDIO.md |
| Application Tracker | P1 | Medium | ROADMAP.md |
| Document Kit Generator | P1 | Medium | ROADMAP.md |
| Opportunity Matching Hub | P1 | High | ROADMAP.md |
| Institution Intervention Center | P1 | High | ROADMAP.md |
| Curriculum Blind Spot Mapper | P1 | High | ROADMAP.md |
| Public Impact Dashboard | P2 | Medium | ROADMAP.md |
| Employer Portal / Talent Board | P2 | High | ROADMAP.md |
| Mentor Quality & Capacity Dashboard | P2 | Medium | ROADMAP.md |
| Lecturer / Class Dashboard | P2 | High | ROADMAP.md |
| Scholarship & Support Recommendation | P2 | Medium | ROADMAP.md |
| Community Mentor Network | P2 | Medium | ROADMAP.md |
| Analytics API + Data Export | P2 | Medium | ROADMAP.md |
| Governance, Privacy, Consent Center | P1 | Medium | NONFUNCTIONAL_REQUIREMENTS.md |
| Score Simulator (formula versioning) | P2 | Medium | ROADMAP.md |
| Data Import sekolah/kampus | P2 | Medium | ROADMAP.md |
| Support Case Management | P2 | Medium | ROADMAP.md |
| Evidence Verification System | P2 | Medium | ROADMAP.md |
| Peer Learning Circle | P2 | Medium | ROADMAP.md |
| Life Constraints Assessment | P2 | Low | ROADMAP.md |
| Skill Demand Feedback Loop | P3 | High | ROADMAP.md |
