// Draws the link preview images (what WhatsApp, Discord, LinkedIn… show when someone
// shares the site): one for the whole site and one per note. Runs on its own before
// every `npm run build`, and writes them to public/og/.
//
// The fonts come from Google Fonts while it runs. If anything fails (no internet,
// say), it prints a warning and the site builds anyway, just without the images.

import fs from "node:fs";
import path from "node:path";
let h; // React.createElement, loaded in main() so a missing package is only a warning

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "og");
const NOTES = path.join(ROOT, "content", "notes");
const SITE = (process.env.SITE_URL || "https://kanusaru.github.io/home").replace(/^https?:\/\//, "").replace(/\/$/, "");

const C = { ground: "#0d0d0c", panel: "#131312", rule: "#2b2a26", bone: "#e7e2d6", ash: "#918c81", blue: "#7390ff" };
const W = 1200;
const H = 630;

/** A font file from Google Fonts, cut down to the letters in `text`. */
async function googleFont(family, weight, text) {
  const q = `${family.replace(/ /g, "+")}${weight ? `:wght@${weight}` : ""}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${q}&text=${encodeURIComponent(text)}`)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`Google Fonts sent no font file for ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

/** Front matter of a note file: title, date… */
function frontMatter(file) {
  const m = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return meta;
}

function notes() {
  if (!fs.existsSync(NOTES)) return [];
  const bySlug = new Map();
  for (const f of fs.readdirSync(NOTES)) {
    const m = f.match(/^(.+)\.(en|es)\.md$/);
    if (!m) continue;
    const n = bySlug.get(m[1]) ?? { slug: m[1] };
    n[m[2]] = frontMatter(path.join(NOTES, f));
    bySlug.set(m[1], n);
  }
  return [...bySlug.values()];
}

function dateLabel(date) {
  const [y, mo, d] = (date || "").split("-").map(Number);
  if (!y) return "";
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, (mo || 1) - 1, d || 1)),
  );
}

// the frame every image shares: dark ground, a panel with a thin border
const frame = (...children) =>
  h(
    "div",
    {
      style: {
        width: W,
        height: H,
        display: "flex",
        padding: 40,
        backgroundColor: C.ground,
        backgroundImage: "radial-gradient(circle at 12% 0%, #1d1c19 0%, #0d0d0c 62%)",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          flex: 1,
          border: `1px solid ${C.rule}`,
          backgroundColor: C.panel,
          padding: "48px 60px",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      ...children,
    ),
  );

function siteImage(lily) {
  return frame(
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h("div", { style: { fontFamily: "Jacquard", fontSize: 250, lineHeight: 0.95, color: C.bone } }, "Kanu"),
      h("div", { style: { fontFamily: "Archivo", fontWeight: 700, fontSize: 46, color: C.bone, marginTop: 18 } }, "Erick Donado"),
      h("div", { style: { fontFamily: "VT323", fontSize: 36, color: C.ash, marginTop: 8 } }, SITE),
    ),
    h("img", { src: lily.src, width: lily.w * 0.95, height: lily.h * 0.95 }),
  );
}

function noteImage(note, lily) {
  const main = note.en ?? note.es;
  const second = note.en && note.es && note.es.title !== note.en.title ? note.es.title : null;
  return frame(
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: 720 } },
      h("div", { style: { fontFamily: "Jacquard", fontSize: 96, lineHeight: 1, color: C.bone } }, "Kanu"),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h("div", { style: { fontFamily: "VT323", fontSize: 34, color: C.ash } }, `Notes · ${dateLabel(main.date)}`),
        h(
          "div",
          { style: { fontFamily: "Archivo", fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: C.bone, marginTop: 10 } },
          main.title,
        ),
        second &&
          h("div", { style: { fontFamily: "Archivo", fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: C.ash, marginTop: 14 } }, second),
      ),
    ),
    h("img", { src: lily.src, width: lily.w * 0.7, height: lily.h * 0.7, style: { opacity: 0.85 } }),
  );
}

async function main() {
  ({ createElement: h } = await import("react"));
  // next has no "exports" map, so plain Node needs the file name with .js
  const og = await import("next/og.js");
  const ImageResponse = og.ImageResponse ?? og.default?.ImageResponse;
  const all = notes();

  const lilyPng = fs.readFileSync(path.join(ROOT, "scripts", "og-lily.png"));
  const lily = {
    src: `data:image/png;base64,${lilyPng.toString("base64")}`,
    w: lilyPng.readUInt32BE(16),
    h: lilyPng.readUInt32BE(20),
  };

  // every letter that appears, so each font only carries what it needs
  const titles = all.flatMap((n) => [n.en?.title, n.es?.title]).filter(Boolean).join(" ");
  const fonts = [
    { name: "Jacquard", data: await googleFont("Jacquard 24", null, "Kanu"), weight: 400 },
    { name: "Archivo", data: await googleFont("Archivo", 700, `Erick Donado ${titles}`), weight: 700 },
    { name: "Archivo", data: await googleFont("Archivo", 800, titles || "a"), weight: 800 },
    {
      name: "VT323",
      data: await googleFont("VT323", null, `${SITE} Notes · ${all.map((n) => dateLabel((n.en ?? n.es).date)).join(" ")}`),
      weight: 400,
    },
  ];

  const write = async (file, element) => {
    const img = new ImageResponse(element, { width: W, height: H, fonts });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
  };

  fs.rmSync(OUT, { recursive: true, force: true });
  await write(path.join(OUT, "site.png"), siteImage(lily));
  for (const n of all) await write(path.join(OUT, "notes", `${n.slug}.png`), noteImage(n, lily));
  console.log(`og: wrote ${1 + all.length} preview image(s) to public/og/`);
}

main().catch((err) => {
  console.warn(`og: skipped the preview images (${err.message}). The site still builds.`);
});
