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
import { asNumber, describeError, formatCount, isRecord, nowIso, safeImage, snapshot } from "@/lib/gaming/shared";
import type { GameEntry, PlatformStats } from "@/lib/gaming/types";

const RECENT_COUNT = 5;
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

  try {
    const [summary, titles] = await Promise.all([
      getUserTrophyProfileSummary(auth, "me"),
      getUserTitles(auth, "me", { limit: RECENT_COUNT }),
    ]);

    const earned = summary.earnedTrophies;
    const recent: GameEntry[] = titles.trophyTitles.slice(0, RECENT_COUNT).map((title) => ({
      name: title.trophyTitleName,
      image: safeImage(title.trophyTitleIconUrl),
      lastPlayed: title.lastUpdatedDateTime,
      progress: Math.round(title.progress),
    }));

    return {
      id: "psn",
      // The trophy API does not return the online ID; it comes from site.ts.
      handle: snapshot("psn").handle,
      headline: [
        { label: "level", value: String(summary.trophyLevel) },
        { label: "bronze", value: formatCount(earned.bronze) },
        { label: "silver", value: formatCount(earned.silver) },
        { label: "gold", value: formatCount(earned.gold) },
        { label: "platinum", value: formatCount(earned.platinum) },
      ],
      recent,
      source: "live",
      fetchedAt: nowIso(),
    };
  } catch (error) {
    const status = isRecord(error) ? asNumber(error.status) : undefined;
    if (status === 401 || status === 403) {
      tokens = undefined;
      console.warn(`${AUTH_FAILED} (${describeError(error, [npsso])})`);
    } else {
      console.warn(`[psn] falling back to snapshot: ${describeError(error, [npsso])}`);
    }
    return snapshot("psn");
  }
}
