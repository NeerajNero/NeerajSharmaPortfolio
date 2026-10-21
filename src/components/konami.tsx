"use client";

import { useEffect } from "react";
import { toggleCrt } from "@/lib/crt";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const TAP_COUNT = 5;
const TAP_WINDOW_MS = 2000;

export function Konami() {
  useEffect(() => {
    let keys: string[] = [];
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      keys = [...keys, key].slice(-SEQUENCE.length);
      if (keys.length === SEQUENCE.length && keys.every((k, i) => k === SEQUENCE[i])) {
        keys = [];
        toggleCrt();
      }
    };

    let taps: number[] = [];
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-avatar]")) return;
      const now = Date.now();
      taps = [...taps.filter((t) => now - t <= TAP_WINDOW_MS), now];
      if (taps.length >= TAP_COUNT) {
        taps = [];
        toggleCrt();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
