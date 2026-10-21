# Arcade (trophy case)

Three adapters behind one interface, cached for an hour, never throwing out of `getTrophyCase()`. Static snapshots in `site.gaming.static` cover every failure, including a build with no env vars at all.

## Types (`src/lib/gaming/types.ts`)

```ts
type PlatformId = "steam" | "xbox" | "psn";
interface GameEntry { name; image?; lastPlayed?; progress?; hours?; tag? }   // tag: "PS5" | "PS4" on PSN rows
interface PlatformStats { id; handle; nowPlaying?; headline: {label, value}[]; recent: GameEntry[]; source: "live" | "static"; fetchedAt }
interface Aggregate { steamHours?; gamerscore?; platinums? }
```

`getTrophyCase()` in `index.ts` returns `{ platforms: PlatformStats[], aggregate }`. `aggregateOf()` reads headline pairs by label: `hours`, `gamerscore`, `platinum` or `platinums`, whichever source each platform ended up with.

## Shared machinery (`shared.ts`, `format.ts`, `index.ts`)

- `snapshot(id)` returns the static entry with `source: "static"`.
- `fetchJson(url, init, label, secrets)` throws `HttpError` on non-2xx or non-JSON: message `"<label> responded <status>: <120-char excerpt>"`, with every secret string replaced by `[redacted]`. The URL and headers are never part of the message.
- `ShapeError` + `assertUsable(stats)`: a 200 that parses to an empty handle or to headline values that are all zero throws, so an adapter can never report `live` with placeholder data.
- `describeError(error, secrets)` turns any thrown value into one redacted line (status + message).
- `safeImage(url)` keeps only `IMAGE_HOSTS` hosts and upgrades `http` to `https`.
- `cleanName()` strips ® and ™ and collapses whitespace; applied to every game name on all three platforms.
- `RECENT_SHOWN = 3` is what the card shows; adapters return up to 5.
- `format.ts`: `sourceLabel()` gives `"snapshot"` or `"live 14:00 IST"`; `shortDate()` gives `"20 Sep 2026"` in Asia/Kolkata from a fixed three-letter month array.
- `index.ts`: `cachedSteam/Xbox/Psn` each do `"use cache"; cacheLife("hours")` and catch inside the scope via `warnAndSnapshot()`, so a failure caches the snapshot for the hour and is retried after. `getTrophyCase()` runs them with `Promise.allSettled` and maps rejections to snapshots too.

Warning format, one line per failure, always prefixed by the module:

```
[steam] falling back to snapshot: GetOwnedGames responded 403: {"response":{}}
[xbox] falling back to snapshot: account returned no Gamertag: {"content":{...}}
[psn] auth failed — refresh PSN_NPSSO (status 401: …)
[psn] falling back to snapshot: …
```

Secrets are redacted from the excerpt by `excerpt()`; Steam endpoints are named by method because their URLs carry the key.

## Steam (`steam.ts`)

- Env: `STEAM_API_KEY`, `STEAM_ID64`. Either missing → snapshot, no network.
- Calls per hour: 3 fixed + up to 5 achievement lookups = 8.

| Endpoint | Purpose |
|---|---|
| `ISteamUser/GetPlayerSummaries/v2` | `personaname` (handle), `gameextrainfo` (now playing) |
| `IPlayerService/GetOwnedGames/v1` `include_appinfo=1` | `game_count`, hours = Σ `playtime_forever` / 60 rounded, `rtime_last_played` per app |
| `IPlayerService/GetRecentlyPlayedGames/v1` `count=5` | recent five, `playtime_forever` → hours |
| `ISteamUserStats/GetPlayerAchievements/v1` per recent app | progress % = achieved / total; `success:false` or no achievements → no progress value |

Images are `https://cdn.cloudflare.steamstatic.com/steam/apps/<appid>/header.jpg`. Headline: `hours`, `games`, plus `now playing` when present. Throws `ShapeError` when `personaname` is missing, then `assertUsable`. Requires the Steam profile and "Game details" set to Public.

## Xbox (`xbox.ts`, OpenXBL)

- Env: `OPENXBL_API_KEY`. Headers: `X-Authorization`, `Accept: application/json`, `Accept-Language: en-US`.
- Calls per hour: 2 (`/api/v2/account`, `/api/v2/player/titleHistory`). The free tier allows 60 calls per 300 s; a throttled response is still HTTP 200 with a `{"content":{"currentRequests":…,"maxRequests":60,"periodInSeconds":300}}` body, which the shape guard turns into a snapshot fallback.
- Content wrapper: every OpenXBL response is `{ "content": {...}, "code": 200 }`. `unwrap()` reads `content` when present and accepts the bare shape too.
- Account: `profileUsers[0].settings[]` → `Gamertag`, `Gamerscore`. No `Gamertag` → `ShapeError` with a redacted body excerpt (this is what an OpenXBL rate-limit body looks like).
- Title filter (`isXboxTitle`): the Xbox PC app logs Steam games launched through the Game Bar into title history with `devices: ["Win32"]`, no `pfn`, zero gamerscore. A title is kept when any device is in `XboxSeries, XboxOne, Xbox360, PC, Mobile`; with no `devices` array it falls back to a non-empty `pfn` or `achievement.totalGamerscore > 0`. On the owner's account this drops 83 of 191 titles. The `titles` headline is the filtered count.
- Progress (`readProgress`): `progressPercentage` if > 0; else `currentGamerscore / totalGamerscore` when the total is > 0; else no value (the card omits the percentage). A genuine 0% needs a real total.
- Images: `displayImage`, else the first allowed `images[].url`. OpenXBL serves `store-images.s-microsoft.com` over http; `safeImage` upgrades it.
- Recent: five by `titleHistory.lastTimePlayed` desc. Headline: `gamerscore`, `titles`, `100% completions`.

## PlayStation (`psn.ts`, psn-api)

- Env: `PSN_NPSSO`. Expires roughly every two months.
- Auth flow (`authorize()`), module-scope token cache: first call `exchangeNpssoForCode` → `exchangeCodeForAccessToken`; later calls reuse the access token until 60 s before expiry, then `exchangeRefreshTokenForAuthTokens`; only if the refresh throws is the NPSSO exchanged again. Any auth failure logs exactly `[psn] auth failed — refresh PSN_NPSSO` (plus a redacted detail in parentheses) and returns the snapshot. A 401/403 on a data call clears the cache and logs the same line. Other data errors throw to the wrapper.
- Calls per hour: 2 data calls (`getUserTrophyProfileSummary(auth, "me")`, `getUserTitles(auth, "me", { limit: 10 })`) plus auth: 2 on a cold start, 1 refresh when the token has expired. On serverless each cold start re-exchanges the NPSSO.
- PS4/PS5 stacks: the same game appears once per platform. `cleanTitleName()` strips marks and a trailing " for PS5" / " for PS4"; `dedupeTitles()` keeps the most recently updated entry per cleaned name, sorts newest first, takes 5. `tag` is `PS5` if the platform list contains it, else `PS4`, else the first listed.
- Headline: `level`, then `bronze`, `silver`, `gold`, `platinum` (rendered as dots). The handle comes from `site.gaming.static.psn.handle`; the API never returns the online ID.
- Images: `trophyTitleIconUrl` on `image.api.playstation.com` or `psnobj.prod.dl.playstation.net`.

## UI

`trophy-case.tsx` renders the aggregate row in the order platinums, gamerscore, Steam hours, accent when that platform is live and muted when static, then the three cards (Steam, Xbox, PlayStation) and the blog row. `platform-card.tsx` shows the source label top-right, the stats in a 140px-label grid, tier dots for PSN, and the first three recent games with "progress  date  tag" beneath the name.

## Adding a fourth platform

1. Add the id to `PlatformId` in `types.ts` and a `labels` entry plus a dated `static` snapshot in `site.ts`.
2. Add the env var to `env.ts`, `.env.example`, and the table in [deployment.md](deployment.md).
3. Write `src/lib/gaming/<platform>.ts` exporting `get<Platform>Stats(): Promise<PlatformStats>`: return `snapshot()` when the key is missing, use `fetchJson(..., label, [key])`, apply `cleanName()` and `safeImage()`, finish with `assertUsable()`. Throw on anything else; do not catch.
4. Add a `cached<Platform>` wrapper in `index.ts` with `"use cache"; cacheLife("hours")` and the `warnAndSnapshot` catch, add it to `adapters` and `ORDER`, and extend `aggregateOf` if it contributes a number.
5. Add any image host to `image-hosts.ts`.
6. Verify in `pnpm dev` via `/api/trophy-case`, then with the key removed, then `pnpm build` with no env.
7. Update this document, [runbook.md](runbook.md) and the changelog in the same commit.
