import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotePage } from "@/components/NotesPage";
import { getNote, getNotes } from "@/lib/notes";
import { JsonLd, noteGraph, noteMeta, siteGraph } from "@/lib/seo";

// every note becomes its own page when the site is built, in both languages
export const dynamicParams = false;

export function generateStaticParams() {
  const notes = getNotes();
  // a static export needs at least one page here, even before the first note
  return notes.length ? notes.map((n) => ({ slug: n.slug })) : [{ slug: "none" }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = getNote((await params).slug);
  return note ? noteMeta(note, "en") : {};
}

export default async function Page({ params }: Props) {
  const note = getNote((await params).slug);
  if (!note) notFound();
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <JsonLd data={noteGraph(note, "en")} />
      <NotePage note={note} />
    </>
  );
}
