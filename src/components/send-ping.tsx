import { site } from "@/config/site";

/** Strip scheme, www and trailing slash so a URL reads as a visible address. */
function visible(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
}

export function SendPing() {
  const { identity, links } = site;
  const rows = [
    { label: "email", href: `mailto:${identity.email}`, text: identity.email },
    { label: "GitHub", href: links.github, text: visible(links.github) },
    { label: "LinkedIn", href: links.linkedin, text: visible(links.linkedin) },
  ];

  return (
    <ul className="mt-6 flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-4">
          <span className="text-[13px] text-muted">{row.label}</span>
          <a href={row.href} rel="me noopener" className="break-all">
            {row.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
