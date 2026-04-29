# Algoritma & Scoring

Dokumen ini menjelaskan algoritma inti yang saya pakai untuk membuat SkillBridge Nexus terasa seperti platform intelligence, bukan sekadar dashboard statis.

## Talent Readiness Index

TRI adalah skor 0-100 yang merangkum kesiapan learner.

```text
TRI =
  assessmentScore * 0.20 +
  roleFitScore * 0.20 +
  learningProgress * 0.15 +
  mentoringContribution * 0.15 +
  portfolioStrength * 0.15 +
  consistencyScore * 0.15
```

## TRI Milestone

| Rentang | Milestone |
|---|---|
| 0-34 | Emerging |
| 35-49 | Developing |
| 50-69 | Progressing |
| 70-84 | Career Ready |
| 85-100 | Advanced Ready |

## Skill Gap

```text
gap = max(targetLevel - currentLevel, 0)
weightedGap = gap * importanceWeight
```

Gap diberi flag:

- Critical jika requirement role bersifat critical.
- Blocker jika gap besar pada skill foundational/prerequisite.
- Weighted agar skill penting lebih dominan dari skill pelengkap.

## Role Fit

```text
coverage = min(currentPct / targetPct, 1)
fitScore = sum(coverage * importanceWeight) / sum(importanceWeight) * 100
```

Role fit dipakai pada Career Compass, Market Value, Ladder, Opportunity Radar, dan TRI.

## Learning Path Generation

Urutan module disusun dari:

1. Rescue path untuk prerequisite yang lemah.
2. Gap critical lebih dulu.
3. Weighted gap tertinggi.
4. Mapping module ke skill yang paling relevan.
5. Fallback dari target role jika snapshot belum lengkap.

## Mentor Matching

Formula matching:

```text
matchScore =
  skillOverlap * 0.50 +
  roleOrIndustryMatch * 0.20 +
  mentoringStyleMatch * 0.15 +
  availabilityMatch * 0.10 +
  languageMatch * 0.05
```

Skill overlap dihitung dari gap learner, criticality, dan expertise level mentor. Hasil matching selalu membawa `matchReasons[]` agar pengguna memahami alasan rekomendasi.

## Evidence Strength Portfolio

Evidence strength berada pada skala 0-10. Faktor yang dihitung:

- Panjang dan kualitas deskripsi.
- Ada/tidaknya project URL.
- Jumlah skill yang dihubungkan.
- Status validasi mentor.
- Tanggal selesai.
- Rubric strength per skill dari mentor.

## Risk Detection

Risiko learner dibaca dari kombinasi:

- TRI rendah.
- Gap critical tinggi.
- Aktivitas rendah.
- Learning progress lambat.
- Confidence tidak selaras dengan performa.

Risk level digunakan untuk intervention record dan dashboard institusi.

## Skill Decay

Skill decay menggunakan pendekatan half-life:

```text
retention = 0.5 ^ (daysSincePractice / halfLife)
```

Skill dengan confidence dan score tinggi punya half-life lebih panjang. Fitur ini memberi ukuran apakah skill masih fresh atau perlu refresh.

## Calibration Index

Calibration membandingkan confidence dengan score aktual:

```text
expectedScore = confidence * 20
delta = actualScore - expectedScore
calibrationIndex = 100 - mean(abs(delta))
```

Hasilnya mengklasifikasikan skill sebagai underconfident, calibrated, atau overconfident.

## Learning Velocity

Velocity membaca `TRIHistory` mingguan:

- `velocity`: rata-rata delta TRI per minggu.
- `acceleration`: perubahan velocity periode terbaru dibanding periode sebelumnya.
- `consistency`: stabilitas progres.
- Projection: estimasi minggu menuju milestone berikutnya.

## Opportunity Radar

Opportunity Radar sengaja mengecualikan target role dan adjacent role. Tujuannya adalah mencari peluang karir yang tidak langsung terpikir.

```text
surpriseScore = roleFit - medianFitAcrossScannedRoles
```

Nilai positif berarti learner relatif lebih siap untuk role tersebut dibanding role lain di luar target utama.

## i18n Formatter

Formatter di `src/lib/i18n.ts` memastikan angka, tanggal, currency, dan relative time tidak lagi memakai locale hardcoded di komponen. Ini penting agar UI bisa bergerak dari Indonesia-only ke bilingual tanpa refactor besar.
