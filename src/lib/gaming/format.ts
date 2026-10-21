const TIME_ZONE = "Asia/Kolkata";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

/** Always three letters; Intl gives "Sept" for September in en-GB. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dateParts = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: TIME_ZONE,
});

/** Day and three-letter month in Asia/Kolkata, e.g. "21 Oct". */
function dayMonth(date: Date): string | undefined {
  const parts = new Map(dateParts.formatToParts(date).map((part) => [part.type, part.value]));
  const month = MONTHS[Number(parts.get("month")) - 1];
  const day = parts.get("day")?.replace(/^0/, "");
  return month && day ? `${day} ${month}` : undefined;
}

/** "snapshot" for static data, "synced 21 Oct, 13:42 IST" for live data. */
export function sourceLabel(source: "live" | "static", fetchedAt: string): string {
  if (source === "static") return "snapshot";
  const date = new Date(fetchedAt);
  if (Number.isNaN(date.getTime())) return "synced";
  const dm = dayMonth(date);
  return dm ? `synced ${dm}, ${timeFormat.format(date)} IST` : "synced";
}

/** "20 Sep 2026" in Asia/Kolkata. */
export function shortDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const dm = dayMonth(date);
  const year = new Map(dateParts.formatToParts(date).map((part) => [part.type, part.value])).get("year");
  return dm && year ? `${dm} ${year}` : undefined;
}

export function formatNumber(value: number | undefined): string {
  return (value ?? 0).toLocaleString("en-US");
}
