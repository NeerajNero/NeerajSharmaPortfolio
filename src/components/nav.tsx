"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

/** Where a section's top lands after an anchor scroll; matches scroll-margin-top in globals.css. */
const NAV_LINE_PX = 72;
/** Upper bound for a smooth anchor scroll to finish. */
const SETTLE_MS = 700;

/**
 * The active section is the last one whose top has crossed the nav line.
 * At the very bottom of the page short trailing sections can never reach the
 * line, so the section named in the URL hash wins if it is in view, else the
 * last section.
 */
function pickActive(sections: HTMLElement[]): string {
  const doc = document.documentElement;
  const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
  if (atBottom) {
    const wanted = sections.find((s) => `#${s.id}` === window.location.hash);
    if (wanted) {
      const top = wanted.getBoundingClientRect().top;
      if (top >= 0 && top < window.innerHeight) return wanted.id;
    }
    return sections[sections.length - 1].id;
  }
  let current = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= NAV_LINE_PX + 1) current = section.id;
  }
  return current;
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Nav() {
  const [active, setActive] = useState<string>(site.nav[0]?.id ?? "");
  const settleRef = useRef<(() => void) | undefined>(undefined);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const placedOnce = useRef(false);
  // Nav lives in the layout and survives route changes; re-attach per page.
  const pathname = usePathname();

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
    const onJump = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(update, SETTLE_MS);
    };
    settleRef.current = onJump;
    window.addEventListener("scrollend", update);
    window.addEventListener("hashchange", onJump);
    const raf = requestAnimationFrame(update);

    return () => {
      settleRef.current = undefined;
      observer.disconnect();
      window.removeEventListener("scrollend", update);
      window.removeEventListener("hashchange", onJump);
      window.clearTimeout(settle);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  /* Sliding tick: one bar in the list's coordinate space, moved imperatively
     to the active link's offsetLeft/offsetWidth. The first placement runs
     with transitions off so it does not slide in from zero. */
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const place = () => {
      const link = linkRefs.current.get(active);
      if (!link) return;
      const instant = !placedOnce.current || reducedMotion();
      if (instant) indicator.style.transition = "none";
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.opacity = "1";
      if (instant) {
        // Flush, then hand control back to the CSS transition.
        void indicator.offsetWidth;
        indicator.style.transition = "";
        placedOnce.current = true;
      }
    };

    place();

    // Mobile row: bring a partly hidden active link into view ("nearest" edge).
    // Scrolls the list itself rather than scrollIntoView, which also targets
    // the window and cancels the page's own smooth scroll to the section.
    const link = linkRefs.current.get(active);
    if (link) {
      const left = link.offsetLeft;
      const right = left + link.offsetWidth;
      const visibleLeft = list.scrollLeft;
      const visibleRight = visibleLeft + list.clientWidth;
      const target = left < visibleLeft ? left : right > visibleRight ? right - list.clientWidth : undefined;
      if (target !== undefined) {
        list.scrollTo({ left: target, behavior: reducedMotion() ? "auto" : "smooth" });
      }
    }

    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(list);
    if (link) resizeObserver.observe(link);
    window.addEventListener("resize", place);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-[8px]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[1040px] items-center gap-6 px-6"
      >
        <Link
          href="/#player"
          onClick={() => settleRef.current?.()}
          className="shrink-0 font-display text-[11px] leading-none text-accent"
        >
          {site.identity.handle}
        </Link>
        <ul
          ref={listRef}
          className="relative flex min-w-0 flex-1 items-center gap-5 overflow-x-auto py-1 text-[13px] text-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {site.nav.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={`/#${item.id}`}
                  ref={(el) => {
                    if (el) linkRefs.current.set(item.id, el);
                    else linkRefs.current.delete(item.id);
                  }}
                  onClick={() => settleRef.current?.()}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-block py-1 ${isActive ? "text-text" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="nav-tick pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-accent opacity-0"
          />
        </ul>
      </nav>
    </header>
  );
}
