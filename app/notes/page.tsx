import type { Metadata } from "next";
import { NotesPage } from "@/components/NotesPage";
import { getNotes, summarize } from "@/lib/notes";

export const metadata: Metadata = { title: "Notes" };

export default function Page() {
  return <NotesPage notes={summarize(getNotes())} />;
}
