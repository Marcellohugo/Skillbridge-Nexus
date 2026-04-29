# Pathway Readiness

Dokumen ini menjelaskan konsep Pathway Readiness yang menjadi inti repositioning SkillBridge Nexus. Status semua bagian di sini adalah **Recommended** — yaitu rancangan ekspansi produk yang belum ada di kode kecuali disebut sebaliknya secara eksplisit.

## Definisi Pathway

Pathway adalah **jalur transisi** yang sedang dijalani user, bukan sekadar role karier. Pathway memiliki:

- **Titik awal** (status saat ini, misal kelas 12 SMK).
- **Titik tujuan** (Pathway Target).
- **Window waktu** (deadline, semester, batch beasiswa).
- **Persyaratan** (akademik, skill, evidence, dokumen, sertifikasi).
- **Hambatan kontekstual** (waktu, finansial, akses).

Berbeda dari Career Role yang fokus ke posisi pekerjaan, Pathway dapat berupa transisi pendidikan, sertifikasi, magang, beasiswa, kerja, wirausaha, atau pindah karier.

## Segmen User dan Pathway Utama

| Segmen | Pathway Target Utama | Window |
|---|---|---|
| Siswa SMA | Masuk kuliah, beasiswa, sertifikasi awal | 6–18 bulan |
| Siswa SMK | Kerja entry-level, PKL, sertifikasi vokasi | 3–12 bulan |
| Mahasiswa awal | Adaptasi kampus, magang awal | 6–24 bulan |
| Mahasiswa akhir | Magang, kerja entry-level, lanjut studi | 3–12 bulan |
| Fresh graduate | Kerja, sertifikasi, pivot pertama | 0–6 bulan |
| Lulusan SMA non-kuliah | Kerja, sertifikasi, wirausaha mikro | 0–12 bulan |
| Career switcher | Pindah role/industri | 6–18 bulan |
| Pekerja awal | Naik jenjang berikutnya | 6–24 bulan |

## Pathway Target

| Pathway Target | Deskripsi | Output Sukses |
|---|---|---|
| Masuk kuliah | Lolos seleksi kampus/jurusan tujuan | Pengumuman lolos |
| Siap SNBT / seleksi kampus | Skor SNBT atau jalur prestasi memadai | Skor lulus passing grade |
| Siap beasiswa | Kandidat beasiswa siap berkas, esai, wawancara | Lolos seleksi beasiswa |
| Siap PKL | Penempatan PKL sesuai bidang | Surat penerimaan PKL |
| Siap magang | Diterima magang di perusahaan target | Surat magang |
| Siap kerja entry-level | Diterima kerja sesuai jurusan/role | Offer letter |
| Siap sertifikasi | Lulus sertifikasi profesional | Sertifikat aktif |
| Siap wirausaha | Punya validasi ide + first paying customer | Penjualan pertama |
| Siap pindah karier | Lolos role baru di industri tujuan | Offer letter di role baru |

## Pathway Readiness Index (PRI)

PRI adalah skor 0–100 yang merangkum kesiapan user terhadap pathway terpilih. PRI berdiri sejajar dengan TRI: TRI tetap dipakai untuk konteks karier, PRI dipakai untuk lintas pathway.

### Formula PRI (usulan)

```text
PRI =
  coreAbility        * 0.20 +
  pathwayFit         * 0.20 +
  preparationProgress* 0.15 +
  evidenceStrength   * 0.15 +
  supportEngagement  * 0.15 +
  consistency        * 0.15
```

| Komponen | Definisi |
|---|---|
| coreAbility | Skor literasi/numerasi/soft skill dasar relevan pathway |
| pathwayFit | Kesesuaian skill/persyaratan terhadap pathway target |
| preparationProgress | Progres action items (esai, dokumen, modul, latihan) |
| evidenceStrength | Kekuatan evidence terverifikasi |
| supportEngagement | Keterlibatan dengan mentor/BK/dosen/alumni/komunitas |
| consistency | Stabilitas aktivitas mingguan |

> Status: **Recommended**. Belum diimplementasikan di kode. TRI saat ini tetap menjadi skor aktif (`TRIHistory`).

### Milestone PRI (usulan)

| Rentang | Milestone |
|---|---|
| 0–34 | Exploring |
| 35–49 | Preparing |
| 50–69 | Strengthening |
| 70–84 | Pathway Ready |
| 85–100 | Pathway Champion |

## Readiness Taxonomy

Memperluas Skill Taxonomy menjadi Readiness Taxonomy lintas dimensi:

| Kategori | Contoh Sub-Readiness |
|---|---|
| Academic Readiness | Literasi bacaan, numerasi, riset dasar, academic writing |
| Digital Readiness | Spreadsheet, email profesional, keamanan digital, penggunaan AI dasar |
| Career Readiness | CV, interview, etika kerja, problem solving, komunikasi |
| Vocational Readiness | Kasir, admin, barista, teknisi dasar, desain, akuntansi dasar |
| Higher Education Readiness | Pilihan jurusan, beasiswa, manajemen waktu kuliah, adaptasi kampus |
| Entrepreneurship Readiness | Validasi ide, harga jual, pencatatan uang, pemasaran sederhana |
| Life Readiness | Literasi finansial, manajemen waktu, regulasi kerja, kesehatan mental dasar |

> Status: **Recommended**. Saat ini schema memakai `SkillCategory` + `Skill` yang masih berorientasi karier. Penambahan `ReadinessCategory` atau perluasan field di `SkillCategory` akan menjadi prasyarat.

## Evidence Bank

Memperluas `PortfolioProject` menjadi evidence universal lintas tipe.

| Tipe Evidence | Contoh |
|---|---|
| Akademik | Rapor, transkrip, sertifikat asesmen sekolah |
| Sertifikasi | Sertifikat profesional, sertifikat kursus |
| Project | Project pribadi, capstone, hackathon |
| PKL/Magang | Surat keterangan, laporan, supervisor feedback |
| Lomba | Sertifikat lomba, dokumentasi |
| Organisasi | Kepanitiaan, OSIS, BEM, komunitas |
| Kerja informal | Pengalaman freelance, pekerjaan keluarga, paruh waktu |
| Surat rekomendasi | Guru, dosen, mentor, atasan |
| Media | Video praktik, hasil karya |
| Tulisan | Esai, blog, riset mini |
| Dokumen lamaran | CV, motivation letter, cover letter |
| Link publik | Profil GitHub/Behance/LinkedIn/Dribbble |

Field tambahan yang disarankan untuk tiap evidence:

- `evidenceType`
- `verifierRole` (mentor, guru, dosen, employer, komunitas)
- `verificationStatus` (unverified, pending, verified, rejected)
- `expiryDate`
- `evidenceWeight` (kontribusi ke PRI)
- `qrBadgeId` (verifikasi publik tanpa membuka data sensitif)

## Support Network

Memperluas mentor matching menjadi **Support Network matching**. Setiap pathway membutuhkan kombinasi dukungan berbeda.

| Tipe Support | Untuk Pathway |
|---|---|
| Mentor industri | Magang, kerja, sertifikasi, pivot, naik jenjang |
| Guru BK | SMA → kuliah, SMA → sertifikasi, SMA → kerja |
| Dosen wali | Mahasiswa awal/akhir |
| Alumni | Lintas pathway |
| Orang tua / Wali | Semua pathway, ringkasan saja |
| Training Provider | Sertifikasi, kursus, modul |
| Scholarship Officer | Beasiswa |
| Employer / Recruiter | Magang, kerja entry-level, pivot |
| Komunitas | Peer circle, validasi |

## Use Case

### 1. SMA → Kuliah

1. Siswa kelas 12 memilih pathway "Masuk kuliah".
2. Sistem membaca rapor, minat, riwayat asesmen → menampilkan PRI awal.
3. Sistem merekomendasikan jurusan kandidat berbasis pathway fit.
4. Action items: latihan SNBT, dokumen lamaran, esai motivasi, opsi beasiswa.
5. Guru BK dapat memantau readiness dan memberi rekomendasi.
6. Siswa membangun Evidence Bank: rapor, sertifikat, lomba, organisasi.
7. Application Tracker mengelola jadwal seleksi.

### 2. SMK → Kerja

1. Siswa SMK kelas 12 memilih pathway "Siap kerja entry-level".
2. Sistem memetakan jurusan SMK ke role kerja yang relevan.
3. Vocational Readiness diukur: teknisi, admin, kasir, desain, dst.
4. Mentor dari industri / alumni terhubung.
5. Mock interview + CV generator + cover letter.
6. Employer Portal melihat profil dengan izin siswa.

### 3. Lulusan SMA → Sertifikasi/Kerja

1. Lulusan SMA non-kuliah memilih pathway "Sertifikasi awal" atau "Kerja entry-level".
2. Life Constraints Assessment membaca waktu, device, internet, finansial, lokasi.
3. Sistem merekomendasikan sertifikasi gratis/murah, kerja informal terstruktur.
4. Training Provider menawarkan modul yang cocok.
5. Scholarship Officer melihat eligibility untuk subsidi.

### 4. Mahasiswa → Magang

1. Mahasiswa semester 4–6 memilih pathway "Siap magang".
2. Sistem memetakan IPK, project, organisasi → PRI.
3. Sistem merekomendasikan posisi magang relevan + skill gap.
4. Dosen wali mendapat readiness mahasiswa per kelas.
5. Mentor + alumni mendukung interview prep.
6. Application Tracker mengelola lamaran.

### 5. Fresh Graduate → Kerja

1. Fresh graduate memilih pathway "Kerja entry-level".
2. Sistem membaca portfolio, IPK, evidence, sertifikasi.
3. Document Kit menyusun CV, cover letter, profil LinkedIn.
4. Employer Portal menampilkan kandidat berbasis evidence.
5. Setelah diterima, sistem mengikuti pathway "Naik jenjang" berikutnya.

### 6. Career Switcher

1. Pekerja yang ingin pivot memilih pathway "Pindah karier".
2. Sistem mengukur transferable skill dari role lama.
3. PRI menampilkan gap pathway baru.
4. Mentor industri dari domain target memberikan sesi.
5. Evidence Bank menerima project mini, sertifikasi, freelance.
6. Opportunity Matching Hub menampilkan posisi yang realistis.

## Hubungan Dengan TRI Saat Ini

| Aspek | TRI (saat ini) | PRI (recommended) |
|---|---|---|
| Cakupan | Career role | Pathway lintas jenjang |
| Komponen | Assessment, role fit, learning, mentoring, portfolio, consistency | Core ability, pathway fit, preparation progress, evidence, support, consistency |
| Storage | `TRIHistory` | Model baru `PRIHistory` (recommended) |
| Konsumen | Learner, mentor, institusi | + Guru, dosen, orang tua, employer, scholarship, training provider |

TRI tetap dipertahankan untuk konteks karier. PRI diperkenalkan saat ekspansi pathway selesai disusun.

## Prasyarat Implementasi

Sebelum PRI dan Pathway dapat diterapkan, schema dan fitur berikut perlu disiapkan:

1. Model `Pathway`, `PathwayTarget`, `PathwayLearnerEnrollment`.
2. Model `ReadinessCategory` atau perluasan `SkillCategory` dengan field kategori taxonomy.
3. Model `Evidence` (generik) yang menggantikan/memperluas `PortfolioProject`.
4. Model `SupportNetworkMember` untuk memperluas mentor matching.
5. Algoritma `recalcPRIForLearner()` yang sejajar dengan `recalcTRIForLearner()`.
6. UI Pathway Selector + Pathway Target Catalog.
7. Role baru (Teacher/BK, Lecturer, Parent, Employer, Training Provider, Scholarship Officer) — lihat [ROLE_AND_PERMISSION_EXPANSION.md](ROLE_AND_PERMISSION_EXPANSION.md).

Detail urutan dan prioritas ada di [ROADMAP.md](ROADMAP.md).
