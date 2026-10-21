import { site } from "@/config/site";
import { RECENT_SHOWN } from "@/lib/gaming/shared";
import type { PlatformId } from "@/lib/gaming/types";

const ORDER: PlatformId[] = ["steam", "xbox", "psn"];
const AGGREGATE: PlatformId[] = ["psn", "xbox", "steam"];
const GLYPHS = 5;
const TIERS = new Set(["bronze", "silver", "gold", "platinum"]);

/* Mirrors platform-card.tsx: 13px text at line-height 1.65 (21.45px), dl rows
   4px apart, tier dots as one extra line 12px below the dl. */
const LINE_PX = 13 * 1.65;
const DL_GAP_PX = 4;
const BLOCK_GAP_PX = 12;

function statsHeight(id: PlatformId): string {
  const headline = site.gaming.static[id].headline;
  const rows = headline.filter((pair) => !TIERS.has(pair.label)).length;
  const tiers = headline.some((pair) => TIERS.has(pair.label)) ? BLOCK_GAP_PX + LINE_PX : 0;
  return `${rows * LINE_PX + Math.max(0, rows - 1) * DL_GAP_PX + tiers}px`;
}

/**
 * Suspense fallback for <TrophyCase/>: the same grid, row and class
 * structure so the real block lands without a layout shift. Each card shows
 * its title, the snapshot handle and a "syncing" line with five block
 * glyphs cycling left to right (CSS only).
 */
export function TrophyCaseSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-8" aria-busy="true" aria-label="Loading trophy case">
      <dl className="grid gap-6 sm:grid-cols-3">
        {AGGREGATE.map((id) => (
          <div key={id}>
            <dd className="font-display text-[22px] leading-[1.4] text-muted tabular-nums">0</dd>
            <dt className="text-[13px] text-muted">{site.gaming.labels[id].aggregate}</dt>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))] md:grid-rows-[auto_auto_auto_auto]">
        {ORDER.map((id) => (
          <article
            key={id}
            className="flex min-w-0 flex-col gap-4 border border-line bg-surface p-5 md:grid md:row-span-4 md:grid-rows-subgrid"
          >
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3>{site.gaming.labels[id].name}</h3>
              <span className="text-[13px] text-muted">syncing</span>
            </div>
            <p className="min-w-0 truncate text-[13px] text-muted">{site.gaming.static[id].handle}</p>
            {/* Stats row: only the syncing line, inside a box reserved to the
                height the real stats block will have, so the swap does not
                shift layout. */}
            <div className="flex min-w-0 flex-col text-[13px]" style={{ minHeight: statsHeight(id) }}>
              <p className="text-muted">
                syncing trophy case{" "}
                <span className="sync-glyphs" aria-hidden="true">
                  {Array.from({ length: GLYPHS }, (_, i) => (
                    <span key={i} className="sync-glyph" style={{ "--sync-delay": `${i * 200}ms` } as React.CSSProperties} />
                  ))}
                </span>
              </p>
            </div>
            <ul className="min-w-0 divide-y divide-line border-t border-line">
              {Array.from({ length: RECENT_SHOWN }, (_, i) => (
                <li key={i} className="flex min-w-0 items-center gap-3 py-2">
                  <span className="h-12 w-12 shrink-0 border border-line" />
                  {/* two 13px lines plus the 2px bar and its 6px margin, like a real row */}
                  <span className="h-[calc(3.3em+8px)] flex-1 text-[13px]" />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <span>{site.gaming.blog.name}</span>
        <span className="text-[13px] text-muted">{site.gaming.blog.blurb}</span>
      </p>
    </div>
  );
}
