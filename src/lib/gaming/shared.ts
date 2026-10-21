import { site } from "@/config/site";
import { IMAGE_HOSTS } from "@/lib/gaming/image-hosts";
import type { PlatformId, PlatformStats } from "@/lib/gaming/types";

const allowedHosts = new Set<string>(IMAGE_HOSTS);

/** The hand-filled snapshot for a platform, stamped as static. */
export function snapshot(id: PlatformId): PlatformStats {
  return { ...site.gaming.static[id], source: "static" };
}

/** Only pass images next/image is configured to serve; anything else is dropped. */
export function safeImage(url: unknown): string | undefined {
  if (typeof url !== "string" || url.length === 0) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && allowedHosts.has(parsed.hostname) ? url : undefined;
  } catch {
    return undefined;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** GET a JSON endpoint. Throws with status only, never with the URL (it may carry a key). */
export async function fetchJson(
  url: string,
  init: RequestInit,
  label: string,
): Promise<unknown> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${label} responded ${res.status}`);
  return res.json() as Promise<unknown>;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function nowIso(): string {
  return new Date().toISOString();
}
