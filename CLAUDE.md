# neerajnero.com — operating guide

Personal portfolio for Neeraj Sharma (`NeerajNero`), built as a player profile: dark, mono-spaced, one acid-green accent. Résumé content from one config file, a quest log of GitHub repos, and a trophy case fed by Steam, Xbox (OpenXBL) and PlayStation (psn-api) with snapshot fallbacks. Next.js 16 App Router with Cache Components, Tailwind v4, pnpm, Vercel. Live at https://www.neerajnero.com.

The full documentation index is imported below; read the doc that matches the task before touching code. The original build spec is frozen at `docs/spec.md` for reference only.

@docs/README.md

## Non-negotiable rules

1. **Secrets.** Never print, log, echo, cat, grep, or commit any value from any .env* file or from process.env. Do not run cat, grep, head, or printenv against .env* files. Do not include env values in warnings, debug output, commit messages, or your summary. If a response body might echo a key back, truncate before the key. Read keys only through env.ts inside the code; check presence with a boolean (!!env.OPENXBL_API_KEY), never by printing the value.
2. **No content in components.** Every string of copy, every URL, every list and snapshot number lives in `src/config/site.ts`. Components render; they do not contain content.
3. **The design rules apply to every UI change.** The §3 rules are reproduced in `docs/design-system.md` and `.claude/rules/ui.md`. Flat backgrounds, 1px `--color-line` borders, one accent, no hover effects beyond the link underline, left-aligned, reduced motion respected. Re-read them before calling a UI change done.
4. **Adapters never throw out of `getTrophyCase()` and never report `live` on empty data.** Each adapter runs in a `"use cache"` wrapper whose catch logs one redacted `[platform]` line and returns the snapshot. A 200 with no handle or all-zero headline values must throw `ShapeError`.

## Working agreement

- One task per prompt. Do what the prompt asks, then stop and report; do not start the next thing.
- Before every commit: `pnpm typecheck && pnpm lint && pnpm build`. For arcade work also verify with `pnpm dev` and `/api/trophy-case`. For layout work check 1280px and 375px for overflow.
- One commit per task, named after the task.
- Update the matching doc in `docs/` in the same commit, and add a line to `docs/changelog.md`.
- The report at the end states what changed, what was verified and how, and anything the owner must do by hand. No env values in the report.
- Path-scoped rules in `.claude/rules/` load automatically when you edit `src/lib/gaming/**`, `src/config/**`, `src/components/**` or `src/app/**`.

## Routing table

| I want to… | Read this doc | Touch these files |
|---|---|---|
| Add or edit a featured project | [content.md](docs/content.md) | `src/config/site.ts` (`featured`) |
| Update experience, education or skills | [content.md](docs/content.md) | `src/config/site.ts` (`experience`, `education`, `skills`) |
| Change copy, links or the boot lines | [content.md](docs/content.md) | `src/config/site.ts` (`identity`, `links`, `boot.lines`) |
| Change colours, type or spacing | [design-system.md](docs/design-system.md) | `src/app/globals.css` (`@theme`) |
| Change a section's layout | [design-system.md](docs/design-system.md) | `src/components/<section>.tsx`, `src/app/page.tsx` |
| Add or fix a gaming platform | [arcade.md](docs/arcade.md) | `src/lib/gaming/*.ts`, `src/components/platform-card.tsx` |
| Renew the PSN token | [runbook.md](docs/runbook.md) | Vercel env `PSN_NPSSO` only |
| Update the snapshot numbers | [runbook.md](docs/runbook.md) | `src/config/site.ts` (`gaming.static`, `SNAPSHOT_AT`) |
| Deploy or change DNS | [deployment.md](docs/deployment.md) | Vercel and Cloudflare dashboards, `.env.example` |
| Rotate a key | [deployment.md](docs/deployment.md) | Vercel env vars, then redeploy |
| Add a page | [architecture.md](docs/architecture.md) | `src/app/<route>/page.tsx`, `src/app/sitemap.ts` |
| Hide a repo from side quests | [content.md](docs/content.md) | `src/config/site.ts` (`sideQuests.exclude`) |
| Diagnose a card showing "snapshot" | [runbook.md](docs/runbook.md) | Vercel logs, `/api/trophy-case` in dev |

## Notes

- Next rewrites `AGENTS.md` on `next dev`; leave it alone. This file is the operating guide, not `AGENTS.md`.
- `/api/trophy-case` is dev-only and returns 404 in production. It never includes env values.
- The home page is a static shell with a one-hour revalidate; a failure in a cached function is cached as the fallback for the same hour and retried after.
