# Decisions

One entry per decision that shaped the code, from the git history and the files as they are.

## No component library
Context: the spec asked for a hand-rolled, one-accent HUD look with Tailwind v4.
Decision: every component is written by hand; the only runtime dependency beyond Next and React is `psn-api`.
Consequence: no theme overrides to fight, and the §3 rules are enforced by reading the components, not configuring a library.

## Cache Components with `"use cache"` instead of `unstable_cache`
Context: create-next-app enabled `cacheComponents` by default on Next 16.
Decision: keep it on and cache data with `"use cache"; cacheLife("days")` plus tags in `github.ts` and `gaming/index.ts`.
Consequence: the home page is a static shell with a one-day revalidate and one-week expire; the debug route must call `connection()` to stay dynamic; a tagged `POST /api/revalidate` forces an earlier refresh.

## Catch inside the cached scope
Context: if a cached function throws, nothing is cached and a build-time failure would be baked into the static shell until the next deploy.
Decision: every cached function catches internally and returns the fallback (empty list or snapshot).
Consequence: a failure is cached for a day (or until a manual revalidate) and retried automatically; the cost is a stale fallback for that window instead of a permanent one.

## Adapters throw, wrappers warn
Context: early adapters caught their own errors and returned the snapshot silently in some paths.
Decision: adapters throw (`HttpError`, `ShapeError`, anything); the single catch in `warnAndSnapshot()` logs one redacted line and falls back. PSN keeps one internal catch for the spec-mandated auth warning.
Consequence: exactly one warning per failure, one place to redact secrets, and no silent snapshot.

## Shape validation to prevent false "live"
Context: OpenXBL wraps responses in `content`; the first adapter parsed nothing and reported `live` with the placeholder handle. A throttled 200 does the same.
Decision: `assertUsable()` requires a non-empty handle and at least one non-zero headline value; otherwise `ShapeError`.
Consequence: an empty 200 shows the honest "snapshot" label; a real account with genuinely zero stats would also be refused, which is acceptable here.

## Devices filter over pfn for Xbox titles
Context: the Xbox PC app logs Steam games launched via the Game Bar into title history.
Decision: drop titles whose `devices` is only `Win32`; fall back to `pfn` or `totalGamerscore` only when `devices` is missing.
Consequence: 83 of 191 titles removed on the owner's account, Game Pass PC titles kept, and the surviving titles carry real achievement percentages.

## Subgrid for card alignment
Context: three cards with different numbers of stat rows put the dividers at different heights.
Decision: the card grid declares four rows; each card is `grid-rows-subgrid` with exactly four children.
Consequence: dividers and first thumbnails share a y across cards with no JavaScript; every child needs `min-w-0` or long names widen the track.

## Upgrade http image URLs instead of extra lookups
Context: Xbox artwork looked missing; four OpenXBL endpoints were probed and none returned title art on an allowed host.
Decision: the real cause was `displayImage` served over `http://`; `safeImage()` now upgrades allowed hosts to https.
Consequence: no additional API calls, artwork for every title that has a `displayImage`.

## No PSNProfiles scraping
Context: the PSN online ID is not returned by the trophy API and scraping a third-party site could have provided it and richer stats.
Decision: use only psn-api against Sony's own endpoints; the handle is set by hand in `site.ts`.
Consequence: one fewer fragile dependency; the handle must be edited manually if it changes.

## Steam artwork fallback considered and not built
Context: Steam header images come from a predictable CDN URL and can 404 for delisted apps.
Decision: no probing or alternate CDN; the row renders name-only if the image fails to load.
Consequence: zero extra requests per refresh; a rare blank thumbnail is accepted.

## pointerdown for boot skip
Context: "any key, tap or click skips" had to feel instant on touch.
Decision: listen to `keydown` and `pointerdown`, not `click`.
Consequence: a scroll gesture also skips the boot, which is treated as intent to read.

## Derived typing speed
Context: 16 ms per character over the five boot lines exceeds the 1.8 s runtime cap.
Decision: 16 ms is a ceiling; the real delay is `(1250 ms − pauses) / characters`.
Consequence: the boot always finishes in about 1.75 s including hold and fade; longer lines type faster rather than longer.

## Dates rendered once in the campaign
Context: desktop and mobile had separate date spans, so screen readers read each date twice.
Decision: one date element; the rule and node move between layouts with `md:` utilities.
Consequence: a fixed 160px date column on desktop, which the node offset depends on.

## Optional `tag` on `GameEntry`
Context: the spec's types had nowhere to carry PS4/PS5, and the logic had to stay in `psn.ts`.
Decision: add `tag?: string` to `GameEntry`; the card renders it on the meta line.
Consequence: a one-field deviation from the spec's types, documented in `arcade.md`.

## No audio for achievements
Context: an unlock chime is the obvious gaming cue.
Decision: achievements are silent; the toast, the footer counter and the blinking cursor are the only feedback.
Consequence: no autoplay-policy workarounds, no audio assets or dependency, nothing a visitor has to mute; the toast is the complete signal.
