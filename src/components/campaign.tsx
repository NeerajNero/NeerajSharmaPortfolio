import { site } from "@/config/site";

interface Entry {
  key: string;
  dates: string;
  heading: string;
  sub: string;
  bullets: string[];
}

const entries: Entry[] = [
  ...site.experience.map((role) => ({
    key: `${role.company}-${role.start}`,
    dates: `${role.start} – ${role.end}`,
    heading: role.title,
    sub: `${role.company}, ${role.location}`,
    bullets: role.bullets,
  })),
  ...site.education.map((edu) => ({
    key: `${edu.institution}-${edu.start}`,
    dates: `${edu.start} – ${edu.end}`,
    heading: edu.degree,
    sub: `${edu.institution}, ${edu.location}`,
    bullets: [],
  })),
];

export function Campaign() {
  return (
    <ol className="mt-6">
      {entries.map((entry) => (
        /* Mobile: the rule sits on the row and the date stacks above the role.
           Desktop: the date takes the 160px column and the rule moves to the
           content column, so the date is rendered once in either layout. */
        <li
          key={entry.key}
          className="relative grid border-l border-line pl-6 md:grid-cols-[160px_minmax(0,1fr)] md:border-0 md:pl-0"
        >
          <span
            aria-hidden="true"
            className="absolute -left-[3.5px] top-[0.55em] h-[6px] w-[6px] rounded-none bg-accent md:left-[156.5px]"
          />
          <span className="text-[13px] text-muted md:pt-[2px]">{entry.dates}</span>
          <div className="pb-8 md:border-l md:border-line md:pl-6">
            <p>{entry.heading}</p>
            <p className="text-[13px] text-muted">{entry.sub}</p>
            {entry.bullets.length > 0 ? (
              <ul className="mt-2 flex max-w-[70ch] list-disc flex-col gap-1 pl-5 marker:text-muted">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
