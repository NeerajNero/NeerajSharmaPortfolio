/**
 * Typed, undefined-safe reads of every environment variable the site uses.
 * Nothing here throws: a missing variable reads as `undefined` and callers
 * fall back to static content.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = {
  /** Public origin, e.g. https://neerajnero.com. Used for metadataBase. */
  siteUrl: read("NEXT_PUBLIC_SITE_URL") ?? "https://neerajnero.com",
  /** Cloudinary avatar URL. Undefined renders the "NN" fallback square. */
  dpUrl: read("NEXT_PUBLIC_DP_URL"),
  /** Optional token to raise the GitHub API rate limit. */
  githubToken: read("GITHUB_TOKEN"),
  steamApiKey: read("STEAM_API_KEY"),
  steamId64: read("STEAM_ID64"),
  openXblApiKey: read("OPENXBL_API_KEY"),
  psnNpsso: read("PSN_NPSSO"),
  /** Shared secret for POST /api/revalidate. Unset disables the route (404). */
  revalidateSecret: read("REVALIDATE_SECRET"),
} as const;

export type Env = typeof env;
