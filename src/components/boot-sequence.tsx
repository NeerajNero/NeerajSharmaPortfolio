"use client";

import { useEffect, useMemo, useState } from "react";
import { site } from "@/config/site";

const CHAR_MS_MAX = 16;
const LINE_PAUSE_MS = 120;
/** Typing must finish inside this so the whole run stays under 1.8s. */
const TYPING_BUDGET_MS = 1250;
const HOLD_MS = 250;
const REDUCED_MOTION_HOLD_MS = 400;
const FADE_MS = 250;

type Phase = "typing" | "fading" | "done";

interface Schedule {
  charMs: number;
  starts: number[];
  total: number;
}

function buildSchedule(lines: string[]): Schedule {
  const chars = lines.reduce((n, line) => n + line.length, 0);
  const pauses = LINE_PAUSE_MS * Math.max(0, lines.length - 1);
  const charMs = Math.min(CHAR_MS_MAX, (TYPING_BUDGET_MS - pauses) / Math.max(1, chars));
  let t = 0;
  const starts = lines.map((line) => {
    const start = t;
    t += line.length * charMs + LINE_PAUSE_MS;
    return start;
  });
  return { charMs, starts, total: Math.max(0, t - LINE_PAUSE_MS) };
}

function linesAt(lines: string[], schedule: Schedule, elapsed: number): string[] {
  return lines.map((line, i) => {
    const local = elapsed - schedule.starts[i];
    if (local <= 0) return "";
    const count = Math.min(line.length, Math.floor(local / schedule.charMs));
    return line.slice(0, count);
  });
}

export function BootSequence() {
  const lines = site.boot.lines;
  const schedule = useMemo(() => buildSchedule(lines), [lines]);
  const [phase, setPhase] = useState<Phase>("typing");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("boot") === "1";
      sessionStorage.setItem("boot", "1");
    } catch {
      // storage unavailable: play once, never persist
    }
    let raf = 0;
    let timer: number | undefined;
    let finished = false;

    if (seen) {
      // Already hidden by CSS via html[data-boot="done"]; unmount next frame.
      raf = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(raf);
    }

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      setElapsed(schedule.total);
      setPhase("fading");
      timer = window.setTimeout(() => setPhase("done"), FADE_MS);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      raf = requestAnimationFrame(() => {
        setElapsed(schedule.total);
        timer = window.setTimeout(finish, REDUCED_MOTION_HOLD_MS);
      });
    } else {
      const started = performance.now();
      const tick = (now: number) => {
        const t = now - started;
        if (t >= schedule.total) {
          setElapsed(schedule.total);
          timer = window.setTimeout(finish, HOLD_MS);
          return;
        }
        setElapsed(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [schedule]);

  if (phase === "done") return null;

  const typed = linesAt(lines, schedule, elapsed);
  const complete = elapsed >= schedule.total;
  const caretLine = complete ? -1 : typed.findLastIndex((line) => line.length > 0);

  return (
    <div
      aria-hidden="true"
      data-boot-overlay
      className={`fixed inset-0 z-50 bg-surface transition-opacity duration-[250ms] ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="mx-auto max-w-[1040px] px-6 pt-24 font-mono text-[14px] leading-[1.65] text-accent whitespace-pre">
        {typed.map((line, i) => (
          <div key={lines[i]} className="min-h-[1.65em]">
            {line}
            {i === caretLine ? (
              <span className="ml-px inline-block h-[0.9em] w-[0.55em] translate-y-[0.1em] bg-accent" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
