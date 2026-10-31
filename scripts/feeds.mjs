// Writes the RSS feeds for Notes, one per language, on every `npm run build`:
//   public/feed.xml     English (notes only in Spanish appear too, in Spanish)
//   public/feed.es.xml  Spanish (notes only in English appear too, in English)
// Feed readers (Feedly, NetNewsWire, Inoreader…) check them and show new notes.
// Each item carries the whole note; live figures become a line that links to the page.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NOTES = path.join(ROOT, "content", "notes");
const SITE = (process.env.SITE_URL || "https://kanusaru.github.io/home").replace(/\/$/, "");
const ORIGIN = new URL(SITE).origin;

// the note reader uses this to put the base path on links like /notes/picture.png
process.env.NEXT_PUBLIC_BASE_PATH ??= new URL(SITE).pathname.replace(/\/$/, "");
const { parseMarkdown } = await import("../lib/markdown.ts");

const TEXT = {
  en: {
    title: "Kanu, notes",
    description: "Erick Donado's notes: machine learning, systems, and whatever I'm studying.",
    figure: "Live figure, open the note to see it",
  },
  es: {
    title: "Kanu, notas",
    description: "Notas de Erick Donado: machine learning, sistemas y lo que esté estudiando.",
    figure: "Figura interactiva, abre la nota para verla",
  },
};

const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

function rfc822(date) {
  const [y, m, d] = (date || "1970-01-01").split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12)).toUTCString();
}

function readNotes() {
  if (!fs.existsSync(NOTES)) return [];
  const bySlug = new Map();
  for (const file of fs.readdirSync(NOTES)) {
    const m = file.match(/^(.+)\.(en|es)\.md$/);
    if (!m) continue;
    const note = bySlug.get(m[1]) ?? { slug: m[1], versions: {} };
    note.versions[m[2]] = parseMarkdown(fs.readFileSync(path.join(NOTES, file), "utf8"));
    bySlug.set(m[1], note);
  }
  return [...bySlug.values()]
    .map((n) => ({ ...n, date: (n.versions.en ?? n.versions.es).meta.date || "" }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function body(blocks, lang, link) {
  return blocks
    .map((b) => {
      if (b.type === "html") return b.html;
      const caption = b.props.caption ? `: ${xml(b.props.caption)}` : "";
      return `<p><em><a href="${link}">${TEXT[lang].figure}</a>${caption}</em></p>`;
    })
    .join("\n")
    .replace(/(href|src)="\//g, `$1="${ORIGIN}/`); // feed readers need full addresses
}

function feed(lang, notes) {
  const t = TEXT[lang];
  const self = `${SITE}/${lang === "en" ? "feed.xml" : "feed.es.xml"}`;
  const items = notes.map((n) => {
    const v = n.versions[lang] ?? n.versions.en ?? n.versions.es;
    const link = `${SITE}/notes/${n.slug}/`;
    const tags = (v.meta.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
    return [
      "    <item>",
      `      <title>${xml(v.meta.title || n.slug)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <pubDate>${rfc822(n.date)}</pubDate>`,
      ...tags.map((tag) => `      <category>${xml(tag)}</category>`),
      `      <description>${xml(v.meta.summary || "")}</description>`,
      `      <content:encoded>${cdata(body(v.blocks, lang, link))}</content:encoded>`,
      "    </item>",
    ].join("\n");
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xml(t.title)}</title>
    <link>${SITE}/notes/</link>
    <description>${xml(t.description)}</description>
    <language>${lang}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
${notes.length ? `    <lastBuildDate>${rfc822(notes[0].date)}</lastBuildDate>\n` : ""}${items.join("\n")}
  </channel>
</rss>
`;
}

const notes = readNotes();
fs.writeFileSync(path.join(ROOT, "public", "feed.xml"), feed("en", notes));
fs.writeFileSync(path.join(ROOT, "public", "feed.es.xml"), feed("es", notes));
console.log(`feeds: wrote public/feed.xml and public/feed.es.xml (${notes.length} note(s))`);
