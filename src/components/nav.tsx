"use client";

import { useEffect, useState } from "react";
import { site } from "@/config/site";

export function Nav() {
  const [active, setActive] = useState<string>(site.nav[0]?.id ?? "");

  useEffect(() => {
    const sections = site.nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the first visible section in document order.
        const next = site.nav.find((item) => visible.has(item.id));
        if (next) setActive(next.id);
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
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
