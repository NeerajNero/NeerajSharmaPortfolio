> Original build spec, frozen at ship. The living docs are in this folder; CLAUDE.md is the operating guide.

# neerajnero.com — personal portfolio

You are building a personal portfolio for Neeraj Sharma (GitHub: NeerajNero). This file is the full spec. Read it before writing any code. Build only the phase you are asked for, then stop and wait.

The site is a **player profile**: minimal, dark, one acid-green accent, HUD framing. It is a dev portfolio that happens to speak gaming, not a gaming site with a résumé bolted on. Spend the boldness in two places only — the boot sequence and the trophy case — and keep everything else quiet.

---

## 1. Stack

- Latest stable Next.js, App Router, TypeScript strict, `src/` dir, `@/*` alias, pnpm. Scaffold with `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm`. Next uses Turbopack and rewrites AGENTS.md on `next dev` — leave AGENTS.md alone, CLAUDE.md is the spec.
- Tailwind v4 (CSS-first config in `globals.css` via `@theme`). No component library. Hand-roll every component.
- Fonts via `next/font/google`: **Press Start 2P** (display, used sparingly) and **JetBrains Mono** (everything else).
- `psn-api` for PlayStation. No other runtime deps unless you justify them in one line.
- Deployed on Vercel. Domain `neerajnero.com`.
- All content lives in one typed file: `src/config/site.ts`. No content inside components.

## Engineering rules
- Thin components; data fetching and adapters in `src/lib/**`. Server components by default; `"use client"` only where there is state or browser APIs (boot, nav, konami).
- `pnpm typecheck` and `pnpm lint` must pass before each commit. One commit per phase, named after it.
- Never swallow an error silently in `lib/` without a single `console.warn` line prefixed with the module name (`[steam]`, `[psn]`, `[github]`).
- No `any`. No default exports except Next route files.
- Every phase ends with a printed summary: what was built, what was skipped, and anything the owner must do manually.

## 2. Content (source of truth — copy exactly, do not embellish)

### Identity
- Display name: **Neeraj Sharma** (full legal: Neeraj Kumar Sharma U — use only on the résumé page)
- Handle: `NeerajNero`
- Title: Software Engineer 2
- Company: GeekyAnts, Bangalore, India
- Experience: 4+ years
- One-liner: "Full-stack engineer who builds backend systems, auth flows, and AI-assisted workflows in TypeScript. Plays on PC, PlayStation and Xbox."
- Email: neerajnero9066@gmail.com
- GitHub: https://github.com/NeerajNero
- LinkedIn: https://www.linkedin.com/in/neeraj-sharma-13610716a/
- Avatar: `process.env.NEXT_PUBLIC_DP_URL` (Cloudinary). If unset, render a 1-px-bordered square with the letters `NN` in Press Start 2P. Never ship a broken image.
- **Never render a phone number anywhere.**

### Experience (Campaign section, newest first)
1. **Software Engineer 2 — GeekyAnts** · Jun 2025 – Present · Bangalore
   - News & media platform: responsive UI, API integration, feature POCs.
   - Online dating platform: end-to-end auth/authz, Express → NestJS migration, admin panel, AI-powered text + image moderation.
   - Healthcare workflow platform: PDF generation, email workflows, treatment-plan and clinical-notes APIs.
   - Online learning & assessment platform: scalable backend for assessments, auth, learning modules.
   - B2B business platform: backend workflows and API development for enterprise use cases.
2. **Software Engineer 1 — Acesoft Labs** · Sep 2021 – Jun 2023 · Bangalore
   - Responsive web interfaces in React.js, REST integration, reusable component library, cross-browser and performance work, agile delivery.
3. **Trust & Safety Analyst / Technical Support Associate — Concentrix** · Jan 2020 – Sep 2021 · Bangalore
   - Built responsive UI screens in React.js, integrated REST APIs, bug fixes and feature work.

### Education
- BCA — CMR Institute of Management Studies, Bangalore · 2016 – 2019

### Skills (Loadout section — these are the exact groups)
- **Frontend**: React.js, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux Toolkit, Bootstrap, HTML5/CSS3
- **Backend**: Node.js, NestJS, Express.js, REST, GraphQL, Socket.io, BullMQ, Redis, JWT / OAuth, PDF + email workflows
- **Data**: PostgreSQL, MongoDB, Prisma, Drizzle, Mongoose, Hasura
- **Cloud & infra**: AWS (S3, Lambda, SQS, Rekognition), Docker, Docker Compose, Cloudinary, Linux
- **AI**: OpenAI APIs, content moderation (text + image), agentic workflows, AI-assisted development
- **Practice**: System design fundamentals, Swagger/OpenAPI, observability, agile

### Featured projects (Quest Log — "main quests", in this order)
| Name | Repo | Tags | Blurb |
|---|---|---|---|
| TinCan | https://github.com/NeerajNero/TinCan | Next.js, Firebase, PWA | Private PWA for two long-distance friends: chat, live presence, 14 games, shared memories, and a pet you raise together. |
| Self-Hosted Private Cloud | https://github.com/NeerajNero/Self-Hosted-Private-Cloud | Ubuntu Server, Mesh VPN, NAS | Secure self-hosted cloud with encrypted mesh networking, remote access, network storage and media services, minimal public attack surface. |
| Task-Flow (SimpleCRM) | https://github.com/NeerajNero/Task-Flow | NestJS, PostgreSQL, BullMQ, Docker | Multi-tenant CRM backend: event-driven with BullMQ, strict 4-layer architecture, full observability. |
| Chat-App | https://github.com/NeerajNero/Chat-App | NestJS, WebSockets, Prisma, Next.js | Real-time chat with cookie auth, Google OAuth and live presence. |
| Ganesha Chaturthi Donation Manager | https://github.com/NeerajNero/Ganesha-Chaturthi-Donation-Manager-2026 | Next.js, Prisma, PostgreSQL | Mobile-first app managing street-wise donations, expenses and community engagement for the festival. |
| AI Content Moderation | https://github.com/NeerajNero/AI-Content-Moderation | OpenAI, AWS Rekognition | POC moderating text and images with a simple web UI. |
| Yt-Downloader | https://github.com/NeerajNero/Yt-Downloader | Python | Local web app for best-quality video downloads with live progress and a library view. |
| GameTechGuides | https://github.com/NeerajNero/-GameTechBlog- | Next.js, Blog | Gaming and tech blog: practical guides, hardware, setups. |

### Side quests
Fetch the rest from `https://api.github.com/users/NeerajNero/repos?per_page=100&sort=updated` at build/ISR time (`revalidate: 3600`, `Authorization: Bearer ${GITHUB_TOKEN}` if set). Exclude forks, the profile repo `NeerajNero`, and anything already featured. Show the 8 most recently pushed as a compact list: name, language, one-line description, link. If the fetch fails, render nothing for this block — no error UI.

---

## 3. Design system

### Tokens (put in `@theme` in globals.css)
```
--color-bg:        #080A08   /* page */
--color-surface:   #0E110E   /* cards, boot screen */
--color-line:      #1F261F   /* all 1px borders */
--color-text:      #D6DDD2   /* body */
--color-muted:     #7E887B   /* secondary text — passes 4.5:1 on bg */
--color-accent:    #B8FF2B   /* acid green — the only colour */
--color-accent-dim:#3F5A10   /* accent at rest / disabled */
--font-display:    Press Start 2P
--font-mono:       JetBrains Mono
--radius:          2px       /* everything. no pill shapes, no rounded cards */
```
Trophy tiers may use their own tiny dots: bronze `#B07A3F`, silver `#A9B0B5`, gold `#E0B341`, platinum `#CFE6F5`. Nowhere else does a second colour appear.

### Type scale (JetBrains Mono unless noted)
- Display name: Press Start 2P, 28px desktop / 20px mobile, line-height 1.4, letter-spacing 0.02em
- Section titles: Press Start 2P, 13px, normal case, sentence case ("Quest log", not "QUEST LOG")
- Big numbers in trophy case: Press Start 2P, 22px
- Body: 15px / 1.65, max line length 70ch
- Meta/labels: 13px, `--color-muted`, normal case

### Rules — read these twice
- Backgrounds are flat. No gradients, no radial glows, no noise textures.
- Glow is allowed on exactly two things: the "online" status dot and keyboard focus rings (`box-shadow: 0 0 0 2px var(--color-accent)`).
- Borders are 1px `--color-line`. Corner brackets (four 8px L-shapes in accent) appear on the player card only.
- No entrance animations on sections. No hover lift/shadow on cards. Hover on links = accent underline, 1px, offset 3px. That is all.
- No ALL-CAPS tracked-out labels. No "→" on buttons or links. No middle-dot meta strings. No numbered 01/02/03 markers except the campaign timeline, which is an actual sequence.
- Left-aligned everything. Container max-width 1040px, 24px side padding on mobile.
- Section titles are rendered as HUD tabs: text sits on a 1px top rule with a short accent tick on the left. Build one `<SectionHeader>` and reuse it.
- Reduced motion: every animation checks `prefers-reduced-motion` and degrades to an instant state.

### Page wireframe (desktop)
```
┌──────────────────────────────────────────────────────────────┐
│ nav: NeerajNero          player  loadout  quests  campaign  arcade  ping │
├──────────────────────────────────────────────────────────────┤
│ ┌ player card ───────────────────────────────────────────┐   │
│ │ [DP 120px]  Neeraj Sharma                              │   │
│ │             Software Engineer 2 · GeekyAnts            │   │
│ │             ● online · Bangalore                       │   │
│ │             one-liner (max 70ch)                       │   │
│ │             [GitHub] [LinkedIn] [Résumé]               │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ─ Loadout ───────────────────────────────────────────────    │
│ Frontend   React · Next.js · ...     (two columns, text)     │
│ Backend    ...                                               │
│                                                              │
│ ─ Quest log ─────────────────────────────────────────────    │
│ Main quests: 8 rows, each: name / tags / blurb / repo link   │
│ Side quests: compact 8-row list from GitHub                  │
│                                                              │
│ ─ Campaign ──────────────────────────────────────────────    │
│ 1px vertical rule, 3 nodes, date on the left, role on right  │
│                                                              │
│ ─ Arcade ────────────────────────────────────────────────    │
│ ┌ aggregate row: 1,240 h Steam | 18,420 G | 7 platinums ┐    │
│ ├ Steam card ─┬ Xbox card ─┬ PSN card ─────────────────┤     │
│ │ handle      │ gamertag   │ online id                 │     │
│ │ now playing │ gamerscore │ level + trophy split      │     │
│ │ recent 5    │ recent 5   │ recent 5                  │     │
│ └─────────────┴────────────┴───────────────────────────┘     │
│ GameTechGuides link row                                      │
│                                                              │
│ ─ Send ping ─────────────────────────────────────────────    │
│ email (mailto), GitHub, LinkedIn. Nothing else.              │
│ footer: © 2026 · built with Next.js · source on GitHub       │
└──────────────────────────────────────────────────────────────┘
```
Mobile: single column, cards stack, nav collapses to a row of 6 short links that scroll horizontally (no hamburger).

---

## 4. Behaviour

### Boot sequence (`<BootSequence>`, client component)
Full-viewport `--color-surface` overlay shown on first visit per session (`sessionStorage.boot = "1"`). Types these lines in JetBrains Mono 14px, accent colour, ~16ms per character, each line ending with a 120ms pause:
```
neerajnero.com
loading player profile ......... ok
mounting quest log ............. ok
syncing trophy case ............ ok
press any key
```
Total runtime under 1.8s. Any key, tap or click skips to the end. When done (or skipped), overlay fades out over 250ms and the player card is already rendered beneath it — no layout shift. `prefers-reduced-motion`: show the final state for 400ms, then fade. Never block the page from being crawlable: the overlay is on top of fully rendered content, not a gate.

### Nav
Sticky top, 1px bottom rule, backdrop blur 8px over `--color-bg` at 85% opacity. Links scroll to section anchors with `scroll-margin-top`. Active section gets the accent tick. Keyboard reachable.

### Konami code
`↑↑↓↓←→←→BA` toggles `data-crt="on"` on `<html>`: a fixed, pointer-events-none overlay with 2px horizontal scanlines at 6% opacity and a 2-second toast "crt mode on / off" bottom-left. Mobile: tapping the avatar 5 times within 2s does the same. Persist in `localStorage.crt`.

### Résumé page (`/resume`)
Rendered from `site.ts` — full legal name, same three roles, education, skills. Print stylesheet: white background, black text, no nav, no boot. A "Download PDF" link to `/resume.pdf` (I will drop the PDF in `public/`). Add a note in README reminding me the PDF has my phone number on it and I may want a scrubbed version.

### Metadata
- `title`: "Neeraj Sharma — Software Engineer 2"; template `"%s — NeerajNero"`
- description = the one-liner
- `app/opengraph-image.tsx`: 1200×630, `--color-bg`, name in Press Start 2P in accent, handle + title in mono below, corner brackets. No photo.
- `sitemap.ts`, `robots.ts`, favicon = 32px pixel-style "N" in accent on bg as SVG.
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`.

### Accessibility floor
Skip link, semantic landmarks (`header/main/section/footer`), every section has an `h2`, focus rings visible everywhere, contrast ≥ 4.5:1 for all text, images have alt, animation respects reduced motion. Lighthouse accessibility 100 is the target.

---

## 5. Arcade — the Trophy Case

Three adapters behind one interface. Each runs server-side only, is cached for 1 hour, and **never throws** — on any failure it returns the static snapshot from `site.ts` with `source: "static"`. The page must build and render with zero env vars set.

### Types (`src/lib/gaming/types.ts`)
```ts
export type PlatformId = "steam" | "xbox" | "psn";

export interface GameEntry {
  name: string;
  image?: string;          // absolute URL
  lastPlayed?: string;     // ISO
  progress?: number;       // 0–100 achievement/trophy %
  hours?: number;          // total hours, where the platform gives it
}

export interface PlatformStats {
  id: PlatformId;
  handle: string;
  nowPlaying?: string;
  headline: { label: string; value: string }[];  // 2–3 pairs, e.g. [{label:"hours",value:"1,240"}]
  recent: GameEntry[];     // max 5
  source: "live" | "static";
  fetchedAt: string;       // ISO
}

export interface Aggregate {
  steamHours?: number;
  gamerscore?: number;
  platinums?: number;
}
```
`src/lib/gaming/index.ts` exports `getTrophyCase(): Promise<{ platforms: PlatformStats[]; aggregate: Aggregate }>` which runs all three adapters with `Promise.allSettled`. Wrap each adapter in `unstable_cache` (or `"use cache"` if the installed Next version supports it) with `revalidate: 3600`.

### Steam (`steam.ts`) — env `STEAM_API_KEY`, `STEAM_ID64`
- `GET https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=&steamids=` → `personaname`, `gameextrainfo` (now playing, may be absent).
- `GET https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=&steamid=&include_appinfo=1` → `game_count`, total hours = Σ `playtime_forever` / 60.
- `GET https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=&steamid=&count=5` → recent; image = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`; hours = `playtime_forever / 60`.
- For each recent game, `GET https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=&steamid=&appid=` → progress %. Skip silently if a game has no achievements (API returns success:false).
- headline: hours, games owned, now playing (if present).

### Xbox (`xbox.ts`) — env `OPENXBL_API_KEY`
OpenXBL (xbl.io). Headers: `X-Authorization: ${key}`, `Accept: application/json`, `Accept-Language: en-US`. Free tier is ~150 requests/hour; we make 2 per hour.
- `GET https://xbl.io/api/v2/account` → `profileUsers[0].settings[]`; read `Gamertag`, `Gamerscore`, `GameDisplayPicRaw`.
- `GET https://xbl.io/api/v2/player/titleHistory` → `titles[]`; take 5 by `titleHistory.lastTimePlayed` desc; `name`, `displayImage`, `achievement.progressPercentage`, `achievement.currentGamerscore / totalGamerscore`.
- headline: gamerscore, titles played, 100% completions (count of titles where progressPercentage === 100).

### PlayStation (`psn.ts`) — env `PSN_NPSSO`
Use `psn-api`. Module-scope token cache: on first call `exchangeNpssoForCode` → `exchangeCodeForAccessToken`; on later calls, if the access token is expired and a refresh token exists, `exchangeRefreshTokenForAuthTokens`; only fall back to NPSSO exchange if refresh fails.
- `getUserTrophyProfileSummary(auth, "me")` → `trophyLevel`, `progress`, `earnedTrophies.{bronze,silver,gold,platinum}`.
- `getUserTitles(auth, "me", { limit: 5 })` → `trophyTitles[]`; `trophyTitleName`, `trophyTitleIconUrl`, `trophyTitlePlatform`, `progress`, `lastUpdatedDateTime`.
- headline: level, platinums, trophy split rendered as four tiny tier dots with counts.
- If auth fails, log one line server-side (`[psn] auth failed — refresh PSN_NPSSO`) and return static.

### Static fallback (`site.ts` → `gaming.static`)
One hand-filled `PlatformStats` per platform with placeholder handles (`"steam-id"`, `"gamertag"`, `"online-id"`) and realistic-looking zeros. Mark clearly with a `// TODO: fill in` comment. The UI shows a small muted "snapshot" label when `source === "static"`, and "live · 14:00" when live.

### `next.config.ts` image hosts
`res.cloudinary.com`, `cdn.cloudflare.steamstatic.com`, `avatars.steamstatic.com`, `images-eds-ssl.xboxlive.com`, `image.api.playstation.com`, `psnobj.prod.dl.playstation.net`. Use `next/image` everywhere with explicit sizes.

### Aggregate row
Three big numbers above the cards: Steam hours, Xbox gamerscore, PSN platinums. If a platform is static, its number still renders (from the snapshot) but in `--color-muted` instead of accent.

---

## 6. Files

```
src/
  app/
    layout.tsx            fonts, metadata, skip link, <Nav/>, <CrtOverlay/>
    page.tsx              <BootSequence/> + sections in order
    globals.css           @theme tokens, base, focus, print
    resume/page.tsx
    opengraph-image.tsx
    sitemap.ts  robots.ts  icon.svg
  components/
    boot-sequence.tsx     client
    nav.tsx               client (active section)
    section-header.tsx
    player-card.tsx
    loadout.tsx
    quest-log.tsx         server — featured + side quests
    campaign.tsx
    trophy-case.tsx       server — calls getTrophyCase()
    platform-card.tsx
    send-ping.tsx
    konami.tsx            client
    crt-overlay.tsx
  config/site.ts
  lib/
    github.ts
    gaming/{types,index,steam,xbox,psn}.ts
    env.ts                typed reads with undefined-safe fallbacks
public/
  resume.pdf              (I add this)
.env.example
README.md
```

`.env.example`:
```
NEXT_PUBLIC_SITE_URL=https://neerajnero.com
NEXT_PUBLIC_DP_URL=
GITHUB_TOKEN=
STEAM_API_KEY=
STEAM_ID64=
OPENXBL_API_KEY=
PSN_NPSSO=
```

README must include: local run (pnpm), how to get each key (Steam: steamcommunity.com/dev/apikey + profile set public; Xbox: xbl.io dashboard; PSN: log in at playstation.com then open ca.account.sony.com/api/v1/ssocookie, note it expires every ~2 months), Vercel deploy, and DNS for `neerajnero.com` (A record `76.76.21.21` on apex, CNAME `www` → `cname.vercel-dns.com`, then add both domains in Vercel and redirect www → apex).

---

## 7. Build order (one Claude Code prompt per phase; stop at the end of each)

1. **Scaffold** — Next app, `psn-api`, fonts, `@theme` tokens, `site.ts` with all content from §2, `env.ts` + `.env.example`, `layout.tsx`, nav, section header, six empty sections with anchors, scripts (dev, build, lint, typecheck), commit.
2. **Hero** — player card with corner brackets and avatar fallback, boot sequence, Konami + CRT overlay. Build + lint green. Owner checks it at 375px and 1280px.
3. **Content** — loadout, quest log (featured + GitHub side quests with empty state), campaign timeline, send ping, footer.
4. **Trophy case** — types, three adapters, hourly cache, static fallback, aggregate row, platform cards, image hosts. Must build and render with zero env vars. Owner then adds keys and the live path is verified.
5. **Ship** — `/resume` + print styles, OG image, sitemap/robots/icon, README, final a11y and §3 rules pass, Vercel deploy, DNS for the apex and www.

## 8. Definition of done
- Builds with zero env vars; builds with all env vars.
- Lighthouse: performance ≥ 95, accessibility 100, best practices 100, SEO 100 on the home page.
- No console errors or warnings in dev.
- No content in components; everything in `site.ts`.
- Reads as deliberate, not generated: re-read §3 "Rules" before you say a phase is done and remove anything that breaks them.
