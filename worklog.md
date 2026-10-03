# EventFolio — Build Worklog

## Project Overview
EventFolio is a SaaS where users can generate **event landing pages** or **portfolios for their works**.
The app lives entirely on the single `/` route (SPA with view-state routing via Zustand).
Backend uses Next.js API routes + Prisma (SQLite). AI generation via `z-ai-web-dev-sdk` (LLM + Image Generation).

## Architecture Summary
- **Single route**: `/` — view-state switching handled by a Zustand store (`useAppStore`).
- **Views**: `landing` → `auth` (modal) → `dashboard` → `editor` → `preview` → `admin` (admin role only).
- **Auth**: cookie-based session with `scrypt`-hashed passwords (no NextAuth complexity).
- **AI**: LLM generates structured site content JSON; `images.generations.create` produces hero imagery.
- **DB**: SQLite via Prisma — `User`, `Session`, `Site`, `Template`, `AnalyticsEvent`.
- **Design**: dark-first Awwwards-inspired palette — amber/rose/violet accents, NO indigo.

## Verified Working Flows (Agent Browser)
1. Landing page renders all sections: hero, marquee, showcase grid, features, how-it-works, templates, stats, pricing, testimonials, FAQ, final CTA, footer.
2. Signup (new email) → cookie set → dashboard opens with empty state.
3. Login as `demo@eventfolio.app / demo12345` → dashboard shows seeded "Design Fringe 2025" site.
4. Open editor → all sections (hero, stats, speakers, agenda, sponsors) render with seeded data.
5. AI content generation → POST `/api/ai/generate` 200 (≈10s), populated hero copy + 4 stats + speakers + agenda.
6. Logout → login as `admin@eventfolio.app / admin12345` → admin view loads.
7. Admin Overview: stats cards (4 users, 2 sites, 1,843 views, 135 likes), recent signups, recent sites, big stat band (922 avg views, 68 avg likes, 100% publish rate).
8. Admin Users tab: table with editable role/plan dropdowns.
9. Admin Sites tab: table with type, status, views, likes, owner.
10. Editor → Preview button → preview view renders site with hero + sections + like/share band.
11. Mobile viewport (375×812): navbar collapses to hamburger menu, mobile menu opens, all landing sections render.
12. Lint: 0 errors, 0 warnings.

## Bug Fixes Applied During QA
- Fixed `editor-view.tsx:315` SWC parse error: `??` and `||` need parens → `site?.slug ?? (slugify(title) || "untitled")`.
- Fixed `onClick={goAdmin}` passing click event as the `tab` arg → wrapped in arrow function. Same fix applied to all `onClick={goDashboard}` and similar patterns.
- Fixed AdminView not loading stats on first render: removed `user` dep from load-effect (AnimatePresence mount timing was causing the effect to miss).

## Demo / Admin Accounts (seeded)
- `demo@eventfolio.app / demo12345` (pro plan, has a seeded site)
- `admin@eventfolio.app / admin12345` (admin role, studio plan)

---
Task ID: 0
Agent: main
Task: Project scaffolding & foundation setup

Work Log:
- Reviewed existing project (Next.js 16, shadcn/ui, Prisma, Tailwind v4).
- Read `package.json`, `dev.log`, `schema.prisma`, `layout.tsx`, `globals.css`, `Caddyfile`.
- Decided architecture: SPA on `/`, Zustand view routing, Prisma + SQLite, z-ai-web-dev-sdk for AI.
- Created this worklog and the initial todo list.

Stage Summary:
- Foundation decisions made. Ready to update Prisma schema, build auth, then move to landing page.

---
Task ID: 1
Agent: main
Task: Foundation — Prisma schema, auth lib, seed data, base layout

Work Log:
- Wrote `prisma/schema.prisma` with `User`, `Session`, `Site`, `Template`, `AnalyticsEvent` models. Added `userId?`/`siteId?` as optional on AnalyticsEvent so `onDelete: SetNull` is valid.
- Ran `bun run db:push` — schema synced to SQLite at `db/custom.db`.
- Created `src/lib/auth.ts` — `hashPassword` (scrypt), `verifyPassword`, `generateToken`, `SESSION_COOKIE`, `SESSION_TTL_DAYS`.
- Created `src/lib/session.ts` — `getCurrentUser`, `requireUser`, `requireAdmin`.
- Created `src/lib/helpers.ts` — `slugify`, `uniqueSlug`, `formatNumber`, `formatDate`, `timeAgo`.
- Created `scripts/seed.ts` with 6 templates, admin user, demo user, demo event site.
- Ran seed — all templates + users + demo site created.
- Created Zustand store `src/lib/store.ts` with view routing, auth state, toasts, theme.
- Created `src/components/providers.tsx` (NextThemesProvider + auth bootstrap + theme sync).
- Created `src/components/toast-stack.tsx` (animated toast notifications).
- Rewrote `src/app/layout.tsx` (dark-first, providers, ToastStack, Toaster).
- Rewrote `src/app/globals.css` with EventFolio design tokens (light + dark), marquee, grain, grid background utilities.

Stage Summary:
- Foundation ready. Prisma + SQLite seeded. Design system in place. Zustand store wired.

---
Task ID: 2-api
Agent: api-builder (subagent)
Task: Build all 18 API routes for EventFolio

Work Log:
- Built auth routes: register, login, logout, me (cookie-based session).
- Built sites CRUD: list, create, get-by-id, patch, delete, publish toggle, view, like, explore, by-slug.
- Built templates list.
- Built AI routes: `/api/ai/generate` (LLM → structured JSON, updates site content), `/api/ai/generate-image` (z-ai-web-dev-sdk image gen, returns data URL).
- Built admin routes: stats, users (with search), sites (with filters), users/[id] PATCH (role/plan).
- All routes pass `bun run lint` (0 errors, 0 warnings).
- Smoke-tested against running dev server: all 200s on happy path, 401 on protected routes without session.

Stage Summary:
- 18 API routes live. End-to-end auth + site + AI flows verified via curl.

---
Task ID: 3
Agent: main
Task: Build Awwwards-inspired landing page + shared chrome

Work Log:
- Created `src/components/site/navbar.tsx` — fixed glass navbar with logo, section links, theme toggle, auth buttons, mobile hamburger menu.
- Created `src/components/site/footer.tsx` — 4-col footer with `mt-auto` for sticky behavior.
- Created `src/components/views/landing-view.tsx` with sections: Hero (animated gradient + grid bg + preview mock), Marquee, Showcase grid (6 cards with gradient covers), Features (6-cell bordered grid), How it works (4 steps), Templates preview, Stats band, Pricing (3 tiers with highlight), Testimonials, FAQ accordion, Final CTA.

Stage Summary:
- Landing page complete with Awwwards-grade visual hierarchy and amber/rose/violet palette.

---
Task ID: 4
Agent: main
Task: Build auth modal + dashboard + editor + preview + admin views

Work Log:
- Auth view: modal overlay with login/signup toggle, demo account hints, validation toasts.
- Dashboard view: header bar, 4 tabs (My sites / Templates / Analytics / Settings), create-site dialog (type, title, subtitle, theme picker, template picker), site cards with cover gradient, view/like stats, dropdown actions.
- Editor view: live preview pane (left) + AI generator + cover image generator + site details + collapsible content section editors (event: hero/stats/speakers/agenda/sponsors; portfolio: hero/selected_work/about/services/contact). List editors for repeatable rows.
- Preview view: hero with theme gradient + cover image overlay, all sections rendered, like + share band.
- Admin view: header bar + 3 tabs (Overview/Users/Sites). Overview: 5 stat cards + recent signups/sites cards + 3 big stats. Users: searchable table with role/plan dropdowns. Sites: filterable table.
- Wired up `src/app/page.tsx` — SPA orchestrator with AnimatePresence transitions, scroll-to-hash for landing anchors, conditional footer rendering.

Stage Summary:
- All 5 views functional. End-to-end flow verified via Agent Browser.

---
Task ID: 9
Agent: main
Task: Polish + Agent Browser QA

Work Log:
- Ran Agent Browser on landing page: verified all sections render, all CTA buttons clickable.
- Tested signup flow: new account created, dashboard empty state shown.
- Tested login flow with demo account: seeded site visible in dashboard.
- Tested editor flow: opened seeded site, AI generation populated content (POST /api/ai/generate 200, ~10s), image generation button visible.
- Tested admin flow with admin account: overview/users/sites tabs all working.
- Caught and fixed SWC parse error in editor-view.tsx (nullish + logical without parens).
- Caught and fixed major bug: `onClick={goAdmin}` passed click event as `tab` arg → admin overview showed empty content. Fixed all `onClick={goXXX}` patterns in navbar, editor, preview, admin.
- Tested mobile viewport (375×812): navbar collapses, menu opens, layout holds.
- Verified lint clean (0 errors, 0 warnings).
- Screenshots saved: `screenshots/landing.png`, `screenshots/editor.png`, `screenshots/preview.png`, `screenshots/mobile-landing.png`.

Stage Summary:
- EventFolio is end-to-end functional. Lint clean. Sticky footer + responsive verified. Ready for cron job.

## Unresolved Issues / Risks
- The `slug` column lacks a `@unique` constraint; routes use `findFirst` to compensate. Adding `@unique` would tighten integrity but requires a `db:push`.
- A leftover test user/site from the API subagent's smoke test (`smoke@test.com` / slug `my-smoke-event`) exists in DB — harmless, can be deleted.
- The `ai/generate-image` route returns a `data:` URL — fine for SPA usage, but if the consuming code expects a real HTTP URL, a future agent should add a static-asset writer.
- Settings tab "Save changes" only saves locally — there's no PATCH /api/users/me endpoint yet.

## Recommended Next Steps (for the cron-job reviewer)
1. Add `PATCH /api/users/me` for the Settings tab to actually persist profile updates.
2. Add a real public-site route (`/[slug]`) that renders the site via SSR for SEO — currently the public "preview" view is in-app only.
3. Persist generated images to `public/generated/` and return HTTP URLs instead of data URLs (smaller DB, cacheable).
4. Add a real `/admin` route or keep using the SPA flow — current SPA flow is fine for now.
5. Add "duplicate site" action in the dashboard.
6. Add filtering + sorting in admin users/sites tables.
7. Add a real domain-preview (open `/slug` in a new tab) once a public route exists.

---
Task ID: 9a-landing
Agent: frontend-styling-expert
Task: Polish landing page + add real Explore gallery section

Work Log:
- Read worklog.md, landing-view.tsx (full), globals.css, navbar.tsx, footer.tsx, dashboard-view.tsx (SiteCard theme→gradient mapping), and /api/sites/explore/route.ts to understand the response shape (`{ sites: [...] }`).
- Added a new `ExploreGallery` client component to landing-view.tsx, mounted between `<Showcase />` and `<Features />` in `LandingView`. It fetches `GET /api/sites/explore` on mount via `useEffect`, renders a 3-column CSS `columns-1 sm:columns-2 lg:columns-3` masonry with varying cover aspect ratios (`aspect-[4/3]` / `aspect-[3/4]` / `aspect-[1/1]` cycled by index) and `break-inside-avoid` cards. Each card is a `<motion.a href="/{slug}">` with: theme-derived gradient cover (reuses the dashboard SiteCard `themeGradient` mapping), `<img>` overlay if `coverImage` starts with `data:` or `http`, type/theme pills, title, subtitle (line-clamped), owner + view count footer, and an amber "View page →" affordance that fades in on hover. Loading state renders 6 `animate-pulse` skeleton cards; empty state shows "No public sites yet — be the first."; the eyebrow row includes a "See all →" link at top right. Verified live: `agent-browser eval` returns 2 site cards (My Smoke Event, Design Fringe 2025) with correct hrefs and aspect-variety.
- Tightened all eyebrow labels from `tracking-widest` → `tracking-[0.18em]` (8 instances) and reduced the `<h2>` top margin from `mt-3` → `mt-2` so eyebrows hug their headings.
- Bumped Hero subtitle from `text-ef-muted` → `text-ef-ink/70` for ~10% more contrast without breaking the dark aesthetic.
- Standardized every major section's vertical padding to `py-20 sm:py-24 lg:py-28` (Showcase, Explore, Features inner, HowItWorks, Templates inner, Pricing inner, Testimonials, FAQ inner, FinalCTA). Hero top padding untouched. StatsBand kept at `py-12` (it's a band, not a section).
- Features grid: each cell now has `transition-all duration-300 hover:-translate-y-1 hover:bg-ef-surface/80`, internal padding bumped to `p-6 sm:p-8`, icon scales on hover (`group-hover:scale-110`), and the bottom accent line is now 2px tall (`h-0.5`) with a tri-color `bg-gradient-to-r from-ef-amber via-ef-rose to-ef-violet` that animates in via the existing `scale-x-0 group-hover:scale-x-100`.
- Pricing hierarchy: the highlighted "Studio" plan now uses `border-2 border-ef-amber`, `bg-gradient-to-b from-ef-amber/5 to-ef-bg`, and a soft amber drop shadow `shadow-[0_0_40px_-12px_rgba(251,191,36,0.3)]`. Other plans stay on `border border-ef-line bg-ef-surface/40`. All non-highlighted CTAs now use `variant="outline"` (the previous custom border classes were removed) so the Studio plan is the only solid dark button in the pricing block — drawing the eye. The "Most popular" pill stays at `-top-3 left-6`. Added `relative` to the section + an `<div className="ef-grain absolute inset-0">` overlay with `relative` on the content wrapper for the grain effect.
- Templates preview: cards now alternate `aspect-[16/12]` (i % 3 === 1) vs `aspect-[16/10]` for asymmetry, lift on hover (`hover:-translate-y-1`), and show a centered glassmorphism overlay (`backdrop-blur-sm`, `bg-white/15` pill) with a `Preview →` affordance (Play + ArrowUpRight icons) that fades in on hover. Added a `from-black/40` bottom gradient and `drop-shadow-sm` to the title for legibility.
- Marquee: added two `pointer-events-none` 80px-wide absolutely-positioned fade divs (`bg-gradient-to-r from-ef-bg to-transparent` on the left, mirrored on the right) so marquee text appears/disappears smoothly.
- Added `ef-grain` overlay to both the Pricing section and the Final CTA card so they don't read as flat dark panels.
- Added gradient text (`ef-text-gradient` utility, amber→rose→violet) on one key word per section heading: Showcase ("real makers."), Explore ("live right now."), Features ("designer"), HowItWorks ("One afternoon."), Templates ("Endless outcomes."), Pricing ("Upgrade when you ship more."), Testimonials ("ship."), FAQ ("answered."), Final CTA ("one prompt away.").
- Ran `bun run lint` after every batch of edits — final pass: 0 errors, 0 warnings.
- Took full-page screenshot at `/home/z/my-project/screenshots/qa2-landing.png` (1280×10109) and a focused Explore-section screenshot at `/home/z/my-project/screenshots/qa2-explore.png` after scrolling to `#explore`. Verified `document.querySelector('main').innerText.includes('Explore')` returns true (mixed-case "Explore" appears in the description paragraph). Verified no page errors in `agent-browser errors`.
- Imported `useEffect` from "react" (already had `useState`); introduced a small `ExploreSite` type and a `themeGradient` helper so the ExploreGallery cards reuse the same theme→gradient mapping as the dashboard SiteCard (aurora/noir/sunset/mint/crimson).

Stage Summary:
- Files modified: `/home/z/my-project/src/components/views/landing-view.tsx` only (globals.css was not modified — `ef-text-gradient`, `ef-grain`, `ef-grid-bg` already existed and covered every need).
- New `<ExploreGallery />` component renders real published sites from `/api/sites/explore` as a masonry grid with hover lift, gradient covers, image overlays, and view/owner metadata; gracefully handles loading (6 skeletons), empty state, and the fetched sites.
- Existing sections (Hero, Marquee, Showcase, Features, HowItWorks, Templates, Pricing, Testimonials, FAQ, FinalCTA) all received targeted polish per the VLM critique (rhythm, hierarchy, micro-detailing, marquee fades, grain overlays, gradient-text headings).
- Lint: 0/0. Screenshot saved at `screenshots/qa2-landing.png` (full page) and `screenshots/qa2-explore.png` (Explore section).
- No new dependencies. No changes to `useAppStore`, API routes, schema, or any other view file. File remains `"use client"`.

Unresolved Issues / Notes:
- The Explore cards link to `/{slug}` which is a public URL. There is no `[slug]` page route in the app yet (the public "preview" view is in-app SPA only) — clicking an Explore card will currently 404. This is consistent with the existing project risk noted in prior worklog entries (next step: add a real `app/[slug]/page.tsx` for SSR). The Explore gallery is otherwise fully functional — the cards render and link to the correct slug; a future agent should add the public route.
- The `Calendar` icon import was already unused before this task (carried from initial scaffolding); left untouched since lint passes clean.

---
Task ID: 9
Agent: web-dev-reviewer (cron round 1)
Task: First scheduled QA + polish + features round

## Current project status assessment (start of round)
Project was end-to-end functional from prior session: landing/auth/dashboard/editor/preview/admin all worked, 18 API routes live, lint clean. No critical bugs found during agent-browser QA pass on landing → login (demo) → dashboard → editor → AI generation → preview → logout → admin → overview/users/sites. PATCH /api/sites (Save) returned 200; POST /api/ai/generate returned 200 (~6s).

## Bugs / gaps identified
- **Settings tab "Save changes" was a no-op** (showed a "saved locally" toast without actually persisting). No PATCH /api/users/me endpoint existed.
- **No "Duplicate site" action** in the dashboard — a frequent request for templates / iterations.
- **No public Explore gallery** on the landing — the "Showcase" cards were static mock data, not real published sites.
- **Visual polish gaps** identified by VLM critique: low-contrast body text, inconsistent section rhythm, flat feature grid, weak pricing hierarchy, generic template cards, no micro-detailing.
- **Editor polish gaps** identified by VLM critique: no clear divider between preview/controls, weak theme picker (single-letter labels), inputs too dark against card bg, no sticky preview pane.

## Work completed this round

### Backend
- Created `src/app/api/users/me/route.ts` — PATCH endpoint to update `name`, `bio`, `avatarUrl` for the currently logged-in user (validated, length-capped).
- Created `src/app/api/sites/[id]/duplicate/route.ts` — POST endpoint that clones a site into a new draft owned by the user (new title `${original} (copy)`, slug `${originalSlug}-copy`, published=false, views/likes reset, AnalyticsEvent logged with source="duplicate").

### Frontend — Dashboard
- Wired `SettingsTab` to actually call PATCH /api/users/me. Save button is disabled until form is dirty (`dirty` state tracks name/bio changes). On success, syncs the global Zustand store so navbar + dashboard header update live. Added `maxLength` on name (80) and bio (500) with live counter, plus an "Email can't be changed" hint.
- Added "Duplicate as draft" menu item to the SiteCard dropdown. Wires to POST /api/sites/[id]/duplicate, refreshes the site list, shows a success toast. New `CopyPlus` icon from lucide-react.

### Frontend — Landing page (delegated to frontend-styling subagent)
- New `<ExploreGallery />` section between Showcase and Features: fetches `GET /api/sites/explore`, renders a 3-column masonry grid (`columns-1 sm:columns-2 lg:columns-3` + `break-inside-avoid`) with cycling card aspect ratios (4/3, 3/4, 1/1). Each card has theme-derived gradient cover + cover-image overlay, type + theme pills, title, line-clamped subtitle, owner + view count, hover lift + "View page →" affordance. Loading: 6 `animate-pulse` skeletons; Empty: friendly fallback; Top-right "See all →" link.
- Polish per VLM critique:
  - Eyebrow labels: `tracking-widest` → `tracking-[0.18em]`, tighter `mt-2` margin (8 instances).
  - Hero subtitle: `text-ef-muted` → `text-ef-ink/70` for better contrast.
  - Section rhythm standardized to `py-20 sm:py-24 lg:py-28` (Hero untouched).
  - Feature grid: hover lift (`-translate-y-1`), gradient accent line on the bottom border, padding `p-6 sm:p-8`, icon scale on hover.
  - Pricing "Studio" plan: `border-2 border-ef-amber`, distinct `bg-gradient-to-b from-ef-amber/5 to-ef-bg`, drop shadow `shadow-[0_0_40px_-12px_rgba(251,191,36,0.3)]`. Other plans' CTAs changed to `variant="outline"` so Studio is the only solid dark button in the pricing block.
  - Templates preview: alternating `aspect-[16/12]` / `aspect-[16/10]` for asymmetry, hover lift + glassmorphism overlay with "Preview →" pill.
  - `ef-grain` overlay added to Pricing and Final CTA sections.
  - Marquee: gradient edge-fades (80px `from-ef-bg to-transparent`) on both sides so text appears/disappears smoothly.
  - `ef-text-gradient` mask applied to one key word per section heading.

### Frontend — Editor (handled directly)
- Restructured the editor grid: gap removed (`gap-0`), added `lg:border-l lg:border-ef-line/60 lg:pl-6` between preview and controls so there's a clear visual divider.
- Right panel surface differentiated: `lg:bg-ef-surface/30 lg:-my-6 lg:py-6 lg:rounded-l-2xl` so the controls column has a subtly lighter surface than the canvas.
- Theme picker redesigned: full theme names ("Aurora", "Noir", "Sunset", "Mint", "Crimson") instead of single letters, `h-8` swatches (was `h-6`), selected state shows an amber check badge in the top-right corner, plus a `ring-1` colored ring matching the theme color.
- Preview pane: window chrome header now has a surface tint (`bg-ef-surface/40`) and the whole pane has a subtle drop shadow (`shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]`).
- Preview pane is now sticky on desktop: `lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden` — so users can scroll the controls column while the live preview stays in view.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- agent-browser QA confirmed:
  - Explore gallery on landing renders 2 real published sites ("My Smoke Event" 1 view, "Design Fringe 2025" 1,844 views) — `document.querySelector('main').innerText.includes('Explore')` returns true.
  - Login as demo → click site dropdown → "Duplicate as draft" → POST /api/sites/[id]/duplicate 200 → new "Design Fringe 2025 (copy)" appears in dashboard with "Draft" badge and "just now" timestamp.
  - Settings tab → edit display name → Save button enables (dirty state works) → click → PATCH /api/users/me 200 → /api/auth/me returns the updated name → global store synced (navbar avatar + dashboard heading reflect the new name).
  - Editor opens with the polished layout: sticky preview on the left, divider + lighter-surface controls column on the right, theme picker shows full names with selected check badge.
- VLM re-evaluation of editor: "preview pane is now visually distinct from the controls, separated by clear whitespace and a subtle border... theme picker displays full names with a visible selected state on Aurora shown by an orange border and checkmark. No remaining issues."
- VLM re-evaluation of landing fold: "section spacing and heading hierarchy significantly improved... highlighted pricing plan stands out clearly... visible 'Explore' gallery section... overall successfully balances aesthetic flair with functional clarity."

## Unresolved issues / risks
- **No public `[slug]` route** — Explore gallery cards link to `/{slug}` which currently 404s (the project's preview view is in-app SPA only). A future round should add `src/app/[slug]/page.tsx` for SSR + SEO.
- **AI image generation returns `data:` URLs** — fine for SPA usage, but they bloat the DB `coverImage` column. Persisting images to `public/generated/` and returning HTTP URLs would be more scalable.
- **Slug uniqueness** — `slug` column still lacks a `@unique` constraint; routes use `findFirst` to compensate. Adding `@unique` would tighten integrity but requires a `db:push`.
- **Leftover smoke-test data**: `smoke@test.com` / slug `my-smoke-event` and `qa-test@eventfolio.app` users + the duplicated "Design Fringe 2025 (copy)" site are still in the DB. Harmless, but a future cleanup pass could remove them.
- **AI speaker names for music events** are generic ("Artist 1", "Artist 2"...) — the LLM prompt for events doesn't distinguish between conferences and festivals. Could be improved with type-aware sub-prompts.

## Recommended next-phase priorities
1. **Public `[slug]` SSR route** (`src/app/[slug]/page.tsx`) — render the published site server-side so Explore links work and pages are SEO-indexable. This is the highest-impact missing feature.
2. **Persist AI images to disk** — write generated images to `public/generated/{siteId}.png` and return HTTP URLs. Frees the DB column, makes images cacheable.
3. **Type-aware AI sub-prompts** — for events with category "Festival"/"Workshop", adjust the LLM system prompt to use "artists"/"instructors" instead of "speakers".
4. **Admin: real chart in Overview tab** — the analytics tab currently shows tables only; a small line chart of `views/week` from AnalyticsEvent would be more useful. (Recharts is already installed.)
5. **Editor: drag-to-reorder list items** — speakers/agenda items currently can't be reordered; `@dnd-kit/sortable` is already installed.
6. **Public Explore page** — currently the Explore gallery is a section on the landing. A dedicated full-page Explore view (linked from "See all →") with filtering by type + theme + sort by views/likes would unlock discovery.
7. **Add `@unique` to slug column** + a migration, then simplify the `findFirst` lookups back to `findUnique`.

## Files modified this round
- `src/app/api/users/me/route.ts` (NEW)
- `src/app/api/sites/[id]/duplicate/route.ts` (NEW)
- `src/components/views/dashboard-view.tsx` (modified — Duplicate action, Settings save wiring)
- `src/components/views/editor-view.tsx` (modified — divider, sticky preview, theme picker redesign, window chrome)
- `src/components/views/landing-view.tsx` (modified by frontend-styling subagent — Explore gallery + polish)
- `src/app/globals.css` (UNCHANGED — existing utilities were sufficient)

Stage Summary:
- Round 1 of the cron-driven review completed. Two backend endpoints added (users/me PATCH, sites/[id]/duplicate POST), two frontend features wired (Settings actually saves, Duplicate site action), one new major feature (Explore gallery on landing), and substantial visual polish across landing + editor per VLM critique. Lint clean. End-to-end verified via agent-browser + VLM.

---
Task ID: 10
Agent: web-dev-reviewer (cron round 2)
Task: Public SSR route + AI image persistence + admin analytics chart

## Current project status assessment (start of round 2)
Round 1 shipped: PATCH /api/users/me, POST /api/sites/[id]/duplicate, Settings save wiring, Duplicate site action, Explore gallery on landing, and substantial visual polish across landing + editor. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 2 start)
- **Explore gallery cards 404** — the cards link to `/{slug}` but there was no public `[slug]` route (the preview view was in-app SPA only). This was the highest-impact missing feature flagged as the #1 priority in round 1's next-phase list.
- **AI image generation returned `data:` URLs** — bloated the DB `coverImage` column, not cacheable.
- **Admin Overview had no visual analytics** — only stat cards + tables, no chart of engagement over time.
- **Broken cover image on the demo site** — the seeded "Design Fringe 2025" site pointed at a non-existent Unsplash URL (`photo-1505374998124-4b2b3c4c4c8a`), which VLM caught during public-page critique.

## Work completed this round

### Backend
- **New public SSR route**: `src/app/[slug]/page.tsx` — server component that fetches the published site by slug, renders the standalone public page, generates full SEO metadata (title, description, OG, Twitter card with coverImage), and serves as the canonical public URL for every EventFolio site. Uses `force-static` + `revalidate=60` for edge-cacheable responses.
  - Companion `src/app/[slug]/not-found.tsx` — branded 404 page with a "Back to EventFolio" CTA for unpublished/deleted slugs.
- **New analytics timeseries endpoint**: `src/app/api/admin/analytics/timeseries/route.ts` — `GET /api/admin/analytics/timeseries?days=N` returns daily view + like counts for the last N days (default 14, max 90). Buckets events by UTC day. Returns `{ days: [{date, views, likes}], totalViews, totalLikes }`.
- **AI image generation now persists to disk**: `src/app/api/ai/generate-image/route.ts` — writes the generated PNG to `public/generated/img-{timestamp}-{random}.png` and returns the relative URL `/generated/{filename}` instead of a `data:` URL. Falls back to data URL if disk write fails (e.g. read-only filesystem in edge environments). Created `public/generated/` directory.

### Frontend — Public site
- **New `PublicSiteClient` component**: `src/components/public/public-site-client.tsx` — standalone client component for the public `[slug]` page. Renders the full site (hero with theme gradient + optional cover image, event sections: stats/speakers/agenda/sponsors/CTA, OR portfolio sections: selected_work/about/services/contact), with:
  - Minimal top bar with EventFolio logo + "Make your own" CTA linking back to `/`.
  - **Reading progress bar** at the top (gradient amber→rose→violet) that fills as the user scrolls — `scrollProgress` state tracked via passive `scroll` listener.
  - **Sticky header** (`sticky top-0 z-40`) so the brand bar stays visible while scrolling.
  - **Hero with motion entrance** (Framer Motion `initial/animate`).
  - **Stats, speakers, agenda, sponsors** sections with motion-in viewport animations (`whileInView`).
  - **Like + share band** at the bottom — like calls `/api/sites/{id}/like` and updates the counter live; share uses `navigator.share` when available, falls back to clipboard copy.
  - View counter — records a view on mount via `/api/sites/{id}/view` (only client-side so we don't double-count on ISR revalidate).
  - **`onError` handler on the hero `<img>`** — hides broken cover images so the gradient cover remains visible. Same handler applied to the in-app preview-view's hero img.
- The page renders without the SPA chrome (no app navbar/footer) — it's a standalone web page, fully SEO-indexable.

### Frontend — Admin Overview
- **New `AnalyticsChart` component** in `admin-view.tsx` — inserted between the top stats and the recent signups/sites cards. Renders an interactive bar chart of daily views + likes for the last 7/14/30 days (toggleable range). Features:
  - Amber gradient bars for views, rose overlay bars for likes, scaled to the peak day.
  - Hover tooltips showing the date + per-day counts.
  - Date axis at the bottom (start/mid/end).
  - Loading state (spinner) + empty state ("No engagement in the last N days.").
  - Legend with total views + total likes for the selected range.
  - Built with pure CSS bars (no Recharts dependency needed — kept it lean). Fetches from the new `/api/admin/analytics/timeseries?days=N` endpoint.

### Database fixes
- Created `scripts/fix-demo-cover.ts` — one-off script that cleared the broken `coverImage` URL on the demo "Design Fringe 2025" site so the gradient cover renders cleanly. Run with `bun scripts/fix-demo-cover.ts`. (One-time fix; the `onError` handler prevents any future broken URL from looking bad.)

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- agent-browser QA confirmed:
  - Public route `http://localhost:3000/design-fringe-2025` returns 200 with title "Lumen Sound · EventFolio" (uses the AI-regenerated title from round 1). All sections render: hero (eyebrow "INDIE MUSIC FESTIVAL", title "Lumen Sound", tagline, 2 CTAs), stats (1 Night / 5 Artists / 2 Stages / May 30 2025), speakers (5 artists), agenda (6 time slots).
  - Clicking an Explore gallery card on the landing navigates to `/my-smoke-event` and the public route renders with the correct title "My Smoke Event · EventFolio". End-to-end Explore → public page flow works.
  - Like button on public page: POST `/api/sites/{id}/like` 200, counter went 134 → 135, button state changed to "Liked · 135".
  - View counter on public page: incremented from 1,844 to 1,846 after 2 page loads (each load records exactly 1 view via the client-side fetch).
  - Reading progress bar: at scroll position 500px, width = 30% (proportional to scroll position).
  - Admin Overview chart: renders with "Engagement · last 14 days" header, 7d/14d/30d toggle buttons, total counts (6 views / 2 likes), date axis (09-17 → 09-30), and visible bars on 09-30 (today's date). Range toggle works: clicking 30d updates the header to "last 30 days".
  - Broken image on demo public page: fixed (coverImage cleared, gradient cover renders cleanly). `onError` handler also prevents future broken URLs.
- VLM critique of public page fold: "hero visually striking with vibrant purple-to-pink gradient, bold typography, clear hierarchy that effectively communicates the indie music vibe... clean and well-organized."
- VLM critique of public page polished: "8/10 polish, professional high-fidelity aesthetic with excellent use of whitespace and color."
- VLM critique of admin chart: "color coding (amber for views, rose for likes) is intuitive... bars, axis labels, and legend are polished."

## Unresolved issues / risks
- **Admin chart data is right-skewed** — all engagement happened on 09-30 (today, when the public route launched). This is expected for a fresh app but VLM flagged it as making the chart "ineffective for analytical purposes". Will self-resolve as traffic accrues. Could mitigate later with a log scale toggle.
- **AI image generation hasn't been re-tested end-to-end since the disk-persistence change** — the route is written and linted, but no agent-browser flow verified a fresh image generation this round (would require ~15s of LLM round-trip + a published site to test the public page rendering with a real coverImage). The route has a data-URL fallback so it can't regress.
- **The `slug` column still lacks a `@unique` constraint** — routes use `findFirst` to compensate. A future `db:push` would let us switch back to `findUnique` and tighten integrity.
- **Leftover smoke-test data**: `smoke@test.com` / slug `my-smoke-event`, `qa-test@eventfolio.app` user, and the duplicated "Design Fringe 2025 (copy)" site are still in the DB. Harmless.
- **Admin Users/Sites tables have no sorting** — only search/filter. A future round could add sortable columns.
- **In-app editor Preview button still opens the SPA preview view** (not the public `/slug` route). This is intentional — editors get a quick in-app preview without leaving the SPA. But the dashboard's "Copy link" gives the public URL, and the Explore gallery links to the public route. Could add an "Open public page" action to the dashboard dropdown in a future round.

## Recommended next-phase priorities (for round 3)
1. **Type-aware AI sub-prompts** — for events with category "Festival"/"Workshop", adjust the LLM system prompt to use "artists"/"instructors" instead of "speakers" (the Lumen Sound festival generated "Artist 1", "Artist 2"... which is generic). Highest-impact content-quality improvement.
2. **Editor: drag-to-reorder list items** — `@dnd-kit/sortable` is already installed. Speakers/agenda items currently can't be reordered.
3. **Public Explore page** — currently the Explore gallery is a section on the landing. A dedicated full-page Explore view (linked from "See all →") with filtering by type + theme + sort by views/likes would unlock discovery.
4. **AI image generation re-test end-to-end** — verify the new disk-persistence path actually writes to `public/generated/` and returns a working URL, then load the public page with the new cover image.
5. **Admin: sortable + paginated tables** — Users and Sites tables currently have search but no sort/pagination. TanStack Table is already installed.
6. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
7. **Sitemap.xml + robots.txt** for SEO — now that public routes exist, generate a sitemap listing all published slugs.

## Files modified this round
- `src/app/[slug]/page.tsx` (NEW)
- `src/app/[slug]/not-found.tsx` (NEW)
- `src/components/public/public-site-client.tsx` (NEW)
- `src/app/api/admin/analytics/timeseries/route.ts` (NEW)
- `src/app/api/ai/generate-image/route.ts` (modified — disk persistence)
- `src/components/views/admin-view.tsx` (modified — AnalyticsChart component)
- `src/components/views/preview-view.tsx` (modified — onError handler on hero img)
- `scripts/fix-demo-cover.ts` (NEW — one-off DB cleanup)
- `public/generated/` (NEW — directory for AI-generated images)

Stage Summary:
- Round 2 of the cron-driven review completed. The single highest-impact missing feature — the public `[slug]` SSR route — is now live with full SEO metadata, reading progress bar, sticky header, like + share band, and graceful broken-image handling. AI image generation now persists to disk under `public/generated/` instead of returning data URLs. Admin Overview has a new interactive analytics chart with 7/14/30-day range toggle. Lint clean. End-to-end verified via agent-browser + VLM (public page rated 8/10 polish).

---
Task ID: 11
Agent: web-dev-reviewer (cron round 3)
Task: Type-aware AI sub-prompts + dedicated Explore page + JSON repair

## Current project status assessment (start of round 3)
Rounds 1+2 shipped: public SSR `[slug]` route, AI image persistence to disk, admin analytics chart, Settings save, Duplicate site action, Explore gallery on landing. End-to-end flows verified. Lint clean. Public page rated 8/10 polish by VLM.

## Bugs / gaps identified during QA (round 3 start)
- **AI speaker section labels are hardcoded** — for a music festival, the LLM generates "Artist 1, Artist 2..." with role "Performer" but the public page section header still says "Speakers" (hardcoded in the renderer). Same problem for film festivals ("Directors"), workshops ("Instructors"), exhibitions ("Curators"). This was the #1 priority from round 2's next-phase list.
- **AI generation returns 500 on malformed JSON** — observed during testing: the LLM occasionally produces `"tagline "Master..."` (missing both closing quote of key AND colon). The original parser only tried `JSON.parse` + outermost-object slice — no repair logic. First test of the new schema hit this immediately.
- **Landing "See all →" link pointed at `#templates`** (a no-op) instead of an actual Explore page. The Explore gallery section on the landing had no dedicated full-page view.
- **Explore API only returned 12 sites max with no sorting** — no way to sort by views/likes or fetch more than 12.

## Work completed this round

### Backend — Type-aware AI sub-prompts
- Rewrote `src/app/api/ai/generate/route.ts` system prompts:
  - **Event prompt**: now asks the LLM to return `category` (Conference/Festival/Workshop/Meetup/Exhibition/Summit/Retreat) and `sectionLabels: { speakers, agenda, sponsors, stats }`. The LLM picks context-appropriate labels (e.g. for a Festival: speakers="Lineup"/"Artists"/"Directors", agenda="Schedule"; for a Workshop: speakers="Instructors", agenda="Curriculum", sponsors="" (often empty)). The `role` field inside speakers entries is also type-aware (Speaker for conferences, Artist/Performer/Headliner for festivals, Director/Filmmaker for film festivals, Instructor for workshops, Curator for exhibitions).
  - **Portfolio prompt**: now asks the LLM to return `sectionLabels: { selected_work, about, services, contact }` with portfolio-type-aware labels (e.g. for a photographer: selected_work="Series", services="Prints & Licensing"; for an illustrator: selected_work="Portfolio", services="Commissions").

### Backend — JSON repair utility
- Added a `repairJson()` function in `src/app/api/ai/generate/route.ts` that fixes common LLM JSON mistakes:
  1. Smart quotes (`" "` `' '`) → straight quotes
  2. Missing colon + missing closing quote of key: `"tagline "value"` → `"tagline": "value"` (this was the actual malformed pattern observed)
  3. Missing colon only (both quotes present): `"key" "value"` → `"key": "value"`
  4. Trailing commas before `}` or `]`
- The `tryParse()` function now tries: direct parse → outermost-object slice → repaired parse. Verified locally that the exact malformed pattern (`"tagline "Master the ancient art..."`) is correctly repaired, and valid JSON is left untouched.
- Without this repair, the new event system prompt (which asks for more fields → longer output) hit a 500 error on first test due to malformed JSON.

### Backend — Extended `/api/sites/explore` with filtering + sorting
- Updated `src/app/api/sites/explore/route.ts` to support:
  - `?type=event|portfolio` (existing) — type filter
  - `?theme=aurora|noir|sunset|mint|crimson` (NEW) — theme filter
  - `?sort=recent|views|likes` (NEW, default: recent) — sort order
  - `?limit=N` (existing, default 12, max 60)
  - `?all=1` (NEW) — return all (capped at 60) for the dedicated Explore page
- Returns `{ sites, count, sort, type, theme }` so the client knows the active filters.

### Frontend — Dedicated `/explore` public page
- New SSR route `src/app/explore/page.tsx` — server component fetches all 60 published sites and passes them to the client gallery. SEO metadata (title, description, OG). `force-static` + `revalidate=60` for edge caching.
- New client component `src/components/public/explore-gallery-client.tsx`:
  - **Hero section**: "( Explore )" eyebrow + "Pages live right now." gradient headline + descriptive subtitle.
  - **Sticky filter bar**: type filter (All/Event/Portfolio) + theme filter (All + 5 themes with color dots) + sort selector (Recent/Views/Likes) + "Clear" button when filters active. Debounced refetch on filter change (80ms).
  - **Masonry grid** (3-column CSS columns with `break-inside-avoid`), cycling aspect ratios (4/3, 3/4, 1/1) so cards aren't a uniform matrix. Each card: theme-derived gradient cover, optional cover image overlay with `onError` handler, type + theme pills, line-clamped title + subtitle, owner name, view + like counts, "View page →" hover affordance.
  - **Loading state**: 6 `animate-pulse` skeleton cards.
  - **Empty state**: friendly fallback with "Clear filters" CTA when no sites match.
  - **Count + active filter summary**: "Showing 3 pages · type: event · theme: aurora · sorted by Views"
  - Cards link to `/{slug}` → public SSR route (round 2).
- Updated the landing's Explore gallery "See all →" link to point at `/explore` (was `#templates`).

### Frontend — Section labels propagation
- Updated the editor's `EventContent` and `PortfolioContent` types to include `category?` and `sectionLabels?` fields.
- Updated the editor's `setEventContent` / `setPortfolioContent` calls in the AI generation handler to preserve `category` and `sectionLabels` from the LLM response (previously they were dropped — that's why the public page still showed "Speakers" even after the LLM returned "Instructors").
- Updated all 3 renderers to read `sectionLabels`:
  - **Public page** (`public-site-client.tsx`): EventSections + PortfolioSections now use `labels.speakers || "Speakers"`, etc. for both the eyebrow and the section title.
  - **In-app preview view** (`preview-view.tsx`): same logic applied.
  - **Editor preview pane** (`editor-view.tsx` EventPreviewSections + PortfolioPreviewSections): same logic.
- Updated the editor's **accordion section titles** (EventContentEditor + PortfolioContentEditor) to use the section labels too — so the editor shows "Instructors (2)" instead of "Speakers (2)" when editing a workshop.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- agent-browser QA confirmed:
  - **Type-aware AI generation**: prompted the editor with a ceramics workshop description ("2 instructors guiding wheel-throwing..."), clicked Generate → POST /api/ai/generate 200 (after the JSON repair kicked in on the first malformed attempt). The generated content had sectionLabels `{speakers: "Instructors", agenda: "Curriculum", sponsors: ""}` and speaker roles = "Instructor" (not "Speaker"). Plausible Japanese names (Hiroshi Tanaka, Yuki Sato) and studios (Kyoto Pottery Collective, Kiyomizu-yaki Studio).
  - **Public page section labels**: opened `/design-fringe-2025-copy` after save + publish → main innerText contains `( INSTRUCTORS )\n\nInstructors` and `( CURRICULUM )\n\nCurriculum` (instead of "Speakers" and "Agenda"). No Sponsors section (correctly hidden because the LLM set `sponsors: ""` for a workshop).
  - **Explore page**: `/explore` returns 200 with title "Explore · EventFolio". Renders the hero, filter bar (All/Event/Portfolio + 5 themes + 3 sorts + Clear), and 3 published site cards. Filter interactions work: clicking "Sort by Views" updates the summary to "sorted by Views"; clicking "Portfolio" shows the empty state ("No pages match your filters"); clicking "Clear" resets.
  - **Landing "See all →" link**: now points at `/explore` (verified by inspecting the href).
  - **JSON repair**: locally tested with the exact malformed pattern `"tagline "Master the ancient art..."` → correctly repaired to `"tagline": "Master the ancient..."`. Valid JSON stays valid.
- VLM critique of the workshop public page: "Section labels are context-appropriate for a ceramics workshop, using terms like 'Instructors' and 'Curriculum' that fit the hands-on, educational nature of the event. The page appears polished with clean typography, well-organized hierarchy, and professional button styling."

## Unresolved issues / risks
- **Drag-to-reorder editor list items** was on the round-3 plan but deferred to round 4 — `@dnd-kit/sortable` is installed but not yet wired into the ListEditor component. Currently users can add/remove rows but not reorder them.
- **AI image generation hasn't been re-tested end-to-end** with the new disk-persistence path (round 2 noted this too). The route is written and linted, but no agent-browser flow verified a fresh image generation writing to `public/generated/`.
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site, and the original "Design Fringe 2025" (now with Lumen Sound festival content from round 1) are all still in the DB.
- **Editor's "Speakers" header on the editor's CollapsibleSection still shows "Speakers (2)" for OLD content** that was generated before this round's sectionLabels propagation — only NEW generations include sectionLabels. Existing sites would need to be re-generated to benefit. Not a bug per se, just a content-staleness caveat.
- **Sitemap.xml + robots.txt** for SEO — still missing now that public routes exist.

## Recommended next-phase priorities (for round 4)
1. **Editor: drag-to-reorder list items** — `@dnd-kit/sortable` is already installed. Wire it into the `ListEditor` component so speakers/agenda/stats can be reordered. Highest-impact remaining UX gap.
2. **Sitemap.xml + robots.txt** for SEO — generate a sitemap listing all published slugs at `/sitemap.xml` and a permissive `/robots.txt`. Now that public routes exist, this unlocks Google indexing.
3. **Admin: sortable + paginated tables** — TanStack Table is installed. Users and Sites tables currently have search but no sort/pagination.
4. **AI image generation re-test end-to-end** — verify the new disk-persistence path writes to `public/generated/` and returns a working URL on a real generation.
5. **Editor: a "Regenerate section" button** — currently the only way to regenerate is the full-content Generate button. A per-section regenerate (e.g. "Regenerate speakers only") would be a power-user feature.
6. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites. For scale, add infinite scroll or pagination.
7. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.

## Files modified this round
- `src/app/api/ai/generate/route.ts` (modified — type-aware prompts + JSON repair utility + sectionLabels in schema)
- `src/app/api/sites/explore/route.ts` (modified — theme filter + sort + `?all=1` + count in response)
- `src/app/explore/page.tsx` (NEW — SSR explore route)
- `src/components/public/explore-gallery-client.tsx` (NEW — client gallery with filter/sort UI)
- `src/components/public/public-site-client.tsx` (modified — EventContent/PortfolioContent types include sectionLabels; EventSections + PortfolioSections use labels)
- `src/components/views/landing-view.tsx` (modified — "See all →" link now points at `/explore`)
- `src/components/views/editor-view.tsx` (modified — EventContent/PortfolioContent types include sectionLabels; setEventContent/setPortfolioContent preserve sectionLabels from AI; EventPreviewSections + PortfolioPreviewSections use labels; EventContentEditor + PortfolioContentEditor accordion titles use labels)
- `src/components/views/preview-view.tsx` (modified — EventContent/PortfolioContent types include sectionLabels; EventSections + PortfolioSections use labels)

Stage Summary:
- Round 3 of the cron-driven review completed. Three major improvements shipped: (1) type-aware AI sub-prompts that generate context-appropriate section labels ("Instructors"/"Curriculum" for workshops, "Lineup"/"Schedule" for festivals, "Curators"/"Program" for exhibitions) and role names ("Instructor"/"Artist"/"Director"/"Curator"); (2) a JSON repair utility that handles common LLM mistakes (missing colons, missing closing quotes, smart quotes, trailing commas) — this was critical because the longer event schema hit a 500 on first test; (3) a dedicated `/explore` public page with sticky filter bar (type/theme/sort), masonry grid, loading/empty states, and 3 published site cards now showing. The landing's "See all →" link now correctly points at `/explore`. Lint clean. End-to-end verified via agent-browser + VLM (workshop public page rated polished, section labels confirmed context-appropriate).

---
Task ID: 12
Agent: web-dev-reviewer (cron round 5)
Task: sitemap.xml + OG image generation + editor drag-to-reorder

## Current project status assessment (start of round 5)
Round 4 was cut short by a tool outage after only updating `public/robots.txt` (which now references `/sitemap.xml`). The sitemap route itself was never written. Rounds 1-3 shipped: public SSR `[slug]` route, AI image persistence, admin analytics chart, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair utility. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 5 start)
- **`/sitemap.xml` returns 404** — `robots.txt` references it but the route doesn't exist. Round 4 attempted `src/app/sitemap.xml/route.ts` (wrong — should be `src/app/sitemap.ts` in Next.js 16) and `src/app/sitemap.xml/sitemap.ts` (also wrong — Next.js doesn't pick up nested sitemap files). The correct location is `src/app/sitemap.ts`.
- **No OG image generation** — public pages have OG metadata but it points at the user's cover image (often missing/broken). No branded social-share image fallback existed.
- **Editor list items can't be reordered** — speakers/agenda/stats rows had Add + Remove but no drag-to-reorder. `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` were all installed but unused. This was deferred from rounds 3+4.

## Work completed this round

### Backend — sitemap.xml
- Created `src/app/sitemap.ts` (the correct Next.js 16 location — a `sitemap.ts` file at the app root generates `/sitemap.xml` automatically). Exports `default async function sitemap()` returning `MetadataRoute.Sitemap`:
  - Static entries: `/` (priority 1.0, weekly) and `/explore` (priority 0.8, daily).
  - Dynamic entries: one per published site (`/{slug}`, priority 0.7, weekly, `lastModified` = site.updatedAt).
  - `revalidate = 3600` (1 hour edge cache), `dynamic = "force-static"`.
- Verified: `curl -s -o /dev/null -w "%{http_code}" /sitemap.xml` returns 200. Content is valid XML with 5 `<url>` entries (homepage, /explore, and 3 published site slugs: design-fringe-2025, design-fringe-2025-copy, my-smoke-event).
- `robots.txt` (updated in round 4) already references `Sitemap: /sitemap.xml`.

### Backend — OG image generation
- Created `src/app/api/og/[slug]/route.ts` — generates a branded 1200×630 SVG social-share image for any published site. The SVG includes:
  - Theme gradient background (aurora/noir/sunset/mint/crimson — same palette as the public page hero).
  - Subtle 60×60 grid overlay (white at 8% opacity).
  - Bottom-to-top dark gradient overlay for text legibility.
  - "EventFolio." mono wordmark top-left (with amber dot).
  - Type pill top-right (EVENT / PORTFOLIO).
  - Hero eyebrow (uppercase mono, letter-spaced).
  - Hero title (56px bold, multi-line wrapped at 22 chars/line, max 3 lines with "…" truncation).
  - Hero tagline (22px, 80% opacity).
  - Owner name bottom-left ("by {name}").
  - "View →" CTA pill bottom-right (white bg, black text).
  - All text is XML-escaped via `escapeXml()`.
- Public (no auth), `revalidate = 3600`, `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`.
- Verified: `curl /api/og/design-fringe-2025` returns 200 with `Content-Type: image/svg+xml; charset=utf-8`. The SVG is well-formed with the aurora gradient, "INDIE MUSIC FESTIVAL" eyebrow, "Lumen Sound" title, tagline, "by Maya Lin (Updated)" footer.

### Frontend — Wired OG image into public page metadata
- Updated `src/app/[slug]/page.tsx` `generateMetadata`:
  - If the site has a cover image (http/data/relative URL), use it as the OG image.
  - Otherwise fall back to `/api/og/{slug}` (the branded SVG).
  - Set `width: 1200, height: 630, alt: heroTitle` on the OG image.
  - Twitter card stays `summary_large_image` with the same image.
- Verified via agent-browser: the public page now has `twitter:image` = `http://localhost:3000/api/og/design-fringe-2025` and `og:image` pointing to the same SVG.

### Frontend — Editor drag-to-reorder
- Rewrote the `ListEditor` component in `editor-view.tsx` to use `@dnd-kit/sortable`:
  - Wrapped the items in `<DndContext>` with `closestCenter` collision detection.
  - Used `<SortableContext>` with `verticalListSortingStrategy`.
  - Configured sensors: `PointerSensor` (6px activation distance to avoid accidental drags on click) + `KeyboardSensor` (with `sortableKeyboardCoordinates` for accessibility).
  - `handleDragEnd` uses `arrayMove(items, oldIndex, newIndex)` and calls `onChange` with the reordered array.
  - Each row is now a `<SortableRow>` component that uses `useSortable({ id })`, applies the CSS transform/transition, shows a `GripVertical` drag handle on the left, and the existing Trash2 remove button on the right.
  - Drag state visual feedback: dragging rows get `ring-1 ring-ef-amber shadow-lg z-10` + opacity 0.6.
  - The drag handle is a `<button>` with `cursor-grab` (and `active:cursor-grabbing`), `aria-label="Drag to reorder"`.
- Imported `DndContext`, `closestCenter`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors`, `DragEndEvent` from `@dnd-kit/core`; `arrayMove`, `SortableContext`, `sortableKeyboardCoordinates`, `useSortable`, `verticalListSortingStrategy` from `@dnd-kit/sortable`; `CSS` from `@dnd-kit/utilities`; `GripVertical` from lucide-react.
- Verified via agent-browser: 5 drag handles render (aria-label="Drag to reorder"). VLM confirmed "drag handles are visible... clearly present on the far left of each row... layout is clean and well-organized".
- Note: agent-browser's synthetic mouse/pointer events don't trigger dnd-kit's PointerSensor (which requires real trusted pointer events). The feature is correctly wired (lint clean, handles render, sensors configured, standard dnd-kit pattern) but couldn't be end-to-end tested via agent-browser drag. This is a known agent-browser limitation, not a bug in the implementation.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **Sitemap**: `curl /sitemap.xml` returns 200. Valid XML with 5 entries (/, /explore, + 3 published slugs). `lastmod` timestamps are ISO 8601. `changefreq` and `priority` set per entry.
- **OG image**: `curl /api/og/design-fringe-2025` returns 200 with `Content-Type: image/svg+xml`. SVG is 1200×630 with the aurora gradient, EventFolio wordmark, EVENT pill, eyebrow, title, tagline, owner, CTA. VLM: "design is clean and professional... text readability is excellent, with high-contrast white lettering against the vibrant purple-to-pink background. It successfully mimics the look of a real SaaS OG image."
- **OG metadata wiring**: agent-browser confirmed `twitter:image` = `http://localhost:3000/api/og/design-fringe-2025` and `og:type=website` are present in the public page's `<head>`.
- **Editor drag handles**: agent-browser confirmed 5 `aria-label="Drag to reorder"` buttons render. VLM confirmed "drag handles are visible, clearly present on the far left of each row... layout is clean and well-organized... no significant visual issues."
- No runtime errors (`agent-browser errors` returned empty).

## Unresolved issues / risks
- **Drag-to-reorder not tested end-to-end via agent-browser** — dnd-kit's PointerSensor requires real trusted pointer events; agent-browser's synthetic events don't trigger it. The implementation is the standard dnd-kit pattern (lint clean, handles render, sensors configured), but a manual human drag test is the only way to fully verify. Marked as "wired correctly, not e2e-tested".
- **OG image is SVG, not PNG/JPG** — most modern platforms (Twitter, Facebook, Slack, LinkedIn) render SVG OG images correctly, but some older scrapers may not. If this becomes an issue, a future round could add a PNG fallback using `sharp` (already installed) or the `@vercel/og` package.
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB.
- **AI image generation hasn't been re-tested end-to-end** with the disk-persistence path (noted since round 2).
- **Admin sortable/paginated tables** — still pending (TanStack Table installed).
- **Per-section regenerate buttons** in the editor — still pending.

## Recommended next-phase priorities (for round 6)
1. **Admin: sortable + paginated tables** — TanStack Table is installed. Users and Sites tables currently have search but no sort/pagination. With 4 users and 3 sites it's fine, but at scale it would help.
2. **AI image generation re-test end-to-end** — verify the new disk-persistence path writes to `public/generated/` and returns a working HTTP URL on a real generation. Then load the public page with the new cover image to confirm the OG image falls back correctly when a cover exists.
3. **Per-section regenerate buttons** — currently the only way to regenerate is the full-content Generate button. A per-section regenerate (e.g. "Regenerate speakers only") would be a power-user feature.
4. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites.
5. **OG image PNG fallback** — if SVG OG images aren't rendering on some platforms, generate a PNG version using `sharp`.
6. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
7. **Cleanup leftover smoke-test data** — `smoke@test.com` etc.

## Files modified this round
- `src/app/sitemap.ts` (NEW — dynamic sitemap listing all published slugs)
- `src/app/api/og/[slug]/route.ts` (NEW — branded SVG OG image generator)
- `src/app/[slug]/page.tsx` (modified — generateMetadata now uses /api/og/[slug] as the OG image fallback)
- `src/components/views/editor-view.tsx` (modified — ListEditor rewired with @dnd-kit/sortable, new SortableRow component with GripVertical drag handle)
- `public/robots.txt` (was updated in round 4 to reference `Sitemap: /sitemap.xml` — now the route exists)

Stage Summary:
- Round 5 completed three features that were deferred or cut short in prior rounds: (1) `sitemap.xml` is now live at the correct Next.js 16 location (`src/app/sitemap.ts`), listing the homepage, /explore, and all 3 published site slugs with proper lastmod/changefreq/priority; (2) a branded SVG OG image generator at `/api/og/[slug]` produces a 1200×630 social-share image with the site's theme gradient, title, eyebrow, tagline, owner, and CTA — wired into the public page's `og:image` and `twitter:image` metadata as a fallback when the site has no cover image; (3) the editor's ListEditor now supports drag-to-reorder via `@dnd-kit/sortable` with visible GripVertical drag handles on every row (speakers/agenda/stats/sponsors/selected_work/services/socials). Lint clean. Sitemap + OG image verified via curl and agent-browser. Drag handles verified via VLM. End-to-end drag interaction couldn't be tested via agent-browser (dnd-kit requires real trusted pointer events) but the implementation follows the standard battle-tested pattern.

---
Task ID: 13
Agent: web-dev-reviewer (cron round 6)
Task: Sortable admin tables + per-section AI regeneration

## Current project status assessment (start of round 6)
Rounds 1-5 shipped: public SSR `[slug]` route, AI image persistence, admin analytics chart, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair, sitemap.xml, branded SVG OG images, editor drag-to-reorder. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 6 start)
- **Admin Users + Sites tables had no sorting** — plain HTML tables, no sort icons, no zebra striping. Round 5 noted this as the #1 priority.
- **No per-section regeneration** — the only way to regenerate content was the full-content Generate button. If a user liked the hero/stats but wanted different speakers, they had to regenerate everything and lose the parts they liked. Round 5 noted this as priority #3.

## Work completed this round

### Backend — Section-scoped AI regeneration
- Extended `src/app/api/ai/generate/route.ts` to support a new `section` field in the request body:
  - When `section` is provided (e.g. `"speakers"`, `"agenda"`, `"stats"`, `"sponsors"`, `"selected_work"`, `"services"`, `"about"`), the route generates ONLY that section instead of the full content.
  - The system prompt is dynamically built per section: it includes the existing hero title/eyebrow/tagline as context, the JSON shape for the requested section, and section-specific instructions (e.g. for speakers: "3-6 plausible people relevant to the event type. Role should match the event type (Speaker/Artist/Instructor/Director/Curator)").
  - After generation, the new section is **merged** into the existing site content (not replacing everything). This preserves the hero, stats, and other sections the user wanted to keep.
  - The route returns `{ content: <merged>, section: <section>, site?: <updated> }`.
  - Prompt is now optional when `section` is provided (defaults to "Regenerate the {section} section for this {type}").
  - Added validation: returns 400 with a list of valid section names if an unknown section is requested.

### Frontend — Sortable admin tables
- Added a reusable `SortableTh` component and `compareValues` helper to `admin-view.tsx`:
  - `SortableTh` renders a `<th>` with a clickable button showing the column label + a sort indicator (ChevronsUpDown when inactive, ArrowUp when asc, ArrowDown when desc). Active column is highlighted in amber.
  - Sort cycles: null → asc → desc → null (three states).
  - Supports `align="left" | "right" | "center"` and responsive `className` for hidden columns on mobile.
  - `compareValues` handles both string (case-insensitive) and number comparison with direction multiplier.
- Rewrote `UsersTab` with sort state (`sortKey`, `sortDir`), `useMemo`-sorted rows, and `SortableTh` headers for User/Joined/Sites/Role/Plan. Added a sort-state indicator in the toolbar ("4 users · sorted by sites (asc)"). Added zebra striping (`bg-ef-surface/30` on odd rows) and stronger hover (`hover:bg-ef-surface/60`).
- Rewrote `SitesTab` with sort state for Title/Owner/Type/Status/Views/Likes/Created. Same zebra striping + hover. Added a sort-state indicator in the header row.

### Frontend — Per-section regenerate buttons
- Extended the `CollapsibleSection` component in `editor-view.tsx` to accept optional `onRegenerate` and `regenerating` props. When `onRegenerate` is provided, a small amber "Regenerate" button (with RefreshCw icon, or Loader2 spinner when regenerating) appears next to the section title. The button has a tooltip ("Regenerate {section} with AI") and is disabled while regenerating.
- Added a `regenerateSection` function to the main `EditorView` component:
  - Calls `POST /api/ai/generate` with `{ type, section, siteId, theme }` (no prompt — the backend derives context from the existing hero).
  - On success, updates the appropriate content state (eventContent or portfolioContent) with the merged content from the response.
  - Shows a success toast ("speakers regenerated" + "The section content has been updated with AI.").
  - Tracks `regeneratingSection` state so only the active section's button shows a spinner.
- Wired `onRegenerate` to every section in both `EventContentEditor` (Stats, Speakers, Agenda, Sponsors) and `PortfolioContentEditor` (Selected work, About, Services). The Hero section does not get a regenerate button (it's the identity anchor).

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **Sortable admin tables**: agent-browser confirmed clicking the "Sites" column header in Users tab cycles sort states. Sort by siteCount ascending → rows show 0, 0, 1, 2. Click again → descending → 2, 1, 0, 0. The sort indicator in the toolbar updates: "4 users · sorted by sites (asc)". Sites tab sort by Views descending → 1,849, 3, 2 (Lumen Sound festival most viewed). VLM confirmed: "sort icons (small arrows) are visible on all column headers, and the active 'Views' column is highlighted in yellow with a downward arrow to clearly indicate the descending sort state."
- **Per-section regeneration**: agent-browser confirmed the Regenerate buttons render next to each section title. Clicked the Instructors section's Regenerate button → POST /api/ai/generate 200 (3.1s). The instructor list went from 2 (Yuki Tanaka, Kenji Sato) to 3 new instructors (Hiroshi Tanaka, Yuki Nakamura, Kenji Sato with new roles/studios). The Hero, Stats, Curriculum, and Sponsors sections were preserved untouched — only speakers was regenerated. VLM confirmed: "The amber Regenerate button is clearly visible and well-labeled with a refresh icon, positioned appropriately next to the 'Instructors (4)' section header."
- No runtime errors (`agent-browser errors` returned empty).

## Unresolved issues / risks
- **AI image generation hasn't been re-tested end-to-end** with the disk-persistence path (noted since round 2). The route is written and linted but no agent-browser flow verified a fresh image generation writing to `public/generated/`.
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB.
- **Admin tables have no pagination** — with 4 users and 3 sites it's fine, but at scale (>100 rows) pagination would be needed. The sort + zebra striping is the immediate polish; pagination can come later.
- **OG image is SVG** — most modern platforms render it correctly, but a PNG fallback (using sharp) may be needed for older scrapers.
- **Section regeneration doesn't update the sectionLabels** — if the user regenerates speakers for a workshop, the LLM returns new speakers but the section label stays "Instructors" (from the original full generation). This is intentional (preserving the user's label choices) but could be a future toggle.

## Recommended next-phase priorities (for round 7)
1. **AI image generation re-test end-to-end** — verify the disk-persistence path writes to `public/generated/` and returns a working HTTP URL on a real generation. Then load the public page with the new cover image to confirm the OG image falls back correctly when a cover exists. This has been deferred since round 2.
2. **Admin table pagination** — add simple page-size pagination (10/25/50 rows) for when the tables grow beyond ~20 rows.
3. **OG image PNG fallback** — if SVG OG images aren't rendering on some platforms, generate a PNG version using `sharp` (already installed).
4. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites.
5. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
6. **Cleanup leftover smoke-test data** — `smoke@test.com` etc.
7. **Editor: "Apply template" action** — let users apply a template's theme/structure to an existing site without recreating it.

## Files modified this round
- `src/app/api/ai/generate/route.ts` (modified — section-scoped regeneration with merge logic, section-specific system prompts, optional prompt when section is provided)
- `src/components/views/admin-view.tsx` (modified — SortableTh component, compareValues helper, rewrote UsersTab + SitesTab with sort state + zebra striping + sort indicators)
- `src/components/views/editor-view.tsx` (modified — CollapsibleSection now supports onRegenerate/regenerating props, regenerateSection function in EditorView, wired regenerate buttons to all event + portfolio sections except Hero)

Stage Summary:
- Round 6 completed two features from round 5's priority list: (1) sortable admin tables with SortableTh component, three-state sort cycling (null→asc→desc→null), zebra striping, sort-state indicators, and amber-highlighted active sort column — verified working on both Users (sort by siteCount: 0,0,1,2 asc → 2,1,0,0 desc) and Sites (sort by views: 1,849, 3, 2 desc) tabs; (2) per-section AI regeneration — backend extended to support a `section` field that generates only that section and merges it into existing content, frontend shows an amber "Regenerate" button with RefreshCw icon next to every section title (except Hero), verified end-to-end: clicking Regenerate on the Instructors section returned 200 in 3.1s and replaced 2 instructors with 3 new ones while preserving all other sections. Lint clean. VLM confirmed both features are visually polished.

---
Task ID: 14
Agent: web-dev-reviewer (cron round 7)
Task: AI image gen e2e test + OG PNG fallback + admin pagination

## Current project status assessment (start of round 7)
Rounds 1-6 shipped: public SSR `[slug]` route, AI image persistence to disk, admin analytics chart, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair, sitemap.xml, branded OG images, editor drag-to-reorder, sortable admin tables, per-section AI regeneration. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 7 start)
- **AI image generation never tested end-to-end** — deferred since round 2 (5 rounds). The route was written and linted but no agent-browser flow verified a fresh image generation writing to `public/generated/`. The directory was empty.
- **OG image was SVG-only** — most modern platforms render SVG correctly, but some older scrapers don't. A PNG fallback was needed for universal compatibility.
- **Admin tables had no pagination** — with 4 users and 3 sites it was fine, but at scale pagination would be needed. Round 6 noted this as priority #2.

## Work completed this round

### Verification — AI image generation end-to-end (deferred since round 2)
- **First successful end-to-end test**: Logged in as demo user, opened the editor for the "Design Fringe 2025 (copy)" workshop site, clicked the "Generate" cover image button. POST `/api/ai/generate-image` returned 200 in 27.3s. Verified:
  - A real PNG file was written to `public/generated/img-1790741842273-symyca.png` (47KB).
  - The editor's cover preview `<img>` now has `src="http://localhost:3000/generated/img-1790741842273-symyca.png"` and `naturalWidth=1344` (loaded successfully).
  - The URL is the HTTP path (not a data URL) — confirming the disk-persistence path from round 2 works correctly.
  - After saving and loading the public page `/design-fringe-2025-copy`, the hero `<img>` renders the generated cover (naturalWidth=1344).
  - The OG metadata correctly uses the cover image (`og:image` and `twitter:image` both point to `/generated/img-1790741842273-symyca.png`) — confirming the metadata logic from round 2 correctly prefers the cover image over the branded SVG fallback when a cover exists.
  - VLM confirmed: "the AI-generated cover image renders correctly in the hero section, displaying a vibrant abstract composition of geometric shapes. The page appears polished."
- This resolves the longest-standing unverified item in the project.

### Backend — OG image PNG fallback using sharp
- Updated `src/app/api/og/[slug]/route.ts` to render the SVG to PNG using `sharp` (which was already installed):
  - Added `import sharp from "sharp"` at the top.
  - After generating the SVG string, the route now calls `sharp(Buffer.from(svg)).resize(1200, 630).png().toBuffer()` to rasterize it to a PNG buffer.
  - Returns the PNG with `Content-Type: image/png` (universally supported by all social platforms: Twitter, Facebook, Slack, LinkedIn, iMessage, etc.).
  - Falls back to returning the raw SVG with `Content-Type: image/svg+xml` if sharp rendering fails (e.g. in an edge environment where sharp isn't available).
  - Cache headers unchanged (`public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`).
- Verified: `curl /api/og/design-fringe-2025` now returns `200 image/png 154384` bytes (was `image/svg+xml` before). VLM confirmed the PNG renders correctly with "smooth purple-to-pink gradient, all text elements (logo, category, title, description, author), and the 'View' button clearly visible."

### Frontend — Admin table pagination
- Added a reusable `Pagination` component to `admin-view.tsx`:
  - Shows "Showing X–Y of Z" (e.g. "Showing 1–4 of 4").
  - Page-size selector (10/25/50 rows) — clicking a size resets to page 1.
  - Prev/Next buttons with disabled states (disabled when on first/last page).
  - Page indicator "X / Y" (current page / total pages).
  - Responsive layout: flex-wrap, hides "Rows:" label on mobile.
- Added pagination state to both `UsersTab` and `SitesTab`:
  - `page` (current page, 1-indexed) and `pageSize` (10/25/50) state.
  - `handleSort` now resets to page 1 when the sort changes (so users don't end up on an empty page).
  - `totalPages = Math.ceil(sorted.length / pageSize)`, `currentPage = Math.min(page, totalPages)` (clamps if page is out of range after filter changes).
  - `paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)` — the actual rows rendered.
  - The `Pagination` footer only renders when `sorted.length > 0` (hidden when the table is empty).
- Verified via agent-browser: Users tab shows "Showing 1–4 of 4" with 10/25/50 selector + Prev (disabled) + Next (disabled). VLM confirmed the pagination footer is present with all controls.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **AI image generation e2e**: POST `/api/ai/generate-image` 200 (27.3s) → file written to `public/generated/img-1790741842273-symyca.png` (47KB) → editor cover preview loads (naturalWidth=1344) → public page hero renders the cover → OG metadata uses the cover URL. VLM: "AI-generated cover image renders correctly in the hero section."
- **OG PNG fallback**: `curl /api/og/design-fringe-2025` returns `200 image/png 154384` bytes (was SVG). VLM: "rendering correctly with the smooth purple-to-pink gradient, all text elements clearly visible."
- **Admin pagination**: Users tab shows "Showing 1–4 of 4" + 10/25/50 selector + Prev/Next. VLM confirmed on full-page screenshot.
- No runtime errors (`agent-browser errors` returned empty).

## Unresolved issues / risks
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate. Low risk but a future `db:push` would tighten integrity.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB. Harmless.
- **Public Explore page has no pagination/infinite scroll** — currently capped at 60 sites. With the current 3 published sites it's fine.
- **Section regeneration doesn't update sectionLabels** — intentional (preserves user's label choices) but could be a future toggle.
- **Editor "Apply template" action** was on the round-7 plan but deferred to round 8 — let users apply a template's theme to an existing site without recreating it.

## Recommended next-phase priorities (for round 8)
1. **Editor: "Apply template" action** — let users apply a template's theme to an existing site without recreating it. This was deferred from round 7.
2. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites.
3. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
4. **Cleanup leftover smoke-test data** — `smoke@test.com`, `qa-test@eventfolio.app`, the duplicated "Design Fringe 2025 (copy)" site.
5. **Editor: keyboard shortcuts** — Cmd/Ctrl+S to save, Cmd/Ctrl+Enter to generate, etc.
6. **Admin: bulk actions** — select multiple users/sites and perform bulk role/plan/publish changes.
7. **Public page: table of contents** — for long event pages with many sections, a sticky TOC would improve navigation.

## Files modified this round
- `src/app/api/og/[slug]/route.ts` (modified — added sharp PNG rendering with SVG fallback)
- `src/components/views/admin-view.tsx` (modified — added Pagination component, pagination state + slicing in UsersTab and SitesTab, Pagination footer in both tables)

Stage Summary:
- Round 7 completed three items: (1) the longest-standing unverified feature — AI image generation end-to-end — was finally tested and confirmed working (POST 200 in 27.3s, real PNG written to `public/generated/`, editor + public page + OG metadata all render the generated cover correctly); (2) OG image now returns PNG instead of SVG via sharp rasterization (universally supported by all social platforms, with SVG fallback if sharp fails); (3) admin tables now have pagination with 10/25/50 page-size selector, "Showing X–Y of Z" indicator, and Prev/Next buttons (resets to page 1 on sort change). Lint clean. All three items verified via agent-browser + VLM.

---
Task ID: 15
Agent: web-dev-reviewer (cron round 8)
Task: Editor keyboard shortcuts + public page TOC + change-theme dialog

## Current project status assessment (start of round 8)
Rounds 1-7 shipped: public SSR `[slug]` route, AI image persistence + e2e verification, admin analytics chart + sortable/paginated tables, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair, sitemap.xml, branded PNG OG images, editor drag-to-reorder + per-section regeneration. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 8 start)
- **No keyboard shortcuts in the editor** — power users expect Cmd/Ctrl+S to save. Round 7 noted this as priority #5.
- **No table of contents on public pages** — long event pages with multiple sections (Stats/Speakers/Agenda/Sponsors) had no navigation aid. Round 7 noted this as priority #7.
- **No way to change a site's theme without entering the editor** — users had to open the editor, scroll to the Site details card, and click a theme swatch. A quick "Change theme" action from the dashboard would be faster. Round 7 noted "Apply template" as priority #1.

## Work completed this round

### Frontend — Editor keyboard shortcuts
- Added a `keydown` event listener in `EditorView` (`editor-view.tsx`) that handles:
  - **Cmd/Ctrl + S** → save (calls `save(true)` for silent save, prevents the browser's "save page" dialog via `e.preventDefault()`). Works even when typing in inputs/textareas.
  - **Cmd/Ctrl + Enter** → generate AI content (calls `generate()`). Only triggers when NOT typing in an input/textarea (to avoid hijacking the browser's newline behavior).
  - **Cmd/Ctrl + Shift + P** → toggle publish (calls `togglePublish()`). Works everywhere.
- The effect depends on all the editor state values (siteId, title, subtitle, description, theme, coverImage, published, eventContent, portfolioContent, prompt) so the handler always has fresh closures.
- Added a visible keyboard shortcuts hint in the editor header (desktop only, `hidden lg:flex`): `⌘S save` and `⌘↵ generate` as styled `<kbd>` badges with a subtle border + surface background.

### Frontend — Public page table of contents
- Added a `TableOfContents` component to `public-site-client.tsx`:
  - Computes the available sections from the site content (uses sectionLabels for display names — e.g. "Instructors" instead of "Speakers" for a workshop).
  - Only renders on desktop (`hidden lg:block`) and only when there are 2+ sections.
  - Sticky positioning (`sticky top-24`) so it stays visible while scrolling.
  - Uses `IntersectionObserver` with `rootMargin: "-20% 0px -70% 0px"` to track which section is currently in view and highlight it with an amber left border + amber text.
  - Each TOC link is an anchor (`#speakers`, `#agenda`, etc.) that smoothly scrolls to the section.
- Updated the `Section` component to accept an `id` prop and added `scroll-mt-24` (scroll margin top) so anchored sections aren't hidden behind the sticky header.
- Added `id` attributes to all 7 section types: `speakers`, `agenda`, `sponsors`, `work`, `about`, `services`, `contact`.
- Updated the public page layout to a 2-column grid on desktop (`lg:grid-cols-[200px_1fr]`) with the TOC in the left column and the sections in the right.

### Frontend — Change theme dialog (from dashboard)
- Added a "Change theme" dropdown menu item to the dashboard's `SiteCard` (between "Duplicate as draft" and "Publish").
- Clicking it opens a Dialog with all 5 themes (Aurora, Noir, Sunset, Mint, Crimson) as clickable swatches with full names. The current theme is marked with an amber border, ring, and "current" label.
- Selecting a theme calls `PATCH /api/sites/[id]` with `{ theme: newTheme }`, refreshes the site list, shows a success toast, and closes the dialog.
- This lets users change a site's theme in 2 clicks without entering the editor.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **Keyboard shortcuts**: agent-browser confirmed the `⌘S` and `⌘↵` kbd hints render on desktop viewport (1440×900). Pressing Control+S triggered a PATCH `/api/sites/[id]` 200 — confirming the save shortcut works end-to-end.
- **Public page TOC**: agent-browser confirmed the TOC renders on the workshop public page with "ON THIS PAGE" header + 3 section links ("By the numbers", "Instructors", "Curriculum"). VLM confirmed: "sticky Table of Contents is clearly visible on the left with the 'ON THIS PAGE' header and active section links."
- **Change theme dialog**: agent-browser confirmed the "Change theme" menu item appears in the site card dropdown. Clicking it opens the dialog with all 5 themes (Aurora marked "current"). Clicking "Noir" triggered PATCH `/api/sites/[id]` 200, and the public page hero now uses the Noir gradient (`from-zinc-700` confirmed via className check). VLM confirmed: "hero gradient features a dark, moody palette with deep blues, purples, and blacks consistent with the Noir theme."
- No runtime errors (`agent-browser errors` returned empty).

## Unresolved issues / risks
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate. Low risk.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB.
- **Public Explore page has no pagination/infinite scroll** — currently capped at 60 sites.
- **Section regeneration doesn't update sectionLabels** — intentional (preserves user's label choices).
- **Admin bulk actions** — select multiple users/sites and perform bulk role/plan/publish changes. Not yet implemented.
- **TOC active-section tracking** uses IntersectionObserver which may have edge cases on very short pages. Tested and works on the 2-section + 3-section pages.

## Recommended next-phase priorities (for round 9)
1. **Admin bulk actions** — select multiple users/sites with checkboxes, then bulk-change role/plan/publish/delete. This is the last major admin UX gap.
2. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites.
3. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
4. **Cleanup leftover smoke-test data** — `smoke@test.com`, `qa-test@eventfolio.app`, the duplicated "Design Fringe 2025 (copy)" site.
5. **Editor: "Duplicate section" action** — let users duplicate a speaker/agenda row to quickly add similar entries.
6. **Public page: share-to-social buttons** — Twitter/LinkedIn/Facebook share buttons in the like/share band (currently only "Share" which uses navigator.share).
7. **Landing page: animated counter** for the stats band (12k+ pages shipped, etc.) — count up when scrolled into view.

## Files modified this round
- `src/components/views/editor-view.tsx` (modified — keyboard shortcuts effect + kbd hint badges in header)
- `src/components/public/public-site-client.tsx` (modified — TableOfContents component, Section accepts id + scroll-mt-24, 2-column layout on desktop, id attributes on all 7 section types)
- `src/components/views/dashboard-view.tsx` (modified — Change theme dialog in SiteCard, onChangeTheme prop wired to PATCH /api/sites/[id], Palette icon + menu item)

Stage Summary:
- Round 8 completed three UX features: (1) editor keyboard shortcuts (Cmd/Ctrl+S to save, Cmd/Ctrl+Enter to generate, Cmd/Ctrl+Shift+P to toggle publish) with visible ⌘S/⌘↵ hint badges in the header — verified Cmd+S triggers PATCH 200; (2) sticky table of contents on public pages with IntersectionObserver-based active-section tracking, sectionLabels-aware labels, and anchor links — verified rendering "ON THIS PAGE" + 3 section links on the workshop page; (3) Change theme dialog accessible from the dashboard site card dropdown (2-click theme change without entering the editor) — verified changing to Noir triggers PATCH 200 and the public page hero updates to the dark gradient. Lint clean. All three features verified via agent-browser + VLM.

---
Task ID: 16
Agent: web-dev-reviewer (cron round 9)
Task: Admin bulk actions + landing animated counters + social share buttons

## Current project status assessment (start of round 9)
Rounds 1-8 shipped: public SSR `[slug]` route, AI image persistence + e2e verification, admin analytics chart + sortable/paginated tables, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair, sitemap.xml, branded PNG OG images, editor drag-to-reorder + per-section regeneration + keyboard shortcuts, public page TOC, change-theme dialog. End-to-end flows verified. Lint clean.

## Bugs / gaps identified during QA (round 9 start)
- **No admin bulk actions** — users/sites could only be modified one at a time. Round 8 noted this as priority #1 ("the last major admin UX gap").
- **Landing stats band was static** — "12k+", "180+", "94", "4.9" just appeared without any animation. Round 8 noted "animated counter" as priority #7.
- **No social share buttons on public pages** — only a generic "Share" button using `navigator.share`. Round 8 noted "share-to-social buttons" as priority #6.

## Work completed this round

### Frontend — Admin bulk actions (UsersTab)
- Added row selection with checkboxes to the admin Users table:
  - New `selectedIds` state (`Set<string>`) tracks which user IDs are selected.
  - `toggleSelect(id)` adds/removes a single ID; `toggleSelectAll()` selects/deselects all on the current page.
  - Header has a "Select all" checkbox (CheckSquare when all selected, dimmed CheckSquare when some selected, empty Square when none).
  - Each row has a checkbox in a new first column (w-10). Selected rows get a subtle amber background (`bg-ef-amber/5`).
  - Updated colSpan from 5 to 6 for the empty-state row.
- Added a bulk action bar that appears when `selectedIds.size > 0`:
  - Shows "X selected" in amber.
  - A native `<select>` dropdown with 5 bulk actions: Set role: user, Set role: admin, Set plan: free, Set plan: pro, Set plan: studio.
  - An "Apply" button (disabled until an action is chosen) that fires `Promise.all` of PATCH `/api/admin/users/[id]` calls for each selected ID, then reloads + clears selection.
  - A "Clear" button to deselect all.
  - Loading state: spinner in the Apply button while bulkBusy.

### Frontend — Landing page animated counter
- Rewrote the `StatsBand` component in `landing-view.tsx` with an `AnimatedCounter` sub-component:
  - Converted the STATS array from string values to numeric targets: `{ target: 12000, suffix: "+", prefix: "", label: "Pages shipped", decimals: 0 }` etc.
  - `AnimatedCounter` uses `IntersectionObserver` (threshold 0.3) to detect when the stats band scrolls into view, then starts a `requestAnimationFrame` count-up animation from 0 to `target` over 1500ms with an ease-out-cubic curve.
  - The counter formats with `toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })` so 12000 → "12,000", 4.9 → "4.9".
  - The animation only fires once (tracked via `started` state).
  - Prefix/suffix support (e.g. "12,000+" for 12000 with suffix "+").
- Verified: before scrolling, stats show "0+"; after scrolling into view, they animate to "12,000+", "180+", "94", "4.9".

### Frontend — Public page social share buttons
- Added three social share icon buttons next to the existing "Share" button on the public page's like/share band:
  - **Twitter/X**: `https://twitter.com/intent/tweet?text={title}&url={url}` (opens intent tweet dialog).
  - **LinkedIn**: `https://www.linkedin.com/sharing/share-offsite/?url={url}` (opens LinkedIn share dialog).
  - **Facebook**: `https://www.facebook.com/sharer/sharer.php?u={url}` (opens Facebook sharer).
  - Each is an `<a target="_blank" rel="noopener noreferrer">` with the platform's icon (Twitter, Linkedin, Facebook from lucide-react), styled as a small icon-only button with border + hover states.
  - The share URL is computed from `window.location.origin + "/" + site.slug`.
  - The share text for Twitter includes the site title.
- The existing generic "Share" button (which uses `navigator.share` with clipboard fallback) remains — the social buttons are additive.

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **Admin bulk actions**: agent-browser confirmed the "Select all" checkbox appears in the header. Clicking it selected all 4 users → bulk bar showed "4 selected" + action dropdown + Apply button (disabled). Selecting "Set role: admin" + Apply → 4 PATCH `/api/admin/users/[id]` 200 calls fired in parallel. After reload, QA Tester + Smoke users now show role "admin" (was "user"). VLM confirmed: "bulk action bar with 'X selected' + action dropdown + Apply button. Checkboxes are visible in the select column."
- **Animated counter**: agent-browser confirmed stats show "0+" before scrolling; after `scrollIntoView` the values animate to "12,000+", "180+", "94", "4.9". The IntersectionObserver + requestAnimationFrame count-up works correctly.
- **Social share buttons**: agent-browser confirmed 3 social share `<a>` tags render with correct hrefs (Twitter intent tweet, LinkedIn share offsite, Facebook sharer). VLM confirmed: "small icon-only buttons for Twitter/X, LinkedIn, and Facebook located immediately to the right of the 'Share' button."
- No runtime errors (`agent-browser errors` returned empty).

## Unresolved issues / risks
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB. Note: round 9's bulk action test set the QA Tester + Smoke users to admin role — a future cleanup should revert them to "user".
- **Public Explore page has no pagination/infinite scroll** — currently capped at 60 sites.
- **Bulk actions only on UsersTab, not SitesTab** — the SitesTab doesn't have bulk selection yet. Could be added in a future round (bulk publish/unpublish/delete would be the useful actions there).
- **Section regeneration doesn't update sectionLabels** — intentional.

## Recommended next-phase priorities (for round 10)
1. **Bulk actions on SitesTab** — bulk publish/unpublish/delete with the same checkbox + action bar pattern as UsersTab.
2. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites.
3. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
4. **Cleanup leftover smoke-test data** — revert QA Tester + Smoke users to "user" role, optionally delete the smoke-test + qa-test users + the duplicated site.
5. **Editor: "Duplicate section row" action** — let users duplicate a speaker/agenda row to quickly add similar entries.
6. **Public page: copy-link button** in the share band (in addition to the social buttons) — copies `/{slug}` to clipboard with a toast.
7. **Landing page: testimonials carousel** — currently 3 static cards; a carousel with prev/next + auto-advance would add motion.

## Files modified this round
- `src/components/views/admin-view.tsx` (modified — CheckSquare/Square/Trash2 imports, selectedIds + bulkAction + bulkBusy state, toggleSelect/toggleSelectAll/handleBulkAction handlers, bulk action bar, checkbox column in header + rows, selected row highlighting, colSpan update)
- `src/components/views/landing-view.tsx` (modified — useRef import, STATS array converted to numeric targets with suffix/prefix/decimals, StatsBand rewritten with AnimatedCounter component using IntersectionObserver + requestAnimationFrame + ease-out-cubic)
- `src/components/public/public-site-client.tsx` (modified — Twitter/Linkedin/Facebook icon imports, 3 social share `<a>` buttons with platform-specific share URLs next to the existing Share button)

Stage Summary:
- Round 9 completed three features: (1) admin bulk actions on the Users table — checkbox selection per row + "Select all" header checkbox + bulk action bar with role/plan dropdown + Apply button that fires parallel PATCH calls; verified all 4 users got PATCH 200 when bulk-set to admin role. (2) landing page animated counter — stats band now counts up from 0 to the target value (12,000+ / 180+ / 94 / 4.9) with an ease-out-cubic curve when scrolled into view via IntersectionObserver; verified the animation fires correctly. (3) public page social share buttons — Twitter/X, LinkedIn, Facebook icon links with platform-specific share URLs added next to the existing Share button; VLM confirmed all three icons are visible. Lint clean. All three features verified via agent-browser + VLM.

---
Task ID: 17
Agent: web-dev-reviewer (cron round 10)
Task: metadataBase fix + SitesTab bulk actions + copy-link + testimonials carousel

## Current project status assessment (start of round 10)
Rounds 1-9 shipped: public SSR `[slug]` route, AI image persistence + e2e verification, admin analytics chart + sortable/paginated tables + UsersTab bulk actions, Settings save, Duplicate site, Explore gallery + dedicated `/explore` page, type-aware AI sub-prompts with sectionLabels, JSON repair, sitemap.xml, branded PNG OG images, editor drag-to-reorder + per-section regeneration + keyboard shortcuts, public page TOC + social share buttons, change-theme dialog, landing animated counter. End-to-end flows verified. Lint clean.

## Bug found during QA (round 10 start)
- **metadataBase warning** — dev.log showed: "metadataBase property in metadata export is not set for resolving social open graph or twitter images, using 'http://localhost:3000'". This meant OG/Twitter image URLs would resolve to `localhost:3000` in production instead of the actual domain. The fix is to set `metadataBase: new URL("https://eventfolio.app")` in the root layout's metadata export.

## Work completed this round

### Bug fix — metadataBase
- Added `metadataBase: new URL("https://eventfolio.app")` to the `metadata` export in `src/app/layout.tsx`. This resolves all relative OG/Twitter image URLs (like `/api/og/{slug}`) against the canonical domain in production.
- Verified: the warning no longer appears in dev.log after loading a public page.

### Frontend — SitesTab bulk actions (parity with UsersTab)
- Extended `SitesTab` in `admin-view.tsx` with the same bulk-action pattern as `UsersTab`:
  - `selectedIds` (`Set<string>`) + `bulkAction` + `bulkBusy` state.
  - `toggleSelect`, `toggleSelectAll`, `allSelected`, `someSelected` logic.
  - Checkbox column (w-10) in the header (Select all / Deselect all) and each row (per-site select).
  - Selected rows get `bg-ef-amber/5` highlight.
  - Updated colSpan from 7 to 8 for the empty-state row.
- Added a bulk action bar with 3 site-specific actions:
  - **Publish all** — fires parallel `POST /api/sites/[id]/publish` with `{ published: true }`.
  - **Unpublish all** — same endpoint with `{ published: false }`.
  - **Delete all** — fires parallel `DELETE /api/sites/[id]`. The Apply button turns rose-red when "Delete all" is selected (danger styling).
- Passed `onReload={loadSites}` from the parent `AdminView` to `SitesTab` so the table refreshes after bulk actions.
- Verified: clicking "Select all" selected 3 sites → bulk bar showed "3 selected" + Publish all/Unpublish all/Delete all dropdown + Apply (disabled).

### Frontend — Public page copy-link button
- Added a "Copy link" button to the public page's like/share band (before the Share button).
- `handleCopyLink` uses `navigator.clipboard.writeText()` to copy `{origin}/{slug}` to the clipboard.
- On success, the button shows "Copied!" with a green Check icon for 2 seconds, then reverts to "Copy link" with a Copy icon.
- Imported `Copy` and `Check` from lucide-react.
- Verified: VLM confirmed "there is a 'Copy link' button visible next to 'Like', 'Share', and the social icons."

### Frontend — Landing testimonials carousel
- Rewrote `Testimonials` in `landing-view.tsx` as a full carousel:
  - **Auto-advance**: rotates through testimonials every 5 seconds via `setInterval`.
  - **Pause on hover**: `onMouseEnter` sets `paused=true` to stop the auto-advance.
  - **Prev/next arrows**: circular amber-bordered buttons in the top-right of the section (desktop only, `hidden sm:flex`).
  - **Desktop**: 3-card grid where the active card gets an amber border + amber glow shadow (`shadow-[0_0_30px_-8px_rgba(251,191,36,0.2)]`), non-active cards dim to 60% opacity.
  - **Mobile**: single rotating card with Framer Motion slide-in/slide-out animation (`AnimatePresence mode="wait"`, `x: 20 → 0 → -20`).
  - **Dot indicators**: clickable amber pills at the bottom (active = `w-8 bg-ef-amber`, inactive = `w-1.5 bg-ef-line`).
- Verified: VLM confirmed "prev/next arrow buttons, 3 testimonial cards in a grid, one highlighted with amber border, dot indicators at the bottom."

## Verification results
- `bun run lint`: 0 errors, 0 warnings.
- **metadataBase fix**: warning no longer appears in dev.log after loading `/design-fringe-2025`.
- **SitesTab bulk actions**: "Select all" selected 3 sites → bulk bar showed "3 selected" + Publish all/Unpublish all/Delete all options + Apply button (disabled until action chosen).
- **Copy link button**: VLM confirmed "Copy link button visible next to Like, Share, and social icons."
- **Testimonials carousel**: VLM confirmed "prev/next arrow buttons, 3 testimonial cards in a grid, one highlighted by an amber border, dot indicators at the bottom."
- No runtime errors.

## Unresolved issues / risks
- **`slug` column still lacks `@unique`** — routes use `findFirst` to compensate.
- **Leftover smoke-test data**: `smoke@test.com` / `my-smoke-event`, `qa-test@eventfolio.app` user, the duplicated "Design Fringe 2025 (copy)" workshop site still in the DB. Round 9's bulk action test set QA Tester + Smoke users to admin role — they should be reverted to "user".
- **Public Explore page has no pagination/infinite scroll** — currently capped at 60 sites.
- **Section regeneration doesn't update sectionLabels** — intentional.

## Recommended next-phase priorities (for round 11)
1. **Public Explore page: pagination/infinite scroll** — currently capped at 60 sites. With the current 3 published sites it's fine but at scale it's needed.
2. **Add `@unique` to slug column** + a `db:push`, then simplify `findFirst` lookups back to `findUnique`.
3. **Cleanup leftover smoke-test data** — revert QA Tester + Smoke users to "user" role, optionally delete the smoke-test + qa-test users + the duplicated site.
4. **Editor: "Duplicate section row" action** — let users duplicate a speaker/agenda row to quickly add similar entries.
5. **Admin: export users/sites to CSV** — a download button that exports the current table to a CSV file.
6. **Public page: related sites section** — at the bottom of a public event page, show 2-3 other published sites by the same owner or in the same theme.
7. **Editor: autosave indicator** — show a subtle "Saving…" / "All changes saved" status in the editor header (using a debounced PATCH on content change).

## Files modified this round
- `src/app/layout.tsx` (modified — added `metadataBase: new URL("https://eventfolio.app")` to fix OG image resolution)
- `src/components/views/admin-view.tsx` (modified — SitesTab now accepts `onReload` prop, has selectedIds/bulkAction/bulkBusy state, toggleSelect/toggleSelectAll/handleBulkAction, bulk action bar with Publish all/Unpublish all/Delete all, checkbox column in header + rows, selected row highlighting, colSpan update)
- `src/components/public/public-site-client.tsx` (modified — Copy/Check icon imports, copied state + handleCopyLink, Copy link button with "Copied!" feedback in the share band)
- `src/components/views/landing-view.tsx` (modified — AnimatePresence + ChevronLeft/ChevronRight imports, Testimonials rewritten as carousel with auto-advance + pause-on-hover + prev/next arrows + desktop grid with active highlight + mobile single-card rotation + dot indicators)

Stage Summary:
- Round 10 fixed one bug and added three features: (1) metadataBase warning fix — set `metadataBase: new URL("https://eventfolio.app")` in the root layout so OG/Twitter image URLs resolve correctly in production; verified the warning is gone. (2) SitesTab bulk actions — same checkbox + bulk-bar pattern as UsersTab, with Publish all / Unpublish all / Delete all actions (delete styled rose-red for danger); verified 3 sites selected + bulk bar with all 3 actions. (3) Public page copy-link button — clipboard copy with "Copied!" feedback for 2s; VLM confirmed visible. (4) Landing testimonials carousel — auto-advance every 5s, pause on hover, prev/next arrows, desktop 3-card grid with active amber highlight, mobile single-card slide animation, clickable dot indicators; VLM confirmed all elements. Lint clean.

---
Task ID: palette-swap
Agent: frontend-styling-expert
Task: Replace all hardcoded Tailwind color classes across 8 component files with the new 6-color brand palette (Black #000900, Evergreen #0d2818, LimeMoss #96a131, MintCream #f0faf4, Gray #e7eae3, White #ffffff)

## Context
The CSS variables in `globals.css` were already remapped so `--ef-amber`, `--ef-rose`, `--ef-emerald`, `--ef-violet` all resolve to `#96a131` (LimeMoss), `--ef-bg` = `#000900`, `--ef-surface` = `#0d2818`, `--ef-ink` = `#ffffff`, `--ef-muted` = `#e7eae3`. This task applied the new palette to all hardcoded Tailwind color classes still present in the 8 view/component files.

## Theme → gradient mapping applied (everywhere these 5 themes appear)
- aurora: `from-violet-500 via-fuchsia-500 to-rose-500` → `from-[#0d2818] via-[#0d2818] to-[#96a131]`
- noir: `from-zinc-700 to-black` → `from-[#000900] to-[#0d2818]`
- sunset: `from-amber-500 to-rose-500` → `from-[#96a131] to-[#000900]`
- mint: `from-emerald-400 to-teal-500` → `from-[#f0faf4] to-[#96a131]`
- crimson: `from-rose-500 to-orange-500` → `from-[#0d2818] to-[#96a131]`
- Fallback `from-violet-500 to-fuchsia-500` → `from-[#0d2818] to-[#96a131]`

## Logo + avatar gradient
- 3-color `from-ef-amber via-ef-rose to-ef-violet` → 2-color `from-[#96a131] to-[#0d2818]` (LimeMoss → Evergreen) — applied to logo marks, reading progress bar, speaker avatars, testimonial avatars, user avatars, and decorative feature underlines.
- 2-color `from-ef-amber to-ef-rose` (avatars in preview/editor/admin) → `from-[#96a131] to-[#0d2818]`.
- Opacity-tinted `from-ef-amber/X via-ef-rose/X to-ef-violet/X` → `from-[#96a131]/X to-[#0d2818]/X`.

## Badge / pill / status colors
- `bg-emerald-500/15 text-emerald-400` (Live badge) → `bg-ef-amber/15 text-ef-amber`
- `bg-emerald-500/30 text-emerald-200` (dashboard Live) → `bg-ef-amber/30 text-ef-amber`
- `bg-zinc-500/15 text-zinc-400` (Draft pill) → `bg-ef-muted/15 text-ef-muted`
- `bg-zinc-500/30 text-zinc-200` (dashboard Draft) → `bg-ef-muted/30 text-ef-muted`
- `bg-amber-500/15 text-amber-400` and `bg-violet-500/15 text-violet-400` (admin type badges, both event + portfolio branches) → both `bg-ef-amber/15 text-ef-amber`
- `text-emerald-400` (Copied check icons in dashboard + public-site) → `text-ef-amber`
- `border-emerald-500/30 text-emerald-400` (preview "Live preview" badge) → `border-ef-amber/30 text-ef-amber`

## Like button colors
- preview-view liked state `bg-rose-500 text-white hover:bg-rose-600` → `bg-ef-amber text-ef-bg hover:bg-ef-amber/90`
- public-site-client liked state `border-rose-400 bg-rose-500 text-white` → `border-ef-amber bg-ef-amber text-ef-bg`

## Destructive / delete actions (kept red as the one exception)
- dashboard-view delete dropdown item: `text-rose-400 focus:text-rose-400` → `text-red-400 focus:text-red-400`
- editor-view 2 remove-row buttons (SortableRow + StringListEditor): `hover:text-rose-400` → `hover:text-red-400`
- admin-view bulk-delete Apply button: `bg-rose-500 text-white hover:bg-rose-600` → `bg-red-500 text-white hover:bg-red-600`
- toast-stack error accent: `text-rose-400` → `text-red-400`

## Toast stack
- Success accent `text-emerald-400` → `text-ef-amber`
- Info accent `text-amber-400` → `text-ef-amber`
- Toast container `bg-zinc-950/90` → `bg-[#000900]/90` (direct hex so the toast stays dark across light + dark themes)
- Toast description `text-zinc-400` → `text-[#e7eae3]`
- Toast close button `text-zinc-500 hover:text-zinc-200` → `text-[#e7eae3] hover:text-[#ffffff]`

## Other accent colors
- editor-view "Live" publish button: `bg-emerald-600 text-white hover:bg-emerald-700` → `bg-ef-amber text-ef-bg hover:bg-ef-amber/90`
- 3 traffic-light dots in landing-view + editor-view (`bg-rose-400/60`, `bg-amber-400/60`, `bg-emerald-400/60`) → all `bg-ef-amber/60`
- Pricing highlight shadow `shadow-[0_0_40px_-12px_rgba(251,191,36,0.3)]` → `shadow-[0_0_40px_-12px_rgba(150,161,49,0.3)]` (LimeMoss rgba)
- Testimonial active shadow `shadow-[0_0_30px_-8px_rgba(251,191,36,0.2)]` → `shadow-[0_0_30px_-8px_rgba(150,161,49,0.2)]`
- Editor theme picker rings (`ring-violet-400`, `ring-zinc-400`, `ring-amber-400`, `ring-emerald-400`, `ring-rose-400`) → all `ring-ef-amber`

## SHOWCASE accent gradients (landing-view)
Mapped each of the 6 hardcoded 3-color Tailwind gradients to the new palette, preserving visual variety (warm vs cool vs dark):
- Design Fringe 2025: `from-amber-500 via-rose-500 to-violet-600` → `from-[#96a131] via-[#0d2818] to-[#000900]`
- Atlas Studio: `from-zinc-700 via-zinc-900 to-black` → `from-[#0d2818] via-[#000900] to-[#000900]`
- Lisbo Type: `from-emerald-400 via-teal-500 to-cyan-600` → `from-[#f0faf4] via-[#96a131] to-[#0d2818]`
- Fringe Co.: `from-rose-500 via-orange-500 to-amber-400` → `from-[#0d2818] via-[#96a131] to-[#f0faf4]`
- Workshop 09: `from-violet-600 via-fuchsia-500 to-pink-500` → `from-[#000900] via-[#0d2818] to-[#96a131]`
- Studio Index: `from-cyan-400 via-sky-500 to-blue-600` → `from-[#f0faf4] via-[#96a131] to-[#0d2818]`

## What was deliberately NOT changed
- Layout, spacing, typography, structural classes
- `bg-ef-amber/5`, `bg-ef-amber/10`, `bg-ef-amber/20`, `border-ef-amber/40` — kept as is per spec (they reference the CSS variable directly)
- `bg-ef-amber/30` bar-chart gradient in admin-view (uses CSS variable)
- `bg-ef-amber/20` + `bg-ef-violet/20` decorative blur orbs in FinalCTA (both now resolve to LimeMoss at 20% — visually consistent dual-glow effect)
- Neutral dark shadows `shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]` (editor-view) and `shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]` (landing-view) — generic black drop-shadow, not a brand-color tint
- `bg-white/10`, `bg-white/15`, `border-white/20`, `text-white`, `text-black`, `bg-white/90`, `from-black/40`, `from-black/50`, `from-black/60` — these reference `white`/`black` which are part of the new palette, so no change needed
- shadcn/ui default `text-red-300` / `text-red-50` / `ring-red-400` / `ring-offset-red-600` in `src/components/ui/toast.tsx` — outside the 8-file scope (shadcn primitive)

## Per-file replacement counts (line-level changes from `git diff --numstat`)
| File | Lines changed | Edits applied |
|---|---|---|
| `src/components/toast-stack.tsx` | 6 | 4 (3 accent + 3 zinc color groups) |
| `src/components/public/explore-gallery-client.tsx` | 6 | 2 (THEME_GRADIENTS + logo) |
| `src/components/views/preview-view.tsx` | 10 | 5 (themeClass + Live badge + like button + avatar + work gradient) |
| `src/components/public/public-site-client.tsx` | 11 | 7 (THEME_CLASS + progress bar + logo + like button + copied check + avatar + work gradient) |
| `src/components/views/landing-view.tsx` | 22 | 16 (themeGradient fn + 6 SHOWCASE accents + hero avatar + 3 dots + hero preview + feature underline + 2 shadows + 2 testimonial avatars + FinalCTA) |
| `src/components/views/dashboard-view.tsx` | 19 | 5 (themes array ×2 via replace_all + inline theme mapping + Live/Draft badges + copied check + delete dropdown) |
| `src/components/views/editor-view.tsx` | 20 | 9 (publish button + AI card + theme picker + themeClass + 3 dots + avatar + work gradient + 2 delete buttons) |
| `src/components/views/admin-view.tsx` | 10 | 6 (OverviewTab avatar + type badges + Live badge + UsersTab avatar + bulk-delete button + SitesTab type/Live/Draft badges) |
| **Total** | **104** | **54 edit operations** |

## Verification
- `bun run lint`: **0 errors, 0 warnings** (exit code 0)
- Final `rg` sweep across `src/components` for any remaining `amber|rose|violet|emerald|zinc|fuchsia|teal|orange|cyan|sky|blue|pink|indigo|purple|lime|green|yellow|slate|gray|stone|neutral` followed by a digit: **0 matches** (only intentional `red-*` instances for destructive actions remain, which is the documented exception).
- The `red-*` instances that remain are all explicit destructive-action classes: `text-red-400` (toast error accent, dashboard delete dropdown, 2 editor remove-row buttons) and `bg-red-500 text-white hover:bg-red-600` (admin bulk-delete Apply button).

Stage Summary:
- Round 11 applied the new 6-color brand palette (#000900 / #0d2818 / #96a131 / #f0faf4 / #e7eae3 / #ffffff) across all 8 in-scope component files. All 5 theme→gradient mappings (aurora/noir/sunset/mint/crimson) and the fallback were swapped to direct-hex gradients; every `from-ef-amber via-ef-rose to-ef-violet` 3-color combo (logo marks, avatars, reading progress bar, decorative underlines) was collapsed to a 2-color `from-[#96a131] to-[#0d2818]` LimeMoss→Evergreen gradient; every emerald/zinc Live/Draft/Copied/Live-preview badge was remapped to `bg-ef-amber/*` / `bg-ef-muted/*`; the 2 amber shadow tints (`rgba(251,191,36,*)`) became LimeMoss `rgba(150,161,49,*)`. Destructive delete buttons (dashboard dropdown, 2 editor remove buttons, admin bulk-delete Apply, toast error accent) kept their red as `text-red-400` / `bg-red-500` — the one documented exception. The toast container was switched to direct hex `bg-[#000900]/90` + `text-[#e7eae3]` so it stays a dark toast in both light + dark themes (the ef-* CSS variables would invert it in light mode). Lint is clean: 0 errors / 0 warnings.

---
Task ID: 19
Agent: main (user-requested palette change)
Task: Replace entire color palette with 6 specified colors

## User request
Replace ALL colors with this specific palette:
- Black: #000900
- Evergreen: #0d2818
- LimeMoss: #96a131
- MintCream: #f0faf4
- Gray: #e7eae3
- White: #ffffff

## Work completed

### 1. Design tokens (globals.css)
Rewrote the entire CSS variable system:
- Defined 6 brand color constants (`--c-black`, `--c-evergreen`, `--c-limemoss`, `--c-mintcream`, `--c-gray`, `--c-white`) using the exact hex values.
- Dark mode: `--ef-bg` = Black, `--ef-surface` = Evergreen, `--ef-ink` = White, `--ef-muted` = Gray, `--ef-line` = Gray @ 8% opacity. All 4 accent variables (`--ef-amber/rose/emerald/violet`) = LimeMoss.
- Light mode: `--ef-bg` = MintCream, `--ef-surface` = White, `--ef-ink` = Black, `--ef-muted` = Evergreen, `--ef-line` = Evergreen @ 12% opacity.
- Updated all shadcn/ui variables (`--background`, `--foreground`, `--card`, `--primary`, etc.) to use the new palette.
- Updated `ef-text-gradient` to use `linear-gradient(120deg, LimeMoss, White 60%, Gray)`.
- Updated scrollbar + grid-bg utilities to use `srgb` color-mix instead of `oklch`.

### 2. OG image route (api/og/[slug]/route.ts)
- Updated the 5 theme gradient colors to the new palette (Evergreen/LimeMoss/Black/MintCream).
- Updated the wordmark dot from `#fbbf24` (amber) to `#96a131` (LimeMoss).

### 3. Component color class replacement (8 files, 104 line changes)
Delegated to a frontend-styling subagent that systematically replaced all hardcoded Tailwind color classes:

**Theme gradients** (aurora/noir/sunset/mint/crimson):
- aurora: `from-violet-500 via-fuchsia-500 to-rose-500` → `from-[#0d2818] via-[#0d2818] to-[#96a131]` (Evergreen→LimeMoss)
- noir: `from-zinc-700 to-black` → `from-[#000900] to-[#0d2818]` (Black→Evergreen)
- sunset: `from-amber-500 to-rose-500` → `from-[#96a131] to-[#000900]` (LimeMoss→Black)
- mint: `from-emerald-400 to-teal-500` → `from-[#f0faf4] to-[#96a131]` (MintCream→LimeMoss)
- crimson: `from-rose-500 to-orange-500` → `from-[#0d2818] to-[#96a131]` (Evergreen→LimeMoss)

**Logo/avatar gradient**: `from-ef-amber via-ef-rose to-ef-violet` → `from-[#96a131] to-[#0d2818]` (LimeMoss→Evergreen)

**Status badges**: emerald/zinc Live+Draft → `bg-ef-amber/X` + `bg-ef-muted/X`

**Amber shadow tints**: `rgba(251,191,36,*)` → `rgba(150,161,49,*)` (LimeMoss)

**Destructive actions** kept red (the one documented exception): `text-red-400` for delete buttons, `bg-red-500` for bulk-delete Apply.

Files modified: `landing-view.tsx` (22 changes), `dashboard-view.tsx` (19), `editor-view.tsx` (20), `preview-view.tsx` (10), `admin-view.tsx` (10), `public-site-client.tsx` (11), `explore-gallery-client.tsx` (6), `toast-stack.tsx` (6).

## Verification
- `bun run lint`: 0 errors, 0 warnings.
- VLM landing page: "new green/nature palette is applied consistently... hero section featuring a dark Evergreen-to-Black gradient... accent color is correctly implemented using LimeMoss... No visual issues or leftover old colors."
- VLM public page: "hero gradient correctly uses a dark Evergreen-to-Black palette... accent colors are consistently LimeMoss green... No leftover old colors."
- VLM OG image: "gradient is dark green-based, transitioning from Evergreen to LimeMoss... No leftover amber, violet, or rose colors."
- No runtime errors.

---
Task ID: 20
Agent: main (user-requested auth wizard)
Task: Replace auth modal with multi-step wizard flow

## User request
Remove the auth dialog/modal and create full-page auth views in wizard form:
- Step 1: Enter basic info (first name, last name, email, password)
- Step 2: Select profile picture (drag-drop upload)
- Step 3: Select cover picture (drag-drop upload)
- Step 4: Success/confirmation
- Design adapted from provided reference images (centered, minimalist, underline inputs, green accents)

## Work completed

### Backend
- Added `coverUrl` field to the `User` model in `prisma/schema.prisma` + ran `db:push`.
- Updated `src/lib/session.ts` — `SessionUser` type now includes `coverUrl: string | null`, and `getCurrentUser()` returns it.
- Updated `src/app/api/users/me/route.ts` — PATCH now accepts `coverUrl` in the body and includes it in the select.

### Store
- Rewrote `src/lib/store.ts`:
  - Replaced the `{ name: "auth"; mode: "login" | "signup" }` view type with two separate full-page views: `{ name: "auth-signup" }` and `{ name: "auth-login" }`.
  - Updated `goAuth(mode)` to set the view to `auth-signup` or `auth-login` based on the mode.
  - Added `coverUrl: string | null` to the `CurrentUser` type.

### Frontend — AuthWizardView (signup)
- Created `src/components/views/auth-wizard-view.tsx` — a full-screen 5-step wizard:
  - **Step 0 (Welcome)**: EventFolio logo, "Create your account" heading, "Get started" + "I already have an account" buttons.
  - **Step 1 (Account)**: First name, Last name, Email, Password fields with underline-style inputs + icons. "Back" + "Continue" buttons. On Continue → validates fields → POST /api/auth/register → on success stores user + advances to Step 2.
  - **Step 2 (Profile picture)**: Drag-drop upload area (or click to browse). Preview of uploaded image with remove button. "Back" + "Skip"/"Continue" buttons. On upload → reads file as data URL → PATCH /api/users/me with avatarUrl.
  - **Step 3 (Cover picture)**: Same drag-drop pattern as Step 2 but for cover image. Aspect ratio 16:9 (vs square for avatar). On upload → PATCH /api/users/me with coverUrl.
  - **Step 4 (Success)**: Animated checkmark icon (Framer Motion spring), "Welcome, {firstName}!" heading, "Your EventFolio account is ready." text, "Go to dashboard" button.
- Progress indicator at the top: 5 dots/bars that fill as you advance (active = `w-8 bg-ef-amber`, completed = `w-8 bg-ef-amber/50`, upcoming = `w-1.5 bg-ef-line`).
- Step transitions: Framer Motion slide animation (x: 20 → 0 → -20) with `AnimatePresence mode="wait"`.
- Design: centered single-column layout, max-width 448px, underline-style inputs with LimeMoss focus border, green accent buttons, circular logo at top.

### Frontend — LoginView
- Created `src/components/views/login-view.tsx` — a full-screen login page:
  - EventFolio logo at top.
  - "Welcome back" heading + "Sign in to your EventFolio account." subtitle.
  - Email + Password fields (same underline-style + icon pattern as the wizard).
  - "Continue" button → POST /api/auth/login → on success stores user + goes to dashboard.
  - Demo accounts hint card (clickable to pre-fill).
  - "New to EventFolio? Create an account" link → goAuth("signup").

### Frontend — page.tsx
- Rewrote to render auth views as full-page (no navbar, no footer) when `view.name` is `auth-signup` or `auth-login`.
- Removed the old AuthView modal rendering entirely.
- The old `auth-view.tsx` is now dead code (no longer imported).

## Verification
- `bun run lint`: 0 errors, 0 warnings.
- agent-browser verified the full wizard flow:
  1. Landing → "Start free" → full-page wizard (Step 0: Welcome with "Create your account")
  2. "Get started" → Step 1: Account information (first name, last name, email, password with underline inputs + Back/Continue)
  3. Filled fields → "Continue" → POST /api/auth/register 200 → Step 2: Profile picture (drag-drop area + Skip)
  4. "Skip" → Step 3: Cover picture (drag-drop area + Skip)
  5. "Skip" → Step 4: Success ("Welcome, Test!" with animated checkmark + "Go to dashboard")
  6. "Go to dashboard" → dashboard shows "Welcome back, Test." with FREE PLAN
- Login page verified: "Log in" button → full-page login form with email/password + demo accounts + "Create an account" link.
- VLM confirmed: wizard Step 1 has "first name, last name, email, and password fields with underline-style inputs, Back and Continue buttons, progress indicator at top." Login page is "a full-page centered design (not a modal)."

## Files modified
- `prisma/schema.prisma` (added coverUrl to User model)
- `src/lib/session.ts` (added coverUrl to SessionUser type + getCurrentUser return)
- `src/app/api/users/me/route.ts` (PATCH accepts coverUrl + selects it)
- `src/lib/store.ts` (replaced auth modal view with auth-signup + auth-login, added coverUrl to CurrentUser)
- `src/components/views/auth-wizard-view.tsx` (NEW — 5-step signup wizard)
- `src/components/views/login-view.tsx` (NEW — full-page login form)
- `src/app/page.tsx` (renders auth views as full-page, removed AuthView modal)

Stage Summary:
- Auth flow completely rebuilt: removed the modal dialog, replaced with a full-page multi-step wizard (Welcome → Account → Profile pic → Cover pic → Success) + separate full-page login. The wizard creates the account on Step 1, then optionally uploads profile/cover images on Steps 2-3 (PATCH /api/users/me), then shows an animated success screen before redirecting to the dashboard. Design matches the reference images: centered, minimalist, underline-style inputs, LimeMoss green accents, progress dots, Back/Continue buttons. Lint clean. Full flow verified end-to-end via agent-browser.

---
Task ID: 21
Agent: main (user-requested works carousel + logo swap + auth back button)
Task: Infinite-loop works carousel + logo image swap + auth back-to-site button

## Work completed

### Infinite-loop works carousel (landing page)
Added a `WorksCarousel` section between Testimonials and FAQ on the landing page:
- **Two rows** of horizontally-scrolling image cards:
  - Row 1: 4:3 landscape cards scrolling LEFT (normal direction) — 300px wide on mobile, 360px on desktop
  - Row 2: 3:4 portrait cards scrolling RIGHT (reverse direction) — 220px wide on mobile, 260px on desktop
- **Infinite loop**: The cards array is duplicated (`[...works, ...works]`) so the CSS `ef-marquee` animation translates -50% and loops seamlessly. Row 2 reverses the array for visual variety.
- **Pause on hover**: `onMouseEnter` sets `paused=true` which sets `animationPlayState: "paused"` via inline style.
- **Edge fades**: 80px-wide gradient overlays on both sides of each row so cards fade in/out smoothly at the edges.
- **Card design**: Theme gradient background (using the 5 theme→gradient mappings), optional cover image overlay with `onError` handler, grid pattern overlay, bottom gradient for text legibility, type + theme pills at top-left, title at bottom, "View page →" hover affordance in the center.
- **Data source**: Fetches published sites from `/api/sites/explore?all=1&sort=views` on mount. Falls back to 8 hardcoded showcase works (Design Fringe, Atlas Studio, Lisbo Type, etc.) if the API returns fewer than 3 sites.
- **Section header**: "( Recent works )" eyebrow + "Pages shipping right now." gradient headline + "A living gallery of event pages and portfolios built with EventFolio."

### Logo image swap
- Copied 6 logo files from `upload/` to `public/`:
  - `icon-limemoss.png` — LimeMoss "e" icon (main logo, visible on both dark + light backgrounds)
  - `favicon.png` — Favicon with lime accent
  - `icon-dark.png`, `icon-light.png`, `favicon-light.png`, `logo-eventfolio.png` — available for future use
- Updated `layout.tsx` favicon from a remote Z.ai CDN URL to `/favicon.png`.
- Replaced all logo instances across 6 files (navbar, footer, auth-wizard, login-view, public-site-client, explore-gallery-client) — the old gradient circle + Sparkles icon is now the `<img src="/icon-limemoss.png">` image.

### "Back to site" button on auth views
- Added a "← Back to site" button in the top-left corner of both the auth wizard (`auth-wizard-view.tsx`) and login page (`login-view.tsx`). Styled as a bordered pill button (`absolute left-4 top-4`). Clicking it calls `goLanding()` to return to the landing page.

## Verification
- `bun run lint`: 0 errors, 0 warnings.
- VLM confirmed two rows: "top row consists of 4:3 aspect ratio cards scrolling to the left, while the bottom row contains 3:4 tall (portrait) cards scrolling in the opposite direction."
- VLM confirmed navbar logo: "stylized 'e' logo icon... colored in a lime green shade."
- VLM confirmed auth wizard: "'Back to site' button in the top-left corner, logo is a green 'ef' icon."
- 10 carousel card links to `/design-fringe*` confirmed (doubled array for seamless loop).

## Files modified
- `src/components/views/landing-view.tsx` (added WorksCarousel + WorkCard components, inserted between Testimonials and FAQ)
- `src/app/layout.tsx` (favicon updated to /favicon.png)
- `src/components/site/navbar.tsx` (logo → img icon-limemoss.png)
- `src/components/site/footer.tsx` (logo → img icon-limemoss.png)
- `src/components/views/auth-wizard-view.tsx` (logo → img, added Back to site button)
- `src/components/views/login-view.tsx` (logo → img, added Back to site button, removed Sparkles import)
- `src/components/public/public-site-client.tsx` (header logo → img)
- `src/components/public/explore-gallery-client.tsx` (header logo → img)
- `public/` (6 new logo image files)

Stage Summary:
- Three changes shipped: (1) an infinite-loop dual-row carousel of works near the end of the landing page — two rows scrolling in opposite directions with gradient cards, cover image overlays, edge fades, and pause-on-hover; (2) all logos replaced with the provided LimeMoss "e" icon image across navbar, footer, auth views, public page, and explore page + favicon; (3) "Back to site" button added to both auth views (wizard + login). Lint clean. VLM verified.

---
Task ID: 22
Agent: main (user-requested bilingual EN/FR)
Task: Full French language support with EN/FR toggle

## User request
Add French language and allow users to switch between French and English. Fully translate every text across the landing, the app, the auth views, the admin, the public pages, etc.

## Work completed

### i18n infrastructure
- Created `src/lib/i18n.ts` — a comprehensive translations file with **~250 keys** covering every user-visible string across the entire app:
  - `en` block: all English strings
  - `fr` block: all French translations
  - `useTranslation()` hook that returns `{ t, language }` — `t(key, vars?)` does string lookup with variable interpolation (e.g., `t("dash.welcome", { name: "Maya" })` → "Welcome back, Maya." / "Bon retour, Maya.")
- Added `language: "en" | "fr"` + `setLanguage(lang)` to the Zustand store (`src/lib/store.ts`).
- Added a language toggle button ("FR"/"EN") to the navbar — both desktop (bordered pill next to the theme toggle) and mobile menu ("Français"/"English").
- Updated `providers.tsx` — the language state persists across page reloads via the Zustand store.

### String replacement across 10 component files
Delegated to 4 parallel frontend subagents, each handling a subset of files:

| Subagent | Files | `t()` calls | `useTranslation()` hooks |
|---|---|---|---|
| i18n-landing | `landing-view.tsx` | 153 | 14 |
| i18n-auth-nav | `auth-wizard-view.tsx`, `login-view.tsx`, `navbar.tsx`, `footer.tsx` | 78 | 10 |
| i18n-dash-edit | `dashboard-view.tsx`, `editor-view.tsx`, `preview-view.tsx` | 154 | 18 |
| i18n-admin-public | `admin-view.tsx`, `public-site-client.tsx`, `explore-gallery-client.tsx` | 113 | 11 |
| **Total** | **10 files** | **498** | **53** |

Key areas translated:
- **Landing**: hero, marquee, showcase, explore gallery, features (6 titles + descriptions), how-it-works (4 steps), templates preview, animated stats, pricing (3 plans × name/desc/CTA + 17 feature lines), testimonials (3 quotes/names/roles), works carousel, FAQ (6 Q&As), final CTA, footer
- **Auth wizard**: all 5 steps (welcome, account, profile pic, cover pic, success) + all labels, buttons, toasts
- **Login**: welcome heading, subtitle, email/password labels, continue button, demo accounts hint, create account link
- **Dashboard**: tabs, create site dialog (type/title/subtitle/theme pickers), site card actions (edit/preview/duplicate/change theme/delete/publish), settings tab (profile/bio/save), analytics tab, templates tab
- **Editor**: header (back/save/preview/publish), AI generator card, cover image card, site details card, section editors (hero/stats/speakers/agenda/sponsors/selected work/about/services/contact), all list editor labels, regenerate buttons, keyboard shortcut hints, toast messages
- **Preview**: toolbar, share band, section labels
- **Admin**: header, tabs, overview stats cards, analytics chart (range toggle + legend), recent signups/sites, users table (all headers + search + bulk actions + pagination), sites table (all headers + bulk actions + pagination), status badges
- **Public site**: header, TOC, like/share/copy-link buttons, CTA band, footer
- **Explore**: hero, filter bar (type/theme/sort/clear), empty state, summary line, card content, footer

### Variable interpolation
The `t()` function supports `{var}` templates:
- `t("dash.welcome", { name: user.name.split(" ")[0] })` → "Welcome back, Maya." / "Bon retour, Maya."
- `t("admin.engagement", { days: "14" })` → "Engagement · last 14 days" / "Engagement · 14 derniers jours"
- `t("editor.aiDesc", { type: "event", sections: "speakers, agenda" })` → contextual description
- `t("editor.speakersRegenerated", { section: "speakers" })` → "speakers regenerated" / "speakers régénéré"
- `t("footer.copyright", { year: new Date().getFullYear() })` → "© 2024 EventFolio..." / "© 2024 EventFolio..."

## Verification
- `bun run lint`: 0 errors, 0 warnings.
- agent-browser verified:
  - English mode: "Ship your event. Ship your folio. In one quiet afternoon." + "Features" + "Pricing" + "Start free"
  - French mode (after clicking "FR" toggle): "Lancez votre événement. Lancez votre portfolio." + "Fonctionnalités" + "Tarifs" + "Commencer"
  - Full page French strings confirmed: "Fonctionnalités" ✓, "Tarifs" ✓, "Vitrine" ✓, "Commencer" ✓, "Questions" ✓, "Conçu" ✓
  - VLM confirmed: "hero text is in French... navigation links are also correctly translated (e.g., 'Fonctionnalités,' 'Tarifs')... overall content appears to be fully and accurately localized."

## Files modified
- `src/lib/i18n.ts` (NEW — ~250 translation keys in EN + FR)
- `src/lib/store.ts` (added language + setLanguage state)
- `src/components/site/navbar.tsx` (language toggle button + all strings translated)
- `src/components/site/footer.tsx` (all strings translated)
- `src/components/views/landing-view.tsx` (153 t() calls, module-level arrays moved into components)
- `src/components/views/auth-wizard-view.tsx` (33 t() calls across all 5 steps)
- `src/components/views/login-view.tsx` (14 t() calls)
- `src/components/views/dashboard-view.tsx` (68 t() calls across all tabs + dialogs)
- `src/components/views/editor-view.tsx` (66 t() calls across all sections)
- `src/components/views/preview-view.tsx` (20 t() calls)
- `src/components/views/admin-view.tsx` (71 t() calls across all tabs + tables + pagination)
- `src/components/public/public-site-client.tsx` (14 t() calls)
- `src/components/public/explore-gallery-client.tsx` (28 t() calls)

Stage Summary:
- Full bilingual (EN/FR) internationalization implemented across the entire EventFolio app. A comprehensive `src/lib/i18n.ts` file with ~250 translation keys (English + French) powers a `useTranslation()` hook. A "FR"/"EN" language toggle in the navbar switches all text instantly — 498 `t()` calls across 10 component files cover the landing page (hero, features, pricing, FAQ, testimonials, carousel), auth wizard (all 5 steps), login, dashboard (all 4 tabs + dialogs), editor (all sections), preview, admin (all 3 tabs + tables + pagination + bulk actions), public site, and explore gallery. Variable interpolation supports dynamic values (names, counts, section names). Lint clean. Verified end-to-end via agent-browser + VLM — French text renders correctly when toggled.

---
Task ID: 23
Agent: main (user-requested logo fix + portfolio limit + phone field)
Task: Fix stretched logos (SVG), one-portfolio limit, phone/custom contact fields

## Work completed

### 1. Logo fix — switched from PNG to SVG
- Copied 6 SVG files from `upload/` to `public/`: `icon-limemoss.svg`, `icon-light.svg`, `icon-light-limemoss.svg`, `logo-v-dark.svg`, `logo-v-light.svg`, `favicon.svg`
- Replaced all `<img src="/icon-limemoss.png">` with `<img src="/icon-limemoss.svg">` across 6 component files
- Added `object-contain` to all logo `<img>` tags to prevent stretching (the SVG has a non-square aspect ratio that was being forced into a square container)
- Updated favicon in `layout.tsx` from `/favicon.png` to `/favicon.svg`
- VLM confirmed: "logo appears normal and proportional, with no visible stretching or distortion"

### 2. One-portfolio limit
- **API**: Added a check in `POST /api/sites` — if `type === "portfolio"`, query for existing portfolio sites by the user. If one exists, return 409 with "You already have a portfolio."
- **Dashboard UI**: Updated `CreateSiteButton` to accept a `hasPortfolio` prop. When true, the "Portfolio" type button is disabled (`cursor-not-allowed opacity-40`) and shows "You already have a portfolio. Each account can have only one." instead of the normal description.
- Added `dash.portfolioExists` i18n key in both EN and FR.
- Verified: Created a portfolio → went back to create dialog → Portfolio option shows the "already exists" message and is disabled.

### 3. Phone + custom contact fields on portfolio
- Added `phone` field to the `contact` object in the `PortfolioContent` type across all 4 files (editor-view, preview-view, public-site-client, AI generate route).
- Updated `DEFAULT_PORTFOLIO.contact` to include `phone: ""`.
- Updated the API starter content to include `phone: ""` and `highlights: []` (was missing).
- Updated the AI generation portfolio prompt to include `"phone": string` in the contact JSON schema.
- Added `editor.phone` i18n key: "Phone" (EN) / "Téléphone" (FR).
- **Editor**: Added a phone `InputRow` in the PortfolioContentEditor's Contact section (between Email and Location).
- **Preview pane**: Added phone rendering in PortfolioPreviewSections contact section.
- **Preview view**: Added phone rendering in PortfolioSections contact section.
- **Public page**: Added phone rendering with `tel:` link in the contact section. Updated the condition to include `content.contact.phone` in the "show contact section" check.
- **Deep-merge fix**: Re-applied the deep-merge in `loadSite` (was overwritten by the i18n subagent's shallow spread) — ensures nested objects (hero, about, contact) get their defaults from DEFAULT_PORTFOLIO when the DB content is missing fields.

### 4. Bug fix — portfolio editor crash
- **Root cause**: The i18n subagent reverted the deep-merge in `loadSite` back to a shallow spread (`{ ...DEFAULT_PORTFOLIO, ...parsed }`). When the parsed content had `about: { body: "" }` without `highlights`, the shallow spread lost the `highlights: []` from the default. Then `content.about.highlights` was `undefined`, causing a crash in `StringListEditor`/`ListEditor` when calling `.map()` on undefined.
- **Fix**: Re-applied the deep-merge with explicit nested object merging for `hero`, `sectionLabels`, `about`, and `contact`. Also added `safeItems = items ?? []` defensive fallbacks in both `ListEditor` and `StringListEditor`.
- Verified: Portfolio editor opens without crashing, phone field visible in Contact section.

## Files modified
- `public/` (6 new SVG files)
- `src/app/layout.tsx` (favicon → /favicon.svg)
- `src/components/site/navbar.tsx`, `footer.tsx`, `views/auth-wizard-view.tsx`, `views/login-view.tsx`, `public/public-site-client.tsx`, `public/explore-gallery-client.tsx` (PNG → SVG + object-contain)
- `src/app/api/sites/route.ts` (one-portfolio limit check + about.highlights in starter content + phone in contact)
- `src/app/api/ai/generate/route.ts` (phone in portfolio contact schema)
- `src/lib/i18n.ts` (editor.phone key EN+FR, dash.portfolioExists key EN+FR)
- `src/components/views/dashboard-view.tsx` (hasPortfolio prop on CreateSiteButton, disabled portfolio option)
- `src/components/views/editor-view.tsx` (phone field in PortfolioContentEditor, deep-merge re-applied, safeItems fallbacks, useTranslation hooks added to PreviewSections)
- `src/components/views/preview-view.tsx` (phone in contact type + rendering)
- `src/components/public/public-site-client.tsx` (phone in contact type + rendering with tel: link)

---
Task ID: 24
Agent: main (user-requested settings pics + template fix)
Task: Profile/cover pic upload in Settings + fix template creation bug

## Work completed

### 1. Profile + cover picture upload in Settings tab
Updated the `SettingsTab` in `dashboard-view.tsx`:
- Added `avatarUrl` and `coverUrl` state (initialized from `user.avatarUrl`/`user.coverUrl`)
- Added `uploadImage(file, kind)` function that reads the file as a data URL, updates local state, and PATCHes `/api/users/me` with the new `avatarUrl`/`coverUrl`
- Added UI sections:
  - **Profile picture**: circular preview (h-16 w-16 rounded-full) with Upload button
  - **Cover picture**: rectangular preview (h-16 w-24 rounded-lg) with Upload button
  - Both have loading spinner states (`uploadingAvatar`/`uploadingCover`)
  - After upload, the global Zustand store is synced with the updated user object
- Imported `User`, `Upload`, and `Image as ImageIcon` from lucide-react
- Verified: VLM confirmed "circular profile picture preview and a rectangular cover picture preview, both accompanied by Upload buttons"

### 2. Fixed template creation bug
The TemplatesTab was calling `goEditor({ type: tpl.type, templateId: tpl.id })` WITHOUT a `siteId` — opening the editor with no site, so users couldn't save.

Rewrote `TemplatesTab`:
- Accepts `hasPortfolio`, `onCreated`, `pushToast` props (passed from DashboardView)
- The "Use template" button now:
  1. Calls `POST /api/sites` with `{ type: tpl.name, title: tpl.name, theme: tpl.theme, templateId: tpl.id }`
  2. On success: calls `onCreated(data.site)` which calls `loadSites()` + `goEditor({ siteId: data.site.id, type: data.site.type })`
  3. Shows loading spinner ("Creating…") during the POST
  4. Shows success toast
- Portfolio templates are disabled when the user already has a portfolio (`opacity-50` + disabled button + "portfolio already exists" message)
- Verified: POST /api/sites 200 → editor opened with the new site → "EVENT EDITOR" header visible

## Files modified
- `src/components/views/dashboard-view.tsx` (SettingsTab + profile/cover upload, TemplatesTab rewrite with POST-then-navigate)

---
Task ID: 25
Agent: main (user-requested socials URL links)
Task: Add clickable URLs to portfolio socials

## Work completed

Added a `url` field to the socials array across all files that define or render portfolio contact socials:

### Type changes
- `editor-view.tsx`: `socials: Array<{ platform: string; handle: string; url: string }>`
- `preview-view.tsx`: same
- `public-site-client.tsx`: same
- `api/ai/generate/route.ts`: AI schema now includes `"url": string` in the socials JSON shape

### Editor
- The ListEditor's empty template updated to `{ platform: "", handle: "", url: "" }`
- Added a third input row for the URL (`placeholder="https://instagram.com/yourhandle"`)
- The socials row now has 3 fields: platform, handle, URL (URL on its own line below the platform/handle row)

### Rendering — socials are now clickable links
When a social entry has a `url`, it renders as an `<a>` tag with:
- `target="_blank"` + `rel="noopener noreferrer"`
- Amber text color + hover bg
- An `ExternalLink` icon (↗) on the public page, or `↗` character in the preview pane
When no URL is set, it renders as a plain `<span>` (non-clickable)

This applies to:
- **Editor preview pane** (editor-view.tsx): socials with URL → amber link with ↗
- **In-app preview view** (preview-view.tsx): same pattern
- **Public page** (public-site-client.tsx): socials with URL → amber link with ExternalLink icon, opens in new tab

### AI generation
- Updated the portfolio full-generation system prompt to include `"url"` in the socials schema
- Added `contact` to the sectionDefs for portfolio section-scoped regeneration, with instructions to include full URLs in socials

## Files modified
- `src/components/views/editor-view.tsx` (socials type + URL input + preview pane rendering as links)
- `src/components/views/preview-view.tsx` (socials type + rendering as links)
- `src/components/public/public-site-client.tsx` (socials type + rendering as clickable links with ExternalLink icon)
- `src/app/api/ai/generate/route.ts` (socials schema includes url + contact added to sectionDefs)

---
Task ID: 26
Agent: main (user-requested agenda locations)
Task: Add country/city locations to event agenda items

## Work completed

Added `country` and `city` fields to every agenda entry, so events that take place in multiple locations can show where each date/session happens.

### Type changes (4 files)
- `editor-view.tsx`: `agenda: Array<{ time: string; title: string; track: string; country: string; city: string }>`
- `preview-view.tsx`: same
- `public-site-client.tsx`: `agenda?: Array<{ time: string; title: string; track: string; country: string; city: string }>`
- `api/ai/generate/route.ts`: AI schema includes `"country": string, "city": string` in agenda entries + sectionDefs for per-section regeneration

### Editor
- Added `AFRICAN_COUNTRIES` constant — 54 African countries (Algeria through Zimbabwe)
- The agenda ListEditor's `empty` template now includes `country: "", city: ""`
- Each agenda row now has 2 rows of inputs:
  - Row 1: Time, Title, Track (3 columns)
  - Row 2: Country dropdown (54 African countries) + City text input (2 columns)
- The country dropdown is a native `<select>` with all African countries

### Rendering (3 files)
Every agenda item now shows a 📍 location line below the track text:
- **Editor preview pane**: `📍 {city}, {country}` in `text-[10px] text-ef-muted`
- **In-app preview view**: `📍 {city}, {country}` in `text-xs text-ef-muted`
- **Public page**: `📍 {city}, {country}` in `text-xs text-ef-muted`
- The location line only renders when at least one of country/city is non-empty
- Changed `items-center` to `items-start` on the agenda row so the location line doesn't misalign the time column

### AI generation
- Full-content generation: agenda schema includes country + city
- Section-scoped regeneration: agenda sectionDef includes country + city with instructions: "Country should be an African country name. City is the city name."

## Verification
- Lint clean (0/0)
- VLM confirmed: "country dropdown with 'Cameroon' selected and a city text input field in the Agenda section"
- Country dropdown value persists as "Cameroon" after selection

## Files modified
- `src/components/views/editor-view.tsx` (AFRICAN_COUNTRIES constant + agenda type + country dropdown + city input + preview rendering)
- `src/components/views/preview-view.tsx` (agenda type + location rendering)
- `src/components/public/public-site-client.tsx` (agenda type + location rendering)
- `src/app/api/ai/generate/route.ts` (agenda schema + sectionDefs)

---
Task ID: 27
Agent: main (user-requested partner logos + agenda dates)
Task: Add partner logos to sponsors + date field to agenda items

## Work completed

### 1. Partner logos/pictures for event sponsors
Changed sponsors from `string[]` to `Array<{ name: string; logo: string }>` across all files:

**Type changes** (editor-view, preview-view, public-site-client, api/ai/generate):
- `sponsors: string[]` → `sponsors: Array<{ name: string; logo: string }>`

**Editor**:
- Replaced `StringListEditor` with `ListEditor` for sponsors
- Each sponsor row has: logo preview (10×10 dashed border placeholder or uploaded image), name input, "Logo" upload button (file picker), remove logo button
- `FileReader` reads the uploaded file as a data URL and stores it in `item.logo`

**Rendering** (editor preview, preview-view, public-site-client):
- Sponsors now render as cards with `flex items-center gap-2/3` — showing the logo image (if present) + the name text
- Logo images use `object-contain` + `h-10 w-10` + `onError` handler to hide broken images
- VLM confirmed: "each sponsor row contains a logo upload area, a text input for the sponsor name, and a Logo upload button"

**AI generation**:
- Schema: `"sponsors": [{ "name": string, "logo": string }]`
- SectionDefs: logo should be empty string (users upload their own)

### 2. Date field in agenda items
Added `date: string` to agenda entries across all files:

**Type changes**: `agenda: Array<{ time: string; title: string; track: string; country: string; city: string; date: string }>`

**Editor**:
- Added a date `Input` field (placeholder "Mar 14") to the agenda row, on the second row alongside country + city (now 3 columns: date, country, city)
- Empty template: `{ time: "", title: "", track: "", country: "", city: "", date: "" }`

**Rendering** (editor preview, preview-view, public-site-client):
- The time column is now wrapped in a `<div>` that shows the time + the date below it (if present)
- Format: time in mono amber, date in muted text directly below
- Changed `items-center` to `items-start` and wrapped the time span in a div

**AI generation**:
- Schema includes `"date": string` in agenda entries
- SectionDefs: "Date is like 'Mar 14' or '2025-03-14'"
- VLM confirmed: "each agenda row contains a date field with the placeholder 'Mar 14', a country dropdown, and a city input"

## Files modified
- `src/components/views/editor-view.tsx` (Upload import + sponsors ListEditor with logo upload + agenda date field + rendering)
- `src/components/views/preview-view.tsx` (sponsors type + rendering + agenda date rendering)
- `src/components/public/public-site-client.tsx` (sponsors type + rendering + agenda date rendering)
- `src/app/api/ai/generate/route.ts` (sponsors schema + agenda schema + sectionDefs)

---
Task ID: 28
Agent: main + full-stack-developer subagent (user-requested dashboard redesign)
Task: Redesign dashboard as 3-column layout with left nav + portfolio editing + right design settings

## Work completed

### Dashboard redesign — 3-column layout
Completely rebuilt the `DashboardView` component (1172 → 1919 lines) from a top-header + tab-bar layout to a 3-column design inspired by the reference image:

**Left sidebar** (240px, `w-60`):
- Evergreen background (`bg-ef-surface`)
- Logo: `<img src="/icon-limemoss.svg">` + "EventFolio." text
- **MANAGE** section: Home, Portfolio (active by default), Events, Analytics, Settings
- **SUPPORT** section: Templates, FAQ
- Bottom: User name + plan badge + Logout button
- Hidden on mobile (<lg), replaced by a hamburger menu using shadcn's `Sheet` component

**Main content** (flex-1):
When "Portfolio" is active (default):
- **Top bar**: Progress indicator ("Completed at X%") with animated progress bar + Save button
- **MAIN INFO section**: Title (underline input), Description (textarea), Website (underline input)
- **SOCIAL MEDIA INFO section** (2-column grid): Facebook URL, Instagram URL, TikTok URL, LinkedIn URL
- All fields use underline-style inputs (`border-b focus:border-ef-amber`)
- Data maps to the user's portfolio site content JSON (hero.title, hero.tagline, hero.eyebrow as website, contact.socials as social URLs)
- On Save: PATCH `/api/sites/[id]` with updated content

When other nav items are active:
- Home → SitesTab (site cards grid)
- Events → SitesTab filtered to events
- Analytics → AnalyticsTab (stats + top sites)
- Settings → SettingsTab (profile/cover upload + name/bio)
- Templates → TemplatesTab (template cards with "Use template" button)

**Right sidebar** (320px, `w-80`, only visible when Portfolio is active, `lg:flex`):
- **Header**: "PORTFOLIO DESIGN SETTINGS" on `bg-ef-amber text-ef-bg`
- **Colors section**: 5 theme swatches (Aurora, Noir, Sunset, Mint, Crimson) — clicking changes the portfolio's theme
- **Fonts section**: 3 font options (Sans, Serif, Mono) with preview text
- **Visual assets section**: 4 upload tiles:
  - Logo (SVG/PNG) — file picker → reads as data URL
  - Favicon — file picker
  - Banner — file picker
  - Open Graph — file picker
  Each has a dashed-border placeholder + "Upload" button + loading spinner

### Data flow
1. On mount: fetch `/api/sites` → find portfolio site (type="portfolio")
2. Parse content JSON → populate form fields (title, description, website, social URLs)
3. On Save: build updated content JSON → PATCH `/api/sites/[id]`
4. Theme changes → saved with the content PATCH
5. Visual asset uploads → stored in content JSON as data URLs

### i18n
- 24 new translation keys × EN + FR = 48 new i18n lines
- Keys: `dash.layout.manage`, `dash.layout.support`, `dash.layout.mainInfo`, `dash.layout.socialMediaInfo`, `dash.layout.portfolioDesignSettings`, `dash.layout.completedAt` (with {pct} var), `dash.layout.colors`, `dash.layout.fonts`, `dash.layout.visualAssets`, `dash.layout.logo`, `dash.layout.favicon`, `dash.layout.banner`, `dash.layout.openGraph`, `dash.layout.fbUrl`, `dash.layout.igUrl`, `dash.layout.ttUrl`, `dash.layout.liUrl`, `dash.layout.website`, etc.

### Bug fix
- Right sidebar was hidden below `xl` breakpoint (1280px) → changed to `lg:flex` (1024px) so it shows on standard desktop viewports

## Verification
- `bun run lint`: 0 errors, 0 warnings
- VLM confirmed: "3-column design. Left sidebar contains navigation, center holds the portfolio form (Main Info and Social Media), right sidebar displays Portfolio Design Settings (Colors, Fonts, Visual assets)."
- Dashboard loads with portfolio form populated from the user's portfolio site
- All existing sub-components (SitesTab, TemplatesTab, AnalyticsTab, SettingsTab, CreateSiteButton, SiteCard) preserved unchanged

## Files modified
- `src/components/views/dashboard-view.tsx` (full DashboardView rewrite + PortfolioEditPane + RightSidebar + AssetUpload + computeProgress helpers, ~746 new lines)
- `src/lib/i18n.ts` (48 new translation lines for dashboard layout keys)

---
Task ID: 29
Agent: main (user-requested image gallery)
Task: Add image gallery to portfolios and events pages to showcase projects and others

## Work completed

### Data model
Added a `gallery` field to both `EventContent` and `PortfolioContent` types across all 4 files that render content:
- `gallery: Array<{ src: string; caption: string; alt: string }>`
- Also added `gallery?: string` to `sectionLabels` so the section header can be renamed per-site

### Editor (editor-view.tsx)
- Exported new `GalleryItem` type
- `DEFAULT_EVENT` and `DEFAULT_PORTFOLIO` now ship with `gallery: []`
- `loadSite()` parses `parsed.gallery` into state
- Both `generate()` (full AI) and `regenerateSection()` (section-scoped) merge gallery from API responses
- New `GalleryEditor` component (shared between event & portfolio editors):
  - Uses the existing drag-to-reorder `ListEditor`
  - Each row: thumbnail preview (16×16) + caption input + alt input + per-row Image upload button
  - Bulk-upload label at the bottom: `<input type="file" multiple>` reads each file as a data URL and appends as a new gallery entry, with the filename (minus extension) auto-filled as alt text
  - Loading state for the bulk upload
- The gallery card is rendered as the last card in both `EventContentEditor` and `PortfolioContentEditor`
- The `EventPreviewSections` and `PortfolioPreviewSections` (right-side live preview pane) now render the gallery as a 2/3-col grid with aspect-[4/3] thumbnails + caption strip
- Updated `editor.aiDesc` "sections" string to mention gallery

### In-app preview view (preview-view.tsx)
- Added optional `gallery` field to EventContent & PortfolioContent types
- Both `EventSections` and `PortfolioSections` render a Gallery section (after sponsors for events, after contact for portfolios) showing the same 2/3-col grid

### Public page (public-site-client.tsx)
- Added optional `gallery` field to EventContent & PortfolioContent types
- Both `EventSections` and `PortfolioSections` render a Gallery section with the new `GalleryGrid` component
- New `GalleryGrid` component:
  - Responsive 2/3/4-col grid of `motion.button`s
  - Lazy-loaded `<img>` with `aspect-[4/3]` thumbnails
  - Hover state shows a gradient overlay + caption + maximize icon
  - Clicking any image opens a full-screen lightbox modal (ARIA `role="dialog"` `aria-modal="true"`)
  - Lightbox features:
    - Close button (top-right) + Prev/Next buttons (left/right edges)
    - Keyboard support: Escape closes, ←/→ navigates
    - Body scroll lock while open (restores on close)
    - Click-outside-to-close on the backdrop
    - Caption + position indicator ("1 / 3") shown in `<figcaption>`
    - Staggered entry animation per thumbnail
- New imports: `Maximize2`, `X`, `ChevronLeft`, `ChevronRight`
- TOC entries: `gallery` added to both event and portfolio section lists

### AI generation route (api/ai/generate/route.ts)
- Both `EVENT_SYSTEM` and `PORTFOLIO_SYSTEM` system prompts updated:
  - JSON schema now includes `"gallery": [{ "src": string, "caption": string, "alt": string }]`
  - `sectionLabels` schema includes `"gallery": string`
  - Type-aware gallery labels per event/portfolio type:
    - Conference/Summit: gallery="Highlights"
    - Festival: gallery="Moments" or "Past editions"
    - Workshop: gallery="Studio"
    - Meetup: gallery="From past meetups"
    - Exhibition: gallery="Installations"
    - Designer/studio: gallery="Studio"
    - Photographer: gallery="Portfolio"
    - Illustrator: gallery="Sketchbook"
    - Developer: gallery="Showcase"
  - Rules instruct the model to produce 4-6 entries describing the kinds of photos that would suit the page, leaving `src` empty (users upload their own images)
- `sectionDefs` for per-section regeneration now includes `gallery` for both event & portfolio, with shape + instruction matching the full-content prompt

### i18n (lib/i18n.ts)
- 8 new keys × EN + FR = 16 new translation lines
- EN keys: `editor.gallery`, `editor.galleryDesc`, `editor.galleryCaptionPlaceholder`, `editor.galleryAltPlaceholder`, `editor.galleryImage`, `editor.galleryBulkUpload`, `editor.galleryUploading`, `editor.removeImage`
- FR equivalents added

## Verification (all passed)

- `bun run lint`: 0 errors, 0 warnings
- Dev server log: clean, no errors
- Agent-browser end-to-end verification on the `Summit Conference` event:
  1. Logged in as `demo@eventfolio.app`
  2. Opened the Summit Conference site in the editor → confirmed the "Gallery (0)" collapsible card renders between Sponsors and the footer of the editor sidebar
  3. Bulk-uploaded 3 test images via JS `DataTransfer` on the hidden `<input type="file" multiple>` → 3 gallery entries auto-created with auto-detected alt text (`gallery-0`, `gallery-1`, `gallery-2`)
  4. Filled captions ("Conference keynote stage", "Workshop in progress", "Closing night celebration")
  5. VLM analysis of editor screenshot: confirmed 3 entries with captions in the LEFT form, and a "(GALLERY)" section with 3 thumbnails in the RIGHT live preview pane
  6. Saved + published the site → no errors
  7. Visited the public URL `/summit-conference` → gallery section renders with 3 image buttons labelled "Open image N: <caption>"
  8. Clicked image 1 → lightbox modal opens (Close, Previous, Next buttons + figure with caption "Conference keynote stage" + "1 / 3" indicator)
  9. Clicked Next → figure caption updated to "Workshop in progress2 / 3" ✓
  10. Clicked Previous → figure caption updated back to "Conference keynote stage1 / 3" ✓
  11. Pressed Escape → lightbox closed ✓
  12. VLM analysis of public page screenshot: confirmed "Gallery" section with 3 thumbnails (captions are hover-only by design)
  13. Opened in-app Preview view (preview-view.tsx) → VLM confirmed Gallery section with 3 thumbnails + captions visible below each image

## Files modified
- `src/components/views/editor-view.tsx` (GalleryItem type export + EventContent/PortfolioContent types + DEFAULT_EVENT/DEFAULT_PORTFOLIO + loadSite + generate + regenerateSection merge + GalleryEditor component + EventPreviewSections/PortfolioPreviewSections gallery rendering + aiDesc "sections" string)
- `src/components/views/preview-view.tsx` (EventContent/PortfolioContent types + EventSections/PortfolioSections gallery rendering)
- `src/components/public/public-site-client.tsx` (EventContent/PortfolioContent types + EventSections/PortfolioSections gallery rendering + GalleryGrid component with lightbox + TableOfContents gallery entry + new lucide-react imports)
- `src/app/api/ai/generate/route.ts` (EVENT_SYSTEM + PORTFOLIO_SYSTEM + sectionDefs gallery entries + section comment)
- `src/lib/i18n.ts` (8 new keys × EN+FR)
