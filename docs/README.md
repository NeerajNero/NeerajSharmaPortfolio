# Docs index

neerajnero.com is a one-page developer portfolio for Neeraj Sharma, built as a "player profile": a dark, mono-spaced page with one acid-green accent. It renders résumé content from a single typed config file, lists GitHub repositories, and shows a live trophy case pulled from Steam, Xbox (via OpenXBL) and PlayStation (via psn-api), each falling back to a hand-filled snapshot when a key is missing or an API fails. It is a Next.js 16 App Router site on Vercel with Cache Components enabled; the home page is a static shell whose cached data revalidates hourly.

## Where to look

| I want to… | Read this doc | Touch these files |
|---|---|---|
| Add or edit a featured project | [content.md](content.md) | `src/config/site.ts` (`featured`) |
| Update experience, education or skills | [content.md](content.md) | `src/config/site.ts` (`experience`, `education`, `skills`) |
| Change copy, links or the boot lines | [content.md](content.md) | `src/config/site.ts` (`identity`, `links`, `boot.lines`) |
| Change colours, type or spacing | [design-system.md](design-system.md) | `src/app/globals.css` (`@theme`) |
| Change a section's layout | [design-system.md](design-system.md) | `src/components/<section>.tsx`, `src/app/page.tsx` |
| Add or fix a gaming platform | [arcade.md](arcade.md) | `src/lib/gaming/*.ts`, `src/components/platform-card.tsx` |
| Renew the PSN token | [runbook.md](runbook.md) | Vercel env `PSN_NPSSO` only |
| Update the snapshot numbers | [runbook.md](runbook.md) | `src/config/site.ts` (`gaming.static`, `SNAPSHOT_AT`) |
| Deploy or change DNS | [deployment.md](deployment.md) | Vercel and Cloudflare dashboards, `.env.example` |
| Rotate a key | [deployment.md](deployment.md) | Vercel env vars, then redeploy |
| Add a page | [architecture.md](architecture.md) | `src/app/<route>/page.tsx`, `src/app/sitemap.ts` |
| Hide a repo from side quests | [content.md](content.md) | `src/config/site.ts` (`sideQuests.exclude`) |
| Diagnose a card showing "snapshot" | [runbook.md](runbook.md) | Vercel logs, `/api/trophy-case` in dev |

## The documents

| File | What it covers |
|---|---|
| [architecture.md](architecture.md) | Stack, folder map, request flow, caching, image hosts |
| [content.md](content.md) | The `SiteConfig` schema and how to edit content |
| [design-system.md](design-system.md) | Tokens, type scale, the design rules, component inventory, boot/Konami/CRT behaviour |
| [arcade.md](arcade.md) | The three gaming adapters, their quirks, guards, warnings and call budgets |
| [deployment.md](deployment.md) | Vercel settings, env vars, DNS, key rotation |
| [runbook.md](runbook.md) | Symptom → cause → fix, token renewal, snapshot refresh, rate limits |
| [decisions.md](decisions.md) | Why the code is the way it is |
| [changelog.md](changelog.md) | Every commit, grouped by phase |
| [spec.md](spec.md) | The original build spec, frozen at ship |

## Conventions used in these docs

- Paths are relative to the repository root.
- "Adapter" means one of `src/lib/gaming/steam.ts`, `xbox.ts`, `psn.ts`.
- "Snapshot" means the static `PlatformStats` in `site.gaming.static`.
- Nothing here contains a key, token or account identifier. Keys live only in Vercel and in your local `.env` or `.env.local`, both git-ignored.
