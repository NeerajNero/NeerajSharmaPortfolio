import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Nav } from "@/components/nav";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import "./globals.css";

const display = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${site.identity.displayName} — ${site.identity.title}`,
    template: `%s — ${site.identity.handle}`,
  },
  description: site.identity.oneLiner,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-3 focus:py-2 focus:text-accent"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-[1040px] px-6 py-6 text-[13px] text-muted">
            {/* footer content arrives in phase 3 */}
          </div>
        </footer>
      </body>
    </html>
  );
}
