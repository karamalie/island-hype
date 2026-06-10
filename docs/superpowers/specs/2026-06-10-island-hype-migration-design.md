# Island Hype — Vercel → DigitalOcean VPS Migration Design

**Date:** 2026-06-10
**Target server:** 68.183.39.8 (Ubuntu 24.04, DigitalOcean) — being resized to 1 GB RAM
**Source:** Vercel (app) + Supabase (Postgres DB + Storage images)
**Status:** Awaiting approval to implement

---

## Goal

Move the `island-hype` Next.js site off Vercel/Supabase and host it on the existing
VPS that already runs the "sandy" site — fully self-hosted DB and images, with a
build-off-server deploy pipeline. The existing sandy site must keep working untouched.

## Decisions (confirmed with user)

| Topic | Decision |
|---|---|
| Database | **Reuse the existing MySQL 8** — convert app from PostgreSQL → MySQL. No second DB daemon (RAM win). |
| Capacity | User resizing droplet **512 MB → 1 GB**. |
| Build | **Never build on the server.** Build in GitHub Actions cloud runner, ship artifacts. |
| Deploy | **GitHub Actions: cloud-build + rsync artifacts + pm2 reload**, for island-hype (and rework sandy to match). |
| Hostname | **islandhype.68-183-39-8.nip.io** with Let's Encrypt SSL (same pattern as sandy; swap to islandhype.com later). |
| Images | Download all Supabase Storage buckets, serve from nginx at the same `/storage/v1/object/public/<bucket>/...` path. |
| Email | Resend stays (external API, unchanged). |

## Current-state facts (verified)

- **App:** Next.js 16, Prisma 6, iron-session auth (Supabase NOT used for auth — only DB + Storage).
- **Images:** 6 buckets, 44 files, ~18 MB total. Disk is a non-issue.
- **DB:** Supabase Postgres, `public` schema, Prisma-managed. Small dataset.
- **Server:** nginx 1.24, MySQL 8 (sandy's DB, localhost), Node 20, pm2. Sandy = Express app on **port 3000**, served at `68-183-39-8.nip.io` (HTTPS via Let's Encrypt). MySQL on 3306. Free port for island-hype: **3001**.
- **Image URL handling is centralized** on `NEXT_PUBLIC_SUPABASE_URL` + `/storage/v1/object/public/<bucket>/<path>` (`lib/image-urls.ts`, `lib/storage.ts`). Pointing that env var at the new origin makes stored paths resolve transparently.

## MySQL conversion analysis

Schema (`prisma/schema.prisma`, 479 lines) is MySQL-compatible **except 3 scalar arrays**:

- `Accommodation.roomTypes  String[]`
- `Accommodation.amenities  String[]`
- `Package.highlights        String[]`

**Fix:** convert these columns to `Json` (MySQL JSON array of strings).
- Admin forms already serialize to delimited strings and server actions split them back
  (`lib/actions/accommodations.ts`, `lib/actions/packages.ts`) — write path passes a JS
  array into the `Json` column.
- Read sites cast to `string[]`: `app/accommodations/[slug]/page.tsx`,
  `app/accommodations/page.tsx`, `app/packages/[slug]/page.tsx`, and the two admin form
  initial-value reads. ~10 lines total.

Everything else (7 enums, `@db.Text`/`@db.VarChar(n)`/`@db.SmallInt`, cuid IDs, relations,
`@@index`, `@@unique`) works on MySQL unchanged. No indexed column is `@db.Text` (MySQL
prefix-index limitation not triggered). Plain `String` fields map to `VARCHAR(191)` on MySQL —
to verify no plain-String field stores >191 chars during data import.

## Architecture

```
                       ┌─────────────────────────── VPS 68.183.39.8 (1 GB) ───────────────────────────┐
  git push  ─► GitHub  │  nginx ──┬─ 68-183-39-8.nip.io           → 127.0.0.1:3000  (sandy, untouched) │
  (Actions, cloud      │          └─ islandhype.68-183-39-8.nip.io → 127.0.0.1:3001  (island-hype)      │
   build, ubuntu-24.04)│               └ /storage/v1/object/public/  → /var/www/island-hype-media/      │
        │  rsync       │                                                                                 │
        └─ artifacts ─►│  pm2: island-hype (Next standalone, Node heap capped)                           │
                       │  MySQL 8 (shared): db `sandy` (existing) + db `islandhype` (new, new user)      │
                       └─────────────────────────────────────────────────────────────────────────────┘
```

Isolation: separate pm2 app, separate MySQL database + user, separate nginx server block,
separate media dir. Sandy's MySQL db, pm2 process, and nginx config are never modified.

## Implementation phases

### Phase A — Code conversion (local, in repo)
1. `prisma/schema.prisma`: `provider = "mysql"`; `binaryTargets = ["native", "debian-openssl-3.0.x"]`; remove `directUrl`; convert the 3 `String[]` → `Json`.
2. `next.config.ts`: add `output: "standalone"`; image `remotePatterns` no longer needed for same-origin media (keep/trim as appropriate).
3. Adjust the ~5 read sites for the `Json` fields (cast to `string[]`).
4. `lib/image-urls.ts`/`lib/storage.ts`: no change needed for URL building (env-driven); `getOptimizedImageUrl` naturally falls back to plain URL once host isn't `supabase.co` → `next/image` handles resizing.
5. `npx prisma generate` + `next build` locally to prove it compiles.

### Phase B — Export source data (local, while still wired to Supabase)
- Run an export script against Supabase Postgres → one JSON file per table (FK-ordered).
- Download all 6 storage buckets → `./_migration/media/<bucket>/<path>` (script already proven).

### Phase C — Server prep (additive only)
- Create MySQL db `islandhype` + dedicated user (localhost, strong password). Sandy's db untouched.
- Create `/var/www/island-hype` (app) and `/var/www/island-hype-media` (images).

### Phase D — Schema + data load
- Push converted Prisma schema to the new MySQL db (`prisma migrate deploy` / `db push`).
- Run import script: JSON → MySQL (transform the 3 array fields → JSON arrays).
- rsync media → `/var/www/island-hype-media/`.
- If any DB rows store absolute `supabase.co` image URLs, run one SQL find/replace → new origin. (Verify relative-vs-absolute first.)

### Phase E — Serve
- Server `.env`: `DATABASE_URL=mysql://...@localhost/islandhype`, `NEXT_PUBLIC_SUPABASE_URL=https://islandhype.68-183-39-8.nip.io` (image base), `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `SUPABASE_*` storage keys only if still used for uploads (decide: keep Supabase for new uploads, or implement local upload — see Open Items).
- pm2 start Next standalone on port 3001 with `NODE_OPTIONS=--max-old-space-size=512`.
- nginx: new server block (proxy → 3001, `/storage/...` alias to media dir), then `certbot` for `islandhype.68-183-39-8.nip.io`.

### Phase F — Deploy pipeline
- `.github/workflows/deploy.yml`: on push to main → checkout → `npm ci` → `prisma generate` → `next build` → rsync `.next/standalone`, `.next/static`, `public`, `prisma/` to server → ssh `prisma migrate deploy && pm2 reload island-hype`.
- GitHub secrets: `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`. Server `.env` lives on the server, not in CI.
- Rework sandy's workflow to the same cloud-build + rsync pattern (separate task).

### Phase G — Verify
- Homepage, image loading, accommodation/package detail pages (array fields), admin login, an inquiry submit. Confirm sandy still serving throughout.

## Image inventory (verified against live source)

Three sources, all captured locally to `_migration/`:

1. **Entity images** — `locations`(6), `accommodations`(6), `packages`(5), `experiences`(8) buckets = 25 files. Referenced by `coverImage` **bare filenames** (e.g. `maafushi.jpg`). No absolute URLs stored → **no DB find/replace needed.** Served by nginx at `/storage/v1/object/public/<bucket>/<file>` from the media dir; `getImageUrl(bucket, file)` builds the URL from the media-base env.
2. **Hero/guide images** — `images` bucket (18 files) under `guide/*` and `hero/maldives-aerial.jpg`. These exactly match the hardcoded root-relative refs (`/maldives-aerial.jpg`, `/hero-aerial.jpg`, `/island-beach-aerial.jpg`, …) in `components/home/hero-carousel.tsx` and `app/guide/page.tsx` etc. — refs that were **never committed to git**. → **Flatten into `public/` and commit**, so they resolve as static assets (fixes the gap permanently). No code change.
3. **Activity images — MISSING.** `activity.coverImage` lists 10 filenames but the `activities` bucket is **empty**. These were never uploaded to Supabase and are likely already broken on the live site. Cannot be ported (nothing to port). **Flag to user** — needs the source files if they want them.

Decisions added (latest):
- **Full Supabase cutoff:** reimplement `uploadImage`/`deleteImage` in `lib/storage.ts` to write to the server media dir (`MEDIA_ROOT`), remove `@supabase/*` usage entirely. Introduce `NEXT_PUBLIC_MEDIA_URL` (replaces `NEXT_PUBLIC_SUPABASE_URL` as image base).
- **Sandy rename → `sandy.68-183-39-8.nip.io`:** new nginx `server_name` + Let's Encrypt cert; also update sandy `.env` `PUBLIC_BASE_URL` and `COOKIE_DOMAIN`, reload, verify login still works.

## Open items to confirm during implementation

1. **New image uploads via admin** — the admin still uploads to Supabase Storage (`lib/storage.ts uploadImage`). Options: (a) keep Supabase for *new* uploads only (simplest, keeps a Supabase dependency), or (b) reimplement upload to write to `/var/www/island-hype-media` on the server (fully off Supabase). Recommend (b) for a clean cut, as a follow-up if not needed day one.
2. **Image transforms** — Supabase on-the-fly resize is replaced by `next/image` (sharp). With 44 small images + 1-week cache, runtime cost is negligible.
3. **`VARCHAR(191)` check** — verify no plain-`String` field holds >191 chars before import.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| OOM on small box | 1 GB resize; reuse MySQL (no 2nd daemon); build off-server; capped Node heap; keep 2 GB swap. |
| Breaking sandy | Additive-only changes; never touch sandy's db/pm2/nginx; verify sandy up after each server step. |
| Prisma engine mismatch | `binaryTargets` includes `debian-openssl-3.0.x`; CI runner is Ubuntu 24.04 = server. |
| Array-field data loss | Export/transform/import verified on the 3 fields before cutover. |
| Admin uploads | Decide Supabase-keep vs local-upload (Open Item 1). |
