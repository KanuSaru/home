// After `next build`: marks every Spanish page as Spanish.
// The site has one layout for both languages, so the built HTML always opens with
// <html lang="en">; the pages under out/es/ are rewritten to say lang="es", which
// tells search engines and screen readers what language the text is in.

import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "out", "es");

function walk(d) {
  if (!fs.existsSync(d)) return 0;
  let n = 0;
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, entry.name);
    if (entry.isDirectory()) n += walk(p);
    else if (entry.name.endsWith(".html")) {
      const html = fs.readFileSync(p, "utf8");
      const fixed = html.replace(/<html lang="en"/, '<html lang="es"');
      if (fixed !== html) {
        fs.writeFileSync(p, fixed);
        n++;
      }
    }
  }
  return n;
}

console.log(`html-lang: marked ${walk(dir)} Spanish page(s)`);
