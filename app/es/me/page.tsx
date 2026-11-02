import { MePage } from "@/components/MePage";
import { JsonLd, pageMeta, profileGraph, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("me", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <JsonLd data={profileGraph("es")} />
      <MePage />
    </>
  );
}
