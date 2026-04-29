# Aksesibilitas

Aksesibilitas saya perlakukan sebagai bagian inti produk, bukan tambahan kosmetik. SkillBridge Nexus menyediakan preferensi global agar pengguna dapat menyesuaikan pengalaman belajar sesuai kebutuhan visual, motorik, dan kognitif.

## Provider

File: `src/components/accessibility-provider.tsx`

Provider menyimpan preferensi, menulis data attribute ke document/body, dan mem-persist pilihan ke localStorage.

## Preferensi

| Preferensi | Dampak |
|---|---|
| Font scale | Mengubah skala teks aplikasi |
| Reduced motion | Mengurangi animasi dan transisi |
| High contrast | Meningkatkan keterbacaan dan border |
| Dyslexia mode | Spasi dan line-height lebih lega |
| Focus mode | Mengurangi distraksi dan menyederhanakan layout |
| Simplified reading | Membantu membaca konten panjang |
| Calm view | Menurunkan intensitas visual |
| Text-to-speech marker | Fondasi untuk integrasi Web Speech API |

## Akses Panel

Panel aksesibilitas dapat dibuka dari:

- AppShell settings.
- Mobile drawer.
- User menu.
- Onboarding dan profile preference.

## Keyboard Support

- Command palette mendukung shortcut `Ctrl/Cmd + K`.
- Dialog dapat ditutup dengan Escape.
- Tombol dan link memakai focus-visible.
- Assessment mendukung pemilihan opsi via keyboard.

## Semantic & ARIA

Saya memakai:

- `aria-label` pada trigger icon.
- `aria-expanded` untuk dropdown/drawer.
- `aria-haspopup` untuk menu.
- `role="dialog"` dan `aria-modal` untuk panel.
- `aria-current="page"` untuk nav aktif.
- Label form eksplisit melalui `Label`.

## i18n dan Screen Reader

Root layout membaca cookie locale dan menyetel `<html lang>`. LanguageProvider juga memperbarui lang saat user mengganti bahasa. Ini penting untuk screen reader, hyphenation, dan formatter browser.

## Reduced Motion

Reduced motion tidak hanya mengurangi animasi tertentu, tetapi menjadi guard CSS global. Tujuannya agar user yang sensitif terhadap gerakan tidak tetap terkena transisi besar dari drawer, hover, atau progress visual.

## Target Kualitas

Saya menargetkan pola WCAG 2.1 AA untuk:

- Kontras teks.
- Ukuran target klik.
- Navigasi keyboard.
- Label form.
- Focus indicator.
- Responsif tanpa horizontal overflow.

## Catatan Lanjutan

Area yang masih layak ditingkatkan:

- Audit screen reader per route.
- Web Speech API untuk text-to-speech nyata.
- Automated accessibility testing dengan axe.
- Validasi contrast pada semua kombinasi theme dan high contrast.
