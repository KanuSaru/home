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

export type NoteVersion = { title: string; summary: string; tags: string[]; blocks: Block[] };
export type Note = {
  slug: string;
  date: string; // YYYY-MM-DD
  versions: { en?: NoteVersion; es?: NoteVersion };
};
/** What lists need: everything except the text. */
export type NoteSummary = Omit<Note, "versions"> & {
  versions: { en?: Omit<NoteVersion, "blocks">; es?: Omit<NoteVersion, "blocks"> };
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
    note.versions[lang] = { title: meta.title || slug, summary: meta.summary || "", tags, blocks };
    // the date can be written in either file; the English one wins if they differ
    if (meta.date && (!note.date || lang === "en")) note.date = meta.date;
    bySlug.set(slug, note);
  }
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNote(slug: string): Note | undefined {
  return getNotes().find((n) => n.slug === slug);
}

export function summarize(notes: Note[]): NoteSummary[] {
  return notes.map((n) => ({
    ...n,
    versions: Object.fromEntries(
      Object.entries(n.versions).map(([l, v]) => [l, { title: v!.title, summary: v!.summary, tags: v!.tags }]),
    ) as NoteSummary["versions"],
  }));
}
