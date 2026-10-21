import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/config/site";

export const alt = `${site.identity.displayName} — ${site.identity.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Mirrors the @theme tokens in globals.css; satori cannot read CSS variables. */
const COLOR = { bg: "#080A08", text: "#D6DDD2", muted: "#7E887B", accent: "#B8FF2B" };
const BRACKET = 32;
const INSET = 48;

const bracketPositions: Record<string, React.CSSProperties> = {
  tl: { top: INSET, left: INSET, borderTop: `3px solid ${COLOR.accent}`, borderLeft: `3px solid ${COLOR.accent}` },
  tr: { top: INSET, right: INSET, borderTop: `3px solid ${COLOR.accent}`, borderRight: `3px solid ${COLOR.accent}` },
  bl: { bottom: INSET, left: INSET, borderBottom: `3px solid ${COLOR.accent}`, borderLeft: `3px solid ${COLOR.accent}` },
  br: { bottom: INSET, right: INSET, borderBottom: `3px solid ${COLOR.accent}`, borderRight: `3px solid ${COLOR.accent}` },
};

export default async function Image() {
  const [display, mono] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/PressStart2P-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/JetBrainsMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `0 ${INSET * 2.5}px`,
          background: COLOR.bg,
          color: COLOR.text,
          fontFamily: "JetBrains Mono",
        }}
      >
        {Object.entries(bracketPositions).map(([key, style]) => (
          <div key={key} style={{ position: "absolute", width: BRACKET, height: BRACKET, ...style }} />
        ))}
        <div
          style={{
            display: "flex",
            fontFamily: "Press Start 2P",
            fontSize: 56,
            lineHeight: 1.4,
            letterSpacing: "0.02em",
            color: COLOR.accent,
          }}
        >
          {site.identity.displayName}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: COLOR.text }}>
          {site.identity.handle}
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 30, color: COLOR.muted }}>
          {site.identity.title}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Press Start 2P", data: display, style: "normal", weight: 400 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
