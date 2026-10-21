/**
 * Browser-only achievement engine. Persists { id: unlockedAtISO } under
 * localStorage "achievements". Every call is a no-op on the server and
 * survives a blocked or missing storage.
 */
import { site, type AchievementId } from "@/config/site";

export const ACHIEVEMENT_EVENT = "achievement";
export const ACHIEVEMENTS_RESET_EVENT = "achievements:reset";
const STORAGE_KEY = "achievements";
/** sessionStorage key: an unlock persisted just before a navigation, to be announced on the next page. */
export const ANNOUNCE_KEY = "achievements:announce";

export interface AchievementDetail {
  id: AchievementId;
  unlockedAt: string;
}

export interface AchievementState {
  id: AchievementId;
  unlockedAt?: string;
}

/** When each trigger fired in this page view, whether or not it was new. */
const firedAt = new Map<AchievementId, number>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): Partial<Record<AchievementId, string>> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Partial<Record<AchievementId, string>> = {};
    for (const { id } of site.achievements) {
      const value = (parsed as Record<string, unknown>)[id];
      if (typeof value === "string") out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function write(store: Partial<Record<AchievementId, string>>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable: the unlock still shows this page view
  }
}

export function isUnlocked(id: AchievementId): boolean {
  return read()[id] !== undefined;
}

export function list(): AchievementState[] {
  const store = read();
  return site.achievements.map(({ id }) => ({ id, unlockedAt: store[id] }));
}

/** Records the trigger time, persists a first unlock and emits it. Returns true only when new. */
export function unlock(id: AchievementId): boolean {
  if (!isBrowser()) return false;
  if (!firedAt.has(id)) firedAt.set(id, performance.now());
  const store = read();
  if (store[id] !== undefined) return false;
  const unlockedAt = new Date().toISOString();
  write({ ...store, [id]: unlockedAt });
  const detail: AchievementDetail = { id, unlockedAt };
  window.dispatchEvent(new CustomEvent<AchievementDetail>(ACHIEVEMENT_EVENT, { detail }));
  return true;
}

/** Re-emits an already persisted unlock so its toast shows on the next page (see the résumé handoff). */
export function announce(id: AchievementId): void {
  if (!isBrowser()) return;
  const unlockedAt = read()[id];
  if (unlockedAt === undefined) return;
  const detail: AchievementDetail = { id, unlockedAt };
  window.dispatchEvent(new CustomEvent<AchievementDetail>(ACHIEVEMENT_EVENT, { detail }));
}

/** Milliseconds since page-view start when `id`'s trigger fired, if it has. */
export function firedAtMs(id: AchievementId): number | undefined {
  return firedAt.get(id);
}

export function reset(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
  window.dispatchEvent(new Event(ACHIEVEMENTS_RESET_EVENT));
}
