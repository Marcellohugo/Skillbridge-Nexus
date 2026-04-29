# Setup & Pengembangan Lokal

Dokumen ini menjelaskan cara menjalankan SkillBridge Nexus di lokal, baik langsung dengan Node maupun melalui Docker.

## Prasyarat

- Node.js 22 atau versi kompatibel dengan project.
- npm.
- PostgreSQL jika menjalankan tanpa Docker.
- Docker Desktop jika memakai Docker Compose.

## Environment

Salin file env:

```bash
cp .env.example .env
```

Minimal variabel yang perlu dicek:

```env
DATABASE_URL=
JWT_SECRET=
APP_URL=http://localhost:3000
EMAIL_PROVIDER=console
```

Untuk production, `JWT_SECRET` harus kuat dan minimal 32 karakter.

## Install

```bash
npm install
```

Postinstall akan menjalankan Prisma generate.

## Database

Jalankan migration:

```bash
npm run db:migrate
```

Seed demo data:

```bash
npm run db:seed
```

Jika hanya ingin sinkron schema saat development awal:

```bash
npm run db:push
```

## Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Docker Development

```bash
docker compose -f docker-compose.dev.yml up -d
```

Default:

- App: `http://localhost:3000`
- PostgreSQL dari host: `localhost:5433`

Stop:

```bash
docker compose -f docker-compose.dev.yml down
```

## Docker Production-like

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

Hapus volume database:

```bash
docker compose down -v
```

## Test & Quality Check

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:ui
```

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillbridge.id` | `password123` |
| Mentor | `mentor@skillbridge.id` | `password123` |
| Admin | `admin@skillbridge.id` | `password123` |
| Institution | `institution@skillbridge.id` | `password123` |

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Prisma client belum terbentuk | Jalankan `npm run db:generate` |
| Database tidak terhubung | Periksa `DATABASE_URL` dan service PostgreSQL |
| Port 3000 penuh | Matikan proses lama atau jalankan Next di port lain |
| Seed gagal | Pastikan migration sudah selesai dan env DB benar |
| UI test gagal karena server mati | Jalankan app terlebih dahulu sebelum `npm run test:ui` |
