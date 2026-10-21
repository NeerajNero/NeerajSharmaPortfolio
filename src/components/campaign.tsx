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
        <li key={entry.key} className="grid md:grid-cols-[160px_minmax(0,1fr)]">
          <span className="hidden text-[13px] text-muted md:block md:pt-[2px]">{entry.dates}</span>
          <div className="relative border-l border-line pb-8 pl-6">
            <span
              aria-hidden="true"
              className="absolute -left-[3.5px] top-[0.55em] h-[6px] w-[6px] rounded-none bg-accent"
            />
            <span className="block text-[13px] text-muted md:hidden">{entry.dates}</span>
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
