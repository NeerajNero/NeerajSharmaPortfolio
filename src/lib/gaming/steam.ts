import { env } from "@/lib/env";
import {
  asNumber,
  asString,
  assertUsable,
  fetchJson,
  formatCount,
  isRecord,
  nowIso,
  safeImage,
  ShapeError,
  snapshot,
} from "@/lib/gaming/shared";
import type { GameEntry, PlatformStats } from "@/lib/gaming/types";

const BASE = "https://api.steampowered.com";
const RECENT_COUNT = 5;

interface OwnedGame {
  appid: number;
  playtimeMinutes: number;
  lastPlayed?: string;
}

function steamUrl(path: string, params: Record<string, string>): string {
  const url = new URL(path, BASE);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

function readGames(body: unknown): unknown[] {
  if (!isRecord(body) || !isRecord(body.response)) return [];
  return Array.isArray(body.response.games) ? body.response.games : [];
}

/** Achievement % for one app; undefined when the app has no achievements. */
async function achievementProgress(
  key: string,
  steamId: string,
  appid: number,
): Promise<number | undefined> {
  const res = await fetch(
    steamUrl("/ISteamUserStats/GetPlayerAchievements/v1/", {
      key,
      steamid: steamId,
      appid: String(appid),
    }),
  );
  // Steam answers 400 + success:false for apps without stats; that is not an error.
  const body: unknown = await res.json().catch(() => undefined);
  if (!isRecord(body) || !isRecord(body.playerstats)) return undefined;
  const stats = body.playerstats;
  if (stats.success !== true || !Array.isArray(stats.achievements)) return undefined;
  const total = stats.achievements.length;
  if (total === 0) return undefined;
  const achieved = stats.achievements.filter(
    (a) => isRecord(a) && a.achieved === 1,
  ).length;
  return Math.round((achieved / total) * 100);
}

/** Throws on any failure; the cached wrapper in index.ts falls back to the snapshot. */
export async function getSteamStats(): Promise<PlatformStats> {
  const key = env.steamApiKey;
  const steamId = env.steamId64;
  if (!key || !steamId) return snapshot("steam");

  const [summaryBody, ownedBody, recentBody] = await Promise.all([
    fetchJson(
      steamUrl("/ISteamUser/GetPlayerSummaries/v2/", { key, steamids: steamId }),
      {},
      "GetPlayerSummaries",
      [key],
    ),
    fetchJson(
      steamUrl("/IPlayerService/GetOwnedGames/v1/", {
        key,
        steamid: steamId,
        include_appinfo: "1",
      }),
      {},
      "GetOwnedGames",
      [key],
    ),
    fetchJson(
      steamUrl("/IPlayerService/GetRecentlyPlayedGames/v1/", {
        key,
        steamid: steamId,
        count: String(RECENT_COUNT),
      }),
      {},
      "GetRecentlyPlayedGames",
      [key],
    ),
  ]);

  const player =
    isRecord(summaryBody) &&
    isRecord(summaryBody.response) &&
    Array.isArray(summaryBody.response.players) &&
    isRecord(summaryBody.response.players[0])
      ? summaryBody.response.players[0]
      : undefined;
  const handle = asString(player?.personaname);
  if (!handle) throw new ShapeError("GetPlayerSummaries returned no personaname");
  const nowPlaying = asString(player?.gameextrainfo);

  const owned = new Map<number, OwnedGame>();
  for (const game of readGames(ownedBody)) {
    if (!isRecord(game)) continue;
    const appid = asNumber(game.appid);
    if (appid === undefined) continue;
    const last = asNumber(game.rtime_last_played);
    owned.set(appid, {
      appid,
      playtimeMinutes: asNumber(game.playtime_forever) ?? 0,
      lastPlayed: last && last > 0 ? new Date(last * 1000).toISOString() : undefined,
    });
  }
  const gameCount =
    (isRecord(ownedBody) && isRecord(ownedBody.response)
      ? asNumber(ownedBody.response.game_count)
      : undefined) ?? owned.size;
  const totalMinutes = [...owned.values()].reduce((n, g) => n + g.playtimeMinutes, 0);
  const hours = Math.round(totalMinutes / 60);

  const recentRaw = readGames(recentBody).filter(isRecord).slice(0, RECENT_COUNT);
  const recent: GameEntry[] = await Promise.all(
    recentRaw.map(async (game) => {
      const appid = asNumber(game.appid);
      const name = asString(game.name) ?? "Unknown game";
      const minutes = asNumber(game.playtime_forever) ?? 0;
      const progress =
        appid === undefined
          ? undefined
          : await achievementProgress(key, steamId, appid).catch(() => undefined);
      return {
        name,
        image:
          appid === undefined
            ? undefined
            : safeImage(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`),
        lastPlayed: appid === undefined ? undefined : owned.get(appid)?.lastPlayed,
        progress,
        hours: Math.round(minutes / 60),
      };
    }),
  );

  const headline = [
    { label: "hours", value: formatCount(hours) },
    { label: "games", value: formatCount(gameCount) },
  ];
  if (nowPlaying) headline.push({ label: "now playing", value: nowPlaying });

  return assertUsable({
      id: "steam",
      handle,
      nowPlaying,
      headline,
      recent,
    source: "live",
    fetchedAt: nowIso(),
  });
}
