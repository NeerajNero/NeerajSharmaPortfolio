import { cacheLife } from "next/cache";
import { site } from "@/config/site";
import { env } from "@/lib/env";

export interface SideQuest {
  name: string;
  url: string;
  description?: string;
  language?: string;
  pushedAt: string; // ISO
}

interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
}

function isGitHubRepo(value: unknown): value is GitHubRepo {
  if (typeof value !== "object" || value === null) return false;
  const repo = value as Record<string, unknown>;
  return (
    typeof repo.name === "string" &&
    typeof repo.html_url === "string" &&
    typeof repo.fork === "boolean" &&
    typeof repo.archived === "boolean" &&
    typeof repo.pushed_at === "string"
  );
}

function repoNameFromUrl(url: string): string {
  return url.replace(/\/+$/, "").split("/").pop()?.toLowerCase() ?? "";
}

/**
 * Side quests: the owner's most recently pushed public repos that are not
 * forks, not the profile repo, and not already featured. Cached for one hour.
 * Never throws: on any failure it warns once and returns an empty list, which
 * is cached for the same hour and retried after.
 */
export async function getSideQuests(): Promise<SideQuest[]> {
  "use cache";
  cacheLife("hours");

  const { endpoint, exclude, limit } = site.sideQuests;
  const excluded = new Set([
    ...exclude.map((name) => name.toLowerCase()),
    ...site.featured.map((project) => repoNameFromUrl(project.repo)),
  ]);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": site.domain,
  };
  if (env.githubToken) headers.Authorization = `Bearer ${env.githubToken}`;

  try {
    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      console.warn(`[github] repos fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const body: unknown = await res.json();
    if (!Array.isArray(body)) {
      console.warn("[github] unexpected response shape");
      return [];
    }

    return body
      .filter(isGitHubRepo)
      .filter((repo) => !repo.fork && !repo.archived && !excluded.has(repo.name.toLowerCase()))
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .slice(0, limit)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description ?? undefined,
        language: repo.language ?? undefined,
        pushedAt: repo.pushed_at,
      }));
  } catch (error) {
    console.warn(`[github] repos fetch threw: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
