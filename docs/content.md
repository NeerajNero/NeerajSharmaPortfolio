# Content

All copy, links, lists and snapshot numbers live in `src/config/site.ts` as one typed object, `site: SiteConfig`. Components import `site` and render it; no component contains a string of content. UI chrome strings ("Skip to content", "snapshot", "Download PDF", "crt mode on") are the only text in components.

## Schema

`SiteConfig` fields, in order, with a real example from the file.

| Field | Type | Example |
|---|---|---|
| `domain` | `string` | `"neerajnero.com"` |
| `nav` | `NavItem[]` (`id`, `label`) | `{ id: "quests", label: "quests" }` — `id` must match a `<section id>` in `page.tsx` |
| `boot.lines` | `string[]` | `"loading player profile ......... ok"`; five lines, the last is `"ready"` |
| `identity.displayName` | `string` | `"Neeraj Sharma"` |
| `identity.legalName` | `string` | `"Neeraj Kumar Sharma U"` — used only on `/resume` |
| `identity.initials` | `string` | `"NN"` — avatar fallback when `NEXT_PUBLIC_DP_URL` is unset |
| `identity.handle` | `string` | `"NeerajNero"` — nav brand, title template, OG image |
| `identity.title`, `company`, `location` | `string` | `"Software Engineer 2"`, `"GeekyAnts"`, `"Bangalore"` |
| `identity.experienceYears` | `string` | `"4+ years"` — résumé only |
| `identity.status` | `string` | `"online"` — status dot label |
| `identity.oneLiner` | `string` | the meta description and card blurb; keep under 70ch of wrap |
| `identity.email` | `string` | `"neerajnero9066@gmail.com"` |
| `links.github`, `linkedin` | `string` | full URLs |
| `links.resume` | `string` | `"/resume"` |
| `links.resumePdf` | `string` | `"/resume.pdf"` — the file must exist in `public/` at build time for the link to render |
| `links.sourceRepo` | `string` | footer "source on GitHub" |
| `experience` | `Role[]` | `{ title, company, start: "Jun 2025", end: "Present", location, bullets: string[] }`, newest first |
| `education` | `Education[]` | `{ degree: "BCA", institution, location, start: "2016", end: "2019" }` |
| `skills` | `SkillGroup[]` | `{ name: "Backend", items: ["Node.js", "NestJS", …] }`; rendered comma-joined |
| `featured` | `Project[]` | `{ name: "TinCan", repo: "https://github.com/NeerajNero/TinCan", tags: ["Next.js", "Firebase", "PWA"], blurb }` |
| `sideQuests.endpoint` | `string` | GitHub repos API URL |
| `sideQuests.exclude` | `string[]` | repo names never shown |
| `sideQuests.limit` | `number` | `8` |
| `sideQuests.revalidate` | `number` | `3600`, documentary; the real lifetime is `cacheLife("days")` |
| `gaming.static` | `Record<PlatformId, PlatformStats>` | one snapshot per platform, see below |
| `gaming.labels` | `Record<PlatformId, { name, aggregate }>` | `{ name: "PlayStation", aggregate: "PSN platinums" }` |
| `gaming.revalidate` | `number` | `3600`, documentary |
| `gaming.blog` | `{ name, url, blurb }` | the GameTechGuides row under the cards |
| `footer` | `{ year, builtWith }` | `{ year: 2026, builtWith: "Next.js" }` |

`SNAPSHOT_AT` at the top of the file is the ISO timestamp stamped on every snapshot's `fetchedAt`.

### Snapshot shape

Each `gaming.static.<platform>` is a full `PlatformStats` (see [arcade.md](arcade.md)): `id`, `handle`, `headline` pairs, `recent` entries and `source: "static"`. The aggregate row reads headline pairs by label: `hours` (Steam), `gamerscore` (Xbox), `platinum` (PSN). The PSN card renders `bronze`, `silver`, `gold`, `platinum` as tier dots and any other pair as a row. The PSN `handle` is shown even when live, because the trophy API never returns the online ID.

## Rules

- Content lives in `site.ts` only. If a component needs new text, add a field.
- Keep `SNAPSHOT_AT` and the `// Snapshot of the live run on …` comment current when you change snapshot numbers.
- Never add a phone number anywhere; the site and the generated PDF are phone-free by design.
- Dates in `experience` and `education` are display strings, not parsed.

## Common edits

### Add a featured project
1. Append to `featured` in `site.ts`: `name`, `repo`, `tags`, `blurb`.
2. The repo name (last URL segment, case-insensitive) is automatically excluded from side quests.
3. `pnpm build`; the quest log renders rows in array order.

### Update a role or skills
1. Edit `experience` (bullets are rendered as a plain list) or `skills`.
2. `/resume` and the home page both read the same arrays; the résumé adds `legalName` and `experienceYears`.

### Change copy or boot lines
1. `identity.oneLiner` feeds the meta description, the player card and the résumé.
2. `boot.lines` is typed character by character; the typing speed is derived from the total length so the overlay always finishes in under 1.8 s. The overlay auto-dismisses, so do not write a line that asks for input.

### Hide a repo from side quests
Add its exact repo name to `sideQuests.exclude`. Current list: `NeerajNero` (profile repo), `Steam-Achievements-Tracker`, `NeerajSharmaPortfolio`. Forks and archived repos are dropped automatically in `src/lib/github.ts`.

### Refresh snapshot numbers
See [runbook.md](runbook.md#refresh-the-snapshot-numbers).
