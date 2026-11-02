import { HomePage } from "@/components/HomePage";
import { getNotes, summarize } from "@/lib/notes";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("home", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <HomePage notes={summarize(getNotes()).slice(0, 3)} />
    </>
  );
}
