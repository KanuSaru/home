import { WorkPage } from "@/components/WorkPage";
import { JsonLd, pageMeta, publicationsGraph, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("work", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <JsonLd data={publicationsGraph("es")} />
      <WorkPage />
    </>
  );
}
