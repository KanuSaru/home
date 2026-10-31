import type { Metadata } from "next";
import { WorkPage } from "@/components/WorkPage";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return <WorkPage />;
}
