import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./src/lib/gaming/image-hosts";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The OG image reads the bundled TTFs at request time; make sure they ship with the function.
  outputFileTracingIncludes: { "/opengraph-image": ["./src/app/fonts/*.ttf"] },
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
