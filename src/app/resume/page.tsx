import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${site.identity.legalName}, ${site.identity.title} at ${site.identity.company}.`,
};

/** Build-time check: the PDF is dropped into public/ by hand and may be absent. */
const hasPdf = existsSync(join(process.cwd(), "public", site.links.resumePdf.replace(/^\//, "")));

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="relative border-t border-line pt-4 font-display text-[13px] leading-[1.6] print:border-black">
      <span aria-hidden="true" className="absolute -top-px left-0 h-px w-6 bg-accent print:hidden" />
      {children}
    </h2>
  );
}

export default function ResumePage() {
  const { identity, links, experience, education, skills } = site;

  return (
    <article className="mx-auto flex max-w-[1040px] flex-col gap-10 px-6 py-12 print:gap-6 print:px-0 print:py-0">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[20px] leading-[1.4] tracking-[0.02em] md:text-[28px]">
          {identity.legalName}
        </h1>
        <p>
          {identity.title}, {identity.company}
        </p>
        <p className="text-[13px] text-muted">
          {identity.location}, {identity.experienceYears}
        </p>
        <p className="max-w-[70ch]">{identity.oneLiner}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
          <li>
            <a href={`mailto:${identity.email}`}>{identity.email}</a>
          </li>
          <li>
            <a href={links.github} rel="me noopener">
              {links.github.replace(/^https?:\/\//, "")}
            </a>
          </li>
          <li>
            <a href={links.linkedin} rel="me noopener">
              {links.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </a>
          </li>
          {hasPdf ? (
            <li className="print:hidden">
              <a href={links.resumePdf}>Download PDF</a>
            </li>
          ) : null}
        </ul>
      </header>

      <section aria-labelledby="resume-experience">
        <Heading id="resume-experience">Experience</Heading>
        <ol className="mt-4 flex flex-col gap-6">
          {experience.map((role) => (
            <li key={`${role.company}-${role.start}`} className="grid gap-1 md:grid-cols-[160px_minmax(0,1fr)]">
              <span className="text-[13px] text-muted">
                {role.start} – {role.end}
              </span>
              <div>
                <p>{role.title}</p>
                <p className="text-[13px] text-muted">
                  {role.company}, {role.location}
                </p>
                <ul className="mt-2 flex max-w-[70ch] list-disc flex-col gap-1 pl-5 marker:text-muted">
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="resume-education">
        <Heading id="resume-education">Education</Heading>
        <ul className="mt-4 flex flex-col gap-4">
          {education.map((edu) => (
            <li key={edu.institution} className="grid gap-1 md:grid-cols-[160px_minmax(0,1fr)]">
              <span className="text-[13px] text-muted">
                {edu.start} – {edu.end}
              </span>
              <div>
                <p>{edu.degree}</p>
                <p className="text-[13px] text-muted">
                  {edu.institution}, {edu.location}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="resume-skills">
        <Heading id="resume-skills">Skills</Heading>
        <dl className="mt-4 grid gap-y-3 md:grid-cols-[160px_minmax(0,1fr)]">
          {skills.map((group) => (
            <div key={group.name} className="contents">
              <dt className="text-[13px] text-muted">{group.name}</dt>
              <dd className="max-w-[70ch]">{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
