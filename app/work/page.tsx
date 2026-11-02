import { WorkPage } from "@/components/WorkPage";
import { JsonLd, pageMeta, publicationsGraph, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("work", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <JsonLd data={publicationsGraph("en")} />
      <WorkPage />
    </>
  );
}
