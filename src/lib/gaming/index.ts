import { cacheLife } from "next/cache";
import { getPsnStats } from "@/lib/gaming/psn";
import { describeError, snapshot } from "@/lib/gaming/shared";
import { getSteamStats } from "@/lib/gaming/steam";
import type { Aggregate, PlatformId, PlatformStats } from "@/lib/gaming/types";
import { getXboxStats } from "@/lib/gaming/xbox";

export interface TrophyCase {
  platforms: PlatformStats[];
  aggregate: Aggregate;
}

const ORDER: PlatformId[] = ["steam", "xbox", "psn"];

function warnAndSnapshot(id: PlatformId, error: unknown): PlatformStats {
  console.warn(`[${id}] adapter threw: ${describeError(error)}`);
  return snapshot(id);
}

/* Each adapter is cached for an hour, catch inside the cached scope so a
 * failure is cached as the snapshot for the same hour and retried after. */

async function cachedSteam(): Promise<PlatformStats> {
  "use cache";
  cacheLife("hours");
  try {
    return await getSteamStats();
  } catch (error) {
    return warnAndSnapshot("steam", error);
  }
}

async function cachedXbox(): Promise<PlatformStats> {
  "use cache";
  cacheLife("hours");
  try {
    return await getXboxStats();
  } catch (error) {
    return warnAndSnapshot("xbox", error);
  }
}

async function cachedPsn(): Promise<PlatformStats> {
  "use cache";
  cacheLife("hours");
  try {
    return await getPsnStats();
  } catch (error) {
    return warnAndSnapshot("psn", error);
  }
}

const adapters: Record<PlatformId, () => Promise<PlatformStats>> = {
  steam: cachedSteam,
  xbox: cachedXbox,
  psn: cachedPsn,
};

/** Read a numeric headline value by label, whatever source the platform ended up with. */
function headlineNumber(stats: PlatformStats | undefined, labels: string[]): number | undefined {
  const pair = stats?.headline.find((h) => labels.includes(h.label));
  if (!pair) return undefined;
  const value = Number(pair.value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

export function aggregateOf(platforms: PlatformStats[]): Aggregate {
  const byId = new Map(platforms.map((p) => [p.id, p]));
  return {
    steamHours: headlineNumber(byId.get("steam"), ["hours"]),
    gamerscore: headlineNumber(byId.get("xbox"), ["gamerscore"]),
    platinums: headlineNumber(byId.get("psn"), ["platinum", "platinums"]),
  };
}

/** Never throws: every platform resolves to live data or its snapshot. */
export async function getTrophyCase(): Promise<TrophyCase> {
  const settled = await Promise.allSettled(ORDER.map((id) => adapters[id]()));
  const platforms = settled.map((result, i) =>
    result.status === "fulfilled" ? result.value : warnAndSnapshot(ORDER[i], result.reason),
  );
  return { platforms, aggregate: aggregateOf(platforms) };
}
