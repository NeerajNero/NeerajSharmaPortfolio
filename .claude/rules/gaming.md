---
paths:
  - "src/lib/gaming/**"
---

# Gaming adapters

- Secrets: never print, log, echo, cat, grep, or commit any value from any .env* file or from process.env. Do not run cat, grep, head, or printenv against .env* files. Do not include env values in warnings, debug output, commit messages, or your summary. If a response body might echo a key back, truncate before the key. Read keys only through env.ts inside the code; check presence with a boolean (!!env.OPENXBL_API_KEY), never by printing the value.
- An adapter returns `snapshot(id)` with no network call when its key is missing. Otherwise it may throw; it must not catch and return the snapshot itself. The only exception is the PSN auth path, which logs exactly `[psn] auth failed — refresh PSN_NPSSO` and returns the snapshot.
- `getTrophyCase()` never throws. Each adapter runs inside a `"use cache"; cacheLife("hours")` wrapper in `index.ts` whose catch calls `warnAndSnapshot()`. Keep the catch inside the cached scope.
- Every live result goes through `assertUsable()`. A 200 with no handle or all-zero headline values must throw `ShapeError`, never report `source: "live"`.
- Fetch with `fetchJson(url, init, label, [key])`. Warnings are one line, prefixed `[steam]`, `[xbox]` or `[psn]`, carrying the HTTP status and a 120-character excerpt with secrets redacted by `excerpt()`. Never log a URL or header that contains a key; name Steam endpoints by method.
- Apply `cleanName()` to every game name and `safeImage()` to every image URL. New image hosts go in `image-hosts.ts` only.
- Stay inside the hourly call budget documented in `docs/arcade.md`; adapters return up to 5 recent entries and the card shows `RECENT_SHOWN`.
- Verify with `pnpm dev` and `/api/trophy-case`, then with the key unset, then `pnpm build` with no env. Update `docs/arcade.md` in the same commit.
