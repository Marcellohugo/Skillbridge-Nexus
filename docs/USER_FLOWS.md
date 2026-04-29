# Alur Pengguna

Dokumen ini menjelaskan alur utama SkillBridge Nexus dari perspektif pengguna. Saya memakai alur ini sebagai pegangan untuk demo, QA, dan pengembangan fitur lanjutan.

## 1. Learner Baru

1. Membuka landing page.
2. Masuk ke `/register`.
3. Memilih role Learner.
4. Sistem membuat `User` dan `LearnerProfile`.
5. Learner diarahkan ke onboarding.
6. Learner mengisi pendidikan, target karir, preferensi belajar, mentoring style, bahasa, dan aksesibilitas.
7. Data onboarding disimpan ke `LearnerProfile` dan `AccessibilityProfile`.
8. Learner diarahkan ke assessment.

## 2. Assessment -> TRI

1. Learner membuka `/assessment`.
2. Learner memilih diagnostic assessment.
3. Setiap jawaban disertai confidence rating.
4. Hasil dikirim ke server action.
5. Sistem menulis `AssessmentSession`, `SkillScoreSnapshot`, `ConfidenceRating`, dan `SkillGapSnapshot`.
6. `recalcTRIForLearner()` menghitung ulang TRI.
7. Sistem menulis `TRIHistory`, `ActivityLog`, dan notification.
8. Dashboard learner membaca readiness terbaru.

## 3. Learning Path

1. Learner membuka `/learning-path`.
2. Sistem membaca target role, skill snapshot, gap, dependency skill, dan module mapping.
3. Learner dapat generate path.
4. Sistem menyusun module prioritas dari gap kritikal dan prerequisite.
5. Learner menandai module selesai.
6. Sistem menambah snapshot skill, menghitung ulang progress, dan menjalankan recalc TRI.

## 4. Mentoring

1. Learner membuka `/mentors`.
2. Sistem menampilkan kandidat mentor berdasarkan gap, role, style, bahasa, dan availability.
3. Learner request sesi.
4. Mentor menerima notification dan melihat sesi di `/mentor/sessions`.
5. Mentor accept, reject, atau reschedule.
6. Setelah sesi selesai, mentor menambahkan action items dan notes.
7. Sistem menghitung kontribusi mentoring ke TRI.
8. Learner dapat melihat brief sesi dan action item di fitur terkait.

## 5. Portfolio Evidence

1. Learner membuka `/portfolio`.
2. Learner membuat project dengan deskripsi, link, tanggal selesai, dan skill terkait.
3. Sistem menghitung evidence strength.
4. Mentor dapat memvalidasi project dan memberi strength per skill.
5. Portfolio yang tervalidasi memengaruhi komponen portfolio pada TRI.

## 6. Admin

1. Admin login dan diarahkan ke `/admin/dashboard`.
2. Admin melihat ringkasan platform.
3. Admin membuka `/admin/users` untuk mengaktifkan atau menonaktifkan user.
4. Admin membuka `/admin/skills` untuk membaca taxonomy dan relasi skill.
5. Admin membuka `/admin/analytics` untuk membaca metrik platform.

## 7. Institution Manager

1. Institution manager login dan diarahkan ke `/institution/dashboard`.
2. Manager melihat ringkasan learner, cohort, career-ready, dan risk.
3. Manager membuka `/institution/cohorts` untuk membandingkan cohort.
4. Manager membuka `/institution/members` untuk membaca learner dalam institusi.
5. Manager membuka `/institution/analytics` untuk melihat TRI trend, blind spot kurikulum, dan intervention queue.

## 8. Bahasa & Aksesibilitas

1. Pengguna membuka settings di shell.
2. Pengguna memilih bahasa Indonesia atau English.
3. LanguageProvider menyimpan pilihan ke cookie dan localStorage.
4. `<html lang>` diperbarui.
5. Formatter tanggal, angka, currency, dan relative time mengikuti locale aktif.
6. Pengguna dapat membuka panel aksesibilitas untuk font scale, reduced motion, high contrast, dyslexia mode, dan focus mode.
