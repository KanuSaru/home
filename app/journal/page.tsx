import { JournalPage } from "@/components/JournalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("journal", "en");

export default function Page() {
  return <JournalPage />;
}
