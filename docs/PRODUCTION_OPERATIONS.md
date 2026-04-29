# Operasi Produksi

Dokumen ini adalah checklist operasional untuk menjalankan SkillBridge Nexus di environment production atau production-like. Fokusnya adalah env, migration, security, backup, observability, dan proses release manual.

## Build

```bash
npm run build
```

Next.js dikonfigurasi untuk standalone output sehingga cocok untuk Docker runtime yang lebih kecil.

## Docker

```bash
docker compose up --build -d
```

Service utama:

- `app`: Next.js standalone server.
- `db`: PostgreSQL.

## Environment Wajib

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secret minimal 32 karakter |
| `APP_URL` | Base URL aplikasi |
| `NODE_ENV` | `production` untuk deployment |
| `POSTGRES_PASSWORD` | Password database jika memakai compose |

## Environment Opsional

| Variable | Keterangan |
|---|---|
| `EMAIL_PROVIDER` | `console` atau `resend` |
| `RESEND_API_KEY` | Diperlukan jika email provider Resend |
| `EMAIL_FROM` | Sender email |
| `UPSTASH_REDIS_REST_URL` | Rate limit distributed |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash |
| `MIGRATE_ON_STARTUP` | Set `false` jika migration ingin dijalankan manual |

## Migration

Migration aman untuk production:

```bash
npm run db:migrate:deploy
```

Jika memakai Docker, entrypoint dapat menjalankan migration saat startup. Untuk deployment yang lebih ketat, saya sarankan migration dijalankan sebagai step terpisah sebelum app baru dinaikkan.

## Security Checklist

- Gunakan `JWT_SECRET` kuat dan berbeda per environment.
- Jangan commit `.env`.
- Gunakan HTTPS di depan app.
- Pastikan cookie secure aktif di production.
- Rotasi credential database jika terjadi exposure.
- Aktifkan email provider nyata untuk reset password.
- Gunakan distributed rate limit untuk traffic production.
- Pastikan backup database berjalan terjadwal.

## Backup

Minimal backup PostgreSQL:

```bash
pg_dump "$DATABASE_URL" > backup.sql
```

Praktik yang saya sarankan:

- Backup harian.
- Retensi minimal 7-30 hari.
- Simpan backup di storage terpisah.
- Uji restore secara berkala.

## Observability

Saat ini observability dasar ada melalui log aplikasi dan `SecurityEvent`. Untuk production yang lebih serius, tambahkan:

- Structured logging.
- Error tracking.
- Metrics endpoint.
- Uptime monitor.
- Alert untuk error rate, latency, dan DB connection.

## Release Manual

1. Pull branch release.
2. Install dependency.
3. Jalankan test, lint, typecheck, build.
4. Jalankan migration deploy.
5. Build image.
6. Start container.
7. Smoke test login dan dashboard.
8. Cek log app dan database.

## Rollback

Rollback aman membutuhkan:

- Image versi sebelumnya.
- Backup database terbaru.
- Migration plan yang reversible atau restore strategy.
- Catatan perubahan env.

Saya tidak mengaktifkan CI/CD pada tahap ini karena permintaan terakhir mengecualikan CI/CD.
