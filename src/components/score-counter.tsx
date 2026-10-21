"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/gaming/format";

const DURATION_MS = 900;

/** Cubic ease-out. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Renders the final number in HTML, then counts up from 0 once the element
 * is in view. Reduced motion: no animation. Width is reserved in ch so the
 * row does not jitter while the digits change.
 */
export function ScoreCounter({ value, className }: { value: number; className?: string }) {
  const final = formatNumber(value);
  const [text, setText] = useState(final);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const started = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / DURATION_MS);
        setText(formatNumber(Math.round(value * easeOut(t))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums ${className ?? ""}`}
      style={{ minWidth: `${final.length}ch` }}
    >
      {text}
    </span>
  );
}
