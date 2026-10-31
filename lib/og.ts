// Link preview images, drawn by scripts/og.mjs before each build. Pages only point to
// one if it was actually drawn, so a build without internet just has no preview image.

import fs from "node:fs";
import path from "node:path";

export function ogImage(file: string, alt: string) {
  if (!fs.existsSync(path.join(process.cwd(), "public", file))) return undefined;
  return [{ url: `/${file}`, width: 1200, height: 630, alt }];
}
