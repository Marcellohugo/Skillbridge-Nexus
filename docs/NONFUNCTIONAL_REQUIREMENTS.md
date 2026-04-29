# Non-Functional Requirements

Dokumen ini merangkum kebutuhan non-fungsional (NFR) SkillBridge Nexus: security, privacy, performance, scalability, observability, accessibility, reliability, backup, testing, dan maintainability. Status mengacu ke audit kode saat ini.

## Label

- **Implemented** — sudah tersedia di kode.
- **Partial** — fondasi ada, perlu diperluas.
- **Recommended** — usulan, belum ada di kode.

## 1. Security Hardening

| Item | Status | Catatan |
|---|---|---|
| Password hashing (bcryptjs) | Implemented | `auth.service.ts` |
| JWT cookie httpOnly | Implemented | `jose`, cookie `auth_token`, SameSite Lax, Secure di prod |
| Token reset/verifikasi disimpan sebagai hash | Implemented | `AuthToken.tokenHash` |
| Rate limit flow auth | Implemented | In-memory + Upstash adapter |
| Security event logging | Implemented | `SecurityEvent` |
| Role guard di proxy + layout + server action | Implemented | Tiga lapis |
| Two-factor authentication (TOTP/email/SMS) | Recommended |  |
| Session/device management page | Recommended |  |
| Device history | Recommended |  |
| Suspicious login detection | Recommended | IP/user-agent anomali |
| Security audit log UI | Recommended | Data ada, UI belum |
| Granular permission per role baru | Recommended | Lihat ROLE_AND_PERMISSION_EXPANSION |
| Secret rotation runbook | Recommended |  |

## 2. Privacy & Consent

| Item | Status | Catatan |
|---|---|---|
| Consent center | Recommended |  |
| Visibility control (employer, institution, public) | Recommended |  |
| Audit access log | Partial | `ActivityLog` ada, akses data sensitif belum khusus |
| Data retention policy | Recommended |  |
| Anonymized analytics | Recommended | Untuk public impact dashboard |
| Right to delete / export | Recommended | GDPR-style |
| Institution aggregate-only mode | Recommended | Mencegah identifikasi individu |
| Employer visibility toggle per learner | Recommended |  |

## 3. Performance Targets

| Target | Status | Catatan |
|---|---|---|
| Dashboard load < 2s untuk data utama | Partial | Belum diukur secara formal |
| Search mentor / materi < 1s untuk query umum | Partial | Mentor list saat ini in-memory ranking |
| TRI/PRI recalculation memakai background job untuk data besar | Recommended | Saat ini sinkron via server action |
| Analytics cohort cache | Recommended | Belum ada layer cache |
| Database index untuk user, cohort, session, snapshot, history | Implemented | Index sudah ada di schema |
| Lazy load chart & komponen berat | Partial | Beberapa chart sudah dynamic import |
| Image optimization Next.js | Implemented | Default Next config |
| API pagination standard | Recommended | Belum ada konvensi seragam |

## 4. Scalability Architecture

| Item | Status | Catatan |
|---|---|---|
| Background job queue | Recommended | Misal BullMQ / pg-boss |
| Caching layer (Redis) | Recommended |  |
| Read model untuk analytics | Recommended |  |
| Batch processing untuk recalc PRI/TRI massal | Recommended |  |
| Rate limit per role | Partial | Saat ini hanya per flow auth |
| Connection pooling Prisma | Implemented | Default Prisma + `db.ts` singleton |
| Horizontal scaling readiness | Partial | Standalone build mendukung; session JWT statis |
| CDN untuk asset | Recommended |  |

## 5. Observability & Incident Management

| Item | Status | Catatan |
|---|---|---|
| Structured logging | Partial | `src/lib/logger.ts` minimal |
| Error tracking eksternal (Sentry) | Recommended |  |
| Performance monitoring (OTel/APM) | Recommended |  |
| Alerting (error rate, latency, DB) | Recommended |  |
| Incident timeline | Recommended |  |
| Health dashboard | Recommended |  |
| Uptime monitor | Recommended |  |
| Metrics endpoint (`/healthz`, `/metrics`) | Recommended |  |
| `SecurityEvent` audit | Implemented |  |

## 6. Accessibility Maturity

| Item | Status | Catatan |
|---|---|---|
| Font scale, motion, contrast, dyslexia, focus, simplified, calm | Implemented | `AccessibilityProfile` |
| Keyboard navigation di assessment + command palette | Implemented |  |
| `<html lang>` dinamis | Implemented |  |
| Focus indicator + ARIA dasar | Implemented | `app-shell.tsx` |
| Full keyboard audit lintas route | Recommended |  |
| Screen reader audit | Recommended |  |
| Caption / transcript wajib untuk konten video | Recommended | Bagian dari Mentor Content Studio |
| Full text-to-speech via Web Speech API | Partial | Marker preferensi ada, integrasi audio belum |
| Plain language mode | Recommended |  |
| Low literacy mode | Recommended |  |
| Low bandwidth mode | Recommended |  |
| Automated a11y testing (axe) | Recommended |  |
| Validasi kontras lintas theme + high contrast | Partial |  |

## 7. Reliability & Error Handling

| Item | Status | Catatan |
|---|---|---|
| Server action mengembalikan `{ ok, error }` | Implemented | Konvensi seragam |
| Env validation startup | Implemented | `env.ts` |
| JWT secret guard | Implemented |  |
| Graceful error boundary di route | Partial | Belum semua segmen punya `error.tsx` |
| Retry strategy untuk email provider | Recommended |  |
| Idempotency key untuk action kritikal | Recommended |  |

## 8. Backup, Restore, Disaster Recovery

| Item | Status | Catatan |
|---|---|---|
| Manual `pg_dump` runbook | Implemented | `PRODUCTION_OPERATIONS.md` |
| Automated backup terjadwal | Recommended |  |
| Restore drill berkala | Recommended |  |
| Backup retention policy | Recommended |  |
| Off-site storage | Recommended |  |
| Data corruption alert | Recommended |  |
| Recovery time objective (RTO) | Recommended |  |
| Recovery point objective (RPO) | Recommended |  |
| Disaster recovery runbook | Recommended |  |

## 9. Testing & Quality

| Item | Status | Catatan |
|---|---|---|
| Unit test (security/env/route guard/email/rate limit/i18n) | Implemented | `tests/unit` |
| Playwright UI smoke test | Implemented | `tests/ui` |
| Algoritma scoring (TRI/PRI, gap, matching) | Partial | Perlu coverage perluasan |
| Role permission test lintas role baru | Recommended |  |
| Server action integration test | Recommended |  |
| E2E critical path (login → assessment → path → mentor → portfolio) | Recommended |  |
| Data import test (CSV) | Recommended |  |
| Accessibility test otomatis | Recommended |  |
| Regression test produk | Recommended |  |
| Performance test dashboard | Recommended |  |

## 10. Maintainability & Release Management

| Item | Status | Catatan |
|---|---|---|
| Feature flag system | Recommended | Untuk roll-out PRI, Pathway, Studio |
| Module boundary (features per domain) | Implemented | `src/features/<domain>` |
| API contract docs | Partial | Server action terdokumentasi via README + TypeScript |
| Seed scenario library lengkap | Partial | `prisma/seed.ts` ada, perlu skenario per pathway |
| Migration checklist | Implemented | `PRODUCTION_OPERATIONS.md` |
| Changelog produk | Recommended |  |
| Versioning rilis | Recommended | Belum ada tag/tagging policy |
| CI/CD pipeline | Future | Sengaja dikecualikan saat ini |

## 11. Scoring Governance

| Item | Status | Catatan |
|---|---|---|
| Explainability panel TRI/PRI | Partial | `matchReasons` mentor sudah explainable; TRI/PRI panel belum |
| Score history | Implemented | `TRIHistory` |
| Formula changelog | Recommended |  |
| Bias review proses | Recommended |  |
| Manual override log | Recommended |  |
| Confidence interval | Recommended |  |
| Score Simulator (formula versioning) | Recommended | Lihat ROADMAP Sprint 4 |

## 12. Operational Hygiene

| Item | Status | Catatan |
|---|---|---|
| Dockerfile multi-stage standalone | Implemented |  |
| Compose dev + prod | Implemented |  |
| Migration deploy step | Implemented |  |
| Pre-commit hooks (lint/typecheck) | Recommended | Bukan CI |
| Dependency audit terjadwal | Recommended |  |
| License audit | Recommended |  |

## Target Indikatif

| Kategori | Target |
|---|---|
| Uptime | ≥ 99.5% |
| Dashboard p95 latency | ≤ 1.5s |
| Search p95 latency | ≤ 0.8s |
| Error rate | ≤ 1% per request |
| Backup frequency | Harian |
| Backup retention | 7–30 hari |
| Restore drill | Quarterly |
| RTO | ≤ 4 jam |
| RPO | ≤ 24 jam |
| WCAG | 2.1 AA |
| Lighthouse a11y | ≥ 90 |
| Test coverage critical path | ≥ 70% |

## Hubungan Dengan Dokumen Lain

- [ROADMAP.md](ROADMAP.md) — Sprint 5 menargetkan governance/observability/security.
- [PRODUCT_VISION.md](PRODUCT_VISION.md) — prinsip privacy-aware & inclusive.
- [ROLE_AND_PERMISSION_EXPANSION.md](ROLE_AND_PERMISSION_EXPANSION.md) — implikasi permission untuk privacy.
- [IMPACT_AND_KPI.md](IMPACT_AND_KPI.md) — KPI dampak.
- [PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md) — runbook operasional saat ini.
