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

const EXCERPT_CHARS = 120;

/** First characters of a body, whitespace collapsed, with any secret replaced. */
export function excerpt(text: string, secrets: (string | undefined)[] = []): string {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.replaceAll(secret, "[redacted]");
  }
  return out.replace(/\s+/g, " ").slice(0, EXCERPT_CHARS);
}

/** A failed HTTP call: endpoint name, status and a redacted body excerpt. Never the URL or headers. */
export class HttpError extends Error {
  readonly status: number;
  readonly excerpt: string;

  constructor(label: string, status: number, bodyExcerpt: string) {
    super(`${label} responded ${status}: ${bodyExcerpt}`);
    this.name = "HttpError";
    this.status = status;
    this.excerpt = bodyExcerpt;
  }
}

/**
 * GET a JSON endpoint. `label` names the endpoint for warnings; `secrets` are
 * redacted from any body excerpt. The URL is never part of an error.
 */
export async function fetchJson(
  url: string,
  init: RequestInit,
  label: string,
  secrets: (string | undefined)[] = [],
): Promise<unknown> {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new HttpError(label, res.status, excerpt(text, secrets));
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(label, res.status, `non-JSON body: ${excerpt(text, secrets)}`);
  }
}

/** A 200 response that parsed to nothing usable. The wrapper falls back to the snapshot. */
export class ShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShapeError";
  }
}

/**
 * Live stats must carry a real handle and at least one non-zero headline
 * number; otherwise the adapter is reporting "live" with placeholder data.
 */
export function assertUsable(stats: PlatformStats): PlatformStats {
  if (stats.handle.trim().length === 0) throw new ShapeError("no handle in response");
  const usable = stats.headline.some((pair) => {
    const value = Number(pair.value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(value) && value > 0;
  });
  if (!usable) throw new ShapeError("no usable headline values in response");
  return stats;
}

/** One-line description of any thrown value for a warning, with secrets redacted. */
export function describeError(error: unknown, secrets: (string | undefined)[] = []): string {
  if (error instanceof HttpError) return excerpt(error.message, secrets);
  if (isRecord(error)) {
    const status =
      asNumber(error.status) ??
      asNumber(error.statusCode) ??
      (isRecord(error.response) ? asNumber(error.response.status) : undefined);
    const message = asString(error.message) ?? "unknown error";
    const text = status === undefined ? message : `status ${status}: ${message}`;
    return excerpt(text, secrets);
  }
  return excerpt(String(error), secrets);
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function nowIso(): string {
  return new Date().toISOString();
}
