import { LearnPage } from "@/components/LearnPage";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("learn", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <LearnPage />
    </>
  );
}
