import { env } from "@/lib/env";
import {
  asNumber,
  asString,
  fetchJson,
  formatCount,
  isRecord,
  nowIso,
  safeImage,
  snapshot,
} from "@/lib/gaming/shared";
import type { GameEntry, PlatformStats } from "@/lib/gaming/types";

const BASE = "https://xbl.io/api/v2";
const RECENT_COUNT = 5;

interface Title {
  name: string;
  image?: string;
  lastPlayed?: string;
  progress?: number;
}

function readSettings(body: unknown): Map<string, string> {
  const settings = new Map<string, string>();
  if (!isRecord(body) || !Array.isArray(body.profileUsers)) return settings;
  const user = body.profileUsers[0];
  if (!isRecord(user) || !Array.isArray(user.settings)) return settings;
  for (const entry of user.settings) {
    if (!isRecord(entry)) continue;
    const id = asString(entry.id);
    const value = asString(entry.value);
    if (id && value !== undefined) settings.set(id, value);
  }
  return settings;
}

function readTitles(body: unknown): Title[] {
  if (!isRecord(body) || !Array.isArray(body.titles)) return [];
  const titles: Title[] = [];
  for (const raw of body.titles) {
    if (!isRecord(raw)) continue;
    const name = asString(raw.name);
    if (!name) continue;
    const history = isRecord(raw.titleHistory) ? raw.titleHistory : undefined;
    const achievement = isRecord(raw.achievement) ? raw.achievement : undefined;
    const lastPlayed = asString(history?.lastTimePlayed);
    titles.push({
      name,
      image: safeImage(raw.displayImage),
      lastPlayed: lastPlayed && !Number.isNaN(Date.parse(lastPlayed)) ? lastPlayed : undefined,
      progress: asNumber(achievement?.progressPercentage),
    });
  }
  return titles;
}

export async function getXboxStats(): Promise<PlatformStats> {
  const key = env.openXblApiKey;
  if (!key) return snapshot("xbox");

  const headers = {
    "X-Authorization": key,
    Accept: "application/json",
    "Accept-Language": "en-US",
  };

  try {
    const [accountBody, historyBody] = await Promise.all([
      fetchJson(`${BASE}/account`, { headers }, "[xbox] account"),
      fetchJson(`${BASE}/player/titleHistory`, { headers }, "[xbox] title history"),
    ]);

    const settings = readSettings(accountBody);
    const handle = settings.get("Gamertag") ?? snapshot("xbox").handle;
    const gamerscore = Number(settings.get("Gamerscore") ?? 0) || 0;

    const titles = readTitles(historyBody);
    const completions = titles.filter((t) => t.progress === 100).length;
    const recent: GameEntry[] = titles
      .filter((t) => t.lastPlayed !== undefined)
      .sort((a, b) => Date.parse(b.lastPlayed ?? "") - Date.parse(a.lastPlayed ?? ""))
      .slice(0, RECENT_COUNT)
      .map((t) => ({
        name: t.name,
        image: t.image,
        lastPlayed: t.lastPlayed,
        progress: t.progress === undefined ? undefined : Math.round(t.progress),
      }));

    return {
      id: "xbox",
      handle,
      headline: [
        { label: "gamerscore", value: formatCount(gamerscore) },
        { label: "titles", value: formatCount(titles.length) },
        { label: "100% completions", value: formatCount(completions) },
      ],
      recent,
      source: "live",
      fetchedAt: nowIso(),
    };
  } catch (error) {
    console.warn(`[xbox] falling back to snapshot: ${error instanceof Error ? error.message : String(error)}`);
    return snapshot("xbox");
  }
}
