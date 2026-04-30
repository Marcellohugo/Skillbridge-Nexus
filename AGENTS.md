<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SkillBridge Nexus Project Notes

This project uses Next.js 16.2.3 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, Prisma, tRPC, and Server Actions. Before changing framework code, read the matching local docs under `node_modules/next/dist/docs/`; for common work start with:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/03-layouts-and-pages.md`
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/01-getting-started/07-mutating-data.md`
- `01-app/01-getting-started/08-caching.md`
- `01-app/01-getting-started/15-route-handlers.md`
- `01-app/02-guides/authentication.md`
- `01-app/02-guides/ai-agents.md`

## Project Conventions

- App routes live in `src/app`. Learner routes use the `(learner)` route group for clean URLs; admin, mentor, and institution routes keep explicit URL prefixes.
- Pages and layouts are Server Components by default. Add `"use client"` only to interactive leaves that need state, effects, event handlers, or browser APIs.
- In App Router code, `params`, `searchParams`, `cookies()`, and `headers()` are async. Await them as shown in the bundled Next docs.
- Put mutations and protected queries in `"use server"` action files under `src/features/**`. Re-check auth and role access inside every Server Action and Route Handler; UI guards and layouts are not sufficient.
- Keep Prisma, secrets, JWT/session logic, email, rate limiting, and audit logging on the server. Do not import those modules into Client Components.
- `cacheComponents` is not enabled in `next.config.ts`. Do not migrate to `use cache`/`cacheLife` unless enabling that option intentionally and following the local migration guide.
- Use Web `Request`/`Response` APIs for Route Handlers. The tRPC endpoint is `src/app/api/trpc/[trpc]/route.ts`.

## Verification

Use the project scripts before claiming a framework-level change is done:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:ui` for browser-facing UI changes

On Windows, stop any running `next dev` process before `npm run build` if `.next` files are locked.
