# Changelog

All commits so far, newest last. Dates are commit dates.

## Scaffold
- `a3240c0` 2026-10-21 Initial commit from Create Next App
- `70ca989` 2026-10-21 phase 1: scaffold — Next 16, Tailwind v4 tokens, `site.ts`, `env.ts`, layout, nav, section header, six empty sections

## Hero
- `a5fbf26` 2026-10-21 phase 2: hero — player card with brackets and avatar fallback, boot sequence, Konami and CRT overlay, pre-paint script

## Content
- `1e001ca` 2026-10-21 phase 3: content — loadout, quest log with GitHub side quests, campaign timeline, send ping, footer, nav active-section rewrite

## Trophy case
- `9b00cdb` 2026-10-21 phase 4: trophy case — types, Steam/Xbox/PSN adapters, hourly cache, snapshot fallback, aggregate row, platform cards, debug route
- `ab9cfd8` 2026-10-21 fix: xbox adapter — unwrap OpenXBL `content`; warnings carry status and a redacted body excerpt

## Ship
- `85c4199` 2026-10-21 phase 5: ship — `/resume` with print styles, OG image with bundled fonts, sitemap, robots, icon, README, adapter shape guards, PSN cleanup and dedupe, Xbox progress derivation

## Arcade polish
- `01b4b80` 2026-10-21 arcade: 3 per card, filter non-xbox titles — `RECENT_SHOWN`, Win32 Game Bar titles dropped via `devices`
- `64c3322` 2026-10-21 polish: psn handle, progress display, resume pdf — real PSN handle, omit 0% without achievement data, `public/resume.pdf` printed from `/resume`
- `5a5becc` 2026-10-21 arcade: snapshot sync, name cleanup, xbox artwork — Xbox snapshot matches live, shared `cleanName`, http→https image upgrade
- `275f488` 2026-10-21 fix: image sizes, duplicate dates — 1x/2x srcset for thumbnails, campaign date rendered once
- `e2b6940` 2026-10-21 arcade: align platform cards — subgrid rows, shared label column, PSN tag on meta line, fixed month names

## Docs
- `f4636a3` 2026-10-21 docs: operating guide, docs folder, path rules — `CLAUDE.md` rewritten as the operating guide, spec frozen at `docs/spec.md`, `docs/` created, `.claude/rules/` added, public README rewritten

## Motion
- `6bdc1b9` 2026-10-21 motion: arcade loader, count-up, xp bars — Suspense skeleton for the trophy case, aggregate numbers count up once in view, 2px XP bars under progress lines; all respect reduced motion, no new dependency

## Cadence
- (this commit) arcade: daily cadence, revalidate route — `cacheLife("days")` with tags `arcade` and `github`, Steam "now playing" dropped, source label "synced 21 Oct, 13:42 IST", `POST /api/revalidate` guarded by `REVALIDATE_SECRET`
