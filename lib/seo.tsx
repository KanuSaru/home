// Metadata for every page, in both languages: title, description, the canonical
// address, links between the English and Spanish versions (hreflang), and the
// structured data (schema.org JSON-LD) that search engines and AI assistants read.

import type { Metadata } from "next";
import { pages, person, publications, siteName, type SeoPage } from "@/content/seo";
import { ogImage } from "@/lib/og";
import type { Lang } from "@/lib/i18n";

/** The site's public address, with the base path: https://kanusaru.github.io/home */
export const SITE = (process.env.SITE_URL || "https://kanusaru.github.io/home").replace(/\/$/, "");

/** A full address for a path on the site: abs("/es/work/"). */
export const abs = (path: string) => `${SITE}${path}`;

export const pagePath = (page: SeoPage, lang: Lang) => {
  const base = page === "home" ? "/" : `/${page}/`;
  return lang === "es" ? `/es${base}` : base;
};

const locale = { en: "en_US", es: "es_CO" };

const feeds = {
  "application/rss+xml": [
    { url: abs("/feed.xml"), title: "Kanu, notes" },
    { url: abs("/feed.es.xml"), title: "Kanu, notas" },
  ],
};

/** Links the English and Spanish addresses of one page; x-default is English. */
export function languages(en: string, es: string) {
  return { en: abs(en), es: abs(es), "x-default": abs(en) };
}

export function pageMeta(page: SeoPage, lang: Lang): Metadata {
  const p = pages[page];
  const title = p.title[lang];
  const description = p.description[lang];
  const url = abs(pagePath(page, lang));
  return {
    // the home page uses the full name as is; the others get ", Erick Donado" from the layout
    title: page === "home" ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: languages(pagePath(page, "en"), pagePath(page, "es")),
      types: feeds,
    },
    openGraph: {
      type: page === "me" ? "profile" : "website",
      siteName,
      title: page === "home" ? title : `${title}, ${person.name}`,
      description,
      url,
      locale: locale[lang],
      alternateLocale: locale[lang === "en" ? "es" : "en"],
      images: ogImage("og/site.png", siteName),
    },
    ...(page === "journal" ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Writes structured data into the page. */
export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so text inside can never close the script tag
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const personId = `${SITE}/#person`;
const websiteId = `${SITE}/#website`;

/** Who I am, and the site itself. Every page carries it. */
export function siteGraph(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: person.name,
        alternateName: person.alternateNames,
        url: abs(lang === "es" ? "/es/" : "/"),
        description: person.summary[lang],
        jobTitle: person.jobTitle[lang],
        affiliation: { "@type": "CollegeOrUniversity", name: person.university, url: person.universityUrl },
        homeLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: person.city, addressCountry: person.country },
        },
        knowsAbout: person.knowsAbout,
        knowsLanguage: person.languages,
        sameAs: person.sameAs,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: abs("/"),
        name: siteName,
        alternateName: "Kanu",
        inLanguage: ["en", "es"],
        author: { "@id": personId },
        publisher: { "@id": personId },
      },
    ],
  };
}

/** The Me page is a profile page about me. */
export function profileGraph(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: abs(pagePath("me", lang)),
    inLanguage: lang,
    mainEntity: { "@id": personId },
  };
}

/** My publications, on the Work page. */
export function publicationsGraph(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": publications.map((p) => ({
      "@type": p.type,
      name: p.title[p.inLanguage === "es" ? "es" : "en"],
      ...(lang === "en" ? { alternateName: p.title.en } : {}),
      headline: p.title[p.inLanguage === "es" ? "es" : "en"],
      datePublished: p.year,
      inLanguage: p.inLanguage,
      author: { "@id": personId },
      publisher: { "@type": "Organization", name: p.publisher },
      isPartOf: { "@type": p.venue.type, name: p.venue.name },
      about: ["Breast cancer", "Medical image segmentation", "Ultrasound", "Deep learning"],
    })),
  };
}

// ---------- Notes ----------

type NoteLike = {
  slug: string;
  date: string;
  versions: { en?: { title: string; summary: string; tags: string[] }; es?: { title: string; summary: string; tags: string[] } };
};

const notePath = (slug: string, lang: Lang) => `${lang === "es" ? "/es" : ""}/notes/${slug}/`;

/**
 * A note's metadata. When it's written in only one language, the other address still
 * works (it shows the original with a notice) but points search engines to the original.
 */
export function noteMeta(note: NoteLike, lang: Lang): Metadata {
  const own = note.versions[lang];
  const shown = (own ? lang : note.versions.en ? "en" : "es") as Lang;
  const v = note.versions[shown]!;
  const both = !!(note.versions.en && note.versions.es);
  return {
    title: v.title,
    description: v.summary,
    alternates: {
      canonical: abs(notePath(note.slug, shown)),
      ...(both ? { languages: languages(notePath(note.slug, "en"), notePath(note.slug, "es")) } : {}),
      types: feeds,
    },
    openGraph: {
      type: "article",
      siteName,
      title: v.title,
      description: v.summary,
      url: abs(notePath(note.slug, shown)),
      locale: locale[shown],
      publishedTime: note.date,
      authors: [person.name],
      tags: v.tags,
      images: ogImage(`og/notes/${note.slug}.png`, v.title) ?? ogImage("og/site.png", siteName),
    },
  };
}

export function noteGraph(note: NoteLike, lang: Lang) {
  const shown = (note.versions[lang] ? lang : note.versions.en ? "en" : "es") as Lang;
  const v = note.versions[shown]!;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: v.title,
    description: v.summary,
    datePublished: note.date,
    inLanguage: shown,
    keywords: v.tags,
    url: abs(notePath(note.slug, shown)),
    mainEntityOfPage: abs(notePath(note.slug, shown)),
    image: ogImage(`og/notes/${note.slug}.png`, v.title) ? abs(`/og/notes/${note.slug}.png`) : undefined,
    author: { "@id": personId },
    publisher: { "@id": personId },
  };
}
