import type { Metadata } from "next";
import { GuestbookPage } from "@/components/GuestbookPage";

export const metadata: Metadata = { title: "Guestbook" };

export default function Page() {
  return <GuestbookPage />;
}
