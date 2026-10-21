import Image from "next/image";
import { site } from "@/config/site";
import { env } from "@/lib/env";

const AVATAR_PX = 120;

const corners = [
  "-top-px -left-px border-t border-l",
  "-top-px -right-px border-t border-r",
  "-bottom-px -left-px border-b border-l",
  "-bottom-px -right-px border-b border-r",
];

function Avatar() {
  const { displayName, initials } = site.identity;
  const box = "h-[120px] w-[120px] shrink-0 select-none border border-line";

  if (env.dpUrl) {
    return (
      <div data-avatar className={box}>
        <Image
          src={env.dpUrl}
          alt={displayName}
          width={AVATAR_PX}
          height={AVATAR_PX}
          priority
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      data-avatar
      role="img"
      aria-label={displayName}
      className={`${box} flex items-center justify-center font-display text-[22px] text-accent`}
    >
      {initials}
    </div>
  );
}

export function PlayerCard() {
  const { identity, links } = site;

  return (
    <article className="relative border border-line bg-surface p-6 md:p-8">
      {corners.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`pointer-events-none absolute h-2 w-2 rounded-none border-accent ${position}`}
        />
      ))}

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <Avatar />

        <div className="min-w-0 flex flex-col gap-3">
          <h1
            id="player-name"
            className="font-display text-[20px] leading-[1.4] tracking-[0.02em] md:text-[28px]"
          >
            {identity.displayName}
          </h1>

          <p>
            {identity.title}, {identity.company}
          </p>

          <p className="flex items-center gap-4 text-[13px] text-muted">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]"
              />
              {identity.status}
            </span>
            <span>{identity.location}</span>
          </p>

          <p className="max-w-[70ch]">{identity.oneLiner}</p>

          <ul className="flex flex-wrap gap-5 text-[13px]">
            <li>
              <a href={links.github} rel="me noopener">
                GitHub
              </a>
            </li>
            <li>
              <a href={links.linkedin} rel="me noopener">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={links.resume} data-achievement="background-check">
                Résumé
              </a>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
