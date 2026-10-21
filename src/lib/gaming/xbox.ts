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

const BASE = "https://xbl.io/api/v2";
const RECENT_COUNT = 5;

interface Title {
  name: string;
  image?: string;
  lastPlayed?: string;
  progress?: number;
}

/** OpenXBL wraps every payload as { content: ..., code: ... }; accept both shapes. */
function unwrap(body: unknown): unknown {
  return isRecord(body) && isRecord(body.content) ? body.content : body;
}

function readSettings(raw: unknown): Map<string, string> {
  const settings = new Map<string, string>();
  const body = unwrap(raw);
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

/**
 * progressPercentage when present and non-zero; otherwise derived from
 * currentGamerscore / totalGamerscore. A genuine 0% needs a real total;
 * with no total there is no achievement data, so no value is reported and
 * the card omits the percentage.
 */
function readProgress(achievement: unknown): number | undefined {
  if (!isRecord(achievement)) return undefined;
  const percentage = asNumber(achievement.progressPercentage);
  if (percentage !== undefined && percentage > 0) return Math.round(percentage);
  const current = asNumber(achievement.currentGamerscore) ?? 0;
  const total = asNumber(achievement.totalGamerscore) ?? 0;
  if (total <= 0) return undefined;
  return current > 0 ? Math.round((current / total) * 100) : 0;
}

/** First allowed URL in a title's images array, when displayImage is empty. */
function firstImage(images: unknown): string | undefined {
  if (!Array.isArray(images)) return undefined;
  for (const entry of images) {
    const url = isRecord(entry) ? safeImage(entry.url) : undefined;
    if (url) return url;
  }
  return undefined;
}

/** Devices that mean the title was played through Xbox or the Microsoft Store. */
const XBOX_DEVICES = new Set(["XboxSeries", "XboxOne", "Xbox360", "PC", "Mobile"]);

/**
 * The Xbox PC app logs third-party launchers' games (Steam via the Game Bar)
 * into title history with devices ["Win32"], no pfn and no gamerscore. Keep
 * a title when any device is an Xbox console or store platform; if devices
 * are absent, fall back to a pfn or a gamerscore total as proof it is real.
 */
function isXboxTitle(raw: Record<string, unknown>): boolean {
  const devices = Array.isArray(raw.devices)
    ? raw.devices.filter((d): d is string => typeof d === "string")
    : [];
  if (devices.length > 0) return devices.some((d) => XBOX_DEVICES.has(d));
  const achievement = isRecord(raw.achievement) ? raw.achievement : undefined;
  const total = asNumber(achievement?.totalGamerscore) ?? 0;
  return total > 0 || asString(raw.pfn) !== undefined;
}

function readTitles(raw: unknown): Title[] {
  const body = unwrap(raw);
  if (!isRecord(body) || !Array.isArray(body.titles)) return [];
  const titles: Title[] = [];
  for (const raw of body.titles) {
    if (!isRecord(raw) || !isXboxTitle(raw)) continue;
    const name = asString(raw.name);
    if (!name) continue;
    const history = isRecord(raw.titleHistory) ? raw.titleHistory : undefined;
    const lastPlayed = asString(history?.lastTimePlayed);
    titles.push({
      name,
      image: safeImage(raw.displayImage) ?? firstImage(raw.images),
      lastPlayed: lastPlayed && !Number.isNaN(Date.parse(lastPlayed)) ? lastPlayed : undefined,
      progress: readProgress(raw.achievement),
    });
  }
  return titles;
}

/** Throws on any failure; the cached wrapper in index.ts falls back to the snapshot. */
export async function getXboxStats(): Promise<PlatformStats> {
  const key = env.openXblApiKey;
  if (!key) return snapshot("xbox");

  const headers = {
    "X-Authorization": key,
    Accept: "application/json",
    "Accept-Language": "en-US",
  };

  const [accountBody, historyBody] = await Promise.all([
    fetchJson(`${BASE}/account`, { headers }, "account", [key]),
    fetchJson(`${BASE}/player/titleHistory`, { headers }, "titleHistory", [key]),
  ]);

  const settings = readSettings(accountBody);
  const handle = settings.get("Gamertag");
  if (!handle) throw new ShapeError("account returned no Gamertag");
  const parsedScore = Number(settings.get("Gamerscore"));
  const gamerscore = Number.isFinite(parsedScore) ? parsedScore : 0;

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

  return assertUsable({
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
  });
}
