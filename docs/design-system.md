# Design system

## Tokens

Defined in `@theme` in `src/app/globals.css`. These are the only colours on the site apart from the four trophy-tier dots.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#080a08` | page |
| `--color-surface` | `#0e110e` | cards, boot overlay, toast |
| `--color-line` | `#1f261f` | every 1px border and divider |
| `--color-text` | `#d6ddd2` | body |
| `--color-muted` | `#7e887b` | labels, meta, secondary text |
| `--color-accent` | `#b8ff2b` | the one accent: ticks, brackets, status dot, live numbers |
| `--color-accent-dim` | `#3f5a10` | reserved for rest/disabled states (unused today) |
| `--font-display` | Press Start 2P via `next/font` variable | display name, section titles, big numbers |
| `--font-mono` | JetBrains Mono via `next/font` variable | everything else |
| `--radius` | `2px` | applied to every element in `@layer base` |

Tier dots in `platform-card.tsx`: bronze `#B07A3F`, silver `#A9B0B5`, gold `#E0B341`, platinum `#CFE6F5`.

Base layer: body 15px / 1.65 mono; `::selection` accent on bg; links inherit colour and underline in accent on hover (1px, offset 3px); `:focus-visible` is a 2px accent box-shadow; `section { scroll-margin-top: 72px }` matches the nav line used by `nav.tsx`.

## Type scale

| Element | Font | Size |
|---|---|---|
| Display name (`h1` in player card and résumé) | Press Start 2P | 28px desktop, 20px mobile, line-height 1.4, tracking 0.02em |
| Section titles (`SectionHeader`) | Press Start 2P | 13px, sentence case |
| Aggregate numbers | Press Start 2P | 22px |
| Nav brand | Press Start 2P | 11px |
| Body | JetBrains Mono | 15px / 1.65, max 70ch |
| Labels, meta, nav links, card text | JetBrains Mono | 13px, usually muted |

## Rules

Copied from the spec. Every UI change is checked against them.

- Backgrounds are flat. No gradients, no radial glows, no noise textures.
- Glow is allowed on exactly two things: the "online" status dot and keyboard focus rings (`box-shadow: 0 0 0 2px var(--color-accent)`).
- Borders are 1px `--color-line`. Corner brackets (four 8px L-shapes in accent) appear on the player card only.
- No entrance animations on sections. No hover lift/shadow on cards. Hover on links = accent underline, 1px, offset 3px. That is all.
- No ALL-CAPS tracked-out labels. No "→" on buttons or links. No middle-dot meta strings. No numbered 01/02/03 markers except the campaign timeline, which is an actual sequence.
- Left-aligned everything. Container max-width 1040px, 24px side padding on mobile.
- Section titles are rendered as HUD tabs: text sits on a 1px top rule with a short accent tick on the left. Build one `<SectionHeader>` and reuse it.
- Reduced motion: every animation checks `prefers-reduced-motion` and degrades to an instant state.

Interpretations already made: the player section has an `h1` and no HUD tab; the title line uses a comma instead of a middle dot; CRT scanlines are a hard-stop `repeating-linear-gradient`, the only gradient in the codebase.

## Component inventory

| File | Kind | Renders | Props |
|---|---|---|---|
| `section-header.tsx` | server | 1px top rule, 24px accent tick, `h2#<id>-title` | `id`, `title` |
| `player-card.tsx` | server | avatar (`next/image` 120px or "NN" box with `data-avatar`), `h1#player-name`, title line, status dot, one-liner, three links, four corner brackets | none, reads `site`, `env.dpUrl` |
| `loadout.tsx` | server | `dl` with 160px label column, comma-joined skills | none |
| `quest-log.tsx` | server, async | "Main quests" rows; "Side quests" block only when `getSideQuests()` returns items | none |
| `campaign.tsx` | server | `ol` timeline: 1px rule, 6px square node, date once per entry (column on desktop, stacked on mobile) | none |
| `trophy-case.tsx` | server, async | aggregate `dl` (platinums, gamerscore, Steam hours), 3-column card grid with four explicit rows, blog row | none |
| `platform-card.tsx` | server | one card: title + source label, handle, stats block, game list | `stats: PlatformStats` |
| `send-ping.tsx` | server | three label/link rows | none |
| `nav.tsx` | client | sticky header, brand, six `next/link`s with accent tick on the active one | none |
| `boot-sequence.tsx` | client | full-viewport overlay with typed lines and caret | none |
| `konami.tsx` | client | nothing | none |
| `crt-overlay.tsx` | client | `.crt-scanlines` div (shown via CSS), `role="status"` toast | none |

## Platform card layout

`trophy-case.tsx` wraps the cards in `grid grid-cols-[minmax(0,1fr)] md:grid-cols-[repeat(3,minmax(0,1fr))] md:grid-rows-[auto_auto_auto_auto]`. Each `platform-card.tsx` article is `flex flex-col gap-4` on mobile and `md:grid md:row-span-4 md:grid-rows-subgrid` on desktop, with exactly four children in this order:

1. title row (`h3` platform name, source label right)
2. handle
3. stats block (`dl` with a 140px label column, optional tier dots)
4. game list (`ul` with `border-t`, up to `RECENT_SHOWN` = 3 rows of 48px thumbnail, truncated name, meta line "progress  date  tag")

Because the four children are subgrid items, row 3 takes the tallest card's height and every list divider starts at the same y. Every child and the article carry `min-w-0`; without it, non-wrapping game names widen the grid track and spill past the card.

## Behaviours

### Boot sequence (`boot-sequence.tsx`)
- Once per tab session: `sessionStorage.boot === "1"` means skip. The inline pre-paint script sets `html[data-boot="done"]` in that case and CSS hides the overlay before hydration; the component then unmounts on the next frame.
- Lines come from `site.boot.lines`. Per-character delay is `min(16ms, (1250ms − 4×120ms pauses) / total characters)`, so the full run is about 1.25 s typing, 250 ms hold, 250 ms fade.
- `keydown` or `pointerdown` anywhere finishes immediately (full text, then fade).
- `prefers-reduced-motion`: full text shown, 400 ms hold, then fade (global CSS makes the fade instant).
- The overlay is `aria-hidden`, `fixed inset-0 z-50`, on top of fully rendered content. Crawlers never see a gate.

### Konami and CRT (`konami.tsx`, `crt-overlay.tsx`, `src/lib/crt.ts`)
- Keys `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a` (letters compared lower-case) call `toggleCrt()`.
- Five clicks on `[data-avatar]` within 2000 ms do the same, for touch.
- `toggleCrt()` sets or removes `data-crt="on"` on `<html>`, writes `localStorage.crt = "on" | "off"`, and dispatches a `crtchange` `CustomEvent` with the boolean.
- `CrtOverlay` listens for `crtchange`, shows "crt mode on" / "crt mode off" bottom-left for 2000 ms. The scanlines are a CSS rule on `html[data-crt="on"] .crt-scanlines`: 2px lines of text colour at 6% every 4px, `pointer-events-none`, `z-[60]`.
- On load, `PRE_PAINT_SCRIPT` restores `data-crt` from `localStorage` before first paint. `<html>` has `suppressHydrationWarning` for that reason.

### Nav (`nav.tsx`)
Active section = the last section whose top has crossed the 72px nav line; at the page bottom, the section named in the URL hash if visible, else the last one. Recomputed on `IntersectionObserver` callbacks (thresholds 0 to 1 by 0.1), `scrollend`, `hashchange`, link clicks (700 ms settle timer) and `usePathname()` changes.

## Motion

No motion library. Every animation checks `prefers-reduced-motion` (the global CSS also zeroes animation and transition durations) and runs at most once per page view.

| Animation | File | Trigger | Duration | Reduced motion |
|---|---|---|---|---|
| Boot typing, hold, fade | `boot-sequence.tsx` | first visit per tab session | ≈1.25 s typing + 250 ms + 250 ms | full text for 400 ms, then an instant hide |
| CRT toast | `crt-overlay.tsx` | Konami or five avatar taps | shown 2 s | unchanged (no motion involved) |
| Trophy-case skeleton glyphs | `trophy-case-skeleton.tsx`, `.sync-glyph` in `globals.css` | while `<TrophyCase/>` is suspended | 1 s loop, five glyphs filled in turn at 200 ms steps | all glyphs empty, static |
| Score count-up | `score-counter.tsx` | aggregate number at least half in view, once | 900 ms cubic ease-out | final number only |
| XP bar fill | `xp-bar.tsx` | row in view, once | 600 ms ease-out `scaleX` from 0 | full bar, no transition |

The server always renders the final state (the real number, the full bar), so no-JS visitors and crawlers see the data. Counters reserve their width with `tabular-nums` and a `min-width` in `ch`. XP bars only render when the row has a progress value, and are muted when the card is a snapshot.

Note on the skeleton: with the current caching model the home page is prerendered with the arcade data in it, so the skeleton is never shown on a normal request; see [architecture.md](architecture.md#caching-model). Its reserved heights match the real block in every case now that Steam has no "now playing" line: 553 px at 1280 and 1566 px at 375 for both.

