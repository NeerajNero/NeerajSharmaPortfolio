import Image from "next/image";
import { site } from "@/config/site";
import { shortDate, sourceLabel } from "@/lib/gaming/format";
import type { PlatformStats } from "@/lib/gaming/types";

const IMAGE_PX = 48;

/** The only place a second colour appears: trophy tier dots. */
const TIER_DOT: Record<string, string> = {
  bronze: "bg-[#B07A3F]",
  silver: "bg-[#A9B0B5]",
  gold: "bg-[#E0B341]",
  platinum: "bg-[#CFE6F5]",
};

export function PlatformCard({ stats }: { stats: PlatformStats }) {
  const label = site.gaming.labels[stats.id];
  const tiers = stats.headline.filter((h) => h.label in TIER_DOT);
  const pairs = stats.headline.filter((h) => !(h.label in TIER_DOT) && h.label !== "now playing");

  return (
    <article className="flex min-w-0 flex-col gap-4 border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3>{label.name}</h3>
        <span className="text-[13px] text-muted">{sourceLabel(stats.source, stats.fetchedAt)}</span>
      </div>

      <p className="text-[13px] text-muted">{stats.handle}</p>

      {stats.nowPlaying ? (
        <p className="text-[13px]">
          <span className="text-muted">now playing </span>
          {stats.nowPlaying}
        </p>
      ) : null}

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-[13px]">
        {pairs.map((pair) => (
          <div key={pair.label} className="contents">
            <dt className="text-muted">{pair.label}</dt>
            <dd>{pair.value}</dd>
          </div>
        ))}
      </dl>

      {tiers.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {tiers.map((tier) => (
            <li key={tier.label} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block h-[6px] w-[6px] rounded-full ${TIER_DOT[tier.label]}`} />
              <span className="sr-only">{tier.label} </span>
              {tier.value}
            </li>
          ))}
        </ul>
      ) : null}

      {stats.recent.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {stats.recent.map((game) => {
            const meta = [
              game.progress === undefined ? undefined : `${game.progress}%`,
              shortDate(game.lastPlayed),
            ].filter((m): m is string => m !== undefined);
            return (
              <li key={game.name} className="flex items-center gap-3 py-2">
                {game.image ? (
                  <Image
                    src={game.image}
                    alt=""
                    width={IMAGE_PX}
                    height={IMAGE_PX}
                    sizes={`${IMAGE_PX}px`}
                    className="h-12 w-12 shrink-0 border border-line object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-[13px]">
                    {game.name}
                    {game.tag ? <span className="text-muted"> {game.tag}</span> : null}
                  </p>
                  {meta.length > 0 ? (
                    <p className="text-[13px] text-muted">{meta.join("  ")}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
