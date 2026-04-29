# Roadmap

Roadmap pengembangan SkillBridge Nexus dari MVP saat ini menuju Pathway Readiness Platform lintas jenjang. Roadmap ini berfungsi untuk lomba, pitch, dan rencana eksekusi tim.

## Label

| Prioritas | Definisi |
|---|---|
| P0 | Wajib untuk demo/pilot pertama Pathway Readiness |
| P1 | Penting untuk maturitas produk |
| P2 | Penguatan ekosistem (institusi, employer, training provider) |
| P3 | Lanjutan / eksperimental |

| Effort | Definisi |
|---|---|
| Low | < 1 minggu engineer |
| Medium | 1–3 minggu engineer |
| High | > 3 minggu engineer |

| Status | Definisi |
|---|---|
| Implemented | Sudah ada di kode |
| Planned | Sudah dijadwalkan, scaffold/ada modal mulai |
| Recommended | Usulan baru, belum ada di kode |
| Future | Direncanakan, fase lanjutan |

## MVP Saat Ini (Verified)

| Modul | Status |
|---|---|
| Auth + recovery + security event | Implemented |
| Learner core (onboarding → assessment → snapshot → gap → TRI → path → mentor → portfolio) | Implemented |
| Mentor lifecycle sesi + validasi portfolio | Implemented |
| Admin user/skill/analytics | Implemented |
| Institution cohort/member/analytics | Implemented |
| AppShell + command palette + page pins + theme + language + a11y panel | Implemented |
| Career intelligence (compass/ladder/opportunity/market-value/forecast/simulator) | Implemented |
| Skill intelligence (tree/synergy/decay/calibration/immunity/velocity/twin) | Implemented |
| Engagement (achievements, daily challenge, focus, reflection, heatmap, AI Coach internal) | Implemented |
| Resume/CV + mock interview + capstone storyteller | Implemented |
| Docker prod-like + dev hot reload | Implemented |
| Unit + UI smoke test | Implemented |

Lihat [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) untuk detail per fitur.

## Sprint 1 — Pathway Foundation

Target: memperluas konsep dari Career Role ke Pathway lintas jenjang.

| Item | Prioritas | Effort | Status | Catatan |
|---|---|---|---|---|
| Schema `Pathway`, `PathwayTarget`, `PathwayLearnerEnrollment` | P0 | Medium | Recommended |  |
| Pathway Selector UI di onboarding + dashboard | P0 | Medium | Recommended |  |
| Readiness Taxonomy (Academic/Digital/Career/Vocational/HE/Entrepreneurship/Life) | P0 | Medium | Recommended | Perluasan `SkillCategory` atau model baru |
| Evidence Bank (model `Evidence` lintas tipe) | P0 | High | Recommended | Migrasi/koeksistensi dengan `PortfolioProject` |
| Pathway Fit scoring | P0 | Medium | Recommended |  |
| Localisasi seluruh widget spesifik | P1 | Medium | Partial |  |
| Life Constraints Assessment | P1 | Low | Recommended |  |

## Sprint 2 — Mentor Content Studio + Reward

Target: membuka jalur kontribusi mentor + reward berbasis dampak.

| Item | Prioritas | Effort | Status |
|---|---|---|---|
| Schema `Content`, `ContentVersion`, `ContentReview`, `ContentConsumption`, `RewardLedger` | P1 | High | Recommended |
| Studio UI (artikel, quiz) | P1 | Medium | Recommended |
| Content Quality Review System | P1 | Medium | Recommended |
| Mentor Contribution Score + badge tier | P1 | Medium | Recommended |
| Contributor Candidate flow | P1 | Medium | Recommended |
| Mentor verification workflow lengkap | P1 | Medium | Partial |
| Plagiarism declaration + takedown | P1 | Low | Recommended |

## Sprint 3 — Application Tracker + Document Kit + Opportunity Matching

Target: membantu user mengeksekusi pathway sehari-hari.

| Item | Prioritas | Effort | Status |
|---|---|---|---|
| Application Tracker (kampus/magang/kerja/beasiswa/sertifikasi) | P1 | Medium | Recommended |
| Document Kit Generator (motivation letter, esai beasiswa, cover letter, LinkedIn, interview answer sheet) | P1 | Medium | Recommended |
| Opportunity Matching Hub (peluang eksternal + eligibility) | P1 | High | Recommended |
| PRI (Pathway Readiness Index) + `PRIHistory` | P0 | Medium | Recommended |
| Notifikasi deadline | P1 | Low | Recommended |
| Evidence Verification System + QR badge | P2 | Medium | Recommended |

## Sprint 4 — Institusi & Employer

Target: memperkuat sisi institusi dan membuka sisi employer.

| Item | Prioritas | Effort | Status |
|---|---|---|---|
| Institution Intervention Center (planner, assignment, before-after, effectiveness) | P1 | High | Recommended |
| Curriculum Blind Spot Mapper (course-skill mapping eksplisit) | P1 | High | Partial |
| Public Impact Dashboard (aggregat lintas tenant) | P2 | Medium | Recommended |
| Employer Portal / Talent Board | P2 | High | Recommended |
| Mentor Quality & Capacity Dashboard | P2 | Medium | Recommended |
| Lecturer / Class Dashboard | P2 | High | Recommended |
| Scholarship & Support Recommendation | P2 | Medium | Recommended |
| Bulk Invite + CSV mapping (sekolah/kampus) | P2 | Medium | Recommended |
| Score Simulator (formula versioning) | P2 | Medium | Recommended |

## Sprint 5 — Privacy, Governance, Observability

Target: kesiapan production publik.

| Item | Prioritas | Effort | Status |
|---|---|---|---|
| Governance & Consent Center | P1 | Medium | Recommended |
| Privacy controls (visibility employer, institution aggregate-only mode) | P1 | Medium | Recommended |
| Audit Trail UI (`ActivityLog` + `SecurityEvent`) | P1 | Low | Recommended |
| Data retention policy + export/delete | P1 | Medium | Recommended |
| Observability eksternal (Sentry/OTel/health dashboard) | P1 | Medium | Recommended |
| Backup terjadwal + restore drill | P1 | Medium | Recommended |
| Two-factor authentication | P1 | Medium | Recommended |
| Session/Device Management UI | P2 | Low | Recommended |
| Suspicious login detection | P2 | Medium | Recommended |
| Disaster recovery runbook | P2 | Low | Recommended |
| Analytics API + scheduled report + audit log | P2 | Medium | Recommended |
| CI/CD pipeline | P1 | Medium | Future |

## Sprint 6 — Lanjutan / Eksperimental

| Item | Prioritas | Effort | Status |
|---|---|---|---|
| Skill Demand Feedback Loop (industri ↔ kurikulum) | P3 | High | Recommended |
| Community Mentor Network (alumni mode, contribution score komunitas) | P2 | Medium | Recommended |
| Peer Learning Circle | P2 | Medium | Recommended |
| Support Case Management (BK/dosen wali) | P2 | Medium | Recommended |
| Plain language / low literacy mode | P2 | Medium | Recommended |
| Low bandwidth mode | P2 | Medium | Recommended |
| Full TTS via Web Speech API | P2 | Low | Partial |
| Feature flag system | P2 | Low | Recommended |
| Seed scenario library lengkap (per pathway) | P2 | Medium | Recommended |

## Sequencing & Dependency

```text
Sprint 1 (Pathway foundation, Evidence Bank, Readiness Taxonomy)
   |
   +-> Sprint 3 (PRI, Application Tracker, Document Kit, Opportunity Matching)
   |
   +-> Sprint 2 (Mentor Content Studio, Reward) — paralel jika kapasitas cukup
   |
   +-> Sprint 4 (Institusi & Employer)
            |
            +-> Sprint 5 (Privacy/Governance/Observability)
                     |
                     +-> Sprint 6 (Lanjutan)
```

Sprint 1 menjadi prasyarat untuk Sprint 3 dan Sprint 4 karena PRI, Evidence Bank, dan dashboard institusi membutuhkan model pathway dan readiness taxonomy.

## Milestone Demo / Pitch

| Milestone | Cakupan |
|---|---|
| MVP Showcase (saat ini) | Auth, learner core, mentor sesi, admin, institusi, intelligence learner |
| Pilot Pathway (post Sprint 1) | Pathway selector, readiness taxonomy minimal, evidence bank dasar |
| Mentor Studio (post Sprint 2) | Studio + reward + contributor onboarding |
| Eksekusi Harian (post Sprint 3) | PRI + Application Tracker + Document Kit + Opportunity |
| Institusi & Employer (post Sprint 4) | Intervention Center, Public Impact Dashboard, Employer Portal |
| Production Public (post Sprint 5) | Governance + Observability + 2FA + Backup |

## Definition of Done Per Sprint

Setiap sprint dianggap selesai jika:

1. Schema baru memiliki migration yang dapat di-deploy.
2. Server action terkait memiliki guard role + ownership.
3. UI minimal dapat diakses dari AppShell sesuai role.
4. Unit test untuk algoritma baru tersedia.
5. Dokumentasi terkait di `docs/` diperbarui.
6. Status fitur diperbarui di [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
7. Demo path tersedia di [DEMO_GUIDE.md](DEMO_GUIDE.md).

## Hubungan Dengan Dokumen Lain

- [PRODUCT_VISION.md](PRODUCT_VISION.md)
- [PATHWAY_READINESS.md](PATHWAY_READINESS.md)
- [MENTOR_CONTENT_STUDIO.md](MENTOR_CONTENT_STUDIO.md)
- [NONFUNCTIONAL_REQUIREMENTS.md](NONFUNCTIONAL_REQUIREMENTS.md)
- [ROLE_AND_PERMISSION_EXPANSION.md](ROLE_AND_PERMISSION_EXPANSION.md)
- [IMPACT_AND_KPI.md](IMPACT_AND_KPI.md)
