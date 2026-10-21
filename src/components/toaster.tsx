"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { ACHIEVEMENT_EVENT, type AchievementDetail } from "@/lib/achievements";
import { CRT_EVENT } from "@/lib/crt";

const ENTER_MS = 250;
const HOLD_MS = 3500;
const EXIT_MS = 200;
const REDUCED_FADE_MS = 150;

interface Toast {
  key: number;
  eyebrow?: string;
  title: string;
}

/**
 * One queue for every toast (achievements and the CRT toggle). Shows one at a
 * time: slide in, hold, slide out, next. Reduced motion fades instead.
 */
export function Toaster() {
  const [current, setCurrent] = useState<Toast | null>(null);
  const [shown, setShown] = useState(false);
  const queue = useRef<Toast[]>([]);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enter = reduced ? REDUCED_FADE_MS : ENTER_MS;
    const exit = reduced ? REDUCED_FADE_MS : EXIT_MS;
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

    const next = () => {
      const toast = queue.current.shift();
      if (!toast) {
        busy.current = false;
        return;
      }
      busy.current = true;
      setCurrent(toast);
      // Mount hidden, then show on the next frame so the transition runs.
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      later(() => {
        setShown(false);
        later(() => {
          setCurrent(null);
          next();
        }, exit);
      }, enter + HOLD_MS);
    };

    const push = (toast: Omit<Toast, "key">) => {
      queue.current.push({ ...toast, key: ++seq.current });
      if (!busy.current) next();
    };

    const onAchievement = (event: Event) => {
      const { id } = (event as CustomEvent<AchievementDetail>).detail;
      const found = site.achievements.find((a) => a.id === id);
      if (found) push({ eyebrow: "Achievement unlocked", title: found.title });
    };
    const onCrt = (event: Event) => {
      push({ title: (event as CustomEvent<boolean>).detail ? "crt mode on" : "crt mode off" });
    };

    window.addEventListener(ACHIEVEMENT_EVENT, onAchievement);
    window.addEventListener(CRT_EVENT, onCrt);
    const pending = timers.current;
    return () => {
      window.removeEventListener(ACHIEVEMENT_EVENT, onAchievement);
      window.removeEventListener(CRT_EVENT, onCrt);
      for (const t of pending) window.clearTimeout(t);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[70] max-w-[320px]">
      {current ? (
        <div
          key={current.key}
          data-shown={shown ? "true" : "false"}
          className="toast flex items-start gap-3 border border-line bg-surface px-3 py-2 text-[13px]"
        >
          <span aria-hidden="true" className="mt-[6px] h-[10px] w-[10px] shrink-0 bg-accent" />
          <div className="min-w-0">
            {current.eyebrow ? <p className="text-muted">{current.eyebrow}</p> : null}
            <p className="text-text">{current.title}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
