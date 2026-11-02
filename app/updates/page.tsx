import type { Metadata } from "next";
import { UpdatesPage } from "@/components/Updates";

export const metadata: Metadata = { title: "Updates" };

export default function Page() {
  return <UpdatesPage />;
}
