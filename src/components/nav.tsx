"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

/** Where a section's top lands after an anchor scroll; matches scroll-margin-top in globals.css. */
const NAV_LINE_PX = 72;
/** Upper bound for a smooth anchor scroll to finish. */
const SETTLE_MS = 700;

/**
 * The active section is the last one whose top has crossed the nav line.
 * At the very bottom of the page the last section wins, since short trailing
 * sections can never reach the line on their own.
 */
function pickActive(sections: HTMLElement[]): string {
  const doc = document.documentElement;
  const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
  if (atBottom) return sections[sections.length - 1].id;
  let current = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= NAV_LINE_PX + 1) current = section.id;
  }
  return current;
}

export function Nav() {
  const [active, setActive] = useState<string>(site.nav[0]?.id ?? "");

  useEffect(() => {
    const sections = site.nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const update = () => setActive(pickActive(sections));
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${NAV_LINE_PX}px 0px 0px 0px`,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    });
    for (const section of sections) observer.observe(section);

    // The observer's last callback can land mid smooth-scroll; re-check once
    // the scroll settles (scrollend) and, for browsers without it, after a
    // fixed delay following an anchor jump.
    let settle: number | undefined;
    const onHashChange = () => {
      update();
      window.clearTimeout(settle);
      settle = window.setTimeout(update, SETTLE_MS);
    };
    window.addEventListener("scrollend", update);
    window.addEventListener("hashchange", onHashChange);
    const raf = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", update);
      window.removeEventListener("hashchange", onHashChange);
      window.clearTimeout(settle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-[8px]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[1040px] items-center gap-6 px-6"
      >
        <a
          href="#player"
          className="shrink-0 font-display text-[11px] leading-none text-accent"
        >
          {site.identity.handle}
        </a>
        <ul className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto text-[13px] text-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {site.nav.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex items-center gap-2 py-1 ${isActive ? "text-text" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-px w-2 ${isActive ? "bg-accent" : "bg-transparent"}`}
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
