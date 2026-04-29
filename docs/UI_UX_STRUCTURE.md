# Struktur UI/UX

Saya merancang UI SkillBridge Nexus sebagai dashboard produktif, bukan landing page dekoratif. Fokusnya adalah navigasi yang jelas, density informasi yang terukur, responsif di mobile, dan akses cepat ke fitur yang sering dipakai.

## Design Principles

- Informasi utama selalu terlihat lebih dulu.
- Navigasi tidak boleh membuat user kewalahan.
- Kartu dipakai untuk item atau panel yang memang perlu framing.
- Layout dashboard harus mudah discan.
- Animasi harus halus, tidak mengganggu, dan menghormati reduced motion.
- UI harus tetap stabil di mobile tanpa horizontal overflow.

## Design System

File utama:

- `src/app/globals.css`
- `src/components/ui/index.tsx`

Komponen utama:

- `Button`
- `Card`
- `CardHeader`
- `Badge`
- `Progress`
- `Input`
- `Label`
- `StatCard`
- `Callout`
- `Tabs`
- `RingMetric`

## AppShell

`src/components/app-shell.tsx` menjadi shell bersama untuk role authenticated.

Fitur shell:

- Header sticky.
- Primary navigation ringkas.
- Overflow menu terkelompok.
- Mobile drawer.
- Command palette.
- Notification bell.
- Page pins.
- Settings menu.
- Theme segment.
- Language segment.
- Panel aksesibilitas.

## Navbar Redesign

Navbar sebelumnya terlalu ramai karena terlalu banyak item sejajar. Saya merapikannya dengan pola:

1. Item prioritas tetap tampil di top bar.
2. Fitur lanjutan masuk ke grouped overflow.
3. Mobile memakai drawer penuh, bukan horizontal scrolling.
4. Settings dipisah dari navigasi utama.
5. Page Pins memberi akses cepat untuk halaman personal.

## Responsive Rules

- Container utama memakai `.container-app`.
- Layout grid turun menjadi satu kolom di mobile.
- Button dan kontrol form menjaga tinggi stabil.
- CardHeader dibuat responsif agar action tidak memaksa overflow.
- Mobile drawer memakai `max-w-sm` dan `overflow-y-auto`.
- Playwright UI audit memeriksa horizontal overflow pada route utama.

## Animation

Animasi dipakai untuk:

- Panel drawer.
- Hover state.
- Progress/skeleton.
- Small UI transitions.

Reduced motion menonaktifkan animasi dan transisi penting melalui CSS global.

## i18n/l10n UX

- Bahasa dapat diganti dari settings atau mobile drawer.
- Pilihan bahasa tersimpan di cookie dan localStorage.
- `<html lang>` diperbarui agar screen reader dan browser memahami locale.
- Formatter membuat tanggal, angka, currency, dan relative time mengikuti locale.

## UX Aksesibilitas

Panel aksesibilitas memberi kontrol:

- Font scale.
- Motion.
- Contrast.
- Dyslexia-friendly mode.
- Focus mode.

Preferensi diterapkan melalui data attribute di body/root sehingga semua komponen mengikuti setting tanpa perlu prop drilling.

## Area Yang Perlu Dijaga

- Jangan menambah semua fitur ke top navbar.
- Jangan membuat card di dalam card untuk layout utama.
- Jangan menambah animasi yang mengubah ukuran layout.
- Jangan memakai string UI baru tanpa masuk dictionary i18n jika label tersebut global atau sering muncul.
- Semua route penting perlu dicek ulang di mobile setelah perubahan UI.
