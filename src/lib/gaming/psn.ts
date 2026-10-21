import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
  getUserTitles,
  getUserTrophyProfileSummary,
  type AuthorizationPayload,
  type AuthTokensResponse,
} from "psn-api";
import { env } from "@/lib/env";
import {
  asNumber,
  assertUsable,
  cleanName,
  describeError,
  formatCount,
  isRecord,
  nowIso,
  safeImage,
  ShapeError,
  snapshot,
} from "@/lib/gaming/shared";
import type { GameEntry, PlatformStats } from "@/lib/gaming/types";

const RECENT_COUNT = 5;
/** Fetch more than we show so PS4/PS5 duplicates can be collapsed. */
const FETCH_LIMIT = 10;
/** Treat a token as expired this long before Sony does, to avoid racing the edge. */
const EXPIRY_MARGIN_MS = 60_000;
const AUTH_FAILED = "[psn] auth failed — refresh PSN_NPSSO";

interface TokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

/** Module-scope token cache: survives across calls within one server instance. */
let tokens: TokenCache | undefined;

function store(response: AuthTokensResponse): TokenCache {
  tokens = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + response.expiresIn * 1000,
  };
  return tokens;
}

async function exchangeNpsso(npsso: string): Promise<TokenCache> {
  const code = await exchangeNpssoForCode(npsso);
  return store(await exchangeCodeForAccessToken(code));
}

/**
 * First call: NPSSO → code → tokens. Later calls reuse the access token until
 * it expires, then refresh; only if the refresh fails do we exchange the
 * NPSSO again. Throws when every path fails.
 */
async function authorize(npsso: string): Promise<AuthorizationPayload> {
  if (tokens && tokens.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return { accessToken: tokens.accessToken };
  }
  if (tokens) {
    try {
      const refreshed = store(await exchangeRefreshTokenForAuthTokens(tokens.refreshToken));
      return { accessToken: refreshed.accessToken };
    } catch {
      tokens = undefined;
    }
  }
  return { accessToken: (await exchangeNpsso(npsso)).accessToken };
}

/** "Mafia III: Definitive Edition for PS5®" → "Mafia III: Definitive Edition". */
export function cleanTitleName(name: string): string {
  // Marks first: "… for PS5®" only matches the suffix once the ® is gone.
  return cleanName(name).replace(/\s+for\s+PS[45]\s*$/i, "").trim();
}

/** "PS5", "PS4" or "PS4,PS5" → the newest platform listed. */
function platformTag(platform: string): string | undefined {
  const parts = platform.split(",").map((part) => part.trim().toUpperCase());
  if (parts.includes("PS5")) return "PS5";
  if (parts.includes("PS4")) return "PS4";
  return parts[0] || undefined;
}

interface CleanTitle {
  entry: GameEntry;
  updatedAt: number;
}

/** Clean names, keep the most recent entry per name, newest first, top 5. */
export function dedupeTitles(titles: CleanTitle[]): GameEntry[] {
  const byName = new Map<string, CleanTitle>();
  for (const title of titles) {
    const existing = byName.get(title.entry.name);
    if (!existing || title.updatedAt > existing.updatedAt) byName.set(title.entry.name, title);
  }
  return [...byName.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, RECENT_COUNT)
    .map((t) => t.entry);
}

/** Auth failures are handled here (exact warning per spec); anything else throws to the wrapper. */
export async function getPsnStats(): Promise<PlatformStats> {
  const npsso = env.psnNpsso;
  if (!npsso) return snapshot("psn");

  let auth: AuthorizationPayload;
  try {
    auth = await authorize(npsso);
  } catch (error) {
    console.warn(`${AUTH_FAILED} (${describeError(error, [npsso])})`);
    return snapshot("psn");
  }

  let summary;
  let titles;
  try {
    [summary, titles] = await Promise.all([
      getUserTrophyProfileSummary(auth, "me"),
      getUserTitles(auth, "me", { limit: FETCH_LIMIT }),
    ]);
  } catch (error) {
    const status = isRecord(error) ? asNumber(error.status) : undefined;
    if (status === 401 || status === 403) {
      tokens = undefined;
      console.warn(`${AUTH_FAILED} (${describeError(error, [npsso])})`);
      return snapshot("psn");
    }
    throw error;
  }

  if (!isRecord(summary) || !isRecord(summary.earnedTrophies)) {
    throw new ShapeError("trophy summary missing earnedTrophies");
  }
  const earned = summary.earnedTrophies;
  if (!Array.isArray(titles.trophyTitles)) throw new ShapeError("user titles missing trophyTitles");

  const recent = dedupeTitles(
    titles.trophyTitles.map((title) => ({
      updatedAt: Date.parse(title.lastUpdatedDateTime) || 0,
      entry: {
        name: cleanTitleName(title.trophyTitleName),
        tag: platformTag(String(title.trophyTitlePlatform)),
        image: safeImage(title.trophyTitleIconUrl),
        lastPlayed: title.lastUpdatedDateTime,
        progress: Math.round(title.progress),
      },
    })),
  );

  return assertUsable({
    id: "psn",
    // The trophy API does not return the online ID; it comes from site.ts.
    handle: snapshot("psn").handle,
    headline: [
      { label: "level", value: String(summary.trophyLevel) },
      { label: "bronze", value: formatCount(asNumber(earned.bronze) ?? 0) },
      { label: "silver", value: formatCount(asNumber(earned.silver) ?? 0) },
      { label: "gold", value: formatCount(asNumber(earned.gold) ?? 0) },
      { label: "platinum", value: formatCount(asNumber(earned.platinum) ?? 0) },
    ],
    recent,
    source: "live",
    fetchedAt: nowIso(),
  });
}
