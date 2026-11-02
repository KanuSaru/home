import { LearnPage } from "@/components/LearnPage";
import { learn } from "@/content/learn";
import { getNotes, summarize } from "@/lib/notes";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("learn", "en");

export default function Page() {
  // the notes to read first, in the order they're listed in content/learn.ts
  const notes = summarize(getNotes());
  const reads = learn.how.readNotes.flatMap((slug) => notes.filter((n) => n.slug === slug));
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <LearnPage reads={reads} />
    </>
  );
}
