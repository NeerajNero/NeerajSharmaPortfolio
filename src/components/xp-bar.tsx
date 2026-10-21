"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "ssr" | "armed" | "grown";

/**
 * 2px progress bar. The server renders the full bar; after mount the fill is
 * collapsed while off-screen and grows to its width once in view, once.
 * Reduced motion: the full bar, no transition.
 */
export function XpBar({ progress, muted }: { progress: number; muted: boolean }) {
  const [phase, setPhase] = useState<Phase>("ssr");
  const ref = useRef<HTMLDivElement>(null);
  const width = Math.max(0, Math.min(100, progress));

  useEffect(() => {
    const el = ref.current;
    if (!el || width === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      // One frame after arming so the transition has a start state to leave.
      raf = requestAnimationFrame(() => setPhase("grown"));
    });
    raf = requestAnimationFrame(() => {
      setPhase("armed");
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [width]);

  return (
    <div ref={ref} aria-hidden="true" className="mt-1.5 h-[2px] w-full bg-line">
      <div
        className={`h-full origin-left ${muted ? "bg-muted" : "bg-accent"} ${
          phase === "armed" ? "scale-x-0" : "scale-x-100"
        } ${phase === "grown" ? "transition-transform duration-[600ms] ease-out" : ""}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
