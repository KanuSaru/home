// /llms.txt: a plain-text summary of the site for AI assistants (llmstxt.org).
// Few crawlers read it yet, but it costs nothing and says exactly who I am.

import { pages, person, publications } from "@/content/seo";
import { getNotes } from "@/lib/notes";
import { abs, pagePath } from "@/lib/seo";
import type { SeoPage } from "@/content/seo";

export const dynamic = "force-static";

export function GET() {
  const notes = getNotes();
  const link = (page: SeoPage) => `- [${page === "home" ? "Home" : pages[page].title.en}](${abs(pagePath(page, "en"))}): ${pages[page].description.en}`;

  const text = `# ${person.name} (Kanu)

> ${person.summary.en}

Every page is in English and in Spanish: the Spanish version of ${abs("/work/")} is ${abs("/es/work/")}.

## Pages

${(["home", "me", "work", "notes", "learn", "guestbook", "updates"] as SeoPage[]).map(link).join("\n")}

## Publications

${publications
  .map((p) => `- ${p.title.es} (${p.year}). ${p.type === "Chapter" ? "Book chapter in" : "Article in"} ${p.venue.name}, ${p.publisher}. English title: ${p.title.en}.`)
  .join("\n")}

## Notes

${
  notes.length
    ? notes
        .map((n) => {
          const v = (n.versions.en ?? n.versions.es)!;
          return `- [${v.title}](${abs(`${n.versions.en ? "" : "/es"}/notes/${n.slug}/`)}) (${n.date}): ${v.summary}`;
        })
        .join("\n")
    : "Nothing yet."
}

## Elsewhere

${person.sameAs.map((u) => `- ${u}`).join("\n")}
`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
