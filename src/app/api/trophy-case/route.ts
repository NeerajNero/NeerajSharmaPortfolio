import { connection } from "next/server";
import { getTrophyCase } from "@/lib/gaming";

/**
 * Dev-only: returns the trophy case as JSON so keys can be verified without
 * the UI. 404 in production. Never includes env values; only adapter output.
 */
export async function GET(): Promise<Response> {
  await connection();
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  return Response.json(await getTrophyCase());
}
