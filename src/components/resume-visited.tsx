"use client";

import { useEffect } from "react";
import { announce, ANNOUNCE_KEY, unlock } from "@/lib/achievements";

/**
 * Unlocks "background-check" when the résumé page mounts. If the player
 * card's link already persisted it a moment ago, announce it here so the
 * toast is actually seen. Renders nothing.
 */
export function ResumeVisited() {
  useEffect(() => {
    const fresh = unlock("background-check");
    let handedOff = false;
    try {
      handedOff = sessionStorage.getItem(ANNOUNCE_KEY) === "background-check";
      sessionStorage.removeItem(ANNOUNCE_KEY);
    } catch {
      // no handoff available
    }
    if (!fresh && handedOff) announce("background-check");
  }, []);
  return null;
}
