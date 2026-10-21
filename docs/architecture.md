# Architecture

## Stack

From `package.json`:

| Package | Version | Role |
|---|---|---|
| next | 16.4.2 | App Router, Turbopack, Cache Components on |
| react, react-dom | 19.3.0 | |
| psn-api | ^2.18.1 | PlayStation trophy API client (the only extra runtime dependency) |
| tailwindcss, @tailwindcss/turbopack | ^4 | CSS-first config via `@theme` in `globals.css` |
| typescript | ^5 | `strict`, path alias `@/*` → `src/*` |
| eslint, eslint-config-next | ^9, 16.4.2 | `pnpm lint` |
| pnpm | 10.33.0 | package manager (`packageManager` field) |

Scripts: `dev`, `build`, `start`, `lint` (`eslint`), `typecheck` (`tsc --noEmit`).

`next.config.ts` sets `cacheComponents: true`, `partialPrefetching: true`, `images.remotePatterns` from `IMAGE_HOSTS`, a Turbopack rule for Tailwind, and `outputFileTracingIncludes` so the Open Graph route ships its TTF files.

## Folder map

```
src/app/
  layout.tsx            fonts, metadata, skip link, <Nav/>, <Konami/>, <CrtOverlay/>, footer, pre-paint inline script
  page.tsx              <BootSequence/> + six <section>s: player, loadout, quests, campaign, arcade, ping
  globals.css           @theme tokens, base layer, boot/CRT hooks, reduced-motion, print
  icon.svg              32px pixel "N" favicon
  opengraph-image.tsx   1200x630 PNG via ImageResponse, fonts read from src/app/fonts
  robots.ts, sitemap.ts metadata routes (/ and /resume)
  resume/page.tsx       résumé from site.ts, build-time check for public/resume.pdf
  api/trophy-case/route.ts  dev-only JSON of getTrophyCase(); 404 in production
  api/revalidate/route.ts   POST with x-revalidate-secret: marks the arcade and github tags stale
  fonts/                PressStart2P-Regular.ttf, JetBrainsMono-Regular.ttf + OFL licences
src/components/
  boot-sequence.tsx     client: typed boot overlay, once per session
  nav.tsx               client: sticky nav, active-section tick
  konami.tsx            client, renders nothing: key sequence and avatar taps toggle CRT
  crt-overlay.tsx       client: scanlines + toast
  section-header.tsx    HUD tab (1px rule + accent tick + h2)
  player-card.tsx       avatar, name, status, links, corner brackets
  loadout.tsx           skills definition list
  quest-log.tsx         async: featured projects + GitHub side quests
  campaign.tsx          timeline of roles and education
  trophy-case.tsx       async: aggregate row + three <PlatformCard/>s + blog row
  platform-card.tsx     one platform's stats and recent games
  send-ping.tsx         email, GitHub, LinkedIn rows
src/config/site.ts      all content, typed as SiteConfig
src/lib/
  env.ts                undefined-safe reads of every env var
  crt.ts                CRT toggle helpers + the pre-paint inline script string
  github.ts             getSideQuests(), cached daily under the "github" tag
  gaming/types.ts       GameEntry, PlatformStats, Aggregate, PlatformId
  gaming/index.ts       getTrophyCase(): cached wrappers, allSettled, aggregate
  gaming/steam.ts, xbox.ts, psn.ts   adapters
  gaming/shared.ts      snapshot(), safeImage(), fetchJson(), HttpError, ShapeError, assertUsable(), cleanName(), RECENT_SHOWN
  gaming/format.ts      sourceLabel(), shortDate(), formatNumber()
  gaming/image-hosts.ts IMAGE_HOSTS, shared with next.config.ts
public/resume.pdf       generated from /resume (see runbook)
docs/                   these documents; spec.md is the frozen build spec
.claude/rules/          path-scoped rules for Claude Code
```

## Request flow for `/`

1. `next build` prerenders `/` as a static shell. During that render `QuestLog` awaits `getSideQuests()` and `TrophyCase` awaits `getTrophyCase()`; both are `"use cache"` functions, so their results are baked into the shell with a one-day lifetime. Whatever env vars exist at build time decide whether the baked data is live or snapshot.
2. A request is served the shell from Vercel's cache. After one day, or after `POST /api/revalidate`, the next request triggers a background revalidation that re-runs the cached functions with the runtime env; after a week without requests the next one waits for fresh data.
3. In the browser, an inline script in `<head>` (`PRE_PAINT_SCRIPT` from `src/lib/crt.ts`) runs before paint: it sets `data-crt="on"` on `<html>` if `localStorage.crt === "on"` and `data-boot="done"` if `sessionStorage.boot === "1"`. CSS in `globals.css` uses those attributes to show scanlines or hide the boot overlay without a flash.
4. `BootSequence` hydrates on top of the already-rendered content, plays or skips, and unmounts. `Nav` attaches an `IntersectionObserver` to the six sections.

## Server vs client components

| Client (`"use client"`) | Server |
|---|---|
| `boot-sequence.tsx`, `nav.tsx`, `konami.tsx`, `crt-overlay.tsx` | `layout.tsx`, `page.tsx`, `resume/page.tsx`, `opengraph-image.tsx`, `section-header.tsx`, `player-card.tsx`, `loadout.tsx`, `quest-log.tsx` (async), `campaign.tsx`, `trophy-case.tsx` (async), `platform-card.tsx`, `send-ping.tsx` |

`Nav` lives in the layout and survives route changes, so its effect re-runs on `usePathname()` and its links are `next/link` to `/#section`.

## Caching model

- Profile: every cached function calls `cacheLife("days")`, which is stale 5 min (client router), revalidate 1 day, expire 1 week. The build output prints `/` as `Revalidate 1d, Expire 1w`.
- Tags: the three gaming caches are tagged `arcade`, the GitHub cache `github`. `POST /api/revalidate` calls `revalidateTag(tag, "max")` on both, marking them stale so the next visit refreshes in the background.
- Cached functions: `getSideQuests()` in `src/lib/github.ts`; `cachedSteam`, `cachedXbox`, `cachedPsn` in `src/lib/gaming/index.ts`. Each catches inside the cached scope, so a failure caches the fallback (empty list or snapshot) for the same day and retries after, or sooner after a manual revalidate. A failure is therefore never baked in until the next deploy.
- `/api/trophy-case` calls `await connection()` so it always renders at request time, then returns 404 when `NODE_ENV === "production"`. In `next dev` it returns `getTrophyCase()` as JSON so keys can be verified without the UI. It never includes env values.
- `/opengraph-image` is dynamic because it reads font files with `fs.readFile`; `outputFileTracingIncludes` guarantees the files are in its function bundle.
- `/resume` is static; the "Download PDF" link depends on `existsSync("public/resume.pdf")` evaluated at build.

## Image hosts

`IMAGE_HOSTS` in `src/lib/gaming/image-hosts.ts` is the single list. `next.config.ts` turns it into `remotePatterns` (https only). `safeImage()` in `src/lib/gaming/shared.ts` drops any URL whose host is not in the list and upgrades `http://` to `https://` for hosts that are, because OpenXBL serves store artwork over http. Adding a host means adding one line to that file; both consumers follow.

Current hosts: `res.cloudinary.com`, `cdn.cloudflare.steamstatic.com`, `avatars.steamstatic.com`, `images-eds-ssl.xboxlive.com`, `store-images.s-microsoft.com`, `image.api.playstation.com`, `psnobj.prod.dl.playstation.net`.

## Adding a page

Create `src/app/<route>/page.tsx` as a server component, export `metadata` (the title template appends " — NeerajNero"), pull content from `site.ts`, and add the URL to `src/app/sitemap.ts`. If the page must not be prerendered, call `await connection()` from `next/server` before reading request-time data.
