import type { NextConfig } from "next";

// Static export: `next build` writes a plain HTML site to /out,
// which GitHub Pages (or any static host) can serve.
//
// The site is served from kanusaru.github.io/home, so pages and files live
// under /home. The deploy workflow sets BASE_PATH from GitHub's own settings;
// with a custom domain it becomes empty on its own. Locally it's empty, so
// `npm run dev` works at http://localhost:3000.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
