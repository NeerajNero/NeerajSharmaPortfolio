# Runbook

## Symptoms

| Symptom | Cause | Fix |
|---|---|---|
| A card shows "snapshot" | Key missing in Vercel, or the adapter failed and cached the snapshot for the hour. The Vercel function log has one `[steam]`/`[xbox]`/`[psn]` line. | Check the log line. Missing key: add it and redeploy. HTTP 401/403: rotate the key (see [deployment.md](deployment.md#rotating-keys)). "no Gamertag"/"no personaname": the upstream returned an empty or throttled body; it retries after an hour. |
| Xbox rows have no image | OpenXBL returned an empty `displayImage` and no `images` array for that title. Also check the host is in `IMAGE_HOSTS`. | Nothing to fix for empty data. For a new host, add it to `src/lib/gaming/image-hosts.ts`. |
| Side quests block vanished | `getSideQuests()` failed (rate limit, 401 from a bad token, network) and cached `[]` for the hour. Log line starts with `[github]`. | Fix or remove `GITHUB_TOKEN`; the block returns within an hour or on redeploy. |
| `[psn] auth failed — refresh PSN_NPSSO` in Vercel logs | The NPSSO expired (about every two months) or was pasted with whitespace. | Renew it (below). |
| Build fails with no env | Should never happen: every adapter returns the snapshot without a key. If it does, an adapter is reaching the network before the key check. | Run `env -u STEAM_API_KEY -u STEAM_ID64 -u OPENXBL_API_KEY -u PSN_NPSSO -u GITHUB_TOKEN pnpm build` locally and read the stack. |
| OG image missing or blank | `/opengraph-image` is a request-time route reading `src/app/fonts/*.ttf`; if the files are not in the function bundle it throws. | Keep `outputFileTracingIncludes` in `next.config.ts`; confirm the two TTFs are committed. |
| Home page shows stale numbers | Expected for up to an hour; expire is one day. | Redeploy to force a fresh prerender. |
| Xbox card shows the snapshot right after many manual API calls | OpenXBL throttled the key (60 calls per 5 minutes); its 200 body carries a `currentRequests`/`maxRequests` object instead of settings, so the shape guard refused it. | Wait five minutes; do not loosen the guard. If it happened during `next build`, redeploy after the window. |
| Nav tick lands on the wrong section after a jump | Smooth scroll outlasted the 700 ms settle timer on a very long page. | Raise `SETTLE_MS` in `nav.tsx`; `scrollend` normally corrects it. |

## Renew the PSN NPSSO

1. In a browser, sign in at <https://www.playstation.com>.
2. In the same browser open <https://ca.account.sony.com/api/v1/ssocookie>. Copy the `npsso` value from the JSON.
3. Vercel → Project → Settings → Environment Variables → edit `PSN_NPSSO` for Production. Paste the value with no surrounding whitespace.
4. Redeploy. The next render exchanges the NPSSO; the warning stops.
5. Set a reminder for seven weeks out.

Never paste the value into a commit, a doc, a log, or a chat. Check presence in code with `!!env.psnNpsso`, never by printing it.

## Refresh the snapshot numbers

The snapshot is what visitors see whenever a platform is down, so keep it close to reality.

1. With keys in `.env.local`, run `pnpm dev` and open `http://localhost:3000/api/trophy-case`. The route returns 404 in production builds.
2. For each platform copy `handle`, the `headline` values and up to five `recent` names (and `progress` / `hours` where present) into `site.gaming.static` in `src/config/site.ts`. Leave images out of the snapshot.
3. Update `SNAPSHOT_AT` and the `// Snapshot of the live run on …` comment with the date.
4. `pnpm typecheck && pnpm lint && pnpm build`, then commit with a changelog line.

If an adapter returns `source: "static"` in dev, read the `[platform]` line in the terminal before copying anything.

## Verify keys without the UI

`pnpm dev` then `curl -s localhost:3000/api/trophy-case | jq '.platforms[] | {id, source, handle}'`. The JSON never contains env values.

## Rate-limit ceilings

| Service | Ceiling | This site uses |
|---|---|---|
| Steam Web API | 100,000 calls/day per key | up to 8 per hour |
| OpenXBL free tier | 60 calls per 300 s per key (observed in a throttled response: `"maxRequests":60,"periodInSeconds":300`) | 2 per hour |
| PlayStation (unofficial, via psn-api) | no published limit; aggressive use risks the account | 2 data calls + auth per hour |
| GitHub REST | 60/hour unauthenticated, 5,000/hour with a token | 1 per hour |

The hourly numbers hold per server instance. Serverless cold starts can repeat the PSN auth exchange but not the hourly data calls, which are served from the Vercel data cache.

## Local checks before a commit

```
pnpm typecheck && pnpm lint && pnpm build
```

Then, if the change touched the arcade: `pnpm dev` and read `/api/trophy-case`. If it touched layout: screenshot at 1280px and 375px and confirm no horizontal scroll.
