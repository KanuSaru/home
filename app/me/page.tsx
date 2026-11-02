import { MePage } from "@/components/MePage";
import { JsonLd, pageMeta, profileGraph, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("me", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <JsonLd data={profileGraph("en")} />
      <MePage />
    </>
  );
}
