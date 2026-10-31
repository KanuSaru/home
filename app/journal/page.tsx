import type { Metadata } from "next";
import { JournalPage } from "@/components/JournalPage";

export const metadata: Metadata = { title: "Journal", robots: { index: false } };

export default function Page() {
  return <JournalPage />;
}
