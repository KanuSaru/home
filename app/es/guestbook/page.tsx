import { GuestbookPage } from "@/components/GuestbookPage";
import { JsonLd, pageMeta, siteGraph } from "@/lib/seo";

export const metadata = pageMeta("guestbook", "es");

export default function Page() {
  return (
    <>
      <JsonLd data={siteGraph("es")} />
      <GuestbookPage />
    </>
  );
}
