# Arsitektur

SkillBridge Nexus saya bangun dengan arsitektur Next.js App Router yang memisahkan UI, server action, business logic, dan data access. Tujuan arsitektur ini adalah membuat fitur cepat dikembangkan tanpa mengorbankan type safety dan keamanan role.

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 App Router |
| UI runtime | React 19 |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS v4 dan CSS token di `globals.css` |
| ORM | Prisma Client |
| Database | PostgreSQL |
| Auth | JWT cookie httpOnly, jose, bcryptjs |
| Mutation | Server Actions |
| API scaffold | tRPC |
| Test | Node test runner, tsx, Playwright |
| Deployment | Docker, Next standalone |

## Struktur Folder

```text
src/
  app/                 App Router pages, layouts, route groups
  components/          AppShell, provider, shared widgets, UI primitives
  features/            Server actions dan domain logic per fitur
  lib/                 Auth, DB, i18n, calculations, env, security, navigation
  server/api/          tRPC scaffold
  types/               Shared types
prisma/
  schema.prisma        Domain schema
  migrations/          Migration history
  seed.ts              Demo data
tests/
  unit/                Unit tests
  ui/                  Playwright UI smoke tests
```

## Route Organization

| Area | Folder | URL |
|---|---|---|
| Public | `src/app/(public)` | `/` |
| Auth | `src/app/(auth)` | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` |
| Learner | `src/app/(learner)` | `/dashboard`, `/assessment`, `/learning-path`, dan route learner lain |
| Mentor | `src/app/mentor` | `/mentor/*` |
| Admin | `src/app/admin` | `/admin/*` |
| Institution | `src/app/institution` | `/institution/*` |

Saya memakai route group parenthetical untuk learner agar URL utama tetap bersih. Role lain memakai prefix eksplisit agar struktur akses lebih jelas.

## Application Layers

1. Presentation: page, layout, AppShell, dan shared components.
2. Provider: theme, language, dan accessibility.
3. Server Actions: mutation dan query terproteksi role.
4. Business logic: scoring, matching, path generation, security helper.
5. Data access: Prisma singleton di `src/lib/db.ts`.

## Data Flow Umum

```text
Client component
  -> Server Action
    -> getSession + role/ownership guard
      -> Prisma query/mutation
        -> business helper
          -> revalidatePath / redirect / result
```

## Auth Flow

1. Login/register memvalidasi input.
2. Password dicek atau di-hash dengan bcryptjs.
3. JWT dibuat dengan `jose`.
4. Cookie `auth_token` diset httpOnly.
5. `src/proxy.ts` dan layout role menjaga akses route.
6. Server action tetap melakukan guard ulang.

## i18n/l10n Flow

1. `src/lib/i18n.ts` menyimpan locale constants, dictionary typed, fallback, dan formatter.
2. Root layout membaca cookie `sbn.lang` untuk initial `<html lang>`.
3. `LanguageProvider` membaca cookie/localStorage, menyetel lang, dan menyinkronkan cookie.
4. Komponen memakai `useLang().t()` dan `useLang().format`.

## Keputusan Teknis

- Server Actions dipilih sebagai jalur utama karena lebih dekat dengan form React 19 dan mengurangi boilerplate API route.
- Prisma menjadi satu-satunya data access layer agar schema dan query tetap type-safe.
- UI primitives dikumpulkan di `src/components/ui/index.tsx` agar styling konsisten.
- AppShell dipakai semua role agar navigasi, theme, language, a11y, notification, dan page pins tidak tersebar.
- Feature logic dipisah per folder agar domain seperti learner, mentor, admin, dan institution tidak saling bercampur.

## Deployment Shape

Build production memakai `output: "standalone"` di Next config. Dockerfile melakukan multi-stage build, lalu Docker Compose menyediakan app dan PostgreSQL. Migration production dijalankan melalui `prisma migrate deploy`.
