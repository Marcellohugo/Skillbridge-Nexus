# Role & Permission Expansion

Dokumen ini memperluas role saat ini menjadi multi-stakeholder Pathway Readiness Platform. Untuk role saat ini, lihat [USER_ROLES_AND_PERMISSIONS.md](USER_ROLES_AND_PERMISSIONS.md).

## Role Saat Ini (Implemented)

| Role | Enum | Cakupan |
|---|---|---|
| Learner | `LEARNER` | Diagnosa, learning, mentoring, portfolio, intelligence |
| Mentor | `MENTOR` | Sesi mentoring, learner progress, validasi portfolio |
| Admin | `ADMIN` | User, taxonomy, platform metrics |
| Institution Manager | `INSTITUTION_MANAGER` | Cohort, member, analytics institusi |

## Role Baru Yang Direkomendasikan

| Role baru | Enum (usulan) | Tujuan |
|---|---|---|
| Teacher / BK Counselor | `TEACHER_BK` | Memantau readiness siswa SMA/SMK, rekomendasi jurusan, intervensi awal |
| Parent / Guardian | `PARENT` | Ringkasan readiness anak + saran dukungan |
| Lecturer / Academic Advisor | `LECTURER` | Memantau readiness mahasiswa per kelas/mata kuliah/prodi |
| Employer / Recruiter | `EMPLOYER` | Talent directory berbasis evidence |
| Training Provider | `TRAINING_PROVIDER` | Menawarkan modul/sertifikasi yang cocok dengan gap |
| Scholarship Officer | `SCHOLARSHIP_OFFICER` | Mencari kandidat beasiswa berdasarkan readiness + kebutuhan |

> Status: **Recommended**. Belum ada di enum `Role` Prisma. Membutuhkan migration + UI baru per role.

## Matriks Permission Ringkas

Legenda: ✓ = boleh, ✗ = tidak boleh, △ = bersyarat (consent/scope), – = tidak relevan.

| Aktivitas | Learner | Mentor | Admin | Institution | Teacher/BK | Parent | Lecturer | Employer | Training Provider | Scholarship Officer |
|---|---|---|---|---|---|---|---|---|---|---|
| Mengikuti assessment | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Membuat learning path | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Request sesi mentor | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Mengelola sesi mentoring | △ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Membuat portfolio / evidence | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Validasi evidence learner | ✗ | ✓ | ✗ | ✗ | △ | ✗ | △ | ✗ | △ | ✗ |
| Buat materi (Content Studio) | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Review materi | ✗ | △ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Lihat readiness siswa per kelas | ✗ | ✗ | ✗ | △ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Lihat ringkasan anak | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Akses talent directory | ✗ | ✗ | △ | △ | ✗ | ✗ | ✗ | ✓ | ✗ | △ |
| Cari kandidat beasiswa | ✗ | ✗ | △ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Tawarkan modul/sertifikasi | ✗ | ✗ | △ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Aktivasi/nonaktivasi user | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Lihat platform metrics | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Lihat institution analytics | ✗ | ✗ | ✓ | ✓ | △ | ✗ | △ | ✗ | ✗ | ✗ |
| Akses panel aksesibilitas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Bersyarat (△) berarti membutuhkan kombinasi consent learner, scope institusi, atau policy admin.

## Data Visibility Rules

| Data | Default Visibility |
|---|---|
| Identitas learner (nama, email) | Hanya learner + admin |
| TRI/PRI agregat per cohort | Institusi + admin |
| TRI/PRI individu | Learner + mentor aktif (per consent) + Teacher/BK/Lecturer (per scope sekolah/kelas) |
| Evidence private | Learner |
| Evidence public-shared | Learner + employer (per consent) + scholarship officer (per consent) |
| Riwayat sesi mentoring | Learner + mentor terkait |
| Catatan BK | Learner + Teacher/BK + Parent (jika diizinkan) |
| Data Parent | Learner pemilik anak + Parent |
| Konten mentor | Public (setelah publish) |
| Reward ledger mentor | Mentor pemilik + admin |

## Consent Requirements

Setiap akses lintas role memerlukan consent eksplisit minimal pada:

1. **Employer melihat learner** — opt-in per learner.
2. **Scholarship Officer melihat learner** — opt-in per learner per program.
3. **Parent melihat anak** — verifikasi hubungan + persetujuan learner di atas usia tertentu.
4. **Teacher/BK melihat siswa** — terikat enrolment institusi/kelas.
5. **Lecturer melihat mahasiswa** — terikat enrolment kelas/mata kuliah.
6. **Training Provider mengirim penawaran** — opt-in subscribe per learner.
7. **Aggregat lintas tenant publik** — wajib anonymized.

Mekanisme consent dijelaskan di [NONFUNCTIONAL_REQUIREMENTS.md](NONFUNCTIONAL_REQUIREMENTS.md) bagian Privacy & Consent.

## Pemetaan Pathway → Role Pendukung

| Pathway | Role pendukung utama |
|---|---|
| SMA → Kuliah | Teacher/BK, Parent, Scholarship Officer, Mentor alumni |
| SMK → Kerja | Teacher/BK, Mentor industri, Employer, Training Provider |
| Mahasiswa → Magang | Lecturer, Mentor industri, Employer |
| Mahasiswa akhir → Kerja | Lecturer, Mentor industri, Employer |
| Lulusan SMA → Sertifikasi/Kerja | Mentor industri, Training Provider, Employer |
| Career Switcher | Mentor industri, Training Provider, Employer |
| Pekerja awal → Naik jenjang | Mentor industri, Training Provider |

## Konsekuensi Schema (usulan)

1. Perluasan enum `Role` dengan role baru.
2. Model `RoleScope` atau `RoleAssignment` agar Teacher/Lecturer/Parent terikat institusi/kelas/anak.
3. Model `Consent` untuk mengelola opt-in per learner per role/tujuan.
4. Model `EmployerProfile`, `TrainingProviderProfile`, `ScholarshipOfficerProfile`, `TeacherProfile`, `LecturerProfile`, `ParentProfile`.
5. Penyesuaian `route-guards.ts` + layout per role baru.
6. Penambahan AppShell dropdown role + landing page per role.

## Dampak ke UI/UX

| Role baru | Dashboard utama |
|---|---|
| Teacher/BK | Daftar siswa, readiness per kelas, queue intervensi, rekomendasi jurusan |
| Parent | Ringkasan anak, action item dukungan, tips bahasa sederhana |
| Lecturer | Class readiness, skill gap by course, queue review |
| Employer | Talent directory, shortlist, interview request |
| Training Provider | Catalog modul, gap heatmap, distribusi modul |
| Scholarship Officer | Kandidat beasiswa, equity dashboard, tracker outcome |

## Tahap Rilis

1. **Phase A** — Teacher/BK + Lecturer (paling dekat dengan institusi).
2. **Phase B** — Parent (membutuhkan UX bahasa sederhana).
3. **Phase C** — Employer + Scholarship Officer + Training Provider (memerlukan privacy/consent).

Detail urutan ada di [ROADMAP.md](ROADMAP.md).

## Hubungan Dengan Dokumen Lain

- [USER_ROLES_AND_PERMISSIONS.md](USER_ROLES_AND_PERMISSIONS.md) — role saat ini.
- [PATHWAY_READINESS.md](PATHWAY_READINESS.md) — pathway dan support network.
- [NONFUNCTIONAL_REQUIREMENTS.md](NONFUNCTIONAL_REQUIREMENTS.md) — privacy & consent.
- [MENTOR_CONTENT_STUDIO.md](MENTOR_CONTENT_STUDIO.md) — permission Studio + reviewer.
- [ROADMAP.md](ROADMAP.md) — penjadwalan rilis role baru.
