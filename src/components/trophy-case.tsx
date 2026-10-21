import { PlatformCard } from "@/components/platform-card";
import { ScoreCounter } from "@/components/score-counter";
import { site } from "@/config/site";
import { getTrophyCase } from "@/lib/gaming";
import type { PlatformId } from "@/lib/gaming/types";

export async function TrophyCase() {
  const { platforms, aggregate } = await getTrophyCase();
  const byId = new Map(platforms.map((p) => [p.id, p]));
  const isLive = (id: PlatformId) => byId.get(id)?.source === "live";

  // Platinums lead.
  const numbers: { id: PlatformId; value: number | undefined }[] = [
    { id: "psn", value: aggregate.platinums },
    { id: "xbox", value: aggregate.gamerscore },
    { id: "steam", value: aggregate.steamHours },
  ];

  return (
    <div className="mt-6 flex flex-col gap-8">
      <dl className="grid gap-6 sm:grid-cols-3">
        {numbers.map((n) => (
          <div key={n.id}>
            <dd className={`font-display text-[22px] leading-[1.4] ${isLive(n.id) ? "text-accent" : "text-muted"}`}>
              <ScoreCounter value={n.value ?? 0} />
            </dd>
            <dt className="text-[13px] text-muted">{site.gaming.labels[n.id].aggregate}</dt>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))] md:grid-rows-[auto_auto_auto_auto]">
        {platforms.map((stats) => (
          <PlatformCard key={stats.id} stats={stats} />
        ))}
      </div>

      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <a href={site.gaming.blog.url} rel="noopener">
          {site.gaming.blog.name}
        </a>
        <span className="text-[13px] text-muted">{site.gaming.blog.blurb}</span>
      </p>
    </div>
  );
}
