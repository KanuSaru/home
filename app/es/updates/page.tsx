import { UpdatesPage } from "@/components/Updates";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("updates", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <UpdatesPage />
    </>
  );
}
