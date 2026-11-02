import { UpdatesPage } from "@/components/Updates";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("updates", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("en")} />
      <UpdatesPage />
    </>
  );
}
