# Mentor Content Studio & Reward Engine

Dokumen ini menjelaskan rancangan Mentor Content Studio, Mentor Reward Engine, dan Content Quality Review System. Status keseluruhan: **Recommended** — belum ada di kode.

## Tujuan

1. Memberi mentor cara berkontribusi materi terstruktur, bukan hanya sesi 1-1.
2. Memberi calon mentor jalur menjadi mentor terverifikasi melalui kontribusi.
3. Memberi reward berbasis kualitas dan dampak, bukan jumlah konten.
4. Memastikan kualitas materi melalui review dan rubrik.
5. Memberi institusi cara mengakui kontribusi mentor secara formal.

## Konsep Inti

| Konsep | Penjelasan |
|---|---|
| Contributor Candidate | Calon mentor yang membangun kredibilitas via materi |
| Verified Mentor | Mentor terverifikasi dengan trust score memadai |
| Content | Materi yang dipublikasikan: artikel, video, quiz, project, podcast, template, studi kasus, workshop |
| Content Review | Proses validasi kualitas dan plagiarisme |
| Reward Ledger | Catatan kontribusi yang dapat ditukar reward |
| Mentor Contribution Score | Skor agregat kontribusi mentor |
| Institution Recognition | Pengakuan formal dari institusi terhadap mentor |

## Calon Mentor Sebagai Contributor Candidate

Mentor baru tidak otomatis terverifikasi. Mereka melewati jalur kontribusi:

1. **Contributor Onboarding** — pendaftaran sebagai contributor candidate.
2. **Submit Sample Material** — minimal 1 materi awal.
3. **Expertise Proof** — link portfolio, sertifikat, pengalaman.
4. **Trial Content Review** — review oleh verified mentor lain atau admin.
5. **Contributor Score** — akumulasi dari kualitas materi awal.
6. **Path to Verified Mentor** — setelah ambang batas tercapai, role mentor diaktifkan.

> Konsekuensi schema: tambahkan `MentorProfile.contributorStatus` (`candidate`, `verified`, `suspended`) dan `MentorProfile.contributorScore`.

## Mentor Content Studio

UI dan service untuk mentor membuat materi.

### Content Type

| Tipe | Catatan |
|---|---|
| Artikel | Markdown atau editor block |
| Video | Tautan + transcript wajib |
| Quiz | Bank soal terkait skill/pathway |
| Workshop | Sesi terstruktur dengan agenda |
| Project | Brief + rubrik + sample submission |
| Podcast | Tautan + transcript |
| Template | CV, motivation letter, project brief |
| Studi Kasus | Studi kasus industri/kasus learner |

### Field Wajib Saat Submit

- Title, summary, body/source link.
- Mapping ke skill/pathway (Readiness Taxonomy).
- Difficulty level (1–5).
- Estimated duration (menit).
- Learning outcomes (bullet).
- Prerequisite (skill/level lain).
- Accessibility checklist (caption, transcript, alt-text, plain language).
- Plagiarism declaration.

### Lifecycle

```text
draft -> submitted -> in_review -> revision_requested -> approved -> published -> archived/takedown
```

Versioning: setiap publish menyimpan revisi (`ContentVersion`). Learner feedback terhubung ke versi spesifik.

## Content Quality Review System

| Komponen | Penjelasan |
|---|---|
| Reviewer Assignment | Auto-assign berdasarkan domain skill |
| Quality Rubric | Akurasi, kedalaman, struktur, aksesibilitas, kebaruan |
| Revision Request | Reviewer dapat meminta revisi dengan catatan |
| Content Status | Sinkron dengan lifecycle |
| Plagiarism Declaration | Wajib + catatan sumber |
| Content Takedown | Mekanisme report + admin takedown |
| Review History | Audit setiap review yang dilakukan |

## Reward Engine

Reward diberikan berdasarkan dampak nyata, bukan jumlah konten.

### Mentor Contribution Score

```text
contributionScore =
  contentQuality      * 0.25 +
  learnerCompletion   * 0.20 +
  learnerRating       * 0.15 +
  readinessImpact     * 0.20 +
  accessibilityQuality* 0.10 +
  updateConsistency   * 0.10
```

| Komponen | Definisi |
|---|---|
| contentQuality | Skor reviewer berdasarkan rubric |
| learnerCompletion | % learner yang menyelesaikan materi |
| learnerRating | Rata-rata rating learner |
| readinessImpact | Delta TRI/PRI terhubung ke konsumsi materi |
| accessibilityQuality | Caption, transcript, alt-text, plain language |
| updateConsistency | Frekuensi update materi terhadap kurikulum |

### Bentuk Reward

| Reward | Catatan |
|---|---|
| Contribution Points | Saldo poin yang dapat dikonversi |
| Contributor Badge | Tier (bronze/silver/gold/platinum) |
| Verified Contributor Status | Membuka akses fitur lanjutan |
| Priority Matching | Prioritas muncul di mentor marketplace |
| Certificate of Contribution | Sertifikat formal dengan QR verifikasi |
| Institution Recognition | Pengakuan dari institusi mitra |
| Optional Revenue Share / Honorarium | Hanya pada versi monetisasi |

## Anti-Gaming & Moderasi

1. Plagiarism declaration + spot-check kualitas konten.
2. Validasi konsumsi nyata (tidak hanya open) sebelum menghitung learner completion.
3. Throttling jumlah submission per minggu.
4. Reviewer rotation untuk menghindari kolusi.
5. Reward ledger transparan untuk audit.
6. Takedown otomatis jika rating rendah konsisten + report meningkat.
7. Larangan referral berbayar atau "tukar review".

## Institution Recognition

| Mode | Penjelasan |
|---|---|
| Endorsement | Institusi memberi endorsement publik |
| Mentor Pool | Mentor dimasukkan ke pool resmi institusi |
| Honorarium | Pembayaran sesuai kebijakan institusi |
| Curriculum Adoption | Materi mentor dipakai sebagai bahan ajar |
| Public Profile | Profil mentor tampil di halaman institusi |

## Skema Data (usulan)

| Model baru | Field utama |
|---|---|
| `Content` | `id`, `mentorId`, `type`, `title`, `bodyOrLink`, `difficulty`, `durationMin`, `outcomes[]`, `prereq[]`, `status`, `currentVersionId`, `createdAt`, `updatedAt` |
| `ContentVersion` | `id`, `contentId`, `version`, `body`, `accessibility`, `publishedAt` |
| `ContentSkillMapping` | `contentId`, `skillId` (atau `readinessCategoryId`), `weight` |
| `ContentReview` | `id`, `contentId`, `reviewerId`, `rubricScores`, `status`, `notes`, `createdAt` |
| `ContentConsumption` | `id`, `learnerId`, `contentId`, `progress`, `completedAt`, `rating` |
| `RewardLedger` | `id`, `mentorId`, `event`, `points`, `evidenceRef`, `createdAt` |
| `MentorBadgeTier` | `mentorId`, `tier`, `awardedAt` |

## Tahap MVP

### MVP Tahap 1 — Foundation

- Model `Content`, `ContentSkillMapping`, `ContentReview`, `ContentConsumption`.
- UI submit materi tipe artikel + quiz.
- Rubric review sederhana.
- Mentor contributor candidate flow.
- Listing materi di learner side.

### MVP Tahap 2 — Reward & Quality

- Reward ledger + contribution score.
- Reviewer rotation + rubric lengkap.
- Versioning + revision request.
- Tipe materi tambahan: video, project, template.
- Accessibility checklist wajib.

### MVP Tahap 3 — Ecosystem

- Institution recognition + mentor pool resmi.
- Certificate of Contribution + QR verifikasi.
- Priority matching di marketplace.
- Optional revenue share / honorarium.
- Takedown system + report flow lengkap.

## KPI Mentor Content Studio

| KPI | Target Indikatif |
|---|---|
| Active contributors per bulan | ≥ 50 |
| Content approval rate | 60–80% |
| Average rubric score | ≥ 4 / 5 |
| Average learner rating | ≥ 4.2 / 5 |
| Readiness impact per content | Delta TRI/PRI ≥ 1 untuk konsumen rutin |
| Time-to-review | < 7 hari |
| Verified mentor conversion | ≥ 40% dari contributor candidate |

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Spam materi berkualitas rendah | Throttling, rubric review, takedown otomatis |
| Plagiarisme | Deklarasi + cek manual + report |
| Bias reviewer | Rotation + audit |
| Manipulasi rating | Validasi konsumsi nyata + cooldown |
| Konflik IP | Lisensi konten jelas + perjanjian kontributor |
| Beban moderasi | Mulai dengan whitelist mentor verified, perlahan dibuka |

## Hubungan Dengan Dokumen Lain

- [PRODUCT_VISION.md](PRODUCT_VISION.md) — repositioning produk.
- [FEATURES.md](FEATURES.md) — status mentor existing.
- [ROADMAP.md](ROADMAP.md) — Sprint 2 menargetkan studio + reward.
- [ROLE_AND_PERMISSION_EXPANSION.md](ROLE_AND_PERMISSION_EXPANSION.md) — perubahan permission mentor.
- [NONFUNCTIONAL_REQUIREMENTS.md](NONFUNCTIONAL_REQUIREMENTS.md) — moderasi, audit, governance.
