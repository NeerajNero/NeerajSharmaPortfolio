import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";

const HEADER = "x-revalidate-secret";
const TAGS = ["arcade", "github"] as const;

/** Constant-time comparison; never logs either value. */
function matches(provided: string | null, expected: string): boolean {
  if (provided === null) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Marks the arcade and GitHub caches stale so the next visit refreshes them
 * in the background (stale-while-revalidate, nobody waits). 404 when
 * REVALIDATE_SECRET is unset, 401 on a missing or wrong header.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = env.revalidateSecret;
  if (!secret) return new Response(null, { status: 404 });
  if (!matches(request.headers.get(HEADER), secret)) {
    return new Response(null, { status: 401 });
  }
  for (const tag of TAGS) revalidateTag(tag, "max");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}

export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
