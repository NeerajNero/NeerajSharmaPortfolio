import { site } from "@/config/site";

export function Loadout() {
  return (
    <dl className="mt-6 grid gap-y-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-y-3">
      {site.skills.map((group) => (
        <div key={group.name} className="contents">
          <dt className="text-[13px] text-muted md:pt-[2px]">{group.name}</dt>
          <dd className="max-w-[70ch]">{group.items.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
