# neerajnero.com

Personal portfolio for Neeraj Sharma (`NeerajNero`). Next.js App Router, TypeScript, Tailwind v4, deployed on Vercel. All content lives in `src/config/site.ts`.

## Local run

```bash
pnpm install
cp .env.example .env.local   # fill in what you have; everything is optional
pnpm dev                     # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`.

The site builds and renders with no environment variables at all. Every live integration falls back to the hand-filled snapshot in `site.gaming.static`, labelled "snapshot" in the UI.

In development, `GET /api/trophy-case` returns the arcade data as JSON so you can verify keys without the UI. It returns 404 in production.

## Environment variables

| Variable | Used for | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, sitemap, robots | yes in production |
| `NEXT_PUBLIC_DP_URL` | Cloudinary avatar; without it the card shows "NN" | no |
| `GITHUB_TOKEN` | Raises the GitHub API rate limit for the side-quests list | no |
| `STEAM_API_KEY`, `STEAM_ID64` | Steam card | no |
| `OPENXBL_API_KEY` | Xbox card | no |
| `PSN_NPSSO` | PlayStation card | no |

Never commit `.env` or `.env.local`. Both are ignored; only `.env.example` is tracked.

### Steam

1. Get a Web API key at <https://steamcommunity.com/dev/apikey> (any domain name works).
2. Find your 64-bit Steam ID: open your profile, Edit Profile, the URL contains it, or use <https://steamid.io>.
3. In Steam privacy settings (Profile, Edit Profile, Privacy Settings) set **My profile** to Public and **Game details** to Public. If game details are private, the owned-games and recently-played calls return empty responses and the card falls back to the snapshot.

### Xbox (OpenXBL)

1. Sign in at <https://xbl.io> with the Microsoft account that owns the gamertag.
2. Create an API key on the dashboard and put it in `OPENXBL_API_KEY`.
3. The free tier allows roughly 150 requests per hour; this site makes 2 per hour.

Note: OpenXBL wraps every response as `{ "content": { ... }, "code": 200 }`. The adapter unwraps `content` and also accepts the bare shape.

### PlayStation (NPSSO)

1. Log in at <https://www.playstation.com> in a browser.
2. In the same browser open <https://ca.account.sony.com/api/v1/ssocookie> and copy the `npsso` value into `PSN_NPSSO`.
3. The NPSSO expires roughly every two months. When it does, the server logs `[psn] auth failed — refresh PSN_NPSSO` and the card shows the snapshot until you repeat steps 1 and 2 and redeploy.

The trophy API never returns the online ID, so set it by hand in `site.gaming.static.psn.handle`.

### GitHub

Optional. Create a fine-grained token with no extra permissions (public repos are readable without any) at <https://github.com/settings/tokens>. Without it the unauthenticated limit of 60 requests per hour still comfortably covers one fetch per hour.

## Deploy on Vercel

1. Import the repository at <https://vercel.com/new>. Framework preset: Next.js, package manager: pnpm. No build settings need changing.
2. Add the environment variables above under Project Settings, Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to `https://neerajnero.com`.
3. Deploy. Live gaming data is cached for one hour and revalidated in the background.

### DNS for neerajnero.com

At your registrar:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Then in Vercel, Project Settings, Domains, add both `neerajnero.com` and `www.neerajnero.com`, and set `www` to redirect to the apex.

## Résumé

`/resume` renders from `site.ts` with a print stylesheet (white, black text, no nav). A "Download PDF" link appears only when `public/resume.pdf` exists at build time.

Reminder: the PDF carries your phone number. The site itself never renders one, so consider dropping a scrubbed copy in `public/` instead of the original.

## Fonts

Press Start 2P and JetBrains Mono load through `next/font/google`. Copies of both TTFs sit in `src/app/fonts/` for the Open Graph image; both are under the SIL Open Font License (licence texts alongside).
