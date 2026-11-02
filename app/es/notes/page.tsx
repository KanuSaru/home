import { NotesPage } from "@/components/NotesPage";
import { getNotes, summarize } from "@/lib/notes";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("notes", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <NotesPage notes={summarize(getNotes())} />
    </>
  );
}
