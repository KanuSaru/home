// Reads the notes in content/notes/ when the site is built.
//
// A note is a Markdown file named after its address, plus its language:
//   content/notes/how-dither-moon-draws-the-moon.en.md
//   content/notes/how-dither-moon-draws-the-moon.es.md
// Write one or both. With both, the language switch picks the version.
// Each file starts with front matter:
//   ---
//   title: How dither-moon draws the Moon
//   date: 2026-10-31
//   tags: graphics, astronomy
//   summary: One or two sentences for the list of notes.
//   ---

import fs from "node:fs";
import path from "node:path";
import { parseMarkdown, type Block } from "./markdown";

export type NoteVersion = {
  title: string;
  summary: string;
  tags: string[];
  blocks: Block[];
  /** about how long it takes to read */
  minutes: number;
  /** its sections (the ## headings), for the list at the top */
  toc: { id: string; text: string }[];
};
export type Note = {
  slug: string;
  date: string; // YYYY-MM-DD
  versions: { en?: NoteVersion; es?: NoteVersion };
};
/** What lists need: everything except the text. */
export type NoteSummary = Omit<Note, "versions"> & {
  versions: { en?: Omit<NoteVersion, "blocks" | "toc">; es?: Omit<NoteVersion, "blocks" | "toc"> };
};

const DIR = path.join(process.cwd(), "content", "notes");

export function getNotes(dir = DIR): Note[] {
  if (!fs.existsSync(dir)) return [];
  const bySlug = new Map<string, Note>();
  for (const file of fs.readdirSync(dir).sort()) {
    const m = file.match(/^(.+)\.(en|es)\.md$/);
    if (!m) continue;
    const [, slug, lang] = m as unknown as [string, string, "en" | "es"];
    const { meta, blocks } = parseMarkdown(fs.readFileSync(path.join(dir, file), "utf8"));
    const note = bySlug.get(slug) ?? { slug, date: "", versions: {} };
    const tags = (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
    note.versions[lang] = { title: meta.title || slug, summary: meta.summary || "", tags, blocks, ...measure(blocks) };
    // the date can be written in either file; the English one wins if they differ
    if (meta.date && (!note.date || lang === "en")) note.date = meta.date;
    bySlug.set(slug, note);
  }
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
}

const plain = (html: string) =>
  html
    .replace(/<annotation[\s\S]*?<\/annotation>/g, " ") // the LaTeX source KaTeX keeps beside each formula
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");

/** Reading time (about 200 words a minute, and a little for each figure) and the list of sections. */
function measure(blocks: Block[]) {
  let words = 0;
  let figures = 0;
  const toc: { id: string; text: string }[] = [];
  for (const b of blocks) {
    if (b.type !== "html") {
      figures++;
      continue;
    }
    words += plain(b.html).split(/\s+/).filter(Boolean).length;
    for (const m of b.html.matchAll(/<h2 id="([^"]*)">([\s\S]*?)<\/h2>/g)) toc.push({ id: m[1], text: plain(m[2]).replace(/\s+/g, " ").trim() });
  }
  return { minutes: Math.max(1, Math.round(words / 200 + figures * 0.2)), toc };
}

export function getNote(slug: string): Note | undefined {
  return getNotes().find((n) => n.slug === slug);
}

export function summarize(notes: Note[]): NoteSummary[] {
  return notes.map((n) => ({
    ...n,
    versions: Object.fromEntries(
      Object.entries(n.versions).map(([l, v]) => [l, { title: v!.title, summary: v!.summary, tags: v!.tags, minutes: v!.minutes }]),
    ) as NoteSummary["versions"],
  }));
}
