# Island Hype Public Site Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all nine public pages of `island-hype` against the delivered black/white/teal design system, on real database content, with layouts that hold at two packages or ninety.

**Architecture:** Three layers, built bottom-up. (1) A **data foundation** — schema additions for the fields the designs assume, plus four pure, unit-tested modules in `lib/design/` that derive layout, price, availability and inventory copy from real counts and dates. (2) A **design system** — `app/globals.css` reduced to a token block, and `components/ui/` collapsed from 14 forked primitives to 7. (3) **Patterns then pages** — the composite pieces that recur across screens (the package card appears on four pages, the stay-type card on three) are built and verified once in `components/patterns/`, then pages compose them. Density, imagery and empty states are never props: they are derived from query results.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19.2, Tailwind v4 (CSS-first `@theme inline`, no config file), Prisma 6 → MySQL 8, iron-session, `lucide-react`, Vitest (added by Task 1).

**Spec:** The design bundle in Claude Design project `52e55ebe-91dd-4711-8df0-fd5740909ecb`:
- `design_handoff_island_hype/README.md` — the written brief. **Read this first; it is the authority on rules.**
- `Island Hype Design System.dc.html` — token and component spec
- `Home.dc.html`, `Packages.dc.html`, `Package Detail.dc.html`, `Locations.dc.html`, `Location Detail.dc.html`, `Accommodations.dc.html`, `Accommodation Detail.dc.html`, `Guide.dc.html`, `Contact.dc.html`

Read a prototype with `DesignSync { method: "get_file", projectId: "52e55ebe-91dd-4711-8df0-fd5740909ecb", path: "<name>.dc.html" }`. The prototypes are **design references authored in HTML, not production code** — they use inline styles and a `support.js` streaming runtime. Read them for exact values; never port their markup.

Prior decisions and local setup: `docs/superpowers/specs/2026-06-10-island-hype-migration-design.md`, and the "Decisions locked" section below.

---

## Status — 2026-09-12

**Tasks 2–27 are done and committed on `feat/public-site-revamp`. Task 28 (ship
to production) has not been started and is the only remaining work.**

The step checkboxes below were never ticked as work progressed, so they record
the plan rather than the state. This section is the state. Where the two
disagree, this section is right.

### Decisions taken during execution that changed the plan

- **Task 1 (Vitest) was skipped**, on instruction: "You can skip writing tests
  and test harnesses for this project." Every `lib/design/` module was instead
  verified against the real database by query. Nothing else in Phase 0 shipped.
- **Experiences were removed entirely**, front end and admin, on instruction.
- **The day-by-day itinerary became one optional free-text "suggestions" field.**
  The business does not write itineraries; guests do. It drops out when empty.
- **Couple pricing is the whole-package total for two**, not per night. The
  per-night reading made Maafushi $1,798pp for a week, roughly 20x market.
- **Packages now always have an accommodation and a location.** The data was
  fixed rather than the layout, on instruction, via
  `scripts/fix-catalogue-associations.ts` — tracked, not in `_migration/`,
  because production has the same gaps.
- **Heroes are art-directed per breakpoint**: the overwater jetty on mobile, the
  client's original aerial on iPad and desktop.
- **The Locations page was rebalanced** away from travel distance toward what
  makes each island different, with distance retained but no longer the lede.
- **The three real contacts are wired** (`info@islandhypemaldives.com`,
  `+971503507644`, `@islandhypemaldives`), in `SiteSetting` so staff can change
  them without a deploy.

### Task 25 diverged the most

The plan's four image assignments were replaced. Every hero was chosen by
measuring the file rather than by name, and the assignments are recorded with
their widths in `lib/design/site-images.ts`.

The plan did not anticipate the real problem: `images: { unoptimized: true }` is
deliberate for a 1 GB box, so every page shipped its full-size original.
`scripts/build-image-derivatives.ts` now pre-generates WebP derivatives at five
widths with a committed manifest (19.2 MB of sources to 9.9 MB of derivatives),
and the app emits a `srcset`. `/locations` measured 1382 KB to 451 KB for its
hero on desktop, 110 KB on a phone.

Also, **eleven** files had an extension that lied about their contents, not the
two the plan names — the earlier count came from checking only two folders.

### Work done that the plan does not contain

- **Error, not-found and global-error boundaries.** The app had none, so any
  failed query showed Next's "Application error" screen to visitors and to
  staff. Four boundaries now, verified against a production build.
- **Admin editors rebuilt around a single `SavePanel`** with explicit dirty
  state, in-place outcomes, unsaved-work warnings and copy that explains
  consequences rather than naming fields.
- **Admin pages are `noindex`**, and the tab titles no longer double the site
  name.
- **Fourteen** unused dependencies dropped, not the twelve the plan lists.

### Known issues, unresolved

- **Admin accounts are hardcoded bcrypt hashes in `lib/auth/config.ts`.** Staff
  cannot add, remove or change a user without a developer and a deploy. This is
  the largest remaining gap in "production ready" for the panel and needs a
  decision: a `User` table, or accept it.
- **The phone number is +971 (UAE) while the opening hours say Maldives time
  (GMT+5).** UAE is GMT+4. One of the two is wrong; the client should say which.
- **The Guide's ten sections of factual prose have not been reviewed by the
  client.** It asserts transfer costs, seasons and island rules as fact.

---

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

### Colour — the only palette

| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#1C1B1B` | Primary text, primary button, footer ground |
| `ink-800` | `#212121` | Primary button hover |
| `ink-700` | `#3F3D3D` | Body copy, footer divider |
| `ink-500` | `#707070` | Meta, captions, mono labels, input placeholders — **light grounds only** |
| `ink-300` | `#AFAFAF` | Disabled controls, icon strokes, **all footer text on ink-900** |
| `ink-200` | `#D9D9D9` | Borders, dividers, hairlines |
| `ink-50` | `#F8F8F8` | Page ground, alternate sections, price rail |
| `white` | `#FFFFFF` | Cards, inputs, surfaces |
| `teal-deep` | `#007979` | **The only teal that may hold white text or be text on white** |
| `teal-bright` | `#24B1B1` | Focus rings, active indicators, `✦` marks, hairline accents |
| `teal-press` | `#005C5C` | Active/pressed state for `teal-deep` |
| `teal-tint` | `#E8F6F6` | Selected-filter ground, badge fills, step circles |

- `#24B1B1` is **2.6:1 on white and must never hold white text.** Only `#007979` may.
- `ink-500 #707070` and `ink-300 #AFAFAF` are **ground-specific and not interchangeable** (`#707070` is 3.47:1 on ink-900 and fails; `#AFAFAF` is 2.19:1 on white and fails). Expose them as semantic aliases `--text-meta` / `--text-meta-inverse`, never as raw `text-ink-500` / `text-ink-300` utilities.
- Teal covers **no more than ~5% of any screen.** Photography supplies the colour.
- No orange. No `--maldives-*`. No dark mode — the system is light-only.

### Type

Geist Sans body, Geist Mono for eyebrows/labels/numerals/spec labels, **Playfair Display italic for the wordmark only.** All three already load via `next/font` in `app/layout.tsx`.

| Step | Size / line-height | Tracking | Weight |
|---|---|---|---|
| `display-xl` | `clamp(40px, 5.8vw, 76px)` | `-0.03em` | 500 |
| `display-l` | `clamp(34px, 4.4vw, 56px)` | `-0.025em` | 500 |
| `display-m` | `clamp(30px, 3.6vw, 44px)` | `-0.02em` | 500 |
| `heading-l` | 32 / 38 | `-0.015em` | 500 |
| `heading-m` | 24 / 30 | `-0.01em` | 500 |
| `heading-s` | 20 / 26 | 0 | 500 |
| `body-l` | 18 / 28 | 0 | 400 |
| `body-m` | 16 / 24 | 0 | 400 |
| `body-s` | 14 / 20 | 0 | 400–500 |
| `caption` | 13 / 18 | 0 | 400 |
| `label` | 12 / 16 mono uppercase | `+0.08em` | 400 |

Measure: headings max 15em, body max 34em. Weights 400 / 500, **600 for price figures only, never 700.** Minimum contrast 4.5:1 body, 3:1 headline.

### Space, radius, elevation, motion

- Spacing 4pt scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Section rhythm **96px desktop / 56px mobile.** Gutter 32 / 20. Grid gap 24 / 16.
- Radii, **fixed assignments, never mixed within an element class**: `8` inputs and small chips · `12` badges and inner panels · `16` all cards · `24` photography, hero frames, large panels · `9999` buttons, pills, avatars.
- Elevation, neutral-tinted, never pure black: `raised 0 1px 2px rgba(28,27,27,0.06)` · `card-hover 0 4px 16px rgba(28,27,27,0.08)` · `overlay 0 12px 40px rgba(28,27,27,0.14)`. **Resting cards use a border, not a shadow.**
- Motion: `140ms` fast / `220ms` base / `320ms` slow. Easing `cubic-bezier(0.2, 0, 0, 1)` standard, `cubic-bezier(0.2, 0.8, 0.2, 1)` emphasised. Card hover transitions `box-shadow` and `transform` at 220ms; image hover `scale(1.015)`.
- **Card interior padding is one value per page:** 20px on cards with an image well, 24px on text-only cards. Nothing else.

### Glass — one recipe, two tiers

Used **only over photography, never on flat ground, at most twice per screen** (nav plus one hero element).

```css
/* glass-light — nav pill, hero secondary button */
background: rgba(255,255,255,0.10);
border: 1px solid rgba(255,255,255,0.22);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(28,27,27,0.24);
backdrop-filter: blur(20px) saturate(140%);
-webkit-backdrop-filter: blur(20px) saturate(140%);

/* glass-dark — mobile menu panel */
background: rgba(28,27,27,0.42);
border: 1px solid rgba(255,255,255,0.14);
backdrop-filter: blur(24px) saturate(120%);

@supports not (backdrop-filter: blur(1px)) {
  /* glass-light → */ background: rgba(28,27,27,0.56);
}
```

Two non-negotiables the current `nav-bar.tsx` violates:
1. **Every photo behind glass needs a scrim.** Add `linear-gradient(to bottom, rgba(28,27,27,0.5) 0%, rgba(28,27,27,0.1) 42%, rgba(28,27,27,0.74) 100%)` to every hero.
2. **Text on glass is full-opacity `#FFFFFF`.** Never `white/70`.

### Density thresholds — implement exactly as written

`density` in the prototypes is a **review affordance and must not ship.** Derive `n` from real query counts. `imagery` ships as a derived boolean. Expired packages are excluded from `n`.

| Rule | Condition |
|---|---|
| Packages render as wide list rows | `n <= 4` |
| Packages render as card grid | `n >= 5` |
| Quick filter pills visible | `3 <= n < 6` |
| Full filter bar + sort visible | `n >= 6` |
| Home locations as photo tiles | `photoRich && count >= 4` |
| Locations **page** as photo tiles | `photoRich && count >= 5` (deliberately different — Home's tiles are 180px basis, the Locations page's are 260px cards) |
| Accommodations rows / grid | `n <= 4` / `n >= 5`; filters at `n >= 6` |
| Package card shows an image well | per-item `photoRich` |
| Gallery mosaic / single 21:9 | `images >= 3` / fewer |
| Gallery pill label | `total > 3 ? "All N photos" : "View photos"` |
| Related packages section | requires `>= 2` others, else becomes a dates prompt |
| Location Detail dashed sibling panel | exactly `1` package here |
| Stay types | **always all five — never sliced.** §1.3 floor |

**`photoRich` is per-item for cards and galleries, aggregate for layout switches.** A single photo-less package must not strip the image well from every sibling. Today: every entity has one `coverImage` (cards are photo-rich) and all `*Image` tables are empty (galleries are photo-light), so the mosaic never fires until someone uploads more.

**Inventory claims must agree with each other.** All counts come from Prisma `_count`. Never hardcode. If a location has one package, the row says "1 package".

### Repeated-element sizing — a bug class that bit three times in design

- **Card titles reserve two lines:** `min-height: 56px` at `22px/28px`.
- **Spec column groups use a fixed grid, never wrapping flex:** `grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px`.
- **Price blocks anchor to the card bottom** with `margin-top: auto` in a column flex card.
- **Flex bases must sum under the container.** The Packages row card is `240 + 320 + 200 = 760`.
- **Separate stacked regions with a background change, not a one-sided border.** The price rail uses an `#F8F8F8` ground, not `border-left`.
- No content row uses a fixed column count. Cards are `flex: 1 1 <basis>; max-width: <cap>; min-width: 0`. Editorial splits use `repeat(auto-fit, minmax(300px, 1fr))`.
- `max-width` in `em` on a **wrapper** resolves against the wrapper's font size, not the heading's. Use `px` caps on wrappers containing large type.

### Copy rules

- Card CTA is **"See the package"**, never "See the days".
- **No day-by-day itineraries, ever.** Island Hype sells fixed packages; guests plan their own days. The detail-page section is *suggestions*, driven by `PackageActivity`.
- How-it-works: you choose a package → we confirm availability with the island → you pay → we sort the transfers. **No deposit percentages, no "we plan it for you".** There is no bespoke trip-building service.
- The dates prompts ask about the *listed* packages; they are not offers to build a custom trip.
- Nav labels: Home / Packages / Locations / **Stays** / Guide. The route stays `/accommodations`.
- `✦` marks are text glyphs, not SVGs.

### Decisions locked with the client (2026-09-12)

- **`PackagePricing.couplePrice` is the whole-package total for two**, not per night. Per-person = `couplePrice / 2`. `calculateTotalPrice()` in `lib/market.ts` assumed per-night, was never called, and must be deleted.
- **Availability** = travel/booking windows + blackout ranges. **No per-date capacity.**
- **Expired packages:** derived three-state (`upcoming` / `open` / `ended`), never a stored flag. Ended sort last at reduced opacity, stay reachable, rail disabled. Excluded from Home and from density counts.
- **Guide:** static TSX, prototype prose verbatim. Not CMS-modelled.
- **Experiences are gone from the product.** Already removed. Do not reintroduce.
- **Admin is out of scope for redesign.** It keeps its own density and must not spend the accent budget. Apply the token table only so it stops referencing deleted variables.
- Every new field is **nullable** so staff choose what to publish. The front end drops a row, a section, or a whole block when its data is absent — it never renders an empty hairline or a dangling label.

### Verification available in this environment

- `npx tsc --noEmit` — must be 0 errors
- `npm run lint` — must add no new errors (17 pre-existing warnings)
- `npm run build` — must pass from a clean `.next`
- `npx vitest run` — after Task 1
- `npm run dev` on :3000 against the prod-cloned local MySQL (see `docs/superpowers/specs/`, and the local-dev memory: passwordless `mysql -u root`, media in `public/storage/v1/object/public/`)
- Browser screenshots via the `claude-in-chrome` MCP for visual checks

### Local data shape — what the branches actually hit today

5 active packages (4 featured), 6 locations, 6 accommodations, 10 activities, 4 offers. So: Packages page → **grid + quick pills**; Home → no package filters, location **tiles**; Locations page → **tiles**; Accommodations → **grid + filters** (the only page tripping `n >= 6`); Package Detail → 3 related cards. Every location has exactly 1 package except **Thulusdhoo, which has 0 packages and 0 stays**. `PackageImage` / `LocationImage` / `AccommodationImage` are **all empty**. 3 of 5 packages have no activities. Every one of those is a branch the plan must exercise.

---

## File Structure

**Created**

| Path | Responsibility |
|---|---|
| `lib/design/pricing.ts` | Select the applicable pricing row for a date; compute per-person and total; format money |
| `lib/design/availability.ts` | Package lifecycle state; validate a guest's requested dates against windows and blackouts |
| `lib/design/density.ts` | Derive layout decisions from counts and imagery |
| `lib/design/inventory.ts` | Count-derived copy strings that must agree with each other |
| `lib/design/stay-types.ts` | The five stay types as reference data, with per-location overrides applied |
| `lib/data/accommodations.ts` | Extend: room types, facilities, FAQs, `_count` |
| `lib/actions/faqs.ts`, `room-types.ts`, `facilities.ts`, `blackouts.ts`, `seasons.ts`, `stay-types.ts`, `tags.ts` | Admin CRUD for the new models |
| `components/layout/glass.tsx` | The one glass recipe as a component/class pair |
| `components/layout/page-head.tsx` | The 380px photo band + scrim + glass nav used by Packages / Locations / Accommodations |
| `components/patterns/*` | 16 composite design pieces — see Tasks 11–15 |
| `app/terms/page.tsx`, `app/privacy/page.tsx` | `SiteSetting`-backed stubs the footer links to |
| `vitest.config.ts` | Test config, `lib/**` only |

**Rewritten**

`app/globals.css` (1,474 → under 200 lines) · `components/ui/{button,card,section,pill,badge,input,container}.tsx` · `components/layout/{nav-bar,footer}.tsx` · all nine page files · `lib/data/{packages,locations,home}.ts` · `lib/market.ts`

**Deleted**

`components/ui/{avatar,icon-button,image-card,slide-counter,skeleton}.tsx` · `components/ui/icons.tsx` (408 lines; `lucide-react` covers it) · `components/home/{hero-carousel,section-carousel,featured-packages,how-to-book}.tsx` · `components/layout/{listing-hero,page-hero}.tsx` · `components/packages/{booking-card,package-card,package-gallery,sort-dropdown,package-filters,itinerary-day}.tsx` · `components/accommodations/*` · `components/locations/*` · `components/shared/price-display.tsx`

**Dependencies to drop** (declared in `package.json`, used in **zero** files — verified by grep): `embla-carousel-react`, `framer-motion`, `nuqs`, `date-fns`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@supabase/supabase-js`, `@supabase/ssr`, `sharp`.

---

## Phase 0 — Test harness

### Task 1: Vitest for `lib/` logic

The repo has no test infrastructure. The four `lib/design/` modules encode precise thresholds and money arithmetic where a subtle error is expensive and invisible, so they get real tests. Presentational work is verified by typecheck, build and browser screenshots instead — unit-testing JSX transcribed from a prototype would test the transcription, not the behaviour.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `npx vitest run` and `npm test`; test files colocated as `lib/design/<name>.test.ts`

- [ ] **Step 1: Install**

```bash
npm i -D vitest@^2
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["lib/**/*.test.ts"] },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Add the script to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Prove the harness runs**

Create `lib/design/harness.test.ts` containing `import { it, expect } from "vitest"; it("runs", () => expect(1).toBe(1));`
Run: `npx vitest run`
Expected: 1 passed. Then delete the file.

- [ ] **Step 5: Confirm `tsc` still clean**

Run: `npx tsc --noEmit` → 0 errors.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "test: add vitest for lib logic"
```

---

## Phase 1 — Data foundation

### Task 2: Schema — the fields and models the designs assume

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_design_fields/migration.sql`

**Interfaces:**
- Produces: `BlackoutRange`, `FaqItem`, `RoomType`, `Facility`, `SeasonMonth`, `StayType`, `LocationStayType`, `Tag`, `PackageTag`; new nullable scalars on `Package`, `Location`, `Accommodation`.

Note: `prisma migrate dev` is non-interactive in this environment, and `migrate diff --from-url … --to-schema-datamodel` silently emits nothing (exit 0, zero bytes). **Write `migration.sql` by hand and apply with `npx prisma migrate deploy`**, as `20260912135415_drop_experiences_reframe_activities` did.

- [ ] **Step 1: Add nullable scalars**

```prisma
// model Package — display fields the designs read
mealPlan    String?  @db.VarChar(160)   // "Half-board, one à-la-carte night"
boardBasis  BoardBasis?                 // for filtering; nullable
badge       String?  @db.VarChar(40)    // card pill: "All-inclusive", "Best value"
bestMonths  String?  @db.VarChar(80)    // "January to April"
longBlurb   String?  @db.Text           // detail overview; falls back to description

// model Location
region               String? @db.VarChar(120) // "North-west · UNESCO biosphere"
knownFor             String? @db.VarChar(120) // "Mantas, house reefs"
bestMonths           String? @db.VarChar(80)
seasonHighlightLabel String? @db.VarChar(40)  // the middle calendar band, e.g. "Mantas"

// model Accommodation
houseReef    String? @db.VarChar(160)  // "Yes — 9m from the villa ladder"
suits        String? @db.VarChar(160)  // "Couples, snorkellers, divers"
boardOptions String? @db.VarChar(160)  // "Half-board or full-board"
absentNote   String? @db.Text          // what is NOT here: "No kids' club, patchy villa wifi"

enum BoardBasis { ROOM_ONLY BED_AND_BREAKFAST HALF_BOARD FULL_BOARD ALL_INCLUSIVE }
```

- [ ] **Step 2: Add the new models**

```prisma
model BlackoutRange {
  id              String   @id @default(cuid())
  startDate       DateTime
  endDate         DateTime
  reason          String?  @db.VarChar(160)
  packageId       String?
  package         Package?       @relation(fields: [packageId], references: [id], onDelete: Cascade)
  accommodationId String?
  accommodation   Accommodation? @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())

  @@index([packageId])
  @@index([accommodationId])
  @@index([startDate, endDate])
}

model FaqItem {
  id              String  @id @default(cuid())
  question        String  @db.VarChar(300)
  answer          String  @db.Text
  sortOrder       Int     @default(0)
  packageId       String?
  package         Package?       @relation(fields: [packageId], references: [id], onDelete: Cascade)
  accommodationId String?
  accommodation   Accommodation? @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  locationId      String?
  location        Location?      @relation(fields: [locationId], references: [id], onDelete: Cascade)

  @@index([packageId])
  @@index([accommodationId])
  @@index([locationId])
}

model RoomType {
  id              String  @id @default(cuid())
  accommodationId String
  accommodation   Accommodation @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  name            String  @db.VarChar(120)
  blurb           String? @db.Text
  nightlyFrom     Float?
  size            String? @db.VarChar(40)   // "78 m²"
  sleeps          String? @db.VarChar(60)   // "2 adults + 1 child"
  access          String? @db.VarChar(60)   // "Ladder to lagoon"
  sortOrder       Int     @default(0)

  @@index([accommodationId])
}

model Facility {
  id              String  @id @default(cuid())
  accommodationId String
  accommodation   Accommodation @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  group           String  @db.VarChar(60)   // "Eating and drinking", "In the water"
  item            String  @db.VarChar(160)
  sortOrder       Int     @default(0)

  @@index([accommodationId])
}

model SeasonMonth {
  id         String      @id @default(cuid())
  locationId String
  location   Location    @relation(fields: [locationId], references: [id], onDelete: Cascade)
  month      Int         // 1-12
  state      SeasonState

  @@unique([locationId, month])
  @@index([locationId])
}

enum SeasonState { BEST HIGHLIGHT WETTER }

model StayType {
  id          String  @id @default(cuid())
  name        String  @db.VarChar(80)   // "Water villa"
  slug        String  @unique
  band        String  @db.VarChar(80)   // "Over the reef"
  blurb       String  @db.Text
  nightlyFrom Float?
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)
  locations   LocationStayType[]
}

model LocationStayType {
  id          String   @id @default(cuid())
  locationId  String
  location    Location @relation(fields: [locationId], references: [id], onDelete: Cascade)
  stayTypeId  String
  stayType    StayType @relation(fields: [stayTypeId], references: [id], onDelete: Cascade)
  blurb       String?  @db.Text   // override
  nightlyFrom Float?             // override
  sortOrder   Int      @default(0)

  @@unique([locationId, stayTypeId])
  @@index([locationId])
}

model Tag {
  id       String  @id @default(cuid())
  name     String  @db.VarChar(60)   // "Diving", "Honeymoon", "Family"
  slug     String  @unique
  sortOrder Int    @default(0)
  packages PackageTag[]
}

model PackageTag {
  id        String  @id @default(cuid())
  packageId String
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([packageId, tagId])
  @@index([packageId])
  @@index([tagId])
}
```

Add the back-relations on `Package` (`blackouts`, `faqs`, `tags`), `Location` (`faqs`, `seasonMonths`, `stayTypes`), `Accommodation` (`blackouts`, `faqs`, `roomTypes`, `facilities`).

- [ ] **Step 3: Migrate the flat `roomTypes` JSON into `RoomType` rows**

`Accommodation.roomTypes` is a JSON array of strings. Preserve it as `RoomType.name` rows, then drop the column in the same migration. Write `prisma/migrations/<ts>_design_fields/migration.sql` with the DDL, then run the data move as a one-off script before dropping the column:

```ts
// scripts/migrate-room-types.ts — run with npx tsx, then delete
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const rows = await db.$queryRaw<{ id: string; roomTypes: string }[]>`
  SELECT id, roomTypes FROM Accommodation`;
for (const r of rows) {
  const names: string[] = JSON.parse(r.roomTypes || "[]");
  await db.roomType.createMany({
    data: names.map((name, i) => ({ accommodationId: r.id, name, sortOrder: i })),
    skipDuplicates: true,
  });
}
await db.$disconnect();
```

- [ ] **Step 4: Apply and verify**

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status      # "Database schema is up to date!"
mysql -u root islandhype -e "SELECT COUNT(*) FROM RoomType;"   # > 0
npx tsc --noEmit               # 0 errors
```

- [ ] **Step 5: Seed the five stay types**

They are reference content (§1.3 floor, never sliced). Values verbatim from `Home.dc.html`'s `STAYS` array: Water villa / Over the reef / $420 · Beach villa / On the sand / $280 · Guesthouse / Local island / $65 · Dive lodge / Built for divers / $110 · Liveaboard / No fixed address / $190. Copy the `blurb` strings exactly.

- [ ] **Step 6: Commit**

```bash
git add prisma/ && git commit -m "feat(db): add design fields, FAQs, room types, blackouts, seasons, stay types, tags"
```

---

### Task 3: `lib/design/pricing.ts`

**Files:**
- Create: `lib/design/pricing.ts`, `lib/design/pricing.test.ts`
- Modify: `lib/market.ts` (delete `calculateTotalPrice`)

**Interfaces:**
- Produces:
```ts
export interface PricingRow {
  id: string; market: Market;
  basePrice: number;        // single occupancy, whole package
  couplePrice: number;      // WHOLE PACKAGE total for two
  extraAdultPrice: number | null; childPrice: number | null;
  infantPrice: number | null; singleSupplement: number | null;
  validFrom: Date | null; validUntil: Date | null;
}
export interface PackagePrice { perPerson: number; total: number; pax: number; currency: "USD" | "MVR" }
export function selectPricingRow(rows: PricingRow[], market: Market, travelDate?: Date | null): PricingRow | null
export function computePackagePrice(row: PricingRow, opts: { adults: number; children?: number; market: Market }): PackagePrice
export function formatMoney(value: number, currency: "USD" | "MVR"): string
```

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { selectPricingRow, computePackagePrice, formatMoney, type PricingRow } from "./pricing";

const row = (o: Partial<PricingRow> = {}): PricingRow => ({
  id: "r1", market: "INTERNATIONAL", basePrice: 599, couplePrice: 899,
  extraAdultPrice: null, childPrice: null, infantPrice: null, singleSupplement: null,
  validFrom: null, validUntil: null, ...o,
});

describe("selectPricingRow", () => {
  it("returns the undated default when no travel date is given", () => {
    expect(selectPricingRow([row()], "INTERNATIONAL")?.id).toBe("r1");
  });
  it("prefers a seasonal row whose window covers the travel date", () => {
    const seasonal = row({ id: "high", validFrom: new Date("2027-01-01"), validUntil: new Date("2027-04-30"), couplePrice: 1400 });
    expect(selectPricingRow([row(), seasonal], "INTERNATIONAL", new Date("2027-02-10"))?.id).toBe("high");
  });
  it("falls back to the undated default outside every seasonal window", () => {
    const seasonal = row({ id: "high", validFrom: new Date("2027-01-01"), validUntil: new Date("2027-04-30") });
    expect(selectPricingRow([row(), seasonal], "INTERNATIONAL", new Date("2027-08-01"))?.id).toBe("r1");
  });
  it("ignores rows for the other market", () => {
    expect(selectPricingRow([row({ market: "LOCAL" })], "INTERNATIONAL")).toBeNull();
  });
  it("returns null for an empty set", () => {
    expect(selectPricingRow([], "INTERNATIONAL")).toBeNull();
  });
});

describe("computePackagePrice", () => {
  // couplePrice is the WHOLE-PACKAGE total for two. Never multiply by nights.
  it("halves couplePrice for the per-person figure at two adults", () => {
    expect(computePackagePrice(row(), { adults: 2, market: "INTERNATIONAL" }))
      .toEqual({ perPerson: 450, total: 899, pax: 2, currency: "USD" });
  });
  it("uses basePrice plus any single supplement for one adult", () => {
    const r = row({ singleSupplement: 120 });
    expect(computePackagePrice(r, { adults: 1, market: "INTERNATIONAL" }))
      .toEqual({ perPerson: 719, total: 719, pax: 1, currency: "USD" });
  });
  it("adds extra adults above two", () => {
    const r = row({ extraAdultPrice: 400 });
    const p = computePackagePrice(r, { adults: 3, market: "INTERNATIONAL" });
    expect(p.total).toBe(1299);
    expect(p.pax).toBe(3);
  });
  it("adds children and counts them in pax", () => {
    const r = row({ childPrice: 200 });
    const p = computePackagePrice(r, { adults: 2, children: 2, market: "INTERNATIONAL" });
    expect(p.total).toBe(1299);
    expect(p.pax).toBe(4);
  });
  it("reports MVR for the local market", () => {
    expect(computePackagePrice(row({ market: "LOCAL" }), { adults: 2, market: "LOCAL" }).currency).toBe("MVR");
  });
  it("rounds the per-person figure to whole units", () => {
    expect(computePackagePrice(row({ couplePrice: 899 }), { adults: 2, market: "INTERNATIONAL" }).perPerson).toBe(450);
  });
});

describe("formatMoney", () => {
  it("formats USD with no decimals", () => expect(formatMoney(2480, "USD")).toBe("$2,480"));
  it("formats MVR with no decimals", () => expect(formatMoney(12000, "MVR")).toMatch(/12,000/));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/design/pricing.test.ts`
Expected: FAIL — cannot resolve `./pricing`.

- [ ] **Step 3: Implement `lib/design/pricing.ts`**

`selectPricingRow`: filter by market; if `travelDate` given, prefer a row whose `validFrom`/`validUntil` bracket it (treat a null bound as open-ended but require at least one bound to count as seasonal); otherwise return the row with both bounds null; else the first remaining.
`computePackagePrice`: 1 adult → `basePrice + (singleSupplement ?? 0)`; 2 adults → `couplePrice`; 3+ → `couplePrice + extraAdultPrice * (adults - 2)` (treat a null `extraAdultPrice` as 0 and leave a TODO-free comment that admin should set it); plus `childPrice * children`. `perPerson = Math.round(total / adults)`. `pax = adults + children`.
`formatMoney`: reuse the `Intl.NumberFormat` config already in `lib/market.ts` (`minimumFractionDigits: 0`).

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/design/pricing.test.ts` → all pass.

- [ ] **Step 5: Delete the dead per-night function**

Remove `calculateTotalPrice` from `lib/market.ts` (never called; encodes the wrong semantics). Keep `getMarket`, `getCurrency`, `formatPrice`, `isLocalMarket`. Fix the misleading `// Base prices (per person for the package duration)` comment in `prisma/schema.prisma` to say the whole-package-for-two truth, and relabel the admin pricing inputs in `app/admin/(authenticated)/packages/[id]/package-form.tsx` to "Total for two (whole package)".

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run && npx tsc --noEmit && npm run build
git add lib/design/pricing.ts lib/design/pricing.test.ts lib/market.ts prisma/schema.prisma "app/admin/(authenticated)/packages/[id]/package-form.tsx"
git commit -m "feat(pricing): whole-package pricing module, drop dead per-night helper"
```

---

### Task 4: `lib/design/availability.ts`

**Files:**
- Create: `lib/design/availability.ts`, `lib/design/availability.test.ts`

**Interfaces:**
- Produces:
```ts
export type PackageLifecycle = "upcoming" | "open" | "ended";
export interface DateWindow { start: Date | null; end: Date | null }
export interface Blackout { startDate: Date; endDate: Date; reason: string | null }
export function lifecycleOf(args: { travel: DateWindow; booking: DateWindow; now?: Date }): PackageLifecycle
export type DateCheck =
  | { ok: true }
  | { ok: false; reason: "before-window" | "after-window" | "blacked-out" | "too-short" | "too-long";
      message: string; window?: DateWindow; blackout?: Blackout };
export function checkDates(args: {
  arrival: Date; nights: number; travel: DateWindow; booking: DateWindow;
  blackouts: Blackout[]; minNights: number; maxNights: number | null; now?: Date;
}): DateCheck
```

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { lifecycleOf, checkDates, type DateWindow, type Blackout } from "./availability";

const NOW = new Date("2026-09-12T00:00:00Z");
const open: DateWindow = { start: new Date("2026-01-01"), end: new Date("2027-12-31") };
const none: DateWindow = { start: null, end: null };

describe("lifecycleOf", () => {
  it("treats null windows as always open — nullable means unconstrained", () => {
    expect(lifecycleOf({ travel: none, booking: none, now: NOW })).toBe("open");
  });
  it("is open inside the travel window", () => {
    expect(lifecycleOf({ travel: open, booking: none, now: NOW })).toBe("open");
  });
  it("is ended after the travel window closes", () => {
    expect(lifecycleOf({ travel: { start: null, end: new Date("2026-08-01") }, booking: none, now: NOW })).toBe("ended");
  });
  it("is upcoming before the travel window opens", () => {
    expect(lifecycleOf({ travel: { start: new Date("2027-03-01"), end: null }, booking: none, now: NOW })).toBe("upcoming");
  });
  it("is ended once the booking window has closed, even if travel is still open", () => {
    expect(lifecycleOf({ travel: open, booking: { start: null, end: new Date("2026-06-30") }, now: NOW })).toBe("ended");
  });
  it("is upcoming when booking has not opened yet", () => {
    expect(lifecycleOf({ travel: open, booking: { start: new Date("2026-11-01"), end: null }, now: NOW })).toBe("upcoming");
  });
});

describe("checkDates", () => {
  const base = { travel: open, booking: none, blackouts: [] as Blackout[], minNights: 4, maxNights: null, now: NOW };

  it("accepts an arrival inside the window at the exact minimum nights", () => {
    expect(checkDates({ ...base, arrival: new Date("2026-11-10"), nights: 4 })).toEqual({ ok: true });
  });
  it("rejects an arrival before the travel window opens", () => {
    const r = checkDates({ ...base, arrival: new Date("2025-12-01"), nights: 4 });
    expect(r).toMatchObject({ ok: false, reason: "before-window" });
  });
  it("rejects an arrival after the travel window closes", () => {
    const r = checkDates({ ...base, arrival: new Date("2028-01-01"), nights: 4 });
    expect(r).toMatchObject({ ok: false, reason: "after-window" });
  });
  it("rejects a stay shorter than minNights", () => {
    const r = checkDates({ ...base, arrival: new Date("2026-11-10"), nights: 2 });
    expect(r).toMatchObject({ ok: false, reason: "too-short" });
  });
  it("rejects a stay longer than maxNights when one is set", () => {
    const r = checkDates({ ...base, maxNights: 7, arrival: new Date("2026-11-10"), nights: 10 });
    expect(r).toMatchObject({ ok: false, reason: "too-long" });
  });
  it("rejects an arrival inside a blackout and names it", () => {
    const b: Blackout = { startDate: new Date("2026-11-08"), endDate: new Date("2026-11-20"), reason: "Resort closed" };
    const r = checkDates({ ...base, blackouts: [b], arrival: new Date("2026-11-10"), nights: 4 });
    expect(r).toMatchObject({ ok: false, reason: "blacked-out" });
    if (!r.ok) expect(r.blackout?.reason).toBe("Resort closed");
  });
  it("rejects a stay that starts before a blackout but overlaps into it", () => {
    const b: Blackout = { startDate: new Date("2026-11-12"), endDate: new Date("2026-11-20"), reason: null };
    const r = checkDates({ ...base, blackouts: [b], arrival: new Date("2026-11-10"), nights: 5 });
    expect(r).toMatchObject({ ok: false, reason: "blacked-out" });
  });
  it("accepts a stay that ends the day a blackout begins", () => {
    const b: Blackout = { startDate: new Date("2026-11-14"), endDate: new Date("2026-11-20"), reason: null };
    expect(checkDates({ ...base, blackouts: [b], arrival: new Date("2026-11-10"), nights: 4 })).toEqual({ ok: true });
  });
  it("gives a human message on every failure", () => {
    const r = checkDates({ ...base, arrival: new Date("2025-12-01"), nights: 4 });
    if (!r.ok) expect(r.message.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/design/availability.test.ts` → FAIL, module not found.

- [ ] **Step 3: Implement**

Departure = `arrival + nights` days. Overlap rule: a stay `[arrival, departure)` clashes with a blackout `[start, end]` when `arrival <= end && departure > start` — which is why the "ends the day a blackout begins" case passes. Messages must match the brand voice and never blame the user, e.g. `"This package runs from January 2026. Tell us your dates and we'll suggest the nearest week."`

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/design/availability.test.ts` → all pass.

- [ ] **Step 5: Commit**

```bash
git add lib/design/availability.ts lib/design/availability.test.ts
git commit -m "feat(availability): window, blackout and lifecycle evaluation"
```

---

### Task 5: `lib/design/density.ts` and `lib/design/inventory.ts`

**Files:**
- Create: `lib/design/density.ts`, `lib/design/density.test.ts`, `lib/design/inventory.ts`, `lib/design/inventory.test.ts`

**Interfaces:**
- Produces:
```ts
// density.ts
export interface ListDensity { layout: "rows" | "grid"; quickPills: boolean; filterBar: boolean }
export function packageListDensity(n: number): ListDensity
export function stayListDensity(n: number): ListDensity
export function locationsLayout(args: { count: number; photoRich: boolean; tilesMin: 4 | 5 }): "tiles" | "rows"
export function isPhotoRich(item: { coverImage: string | null; images?: { url: string }[] }): boolean
export function isAggregatePhotoRich(items: { coverImage: string | null }[]): boolean
export function galleryLayout(imageCount: number): "mosaic" | "single"
export function galleryPillLabel(total: number): string
export function showRelated(otherCount: number): boolean

// inventory.ts
export function pluralise(n: number, singular: string, plural?: string): string
export function packageCountLine(args: { packages: number; locations: number }): string
export function locationMeta(args: { packages: number; accommodations: number }): string
export function packagesHereHeading(args: { count: number; locationName: string }): string
export function staysHeading(count: number): string
export function staysLede(count: number): string
export function resultCount(n: number, empty: boolean): string
```

- [ ] **Step 1: Write the failing density tests**

```ts
import { describe, it, expect } from "vitest";
import { packageListDensity, locationsLayout, isPhotoRich, isAggregatePhotoRich,
         galleryLayout, galleryPillLabel, showRelated } from "./density";

describe("packageListDensity", () => {
  // Thresholds are from the brief §1.1 and are deliberate, not arbitrary.
  it.each([
    [0, "rows", false, false], [1, "rows", false, false], [2, "rows", false, false],
    [3, "rows", true,  false], [4, "rows", true,  false],
    [5, "grid", true,  false], [6, "grid", false, true ], [9, "grid", false, true ],
  ])("n=%i → %s, pills=%s, bar=%s", (n, layout, pills, bar) => {
    expect(packageListDensity(n as number)).toEqual({ layout, quickPills: pills, filterBar: bar });
  });
});

describe("locationsLayout", () => {
  it("Home uses a threshold of 4", () => {
    expect(locationsLayout({ count: 4, photoRich: true, tilesMin: 4 })).toBe("tiles");
    expect(locationsLayout({ count: 3, photoRich: true, tilesMin: 4 })).toBe("rows");
  });
  it("the Locations page uses a threshold of 5", () => {
    expect(locationsLayout({ count: 4, photoRich: true, tilesMin: 5 })).toBe("rows");
    expect(locationsLayout({ count: 5, photoRich: true, tilesMin: 5 })).toBe("tiles");
  });
  it("falls back to rows without photography, however many there are", () => {
    expect(locationsLayout({ count: 8, photoRich: false, tilesMin: 4 })).toBe("rows");
  });
});

describe("photo richness", () => {
  it("is per-item so one photo-less sibling cannot strip every image well", () => {
    expect(isPhotoRich({ coverImage: "a.jpg" })).toBe(true);
    expect(isPhotoRich({ coverImage: null })).toBe(false);
    expect(isPhotoRich({ coverImage: null, images: [{ url: "b.jpg" }] })).toBe(true);
  });
  it("is aggregate only for layout switches, and demands every item have a cover", () => {
    expect(isAggregatePhotoRich([{ coverImage: "a.jpg" }, { coverImage: "b.jpg" }])).toBe(true);
    expect(isAggregatePhotoRich([{ coverImage: "a.jpg" }, { coverImage: null }])).toBe(false);
    expect(isAggregatePhotoRich([])).toBe(false);
  });
});

describe("gallery", () => {
  it("needs three images to fill the mosaic exactly", () => {
    expect(galleryLayout(3)).toBe("mosaic");
    expect(galleryLayout(2)).toBe("single");
    expect(galleryLayout(0)).toBe("single");
  });
  it("only counts the photos past the mosaic in the pill", () => {
    expect(galleryPillLabel(3)).toBe("View photos");
    expect(galleryPillLabel(11)).toBe("All 11 photos");
  });
});

describe("showRelated", () => {
  it("needs two others — a single related card looks like an error", () => {
    expect(showRelated(2)).toBe(true);
    expect(showRelated(1)).toBe(false);
    expect(showRelated(0)).toBe(false);
  });
});
```

- [ ] **Step 2: Write the failing inventory tests**

```ts
import { describe, it, expect } from "vitest";
import { packageCountLine, locationMeta, packagesHereHeading, staysHeading, resultCount } from "./inventory";

describe("inventory copy", () => {
  it("hides thin inventory behind a forward-looking line at three or fewer", () => {
    expect(packageCountLine({ packages: 2, locations: 2 })).toBe("More islands added as we open them up");
    expect(packageCountLine({ packages: 3, locations: 3 })).toBe("More islands added as we open them up");
  });
  it("states real counts past three", () => {
    expect(packageCountLine({ packages: 5, locations: 6 })).toBe("5 packages across 6 islands");
  });
  it("singularises everything", () => {
    expect(locationMeta({ packages: 1, accommodations: 0 })).toBe("1 package");
    expect(locationMeta({ packages: 2, accommodations: 0 })).toBe("2 packages");
    expect(resultCount(1, false)).toBe("1 package");
    expect(resultCount(5, false)).toBe("5 packages");
    expect(resultCount(0, true)).toBe("No packages");
  });
  it("prefers stays over packages in location meta only when there are no packages", () => {
    expect(locationMeta({ packages: 0, accommodations: 3 })).toBe("3 stays");
    expect(locationMeta({ packages: 0, accommodations: 0 })).toBe("Coming soon");
  });
  it("singularises the location-detail heading", () => {
    expect(packagesHereHeading({ count: 1, locationName: "Baa Atoll" })).toBe("The Baa Atoll package");
    expect(packagesHereHeading({ count: 3, locationName: "Baa Atoll" })).toBe("Packages in Baa Atoll");
  });
  it("switches the stays heading at two", () => {
    expect(staysHeading(2)).toBe("The islands we sell");
    expect(staysHeading(6)).toBe("Every island we sell");
  });
});
```

Note `locationMeta({ packages: 0, accommodations: 0 })` → `"Coming soon"`: Thulusdhoo has zero of both today and the prototypes never covered it.

- [ ] **Step 3: Run both to verify failure**

Run: `npx vitest run lib/design` → FAIL, modules not found.

- [ ] **Step 4: Implement both modules**

- [ ] **Step 5: Run to verify pass**

Run: `npx vitest run lib/design` → all pass.

- [ ] **Step 6: Commit**

```bash
git add lib/design/
git commit -m "feat(density): derive layout and inventory copy from real counts"
```

---

### Task 6: Data layer — one query shape per page

**Files:**
- Rewrite: `lib/data/packages.ts`, `lib/data/locations.ts`, `lib/data/home.ts`
- Create: `lib/data/accommodations.ts` (replacing the thin existing one), `lib/design/stay-types.ts`

**Interfaces:**
- Consumes: `lib/design/{pricing,availability,density,inventory}` from Tasks 3–5.
- Produces: one exported type and one loader per page, each returning **exactly** what its page renders — no over-fetching, no client-side derivation:
```ts
// lib/data/packages.ts
export interface PackageCard {
  id: string; slug: string; name: string; shortDesc: string | null;
  atoll: string; locationName: string; locationSlug: string;
  nights: number;                      // from minNights
  stay: string;                        // accommodation.name + type
  transfer: string | null;             // location.transferType + transferTime
  mealPlan: string | null;
  badge: string | null;
  coverImage: string | null;
  photoRich: boolean;
  price: PackagePrice | null;
  lifecycle: PackageLifecycle;
}
export async function getPackageCards(opts?: { featuredOnly?: boolean; locationSlug?: string; market?: Market }): Promise<PackageCard[]>
export async function getPackageDetail(slug: string, market?: Market): Promise<PackageDetail | null>
export async function getFilterOptions(): Promise<{ tags: TagOption[]; locations: LocationOption[]; accommodationTypes: AccommodationType[] }>
```
`getPackageCards` sorts `open` and `upcoming` before `ended`, then by `isFeatured`, then `sortOrder`. `PackageDetail` adds `longBlurb`, `bestMonths`, ordered `images`, `inclusions` grouped by category, `activities` (with `note`, `isIncluded`), `faqs`, `blackouts`, `tags`, and `relatedCount`.

- [ ] **Step 1: Add the `nights` accessor and stop leaking `minNights`**

The designs say "4 nights" everywhere. `minNights` is the sold length (populated 4,5,5,6,4); `maxNights` is the extendable ceiling. Map `nights: pkg.minNights` at the data-layer boundary so no component ever reads `minNights` — the "can we add nights" FAQ covers the range.

- [ ] **Step 2: Build `transfer` and `stay` display strings in the loader**

`transfer` = `` `${titleCase(location.transferType)}, ${location.transferTime} min` `` when both are present, else null so the spec row drops. `stay` = `accommodation.name`; the spec sheet's "Stay" value uses the accommodation type where the design shows a type ("Water villa, 1 bedroom" comes from `RoomType.name` when one exists, else `accommodation.type` title-cased).

- [ ] **Step 3: Attach `_count` everywhere a count is displayed**

`Location` loaders include `_count: { select: { packages: true, accommodations: true } }`. Feed `locationMeta()` from Task 5. Never hardcode an inventory number — §1.2.

- [ ] **Step 4: Add `lib/design/stay-types.ts`**

```ts
export interface ResolvedStayType { id: string; name: string; band: string; blurb: string; nightlyFrom: number | null }
export async function getStayTypes(): Promise<ResolvedStayType[]>                 // all five, always
export async function getStayTypesForLocation(locationId: string): Promise<ResolvedStayType[]>  // overrides applied
```
`getStayTypesForLocation` left-joins `LocationStayType` and prefers its `blurb` / `nightlyFrom` when non-null — this is why Baa shows a $95 guesthouse against the global $65.

- [ ] **Step 5: Verify against real rows**

```bash
npx tsx -e "import {getPackageCards} from './lib/data/packages'; getPackageCards().then(r=>console.table(r.map(({name,nights,mealPlan,transfer,photoRich,lifecycle,price})=>({name,nights,mealPlan,transfer,photoRich,lifecycle,pp:price?.perPerson}))))"
```
Expected: 5 rows; `lifecycle: "open"` on all (every window is NULL today); `photoRich: true` on all (each has a cover); `price.perPerson` = 450 / 650 / 2750 / 5000 / 375.

- [ ] **Step 6: Commit**

```bash
git add lib/data/ lib/design/stay-types.ts
git commit -m "feat(data): page-shaped loaders with derived nights, transfer, price and lifecycle"
```

---

### Task 7: Admin — editors for every new field

Admin keeps its existing visual language (out of redesign scope). This task only adds the editing surfaces, so staff can actually populate what the pages read.

**Files:**
- Create: `lib/actions/{faqs,room-types,facilities,blackouts,seasons,stay-types,tags}.ts`
- Modify: `app/admin/(authenticated)/packages/[id]/package-form.tsx` (new tabs: Dates & Availability, FAQs, Tags; new Basic-Info fields)
- Modify: `app/admin/(authenticated)/locations/[id]/location-form.tsx` (new tabs: Season, Stay types, FAQs; new fields)
- Modify: `app/admin/(authenticated)/accommodations/[id]/accommodation-form.tsx` (new tabs: Rooms, Facilities, FAQs; new fields)
- Create: `app/admin/(authenticated)/stay-types/` (list + edit — global reference content)
- Modify: `components/admin/layout/admin-sidebar.tsx` (add Stay types)

**Interfaces:**
- Produces: `updatePackageFaqs(packageId, items)`, `updatePackageBlackouts(packageId, ranges)`, `updatePackageTags(packageId, tagIds)`, `updateLocationSeason(locationId, months)`, `updateLocationStayTypes(locationId, rows)`, `updateAccommodationRooms(accommodationId, rooms)`, `updateAccommodationFacilities(accommodationId, items)` — each `(id, rows) => Promise<{ success: boolean; error?: string }>`, session-guarded, `revalidatePath` on the admin route and `/`.

- [ ] **Step 1: Scaffold the actions from the existing pattern**

Copy the shape of `updatePackageActivities` in `lib/actions/packages.ts`: session check → `$transaction([deleteMany, createMany])` → `revalidatePath` → `{ success: true }`. Keep `sortOrder` implicit from array index.

- [ ] **Step 2: Add the new scalar fields to the three forms**

Package: Meal plan, Board basis (select), Badge, Best months, Long blurb. **Relabel the pricing inputs** to "Total for two (whole package)" and "Single occupancy (whole package)" so nobody enters a nightly rate again. Location: Region, Known for, Best months, Season highlight label. Accommodation: House reef, Suits, Board options, What's absent.

- [ ] **Step 3: Build the Season editor**

Twelve rows, each a month with a three-way choice (Best / Highlight / Wetter / unset). The `Highlight` band's label comes from `Location.seasonHighlightLabel`, so show that field adjacent with helper text: "Names the middle band in the calendar, e.g. Mantas."

- [ ] **Step 4: Build the Dates & Availability tab**

Travel window start/end, booking window start/end (all four already exist on `Package` and are already wired — they just need prominence), plus a repeatable blackout list of start/end/reason. Show the derived lifecycle inline via `lifecycleOf()` so staff see "This package currently reads as: Ended" while editing.

- [ ] **Step 5: Verify each editor round-trips**

For each: `npm run dev`, log in at `/admin/login`, edit, save, reload, confirm persistence, then confirm the public page reflects it. Specifically set a travel window ending in the past on one package and confirm it greys on `/packages` (this is the only way to see the expiry work — every window is NULL today).

- [ ] **Step 6: Verify and commit**

```bash
npx tsc --noEmit && npm run lint && npm run build
git add lib/actions/ "app/admin/(authenticated)/" components/admin/
git commit -m "feat(admin): editors for FAQs, rooms, facilities, blackouts, season, stay types, tags"
```

---

## Phase 2 — Design system

### Task 8: `app/globals.css` token rewrite

**Files:**
- Rewrite: `app/globals.css` (1,474 lines → under 200)

**Interfaces:**
- Produces: the `:root` token block and `@theme inline` mapping every later task consumes. Semantic aliases `--text-meta` (`#707070`) and `--text-meta-inverse` (`#AFAFAF`) are the **only** sanctioned way to reach those two greys.

- [ ] **Step 1: Replace the whole file**

Keep `@import "tailwindcss";`, the `@theme inline` mapping, the base reset and `body`. Delete: both colour ramps, `--maldives-*`, the entire ~90-class glass/pill/card/image-card/icon-btn/hero/carousel utility layer, the keyframes, and the `prefers-color-scheme: dark` block (the system is light-only). Write the Global Constraints tables above as tokens, plus the two glass recipes and the `@supports` fallback.

- [ ] **Step 2: Prove nothing references a deleted token**

```bash
grep -rn "color-primary-\|color-accent-\|maldives-\|glass-card\|card-clean\|image-card\|icon-btn-circle\|pill-outline\|hero-carousel-card" app components | grep -v node_modules
```
Expected at this point: hits only in files Tasks 9–24 will rewrite or delete. **Record the list** — Task 26 closes it out to zero.

- [ ] **Step 3: Verify the build still compiles**

Run: `npm run build`. Tailwind v4 fails loudly on an unresolvable `@theme` reference, so a pass means the token graph is sound.

- [ ] **Step 4: Screenshot the damage deliberately**

`npm run dev`, screenshot `/` — it will look broken, and that is expected: the old components reference deleted classes. Confirm no *build* or *runtime* error, only visual regression.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(tokens): replace two palettes and 90 utility classes with one token block"
```

---

### Task 9: Primitives — 14 components to 7

**Files:**
- Rewrite: `components/ui/{button,card,section,pill,badge,input,container}.tsx`
- Delete: `components/ui/{avatar,icon-button,image-card,slide-counter,skeleton,icons}.tsx`
- Modify: `components/ui/index.ts`

**Interfaces:**
- Produces:
```ts
// button.tsx — 8 variants → 4 plus one boolean
type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";   // 36 / 44 / 52 / 44×44, all rounded-full
interface ButtonProps { variant?: ButtonVariant; size?: ButtonSize; onImage?: boolean; isLoading?: boolean }
// onImage: primary → solid white with ink text; outline → the glass-light recipe

// card.tsx — 8 variants → 3
type CardVariant = "default" | "image-overlay" | "elevated";
// default: white, 1px #D9D9D9, radius 16, shadow ON HOVER ONLY + translateY(-2px)
// image-overlay: radius 24, mandatory scrim
// elevated: the booking rail — the only card with a resting shadow

// section.tsx — drop the five maldives-* surfaces
type SectionTone = "plain" | "muted" | "inverse";
```
Focus ring is `2px #24B1B1` at `2px` offset on every interactive primitive and **is never removed**.

- [ ] **Step 1: Rewrite `button.tsx`**

Delete `secondary`, `dark`, `white`, `white-outline`, `glass`. Exact colours: primary ink `#1C1B1B` / hover `#212121`; accent `#007979` / hover+press `#005C5C`; outline white with `1px #D9D9D9`, hover border `#AFAFAF` + bg `#F8F8F8`; ghost transparent `#3F3D3D`, hover bg `#F8F8F8`.

- [ ] **Step 2: Rewrite `card.tsx`, `section.tsx`, `pill.tsx`, `badge.tsx`, `input.tsx`, `container.tsx`**

`input.tsx`: 48px, radius 8, `1px #D9D9D9`, placeholder `--text-meta`; focus `1px #24B1B1` plus `0 0 0 3px rgba(36,177,177,0.18)`. `pill.tsx`: heights 36/44 to line a filter row up with a CTA; the selected filter is the one place `teal-tint` fills a surface. `container.tsx`: max-width 1200px, padding 32 desktop / 20 mobile.

- [ ] **Step 3: Delete the five dead primitives and `icons.tsx`**

`lucide-react` covers every icon the designs use (the `✦` marks are text glyphs). Update `components/ui/index.ts`.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit   # will list every old call site — expected; Tasks 11-24 clear them
npm run build
```
If a file that Tasks 11–24 will delete anyway blocks the build, delete it now rather than patching it.

- [ ] **Step 5: Commit**

```bash
git add components/ui/
git commit -m "refactor(ui): collapse 14 primitives to 7 per the design spec"
```

---

### Task 10: Shared shell — glass, nav (three forms), footer

**Files:**
- Create: `components/layout/glass.tsx`, `components/layout/page-head.tsx`
- Rewrite: `components/layout/nav-bar.tsx`, `components/layout/footer.tsx`
- Delete: `components/layout/{listing-hero,page-hero}.tsx`

**Interfaces:**
- Produces:
```ts
type NavSurface = "glass" | "solid";
interface NavBarProps { surface: NavSurface; active: "home" | "packages" | "locations" | "stays" | "guide"; cta?: { label: string; href: string } }
interface PageHeadProps { eyebrow: string; title: string; lede?: string; image: string | null; photoCaption?: string; minHeight?: 380 | 640; active: NavBarProps["active"]; cta?: NavBarProps["cta"] }
```

- [ ] **Step 1: Build `glass.tsx`**

The one recipe, two tiers, with the `@supports` fallback. Export `glassLight` and `glassDark` class strings so call sites cannot invent variants. Enforce the rule in a comment: over photography only, never flat ground, at most twice per screen.

- [ ] **Step 2: Rewrite `nav-bar.tsx` with three forms**

Glass over photo (Home, Packages, Locations, Accommodations) · solid white with an `#F8F8F8` inner pill, ink active state and ink CTA (Package/Location/Accommodation Detail, Guide, Contact). Labels Home / Packages / Locations / **Stays** / Guide. CTA text differs by page: "See packages ↗" on Home, "Book now ↗" on the other glass heads, "Book now" unadorned on solid. The `↗` glyph is `#007979`. **Nav text on glass is full-opacity `#FFFFFF`** — this is the specific thing the current file gets wrong. Mobile menu uses `glassDark`.

- [ ] **Step 3: Build `page-head.tsx`**

The 380px band shared by Packages / Locations / Accommodations, and the 640px Home hero. **The scrim is not optional** — it ships inside this component so no page can forget it. Home: `rgba(28,27,27,0.5) → 0.1 @42% → 0.74`. The 380px heads: `0.52 → 0.18 @45% → 0.7`. When `image` is null, fall back to `linear-gradient(145deg, #007979 0%, #1C1B1B 55%, #212121 100%)` and **omit the photo caption** (captions are a review affordance).

- [ ] **Step 4: Rewrite `footer.tsx`**

Byte-identical across all nine pages, so it takes no props. `#1C1B1B` ground, Playfair italic wordmark, two link columns (Browse: Packages, Locations, Stays, Guide · Company: Contact, Terms, Privacy), `1px #3F3D3D` divider, `© 2026 Island Hype`. **All footer text is `#AFAFAF`** (`--text-meta-inverse`) — `#707070` fails on this ground.

- [ ] **Step 5: Visual check**

Point one page at `PageHead` + `NavBar` + `Footer` temporarily, screenshot at 1440px and 400px, and confirm: nav labels legible against the brightest part of the image, no horizontal scroll at 400px, footer contrast correct.

- [ ] **Step 6: Commit**

```bash
git add components/layout/
git commit -m "feat(shell): glass recipe, three-form nav with mandatory scrim, shared footer"
```

---

## Phase 3 — Patterns

These are the composite pieces that recur across screens. Building them once here is what stops the padding drift the brief calls out (`p-4` / `p-5` / `p-6` / `p-8` on sibling cards in the current build). **Every pattern in this phase must be checked at 1440px and 400px before its task is committed.**

### Task 11: Package card — three forms, one data shape

**Files:**
- Create: `components/patterns/package-card.tsx`, `components/patterns/spec-sheet.tsx`
- Delete: `components/packages/package-card.tsx`

**Interfaces:**
- Consumes: `PackageCard` from Task 6, `Button`/`Card`/`Badge` from Task 9.
- Produces: `<PackageCard pkg={PackageCard} form="grid" | "row" | "compact" />` and `<SpecSheet rows={{label, value}[]} layout="stacked" | "grid3" />`.

Appears on four pages (Home, Packages grid, Location Detail, Package Detail related), so it is built once. All eight required facts: location, nights, accommodation type, transfer type and duration, meal plan, price per person, total price, photo.

- [ ] **Step 1: Build `spec-sheet.tsx`**

`stacked` (grid form): three label/value rows, hairline `border-top` each and `border-bottom` on the last, mono 11px uppercase labels left in `--text-meta`, 14px values right-aligned in ink. `grid3` (row form): **a fixed `repeat(3, minmax(0, 1fr))` grid with `gap: 24px`, labels above values** — never a wrapping flex row. **Rows with a null value are omitted entirely**, so a package with no meal plan shows two rows, not an empty hairline.

- [ ] **Step 2: Build the grid form**

`flex: 1 1 340px; max-width: 420px; min-width: 0`, column flex, radius 16, `1px #D9D9D9`. Image well `aspect-ratio: 4/3` with the badge pill top-left (white bg, `#007979` text, radius 12, height 24) and — **only in development** — the mono photo caption. Body padding **20px**. Eyebrow row: mono `{atoll} · {nights} nights`; when `!photoRich` the badge moves here at the right in `teal-tint`. Title `22/28` with **`min-height: 56px`**. Then the spec sheet. Price block pinned with `margin-top: auto`: `24px/600` per-person, `13px --text-meta` total beneath, 40px ink pill **"See the package"** right.

- [ ] **Step 3: Build the row form**

Three flex children, bases **240 / 320 / 200 = 760** (must sum under the container). Photo `min-height: 260px`; content padding **24px** with eyebrow, `24/30` title, `15/23` blurb capped `max-width: 40em`, then `SpecSheet layout="grid3"`; price rail on an **`#F8F8F8` ground, not a `border-left`**, `align-items: flex-start; justify-content: flex-end`, `28px/600` per-person, total beneath, then two 44px pills — "See the package" (ink) and "Check my dates" (outline).

- [ ] **Step 4: Build the compact form**

Package Detail's related cards: `flex: 1 1 300px; max-width: 400px`, 4:3 image, eyebrow, title `20/26` with `min-height: 52px`, then a hairline-topped footer with `20px/600` per-person and a teal "View →". No spec sheet.

- [ ] **Step 5: Handle the `ended` lifecycle**

When `pkg.lifecycle === "ended"`: wrap at `opacity: 0.55`, add a mono `Ended` marker in `--text-meta` beside the eyebrow, and keep the card a link. When `"upcoming"`: a mono `From {month}` marker instead. Never grey out an `open` package.

- [ ] **Step 6: Verify all three forms against real data**

Temporarily render all three on `/packages` with the 5 real packages. Confirm: titles of one and two lines leave the spec rows aligned; prices align across siblings; the row form does not wrap its third child at 1024px; a package with `mealPlan: null` shows two spec rows cleanly.

- [ ] **Step 7: Commit**

```bash
git add components/patterns/package-card.tsx components/patterns/spec-sheet.tsx
git rm components/packages/package-card.tsx
git commit -m "feat(patterns): package card in grid, row and compact forms"
```

---

### Task 12: Detail-page patterns — gallery, at-a-glance, step rows, FAQ rows

**Files:**
- Create: `components/patterns/{gallery,at-a-glance,step-rows,faq-rows}.tsx`
- Delete: `components/packages/package-gallery.tsx`, `components/accommodations/accommodation-gallery.tsx`

**Interfaces:**
- Consumes: `galleryLayout`, `galleryPillLabel` from Task 5.
- Produces:
```ts
<Gallery images={{url, alt}[]} fallbackCaption?: string />          // mosaic | single, derived
<AtAGlance cells={{label, value}[]} layout="grid2" | "autoFit" />   // omits null-value cells
<StepRows steps={{label, body}[]} note?: string />                  // "Getting there"
<FaqRows items={{question, answer}[]} />                            // "Worth knowing"
```

- [ ] **Step 1: Build `gallery.tsx`**

`mosaic` at `images >= 3`: one large frame (`flex: 2 1 400px; min-height: 420px`) plus two stacked (`flex: 1 1 200px`), `12px` gaps, radius 24. The count pill sits bottom-right of the third frame with `galleryPillLabel(total)`. `single` below three: one `aspect-ratio: 21/9; min-height: 320px` frame — better than a grid of grey boxes. **This is the branch that fires today**, since every image table is empty.

- [ ] **Step 2: Build `at-a-glance.tsx`**

`grid2` = fixed `repeat(2, minmax(0, 1fr))`, `gap: 0 32px`, hairline `border-top` per cell (Package Detail: location, nights, stay, transfer, meals, best months — six cells; Accommodation Detail: island, transfer, rooms, board, house reef, suits). `autoFit` = `repeat(auto-fit, minmax(200px, 1fr))` (Location Detail: transfer, best months, known for, we run). **Cells with a null value are omitted**, so the grid stays even rather than showing a label with nothing under it.

- [ ] **Step 3: Build `step-rows.tsx`**

Hairline rows, `flex: 0 0 84px` mono step label, body `15/23`, closing rule, then an optional `--text-meta` note. Used by Package Detail and Location Detail "Getting there", both of which close on the point that transfers are booked against real flight numbers so a delay moves the transfer rather than losing it.

- [ ] **Step 4: Build `faq-rows.tsx`**

One row per item on hairline `border-top`, question `17/24` weight 500, answer `15/23` in `--text-meta`-adjacent ink-700 capped at `34em`, closing `border-bottom` on the last. **Renders nothing at all when `items` is empty** — no heading, no rule.

- [ ] **Step 5: Verify the empty and thin paths**

Confirm: `Gallery` with the 1 real cover renders the 21:9 single frame, not a broken mosaic; `FaqRows` with `[]` renders nothing; `AtAGlance` with three of six cells null renders three even cells.

- [ ] **Step 6: Commit**

```bash
git add components/patterns/
git commit -m "feat(patterns): gallery, at-a-glance, step rows and FAQ rows"
```

---

### Task 13: Section patterns — stay types, numbered steps, editorial split, trust band, closing CTA, empty panels

**Files:**
- Create: `components/patterns/{stay-type-card,numbered-steps,editorial-split,trust-band,closing-cta,empty-panel}.tsx`
- Delete: `components/home/{how-to-book,featured-packages,section-carousel,hero-carousel}.tsx`

**Interfaces:**
- Produces:
```ts
<StayTypeCard stayType={ResolvedStayType} />                       // 3 pages, identical
<NumberedSteps steps={{title, body}[]} />                          // Home how-it-works, Contact what-happens-next
<EditorialSplit image="left" | "right" eyebrow title body rows={Row[]} link?={...} tone?="plain" | "muted" />
<TrustBand claims={string[]} meta: string />
<ClosingCta heading lede primary secondary framed?: boolean />
<EmptyPanel kind="dashed-sibling" | "no-results" ... />
```

- [ ] **Step 1: Build `stay-type-card.tsx`**

Appears on Home, Accommodations and Location Detail **identically**: padding **24px** (text-only), mono band eyebrow, `22/28` name, `15/23` blurb, then `margin-top: auto` footer on a `border-top` with "From ${nightlyFrom} a night". When `nightlyFrom` is null the footer row drops.

- [ ] **Step 2: Build `numbered-steps.tsx`**

40×40 `teal-tint` circles with `#007979` mono numerals, `20/26` title, `15/23` body, cards `flex: 1 1 240px; max-width: 380px`, padding 24. Home passes the four steps (choose → we confirm with the island → you pay → we sort transfers) — **no deposit percentages, no "we plan it for you"**. Contact passes its three.

- [ ] **Step 3: Build `editorial-split.tsx`**

`repeat(auto-fit, minmax(300px, 1fr))`, `gap: 56px`, `align-items: center`. Photo 4:5 portrait, radius 24. Uses `order: 1` / `order: 2` so the `image="right"` variant **stacks text-first on narrow**. Rows are either numbered (`01`/`02`/`03` teal mono) or `✦`-marked; both are hairline-separated.

- [ ] **Step 4: Build `trust-band.tsx`, `closing-cta.tsx`, `empty-panel.tsx`**

Trust band: `1px #D9D9D9` bottom border, `✦` claims in `#24B1B1`, right-aligned mono meta. Closing CTA: `framed` = bordered radius-24 panel with 48px padding (Home, Locations, Accommodations); unframed on `#F8F8F8` (the detail pages). Empty panel: `dashed-sibling` is `1px dashed #AFAFAF` at the **same `flex: 1 1 340px; max-width: 420px` as a real card** so the row fills; `no-results` is the centred bordered radius-24 panel.

- [ ] **Step 5: Verify the thin-content devices**

Render `dashed-sibling` next to exactly one real card and confirm the row reads as an editorial choice rather than a loading failure. This fires on five of six locations today.

- [ ] **Step 6: Commit**

```bash
git add components/patterns/ && git rm -r components/home/
git commit -m "feat(patterns): stay types, numbered steps, editorial split, trust band, CTA, empty panels"
```

---

### Task 14: Booking rail and the date check

**Files:**
- Create: `components/patterns/booking-rail.tsx`, `components/patterns/date-check-form.tsx`
- Modify: `lib/schemas/inquiry.ts`, `lib/actions/contact.ts`
- Delete: `components/packages/{booking-card,booking-form}.tsx`

**Interfaces:**
- Consumes: `checkDates`, `lifecycleOf` from Task 4; `computePackagePrice` from Task 3.
- Produces: `<BookingRail pkg={PackageDetail} />`, `<DateCheckForm packageId nights minNights maxNights travel booking blackouts />`. Server action `submitDateEnquiry(formData)` returning `{ success: true } | { success: false; error: string }`.

- [ ] **Step 1: Build the rail shell**

`flex: 0 1 340px; position: sticky; top: 24px`, `Card variant="elevated"` — **the only card with a resting shadow**. Price, total, two fields, `Check these dates` (ink, 52px), `Ask us a question` (outline, 48px), then two teal-`✦` reassurance lines: we confirm with the island before you pay; same-day reply from Malé. **Do not wrap the rail in a container with `overflow: hidden`** or sticky breaks.

- [ ] **Step 2: Wire the date check**

On arrival-date and nights change, run `checkDates()` client-side and render the failure `message` inline beneath the field in `--text-meta` with a `3px` left border in `#AFAFAF` on `#F8F8F8` — **the brief's error treatment uses no red**: "a missing email is not an emergency". Re-validate server-side in the action; never trust the client.

- [ ] **Step 3: Handle the `ended` state**

When `lifecycle === "ended"`, replace the fields and primary button with the dates-prompt fallback ("Tell us when you can travel and we'll suggest the nearest week") and keep `Ask us a question` live. Never present a bookable form for a package that cannot be booked.

- [ ] **Step 4: Extend the inquiry schema**

Add `nights`, and keep `checkIn`/`checkOut` as the persisted pair. Extend `bookingFormSchema` in `lib/schemas/inquiry.ts` with a `superRefine` that calls the same `checkDates` so client and server share one rule.

- [ ] **Step 5: Verify end to end**

Submit a valid enquiry → row appears in `Inquiry`. Submit dates outside a window you set in admin → rejected with the inline message, no row written. Submit inside a blackout → rejected naming the reason.

- [ ] **Step 6: Commit**

```bash
git add components/patterns/ lib/schemas/ lib/actions/contact.ts
git rm components/packages/booking-card.tsx components/packages/booking-form.tsx
git commit -m "feat(booking): sticky rail with shared client/server date validation"
```

---

### Task 15: Toolbar, filters and active chips

**Files:**
- Create: `components/patterns/{toolbar,filter-pills,active-filter-chips}.tsx`
- Delete: `components/packages/{package-filters,sort-dropdown}.tsx`, `components/locations/location-filters.tsx`, `components/accommodations/accommodations-filters.tsx`

**Interfaces:**
- Consumes: `packageListDensity` from Task 5, `getFilterOptions` from Task 6.
- Produces: `<Toolbar count lede quickPills filterBar sort tags active />`. Filter state lives in the URL via `searchParams` (server-read) — **not `nuqs`, which is being removed as unused**.

- [ ] **Step 1: Build the toolbar**

Bottom-bordered, result count + hint left, affordances right, scaled by `packageListDensity`. Quick pills at `3 <= n < 6`; the full `Filters (2)` + sort control at `n >= 6`. The count badge on `Filters` is `teal-tint` with `#007979` text.

- [ ] **Step 2: Build the active-filter chip row**

Second row when filters are active: `teal-tint` ground, `1px #24B1B1` border, `#007979` text, `×` per chip, plus a "Clear all". **This row stays visible above the no-results panel** so the cause of zero results is legible — the specific reason `showFilterBar` is forced true in the empty state.

- [ ] **Step 3: Verify against real counts**

`/packages` has 5 active packages today → quick pills visible, full bar hidden. `/accommodations` has 6 → full bar visible. Apply a tag filter that matches nothing and confirm the chips remain above the panel.

- [ ] **Step 4: Commit**

```bash
git add components/patterns/ && git rm components/packages/package-filters.tsx components/packages/sort-dropdown.tsx components/locations/location-filters.tsx components/accommodations/accommodations-filters.tsx
git commit -m "feat(patterns): density-scaled toolbar, filter pills and active chips"
```

---

## Phase 4 — Pages

Each page task follows the same rhythm: read its prototype, compose patterns, verify every density branch, screenshot at 1440px and 400px, commit. **A page task is not done until `npx tsc --noEmit`, `npm run build` and both screenshots are clean.**

### Task 16: Home — `app/page.tsx`

**Spec:** `Home.dc.html` + README §5.1. **Files:** rewrite `app/page.tsx`; delete `components/home/` (done in Task 13).

Ten sections in order: Hero (640px, `PageHead`) → `TrustBand` → `EditorialSplit image="left"` ("A country made almost entirely of water.") → Packages (`PackageCard form="grid"`, filters at `n >= 6`, closing "See all packages →" pill + `packageCountLine`) → `EditorialSplit image="right" tone="muted"` ("Your flight lands. Everything after that is ours.") → Locations (`locationsLayout({ tilesMin: 4 })`) → Stay types (**all five**) → `NumberedSteps` (four) → `ClosingCta framed` → `Footer`.

- [ ] Step 1: Read `Home.dc.html`, transcribe copy verbatim
- [ ] Step 2: Compose the ten sections against `getPackageCards({ featuredOnly: true })`, `getLocations()`, `getStayTypes()`
- [ ] Step 3: Verify branches — 4 featured → no filter pills; 6 locations → tiles; force `photoRich: false` locally and confirm the one-frame-plus-numbered-rows fallback
- [ ] Step 4: Screenshot 1440 + 400; confirm no horizontal scroll, hero legible, 96/56px rhythm
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(home): rebuild against the new design system"`

### Task 17: Packages listing — `app/packages/page.tsx`

**Spec:** `Packages.dc.html` + README §5.2. Page head (380px, CTA "Book now ↗") → `Toolbar` → results (`rows` at `n <= 4`, `grid` at `n >= 5`) → dates prompt → `EmptyPanel kind="no-results"` when `results.length === 0` → "In every price above" (three cards on `#F8F8F8`; the third is **not** included, eyebrow in `#707070` not `#007979`) → footer.

- [ ] Step 1: Read the prototype; transcribe the three "in every price" cards verbatim
- [ ] Step 2: Compose, reading filters from `searchParams`
- [ ] Step 3: Verify all four states — 5 real packages → grid + quick pills; filter to 2 → rows; filter to 0 → panel with chips above; `n >= 6` needs a temp row to exercise the full bar
- [ ] Step 4: Screenshot every state at both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(packages): listing with density-switched layout and empty state"`

### Task 18: Package detail — `app/packages/[slug]/page.tsx`

**Spec:** `Package Detail.dc.html` + README §5.4. Solid nav → breadcrumb → title block with price set right of the heading → `Gallery` → body `flex: 1 1 420px` + `BookingRail flex: 0 1 340px`, wrapping. Sections: `AtAGlance grid2` (six cells) → Overview (`longBlurb`, two paragraphs, `17/28`, `max-width: 34em`) → **Suggestions** (from `activities`, `isIncluded` → Included/Optional mono tag, `note` overriding the activity blurb, **section drops entirely when empty** — true for 3 of 5 packages) → "What the price covers" (two columns: included with teal `✦` and an `#007979` eyebrow; not included with `#AFAFAF` em-dashes and a `#707070` eyebrow) → `StepRows` "Getting there" + square map frame → `FaqRows` "Worth knowing" → related (`showRelated(otherCount)`, else dates prompt) → footer.

- [ ] Step 1: Read the prototype. **The "Day by day" section is replaced by Suggestions** — no numbered day circles, no Arrival/Guided/Departure tags
- [ ] Step 2: Compose against `getPackageDetail(slug)`
- [ ] Step 3: Verify — Maafushi (4 suggestions, 3 related) vs Baros (0 suggestions → section absent, no empty heading); sticky rail holds while scrolling; single 21:9 gallery (all image tables empty)
- [ ] Step 4: Screenshot both packages at both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(package-detail): suggestions, price breakdown and sticky booking rail"`

### Task 19: Locations index — `app/locations/page.tsx`

**Spec:** `Locations.dc.html` + README §5.5. Page head → **transfer comparison table first, before any imagery** (bordered radius-16 container, fixed `repeat(4, minmax(0, 1fr))`, mono header row on `#F8F8F8`, hairline rows, `#707070` footnote that seaplanes fly in daylight only) → atolls (`locationsLayout({ tilesMin: 5 })`) → "Pick the atoll by what you want to do" (three text cards) → `ClosingCta framed` → footer.

- [ ] Step 1: Read the prototype; transcribe the three choose-by-intent cards verbatim
- [ ] Step 2: Build `components/patterns/transfer-table.tsx`; rows drop cleanly when `transferType`/`transferTime` are null
- [ ] Step 3: Verify — 6 locations → tiles; force `photoRich: false` → alternating rows with the 2×2 facts grid; confirm Thulusdhoo (0 packages) renders "Coming soon" meta, not "0 packages"
- [ ] Step 4: Screenshot both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(locations): transfer comparison table and density-switched atoll list"`

### Task 20: Location detail — `app/locations/[slug]/page.tsx`

**Spec:** `Location Detail.dc.html` + README §5.6. Solid nav → breadcrumb → title → `Gallery` → `AtAGlance autoFit` (four cells) → overview (three paragraphs) → **season calendar** → `StepRows` "Getting there" → "Packages here" on `#F8F8F8` (`packagesHereHeading`, plus `EmptyPanel kind="dashed-sibling"` at exactly one package) → stay types for this location (overrides applied) → `ClosingCta` → footer.

- [ ] Step 1: Build `components/patterns/season-calendar.tsx`. Twelve cells, `repeat(auto-fit, minmax(76px, 1fr))`, each a radius-12 bordered box with a mono month label over a 6px bar: `#007979` best, `#24B1B1` highlight, `#D9D9D9` wetter. Legend above, using `Location.seasonHighlightLabel` for the middle band. **Write the twelve cells as literal markup, not a loop** — the brief is explicit that a templated value inside a `background` declaration cannot paint before data resolves. Render nothing when the location has no `SeasonMonth` rows.
- [ ] Step 2: Compose the page
- [ ] Step 3: Verify — every location has 1 package today, so the dashed sibling fires on all five with content; Thulusdhoo has 0 and must drop the card row entirely, keeping only the panel
- [ ] Step 4: Screenshot Baa-equivalent and Thulusdhoo at both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(location-detail): season calendar, packages-here with sibling panel"`

### Task 21: Accommodations index — `app/accommodations/page.tsx`

**Spec:** `Accommodations.dc.html` + README §5.7. Page head ("Where you sleep changes the whole trip.") → **five kinds of night first, before any listing** → toolbar (filters at `n >= 6`) → islands (`rows` at `n <= 4`, `grid` at `n >= 5`; row form has a fixed 3-track rooms/board/transfer grid and a price rail) → "We have stayed in every one of these" (`EditorialSplit image="right" tone="muted"`, three `✦` claims) → `ClosingCta framed` → footer.

- [ ] Step 1: Read the prototype; transcribe the three trust claims verbatim
- [ ] Step 2: Create `components/patterns/stay-card.tsx` (accommodation row/grid; distinct from `StayTypeCard`)
- [ ] Step 3: Verify — 6 accommodations → grid **and** the full filter bar (the only page tripping `n >= 6` on real data); `staysHeading(6)` → "Every island we sell"
- [ ] Step 4: Screenshot both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(accommodations): stay-type-led index with density-switched island list"`

### Task 22: Accommodation detail — `app/accommodations/[slug]/page.tsx`

**Spec:** `Accommodation Detail.dc.html` + README §5.8. Same shape as package detail. `Gallery` → `AtAGlance grid2` (island, transfer, rooms, board, house reef, suits) → three-paragraph overview that **includes the drawbacks** → room types as hairline rows with price/size/sleeps/access → facilities in two honest columns grouped by `Facility.group`, with the `absentNote` beneath in `--text-meta` → `FaqRows` → sticky rail headed **"Sold as a package"** with `See the package` and `Ask about a villa side`.

- [ ] Step 1: Read the prototype
- [ ] Step 2: Compose; **the rail states the package price, not a room rate**, because rooms are not sold standalone — the closing band says so explicitly
- [ ] Step 3: Verify — room types come from the `RoomType` rows migrated in Task 2 (names only, so price/size/sleeps/access cells drop until staff fill them); facilities and `absentNote` are empty today so both blocks must vanish
- [ ] Step 4: Screenshot both widths
- [ ] Step 5: `npx tsc --noEmit && npm run build`
- [ ] Step 6: `git commit -m "feat(accommodation-detail): rooms, facilities and package rail"`

### Task 23: Guide — `app/guide/page.tsx`

**Spec:** `Guide.dc.html` + README §5.9. Static TSX, prototype prose verbatim, **the only page on real photography**.

Article head on white (no photo band). Two-column body: sticky contents rail (`flex: 0 1 220px; position: sticky; top: 24px`, hairline-separated anchor links with mono numerals, current item weight 500) beside prose at `flex: 1 1 520px`. **Every paragraph capped at `34em`** — the rail does not make the measure safe on its own. Ten sections, each opening with a teal mono numeral, anchored `#geography #culture #when #island #transfers #cost #water #etiquette #pack #do`. §10 "Things to do" sits **outside** the two-column article at full 1200px so the six activity cards go three-up. Prose furniture: data tables (fixed 3-track grids, mono headers on `#F8F8F8`), a bordered callout, a pull quote (`border-left: 2px solid #24B1B1`, `19/30`, **no italics**), two-column compare cards, price rows as label/value hairlines.

- [ ] Step 1: Read `Guide.dc.html` in full and transcribe all ten sections verbatim. This is a **content expansion**: the current page has 6 sections, the prototype has 10, adding resort-or-local-island, what things cost, in the water, rules and etiquette, and what to pack
- [ ] Step 2: Re-point all 13 images from `islandhypemaldives.com/storage/...` to **relative** `/storage/v1/object/public/images/guide/...` — they currently hot-link production, which is fine for review and wrong for shipping. Every frame keeps an `#F8F8F8` ground as its loading state
- [ ] Step 3: Build the sticky contents rail with scroll-spy
- [ ] Step 4: Verify — all ten anchors jump correctly; rail highlights the current section; `#do` renders three-up at 1440 and one-up at 400; every image resolves (all 17 files are in `public/storage/v1/object/public/images/guide/`)
- [ ] Step 5: Screenshot top, mid-article and `#do` at both widths
- [ ] Step 6: `npx tsc --noEmit && npm run build`
- [ ] Step 7: `git commit -m "feat(guide): ten-section article with sticky contents rail and real photography"`

### Task 24: Contact — `app/contact/page.tsx`

**Spec:** `Contact.dc.html` + README §5.10. Form left (`flex: 1 1 440px`), details rail right (`flex: 0 1 320px`).

The form **leads with which package** — a select, not free text, because that is what the business sells, with the helper line "Not sure yet? Leave it on 'Still deciding' and say what you're after below." Then arrival / nights / travelling as a three-up row, a textarea prompting for flight times and dietary needs, and an opt-in checkbox. Inputs 48px, radius 8, `1px #D9D9D9`; focus `1px #24B1B1` + `0 0 0 3px rgba(36,177,177,0.18)`. Submit full-width 52px ink with the reassurance line beneath. **Sent and error states are mutually exclusive in production** (the prototype shows both for review); both use a `3px` left border — teal on `#E8F6F6` for success, `#AFAFAF` on `#F8F8F8` for the error — and **no red**. Rail: WhatsApp primary (teal `#007979` — the one place teal is a button fill), phone, **opening hours with Friday closed**, GMT+5 noted, a small 4:3 map. Closes with a three-step `NumberedSteps`.

- [ ] Step 1: Read the prototype; transcribe copy verbatim
- [ ] Step 2: Populate the package select from `getPackageCards()` plus a "Still deciding" option; exclude `ended` packages
- [ ] Step 3: Move the contact facts into `SiteSetting` — `contact.whatsapp`, `contact.phone`, `contact.hours`, `contact.mapImage` — so staff can edit them. **The prototype values (`+960 330 0000`, Sun–Thu 09:00–18:00, Sat 10:00–14:00, Fri closed) are placeholders and must be confirmed with the client before launch**
- [ ] Step 4: Verify — submit succeeds and writes an `Inquiry`; a missing email shows the grey error state, never red; the rail reads correctly at 400px
- [ ] Step 5: Screenshot both states at both widths
- [ ] Step 6: `npx tsc --noEmit && npm run build`
- [ ] Step 7: `git commit -m "feat(contact): package-led enquiry form with settings-backed contact rail"`

---

## Phase 5 — Finish

### Task 25: Asset pass

- [ ] Step 1: Map the four unused real images onto the page heads — `overwater-villas-aerial.jpg` → Home hero (16:9), `overwater-jetty-aerial.jpg` → Packages head (21:9), `island-aerial-heart.jpg` → Locations head, `island-resort-wide.jpg` → Accommodations head. Store as `SiteSetting` keys so staff can swap them
- [ ] Step 2: Rename the mislabelled files — `kaani-beach.jpg` and `thundi.jpg` are actually WebP. Rename to `.webp`, update the `Accommodation.coverImage` rows, and re-run the media sync so prod and local agree
- [ ] Step 3: Delete every placeholder artefact — the `repeating-linear-gradient` stripe, the mono `photo NN — …` captions, and the stand-in hero gradient wherever a real image now exists
- [ ] Step 4: Confirm each `next/image` has correct `sizes` and that `unoptimized: true` still holds (deliberate for the 1 GB box)
- [ ] Step 5: `git commit -m "feat(assets): wire real photography, drop placeholders"`

### Task 26: Admin token sweep

- [ ] Step 1: Re-run the Task 8 Step 2 grep. It must return **zero** hits outside `node_modules`
- [ ] Step 2: Fix every admin file still referencing a deleted token. Admin keeps its own density and layout — **only** swap dead variables for live ones. Do not redesign it
- [ ] Step 3: Verify every admin route renders: dashboard, packages, locations, accommodations, activities, offers, inquiries, settings, stay-types
- [ ] Step 4: `git commit -m "chore(admin): stop referencing deleted design tokens"`

### Task 27: Cleanup

- [ ] Step 1: Drop the twelve unused dependencies listed in File Structure. Verify each is truly unreferenced first: `grep -rl "<dep>" app components lib hooks types` → 0. Then `npm uninstall` them and confirm `npm run build` still passes
- [ ] Step 2: Delete every component in the File Structure "Deleted" list that still exists
- [ ] Step 3: Guard the seed. `prisma/seed.ts` opens with `deleteMany()` on every table and would now destroy the prod-cloned local data. Either delete it (the dump in `_migration/` is the fixture source) or refuse to run without `ALLOW_DESTRUCTIVE_SEED=1`
- [ ] Step 4: Create `app/terms/page.tsx` and `app/privacy/page.tsx` as `SiteSetting`-backed stubs — the footer links to both and neither exists
- [ ] Step 5: Fix `getBaseUrl()` in `lib/market.ts`, which points at `islandhype.com` / `mv.islandhype.com`; the real domain is `islandhypemaldives.com`. If the LOCAL/MVR market is not launching, leave the plumbing but note the hardcoded 15.42 rate needs a source before it does
- [ ] Step 6: Final sweep — `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`, then every route 200 and screenshotted
- [ ] Step 7: `git commit -m "chore: drop dead deps and components, add terms/privacy, guard the seed"`

### Task 28: Ship

- [ ] Step 1: **Baseline prod before anything else.** Prod has no migration history, so `migrate deploy` would try to recreate all 19 tables. Run `prisma migrate resolve --applied 0_init` against prod (SSH tunnel or on the box) and confirm `migrate status` is clean
- [ ] Step 2: Back up prod: `mysqldump --single-transaction islandhype | gzip` off-server, verified non-empty
- [ ] Step 3: Read every migration SQL file once more. Local MySQL is **9.6.0**, prod is **8.0.46** — do not assume locally-generated SQL runs on 8.0 unread
- [ ] Step 4: Apply migrations to prod, then rsync the renamed media
- [ ] Step 5: Deploy via `.github/workflows/deploy.yml` (GitHub Actions cloud-builds and rsyncs; **never build on the server — it OOMs**)
- [ ] Step 6: Verify production — all nine pages, admin login, one enquiry submission, images loading
- [ ] Step 7: Ask the client to populate the new nullable fields, since most sections stay hidden until they do

---

## Self-Review

**Spec coverage.** All nine screens (README §5.1–§5.10) map to Tasks 16–24. §1 density → Task 5 with every threshold tested. §1.2 inventory agreement → Task 5 `inventory.ts` + Task 6 `_count`. §1.3 zero-inventory floors → Task 13. §2 repeated-element sizing → Task 11 Steps 1–3 and the Global Constraints. §3 fluid layout → Global Constraints. §4 primitive refactor → Task 9. §6 glass → Task 10. §7 tokens → Task 8. §8 data requirements → Tasks 2 and 6. §9 assets → Task 25. §11 migration order → the phase order here, with schema inserted before pages because the brief's order predates the decision to ship on real data.

**Gaps deliberately left.** Two states the prototypes never designed: zero locations and zero accommodations. Real data has 6 of each and admin controls `isActive`, so Task 19 falls back to the nearest designed device rather than inventing a layout. The brief says to ask before inventing layouts, so **ask if inventory ever drops that far**.

**Three things the plan fixes that the brief got wrong about this codebase.** `globals.css` is 1,474 lines, not ~800. The §1.1 "hero carousel chrome at `n >= 3`" rule is vestigial — no prototype contains a carousel, and embla is unused. The gallery pill is always rendered with a switched label, not conditionally shown.

**Type consistency.** `PackageCard` (Task 6) is consumed by Tasks 11, 16, 17, 20, 24. `PackagePrice` (Task 3) by Tasks 6, 11, 14. `PackageLifecycle` (Task 4) by Tasks 6, 11, 14, 24. `ListDensity` (Task 5) by Tasks 15, 16, 17, 21. `ResolvedStayType` (Task 6) by Tasks 13, 16, 20, 21. One name per concept throughout.

---

## Execution

**Phase boundaries are the natural review points.** Phases 1–3 produce no visible change on their own; the site looks broken between Task 8 and Task 16 and that is expected. If a demo is needed mid-flight, Task 16 (Home) is the first point where the new design is visible end to end.
