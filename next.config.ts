import type { NextConfig } from "next";

// Static export: `next build` writes a plain HTML site to /out,
// which GitHub Pages (or any static host) can serve.
//
// The site is served from kanusaru.github.io/home, so pages and files live
// under /home. The deploy workflow sets BASE_PATH from GitHub's own settings;
// with a custom domain it becomes empty on its own. Locally it's empty, so
// `npm run dev` works at http://localhost:3000.
const basePath = process.env.BASE_PATH ?? "";
// The site's public address, for things people copy elsewhere (like the 88×31 button
// code). The deploy workflow sets SITE_URL; with a custom domain it follows on its own.
const siteUrl = (process.env.SITE_URL || "https://kanusaru.github.io/home").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
