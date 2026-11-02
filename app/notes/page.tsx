import { NotesPage } from "@/components/NotesPage";
import { getNotes, summarize } from "@/lib/notes";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("notes", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <NotesPage notes={summarize(getNotes())} />
    </>
  );
}
