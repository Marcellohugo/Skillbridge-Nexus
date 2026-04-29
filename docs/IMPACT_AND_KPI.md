# Impact & KPI

Dokumen ini mendefinisikan KPI dan metrik dampak SkillBridge Nexus per stakeholder. KPI dipakai untuk lomba, pitch, pilot, dan iterasi produk.

## Prinsip Pengukuran

1. KPI fokus ke **outcome**, bukan vanity metric.
2. KPI dipisah per stakeholder: learner, mentor, institusi, sekolah/kampus, employer, platform.
3. Setiap KPI memiliki **definisi**, **sumber data**, dan **target indikatif**.
4. Data agregat untuk publik wajib **anonymized** (lihat NFR Privacy).
5. Score governance (TRI/PRI explainability) dijaga agar metrik tidak bias.

## KPI Learner

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Onboarding Completion | % learner menyelesaikan onboarding | `LearnerProfile.onboardingCompleted` | ≥ 80% |
| Diagnostic Completion | % learner menyelesaikan minimal 1 assessment | `AssessmentSession.status=completed` | ≥ 70% |
| TRI Improvement (30 hari) | Rata-rata delta TRI per learner aktif | `TRIHistory` | +5 poin |
| PRI Improvement (30 hari) | Rata-rata delta PRI per learner aktif | `PRIHistory` (recommended) | +5 poin |
| Career-Ready % | % learner dengan TRI ≥ 70 / milestone CAREER_READY+ | `LearnerProfile.triMilestone` | ≥ 25% |
| Pathway-Ready % | % learner dengan PRI ≥ 70 (recommended) | `PRIHistory` | ≥ 25% |
| Active Streak Median | Median streak hari aktif | `LearnerProfile.streakDays` | ≥ 5 hari |
| Validated Evidence per Learner | Rata-rata evidence tervalidasi | `PortfolioProject.isValidated` (saat ini) | ≥ 1 |
| Mentor Session per Learner Aktif | Rata-rata sesi selesai per learner | `MentoringSession.status=COMPLETED` | ≥ 1 / bulan |
| At-Risk Reduction | % learner CRITICAL/HIGH yang turun ke MEDIUM/LOW dalam 60 hari | `LearnerProfile.riskLevel` | ≥ 30% |

## KPI Mentor

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Session Completion Rate | % sesi PENDING/ACCEPTED yang selesai | `MentoringSession.status` | ≥ 75% |
| Average Mentee Rating | Rata-rata rating learner | `MentoringSession.menteeRating` | ≥ 4.2 / 5 |
| Action Item Follow-Through | % action items diselesaikan | Tracking action items (recommended) | ≥ 60% |
| Mentor Impact Score | Delta TRI/PRI learner setelah sesi | Recalc pipeline | ≥ +2 / sesi |
| Validated Evidence by Mentor | Jumlah evidence divalidasi | `PortfolioProject.validatedBy` | Tracking aktif |
| Content Submission per Mentor | Materi disubmit (Studio) | `Content` (recommended) | ≥ 1 / bulan |
| Content Approval Rate | % konten approved | `ContentReview.status` (recommended) | 60–80% |
| Mentor Contribution Score | Skor agregat (lihat Studio) | `RewardLedger` (recommended) | ≥ 70 / 100 |
| Mentor Capacity Utilization | % slot terisi | `MentorAvailability` + sesi | 50–80% |

## KPI Institusi

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Cohort TRI Trend | Trend TRI per cohort 90 hari | `TRIHistory` × `Cohort` | Naik konsisten |
| Cohort PRI Trend | Trend PRI per cohort 90 hari (recommended) | `PRIHistory` | Naik konsisten |
| Career-Ready % per Cohort | % CAREER_READY+ | `LearnerProfile.triMilestone` × `Cohort` | ≥ 25% |
| At-Risk per Cohort | % learner risk HIGH/CRITICAL | `LearnerProfile.riskLevel` × `Cohort` | ≤ 15% |
| Intervention Closure Rate | % intervensi resolved | `InterventionRecord.isResolved` | ≥ 70% |
| Intervention Effectiveness | Delta TRI/PRI sebelum-sesudah intervensi | `InterventionRecord` + history | +3 poin |
| Curriculum Coverage Score | % readiness category ter-cover oleh kurikulum (recommended) | Course-skill mapping | ≥ 80% |
| Curriculum Blind Spot Reduction | Jumlah blind spot 90 hari | Analytics | ↓ tiap kuartal |
| Mentor Pool Activity | % mentor pool aktif memberi sesi/materi | Aggregat mentor | ≥ 60% |

## KPI Sekolah / Kampus (level Teacher/BK & Lecturer)

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Class Readiness Index | Rata-rata PRI siswa per kelas (recommended) | `PRIHistory` × kelas | Naik per semester |
| Recommendation Acceptance | % rekomendasi BK/dosen ditindaklanjuti | Tracking notes (recommended) | ≥ 50% |
| Drop-out Risk Watchlist | Jumlah siswa risk HIGH ditangani | `InterventionRecord` | 100% triaged |
| Pathway Match Rate | % siswa SMA yang pathway-nya konsisten dengan rekomendasi BK | Pathway enrolment vs rekomendasi (recommended) | ≥ 70% |
| Beasiswa/PKL/Magang Placement | Jumlah penempatan sukses | Application Tracker (recommended) | ↑ tiap kuartal |

## KPI Employer / Recruiter

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Time-to-Shortlist | Waktu rata-rata shortlist kandidat | Talent Board (recommended) | ≤ 5 hari |
| Evidence Trust Rate | % shortlist yang evidence-nya tervalidasi | Talent Board | ≥ 80% |
| Interview Conversion | % shortlist berlanjut ke interview | Talent Board | ≥ 30% |
| Hire Conversion | % interview menjadi hire | Talent Board | ≥ 20% |
| Bias Indicator | Rasio shortlist lintas latar belakang | Talent Board (anonymized) | Dijaga seimbang |

## KPI Scholarship Officer

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Eligibility Match Rate | % kandidat memenuhi syarat | Scholarship module (recommended) | ≥ 70% |
| Scholarship Award Outcome | % kandidat lolos | Outcome tracking (recommended) | Naik per batch |
| Equity Spread | Distribusi kandidat lintas latar belakang | Equity dashboard (recommended) | Sesuai target program |

## KPI Training Provider

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Module Match Hit Rate | % modul ditawarkan yang diambil | Provider portal (recommended) | ≥ 30% |
| Module Completion Rate | % learner menyelesaikan modul | `ContentConsumption` (recommended) | ≥ 60% |
| Readiness Impact per Modul | Delta TRI/PRI per modul | Recalc + content link | ≥ +2 |

## KPI Platform (Operasional)

| KPI | Definisi | Sumber Data | Target Indikatif |
|---|---|---|---|
| Monthly Active Learners | Learner aktif minimal 1 sesi UI | `ActivityLog` | Naik bulanan |
| Retention 30/60/90 hari | % user kembali pada periode | `ActivityLog` | 30d ≥ 40%, 60d ≥ 30%, 90d ≥ 25% |
| Median Session Length | Lama sesi UI median | Telemetry (recommended) | 8–15 menit |
| Error Rate | % request gagal | Observability (recommended) | ≤ 1% |
| Uptime | % uptime app | Observability | ≥ 99.5% |
| p95 Latency Dashboard | Latency p95 dashboard | Observability | ≤ 1.5s |
| Security Event Anomaly | Jumlah event keamanan abnormal | `SecurityEvent` | Triaged ≤ 24 jam |
| Backup Success Rate | % backup harian sukses | Backup runbook (recommended) | 100% |
| Restore Drill Pass Rate | Hasil quarterly restore drill | Runbook (recommended) | 100% |

## KPI Dampak Untuk Lomba / Pitch

KPI berikut dirancang untuk diceritakan dalam konteks dampak sosial dan kesiapan industri.

| KPI Dampak | Definisi | Catatan |
|---|---|---|
| Average Readiness Improvement | Rata-rata kenaikan TRI/PRI per learner aktif | Headline impact |
| At-Risk Learner Reduction | % learner risk HIGH/CRITICAL yang turun risk-nya | Bukti intervensi bekerja |
| Validated Evidence Count | Jumlah evidence tervalidasi mentor/verifier | Bukti loop evidence aktif |
| Completed Mentoring Sessions | Total sesi mentoring tervalidasi | Skala mentor pool |
| Intervention Effectiveness | Delta sebelum-sesudah intervensi | Bukti queue intervensi efektif |
| Curriculum Blind Spot Reduction | Berapa blind spot turun per kuartal | Bukti kontribusi kurikulum |
| Pathway Placement Outcome | Jumlah penempatan sukses (kuliah, magang, kerja, beasiswa, sertifikasi) | Outcome akhir |
| Equity Reach | Sebaran user lintas wilayah / latar belakang | Indikator inklusivitas |
| Mentor Contribution Volume | Jumlah materi mentor yang dikonsumsi learner | Bukti ekosistem mentor aktif |

## Cara Menampilkan KPI

| Tempat | KPI |
|---|---|
| Learner dashboard | Personal: TRI/PRI, streak, validated evidence, completed sessions |
| Mentor dashboard | Mentee count, rating, completion, contribution score |
| Institution analytics | Cohort TRI/PRI, at-risk, intervention queue, blind spot |
| Public Impact Dashboard (recommended) | KPI dampak agregat anonymized |
| Pitch deck | KPI dampak + before/after pilot |

## Data Yang Sudah Dapat Dihitung Saat Ini

KPI berikut dapat dihitung tanpa schema tambahan:

- TRI Improvement, Career-Ready %, At-Risk Reduction.
- Session Completion Rate, Average Mentee Rating.
- Validated Evidence per Learner.
- Cohort TRI Trend, At-Risk per Cohort, Intervention Closure Rate.
- Monthly Active Learners (via `ActivityLog`).

KPI lain (PRI, Pathway-Ready %, Curriculum Coverage Score, Application/Placement, Content metrics, Talent Board, Equity Reach) **membutuhkan fitur Recommended** seperti Pathway Foundation, Application Tracker, Mentor Content Studio, Employer Portal, dan Public Impact Dashboard. Lihat [ROADMAP.md](ROADMAP.md).

## Hubungan Dengan Dokumen Lain

- [PRODUCT_VISION.md](PRODUCT_VISION.md) — outcome yang dicari.
- [PATHWAY_READINESS.md](PATHWAY_READINESS.md) — komponen PRI.
- [MENTOR_CONTENT_STUDIO.md](MENTOR_CONTENT_STUDIO.md) — KPI Studio.
- [ROADMAP.md](ROADMAP.md) — sprint yang membuka KPI baru.
- [NONFUNCTIONAL_REQUIREMENTS.md](NONFUNCTIONAL_REQUIREMENTS.md) — observability, anonymization.
