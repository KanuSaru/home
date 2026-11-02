import type { MetadataRoute } from "next";
import { getNotes } from "@/lib/notes";
import { abs, languages, pagePath } from "@/lib/seo";
import type { SeoPage } from "@/content/seo";

// Written once, at build time, to sitemap.xml
export const dynamic = "force-static";

// the journal stays out: it's locked and not meant to be found
const listed: SeoPage[] = ["home", "me", "work", "notes", "learn", "guestbook", "updates"];

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getNotes();
  const latest = notes[0]?.date;

  const pageEntries = listed.flatMap((page) =>
    (["en", "es"] as const).map((lang) => ({
      url: abs(pagePath(page, lang)),
      ...(page === "notes" && latest ? { lastModified: latest } : {}),
      priority: page === "home" ? 1 : page === "work" || page === "learn" ? 0.8 : 0.6,
      alternates: { languages: languages(pagePath(page, "en"), pagePath(page, "es")) },
    })),
  );

  // a note is listed in each language it's written in
  const noteEntries = notes.flatMap((n) =>
    (["en", "es"] as const)
      .filter((lang) => n.versions[lang])
      .map((lang) => ({
        url: abs(`${lang === "es" ? "/es" : ""}/notes/${n.slug}/`),
        lastModified: n.date,
        priority: 0.7,
        ...(n.versions.en && n.versions.es
          ? { alternates: { languages: languages(`/notes/${n.slug}/`, `/es/notes/${n.slug}/`) } }
          : {}),
      })),
  );

  return [...pageEntries, ...noteEntries];
}
