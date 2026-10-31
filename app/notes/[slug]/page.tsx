import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotePage } from "@/components/NotesPage";
import { getNote, getNotes } from "@/lib/notes";
import { ogImage } from "@/lib/og";

// every note becomes its own page when the site is built
export const dynamicParams = false;

export function generateStaticParams() {
  const notes = getNotes();
  // a static export needs at least one page here, even before the first note
  return notes.length ? notes.map((n) => ({ slug: n.slug })) : [{ slug: "none" }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = getNote((await params).slug);
  const v = note?.versions.en ?? note?.versions.es;
  if (!note || !v) return {};
  return {
    title: v.title,
    description: v.summary,
    openGraph: {
      type: "article",
      siteName: "Kanu",
      title: v.title,
      description: v.summary,
      publishedTime: note.date,
      images: ogImage(`og/notes/${note.slug}.png`, v.title) ?? ogImage("og/site.png", "Kanu"),
    },
  };
}

export default async function Page({ params }: Props) {
  const note = getNote((await params).slug);
  if (!note) notFound();
  return <NotePage note={note} />;
}
