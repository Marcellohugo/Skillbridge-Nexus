# Role Pengguna & Permission

SkillBridge Nexus memakai empat role utama. Saya memisahkan route, layout guard, dan server action guard agar setiap role hanya dapat mengakses area yang relevan.

## Role

| Role | Enum | Area |
|---|---|---|
| Learner | `LEARNER` | `/dashboard`, `/assessment`, `/learning-path`, `/mentors`, dan route learner lain |
| Mentor | `MENTOR` | `/mentor/dashboard`, `/mentor/sessions`, `/mentor/learners`, `/mentor/profile` |
| Admin | `ADMIN` | `/admin/dashboard`, `/admin/users`, `/admin/skills`, `/admin/analytics`, `/admin/profile` |
| Institution Manager | `INSTITUTION_MANAGER` | `/institution/dashboard`, `/institution/cohorts`, `/institution/members`, `/institution/analytics`, `/institution/profile` |

## Permission Matrix

| Aktivitas | Learner | Mentor | Admin | Institution |
|---|---:|---:|---:|---:|
| Mengikuti assessment | Ya | Tidak | Tidak | Tidak |
| Membuat learning path | Ya | Tidak | Tidak | Tidak |
| Request sesi mentor | Ya | Tidak | Tidak | Tidak |
| Mengelola sesi mentoring | Terbatas | Ya | Tidak | Tidak |
| Membuat portfolio | Ya | Tidak | Tidak | Tidak |
| Validasi portfolio | Tidak | Ya | Tidak | Tidak |
| Mengelola user aktif/nonaktif | Tidak | Tidak | Ya | Tidak |
| Melihat platform metrics | Tidak | Tidak | Ya | Tidak |
| Melihat cohort analytics | Tidak | Tidak | Tidak | Ya |
| Mengakses accessibility preference | Ya | Ya | Ya | Ya |

## Proteksi Route

Proteksi dilakukan pada tiga lapis:

1. `src/proxy.ts` membaca cookie auth dan mencegah akses tanpa session.
2. Layout role memanggil `getSession()` dan melakukan role check server-side.
3. Server Actions tetap melakukan guard role sebelum membaca atau menulis data.

Contoh pola:

```ts
const session = await getSession();
if (!session || session.role !== "MENTOR") {
  return { ok: false, error: "Hanya mentor." };
}
```

## Cookie Session

- Cookie: `auth_token`
- Mode: httpOnly
- SameSite: Lax
- Secure: aktif pada production
- Expiry: 30 hari

## Catatan Keamanan

- Role check tidak boleh hanya mengandalkan UI.
- Setiap server action yang membaca data user harus mengecek ownership.
- Data sensitif seperti password reset token disimpan sebagai hash.
- Aktivitas keamanan penting dicatat melalui `SecurityEvent`.
