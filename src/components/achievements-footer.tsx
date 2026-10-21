"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";
import {
  ACHIEVEMENT_EVENT,
  ACHIEVEMENTS_RESET_EVENT,
  list,
  reset,
  type AchievementState,
} from "@/lib/achievements";
import { shortDate } from "@/lib/gaming/format";

const locked = (): AchievementState[] => site.achievements.map(({ id }) => ({ id }));

/**
 * "achievements n/5" as a <details> in the footer. The server renders 0/5;
 * the client reads storage after mount and follows unlock and reset events.
 */
export function AchievementsFooter() {
  const [states, setStates] = useState<AchievementState[]>(locked);

  useEffect(() => {
    const refresh = () => setStates(list());
    const raf = requestAnimationFrame(refresh);
    window.addEventListener(ACHIEVEMENT_EVENT, refresh);
    window.addEventListener(ACHIEVEMENTS_RESET_EVENT, refresh);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(ACHIEVEMENT_EVENT, refresh);
      window.removeEventListener(ACHIEVEMENTS_RESET_EVENT, refresh);
    };
  }, []);

  const unlocked = states.filter((s) => s.unlockedAt).length;
  const byId = new Map(states.map((s) => [s.id, s.unlockedAt]));

  return (
    <details className="basis-full text-[13px] text-muted">
      <summary className="inline-block cursor-pointer">
        achievements {unlocked}/{site.achievements.length}
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {site.achievements.map((a) => {
          const at = byId.get(a.id);
          const masked = a.hidden && !at;
          return (
            <li key={a.id} className="grid gap-x-4 sm:grid-cols-[160px_minmax(0,1fr)_120px]">
              <span className="text-text">{masked ? "???" : a.title}</span>
              <span>{masked ? "Keep exploring." : a.description}</span>
              <span>{at ? (shortDate(at) ?? "unlocked") : "locked"}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3">
        <button type="button" onClick={reset} className="cursor-pointer text-text hover:underline hover:decoration-accent">
          reset
        </button>
      </p>
    </details>
  );
}
