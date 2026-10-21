export type PlatformId = "steam" | "xbox" | "psn";

export interface GameEntry {
  name: string;
  image?: string; // absolute URL
  lastPlayed?: string; // ISO
  progress?: number; // 0–100 achievement/trophy %
  hours?: number; // total hours, where the platform gives it
  tag?: string; // short muted suffix after the name, e.g. "PS5"
}

export interface PlatformStats {
  id: PlatformId;
  handle: string;
  nowPlaying?: string;
  headline: { label: string; value: string }[]; // 2–3 pairs
  recent: GameEntry[]; // max 5
  source: "live" | "static";
  fetchedAt: string; // ISO
}

export interface Aggregate {
  steamHours?: number;
  gamerscore?: number;
  platinums?: number;
}
