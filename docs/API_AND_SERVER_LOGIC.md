# API & Logika Server

SkillBridge Nexus memakai Server Actions sebagai jalur utama query dan mutation. tRPC tetap tersedia sebagai scaffold, tetapi alur produk utama saya bangun melalui action yang dekat dengan UI dan tetap dijaga role/ownership.

## Prinsip Server Logic

- Setiap action membaca session melalui `getSession()`.
- Action yang role-specific wajib mengecek `session.role`.
- Action yang membaca/mengubah data user wajib mengecek ownership.
- Mutasi penting memanggil `revalidatePath()` untuk menyegarkan UI terkait.
- Error dikembalikan sebagai object `{ ok: false, error }` agar client dapat menampilkan callout.

## Auth Actions

File: `src/features/auth/auth.actions.ts`

| Action | Fungsi |
|---|---|
| `loginAction` | Validasi credential, set cookie, redirect role |
| `registerAction` | Buat user, profile awal, token verification, redirect |
| `logoutAction` | Hapus cookie dan redirect login |
| `forgotPasswordAction` | Buat token reset dan kirim email |
| `resetPasswordAction` | Validasi token reset dan ganti password |

## Account Recovery Service

File: `src/features/auth/account-recovery.service.ts`

- Membuat email verification token.
- Membuat password reset token.
- Menyimpan token sebagai hash.
- Mengecek token aktif dan expiry.
- Menandai token sebagai used setelah dipakai.

## Learner Actions

| File | Fungsi |
|---|---|
| `assessment.actions.ts` | Persist hasil assessment dan trigger TRI |
| `learning-path.actions.ts` | Generate path, read active path, toggle complete |
| `mentor.actions.ts` | List matched mentors, request session, rating |
| `portfolio.actions.ts` | CRUD portfolio, list skills, validate portfolio |
| `profile.actions.ts` | Update learner profile |
| `weekly-plan.actions.ts` | Susun weekly study plan |
| `session-prep.actions.ts` | Buat brief sesi mentoring |
| `compass/ladder/opportunity/...` | Career dan skill intelligence |

## Mentor Actions

File: `src/features/mentor/session.actions.ts`

- `listIncomingSessionsAction`
- `listMentorLearnersAction`
- `acceptSessionAction`
- `rejectSessionAction`
- `completeSessionAction`
- `rescheduleSessionAction`

Setiap perubahan sesi dapat menulis notification, activity log, dan memicu recalculation TRI learner.

## Admin Actions

File: `src/features/admin/platform.actions.ts`

- List user.
- Aktif/nonaktifkan user.
- Skill taxonomy overview.
- Platform metrics.

## Institution Actions

File: `src/features/institution/analytics.actions.ts`

- Institution analytics.
- Cohort summary.
- Member list.
- Curriculum blind spot.
- Intervention queue.

## Shared Recalculation Pipeline

File: `src/features/shared/recalc.ts`

`recalcTRIForLearner(learnerId)` menghitung ulang readiness dari data live:

- Assessment score.
- Role fit score.
- Learning progress.
- Mentoring contribution.
- Portfolio score.
- Consistency score.

Pipeline ini juga menulis `TRIHistory`, memperbarui `LearnerProfile`, membuat intervention untuk risiko tinggi, dan mengecek badge.

## Email

File: `src/lib/email.ts`

- Provider default: console.
- Provider produksi: Resend jika env tersedia.
- Email saat ini dipakai untuk password reset dan email verification.

## Rate Limit

File: `src/lib/rate-limit.ts`

- In-memory fixed window untuk local/dev.
- Upstash REST adapter untuk environment production.
- Dipakai pada flow auth sensitif agar request berulang bisa dibatasi.

## tRPC

Folder `src/server/api` tetap ada untuk ekspansi API typed. Saat ini jalur utama aplikasi adalah Server Actions, sehingga tRPC tidak menjadi dependency utama flow produk.
