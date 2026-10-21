const TIME_ZONE = "Asia/Kolkata";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

/** "snapshot" for static data, "live 14:00 IST" for live data. */
export function sourceLabel(source: "live" | "static", fetchedAt: string): string {
  if (source === "static") return "snapshot";
  const date = new Date(fetchedAt);
  return Number.isNaN(date.getTime()) ? "live" : `live ${timeFormat.format(date)} IST`;
}

export function shortDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : dateFormat.format(date);
}

export function formatNumber(value: number | undefined): string {
  return (value ?? 0).toLocaleString("en-US");
}
