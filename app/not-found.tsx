import type { Metadata } from "next";
import { NotFoundPage } from "@/components/NotFoundPage";

export const metadata: Metadata = { title: "404", robots: { index: false, follow: false } };

export default function NotFound() {
  return <NotFoundPage />;
}
