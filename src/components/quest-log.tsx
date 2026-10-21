import { site } from "@/config/site";
import { getSideQuests } from "@/lib/github";

function SubHeading({ children }: { children: string }) {
  return <h3 className="text-[13px] text-muted">{children}</h3>;
}

export async function QuestLog() {
  const sideQuests = await getSideQuests();

  return (
    <div className="mt-6 flex flex-col gap-10">
      <div>
        <SubHeading>Main quests</SubHeading>
        <ul className="mt-2 divide-y divide-line border-t border-line">
          {site.featured.map((project) => (
            <li key={project.repo} className="py-4">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <a href={project.repo} rel="noopener">
                  {project.name}
                </a>
                <span className="text-[13px] text-muted">{project.tags.join(", ")}</span>
              </div>
              <p className="mt-1 max-w-[70ch]">{project.blurb}</p>
            </li>
          ))}
        </ul>
      </div>

      {sideQuests.length > 0 ? (
        <div>
          <SubHeading>Side quests</SubHeading>
          <ul className="mt-2 divide-y divide-line border-t border-line">
            {sideQuests.map((repo) => (
              <li
                key={repo.url}
                className="flex flex-col gap-y-0.5 py-2 md:grid md:grid-cols-[240px_110px_minmax(0,1fr)] md:items-baseline md:gap-x-4"
              >
                <a href={repo.url} rel="noopener" className="truncate">
                  {repo.name}
                </a>
                <span className="text-[13px] text-muted">{repo.language ?? ""}</span>
                <span className="truncate text-[13px] text-muted">{repo.description ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
