"use client";

import { useEffect } from "react";
import { site } from "@/config/site";
import { ANNOUNCE_KEY, firedAtMs, unlock } from "@/lib/achievements";

const SPEEDRUN_WINDOW_MS = 8000;
const LAST_SECTION = "ping";

/**
 * Home-page triggers, renders nothing:
 * - completionist: every nav section has had its top cross the viewport.
 *   Checked by position on each observer callback, so sections jumped past
 *   in a single frame (End key, instant anchor) still count as crossed.
 * - speedrun: the last section entered view within 8 s of press-start firing
 * - background-check: the player card's résumé link was clicked
 */
export function AchievementTriggers() {
  useEffect(() => {
    const sections = site.nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const seen = new Set<string>();

    const observer = new IntersectionObserver((entries) => {
      for (const section of sections) {
        if (section.getBoundingClientRect().top < window.innerHeight) seen.add(section.id);
      }
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target.id === LAST_SECTION) {
          const started = firedAtMs("press-start");
          if (started !== undefined && performance.now() - started < SPEEDRUN_WINDOW_MS) unlock("speedrun");
        }
      }
      if (seen.size === sections.length) {
        unlock("completionist");
        observer.disconnect();
      }
    });
    for (const section of sections) observer.observe(section);

    // The link navigates at once, so a toast here would be lost; persist the
    // unlock now and let /resume announce it on arrival.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-achievement="background-check"]')) {
        if (unlock("background-check")) {
          try {
            sessionStorage.setItem(ANNOUNCE_KEY, "background-check");
          } catch {
            // no handoff; the unlock itself is already stored
          }
        }
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
