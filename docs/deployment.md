# Deployment

Hosted on Vercel, DNS on Cloudflare. Live at <https://www.neerajnero.com>; the apex redirects there.

## Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Package manager | pnpm (from the `packageManager` field) |
| Build command | `next build` (default) |
| Output | default; `cacheComponents` is on, so `/` is a static shell with hourly revalidation |
| Node | Vercel default for Next 16 |
| Domains | `neerajnero.com` and `www.neerajnero.com`, with the apex redirecting to `www` (308, observed live) |

Every env var below is set in Project → Settings → Environment Variables for Production. Preview deployments may run with none; the site still builds.

## Environment variables

| Name | Required | Where to get it | What breaks without it |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes in production | the canonical origin | `env.ts` defaults to `https://neerajnero.com`; `metadataBase`, `sitemap.xml` and `robots.txt` emit that host. The live sitemap currently emits the apex while the apex redirects to `www`, so either set this to `https://www.neerajnero.com` or switch the Vercel redirect to `www → apex` |
| `NEXT_PUBLIC_DP_URL` | no | Cloudinary image URL of the avatar (public, not a secret) | the player card shows the "NN" square |
| `GITHUB_TOKEN` | no | github.com → Settings → Developer settings → tokens; no scopes needed for public repos | side quests use the 60/hour anonymous limit |
| `STEAM_API_KEY` | no | <https://steamcommunity.com/dev/apikey> | Steam card shows the snapshot |
| `STEAM_ID64` | no | your profile URL or <https://steamid.io>; profile and "Game details" must be Public | Steam card shows the snapshot |
| `OPENXBL_API_KEY` | no | <https://xbl.io> dashboard, signed in with the Microsoft account that owns the gamertag | Xbox card shows the snapshot |
| `PSN_NPSSO` | no | sign in at playstation.com, then open <https://ca.account.sony.com/api/v1/ssocookie>; expires about every two months | PlayStation card shows the snapshot and the log says `[psn] auth failed — refresh PSN_NPSSO` |

`.env` and `.env.local` are git-ignored by the `.env*` rule; `.env.example` is tracked and lists every name with empty values. The repo must never contain a value.

## DNS (Cloudflare)

Nameservers are Cloudflare's. Records as they resolve today:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | `64.29.17.1` and `216.198.79.1` (Vercel anycast) | DNS only |
| CNAME | `www` | `<project-id>.vercel-dns-017.com` (the per-project target Vercel assigned) | DNS only |

Both must stay **DNS only** (grey cloud). Vercel issues and renews the TLS certificate by answering on these hostnames and terminates HTTPS at its own edge; with Cloudflare's proxy on, certificate issuance fails or loops and requests are double-proxied. The values differ from the spec's `76.76.21.21` / `cname.vercel-dns.com` because Vercel now hands out per-project targets; use whatever the Vercel Domains page shows for this project.

### Redirect

Vercel's Domains page defines the redirect between the two hostnames. Today the apex 308-redirects to `www`. If you want the apex canonical instead, flip the redirect there and set `NEXT_PUBLIC_SITE_URL` to match; `sitemap.ts` and `robots.ts` follow that variable.

## First request after a deploy

The build prerenders `/` and `/resume` with the Production env, so the first request already serves live arcade data if the keys worked during the build. `/opengraph-image` renders on its first request and reads the bundled TTFs. `/api/trophy-case` returns 404. After one hour the first request triggers a background refresh of the GitHub and gaming caches; after a day without traffic the next request waits for fresh data. A cold serverless instance re-runs the PSN NPSSO exchange once.

## Rotating keys

In every case: create the new value, update the Vercel variable, redeploy, then revoke the old one.

- **Steam**: revoke and regenerate at <https://steamcommunity.com/dev/apikey>. `STEAM_ID64` is not a secret but is also not published in this repo or docs.
- **OpenXBL**: regenerate the key on the xbl.io dashboard. The old key stops immediately.
- **PSN**: sign out of playstation.com to invalidate the session, sign in again, fetch a new NPSSO from the ssocookie URL. See [runbook.md](runbook.md#renew-the-psn-npsso).
- **GitHub**: delete the token in Settings → Developer settings and create a new one; or remove the variable entirely and accept the anonymous limit.

If a key was ever exposed in a log, chat or commit, rotate it the same day; do not rely on scrubbing history.

## Checklist before shipping a change

1. `pnpm typecheck && pnpm lint && pnpm build` locally.
2. For arcade changes, `pnpm dev` and read `/api/trophy-case`.
3. Push; Vercel builds the preview; open the preview at 1280px and 375px.
4. Merge or promote; confirm `/`, `/resume`, `/opengraph-image`, `/sitemap.xml` and `/robots.txt` on production.
