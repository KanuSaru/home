import type { Metadata } from "next";
import { MePage } from "@/components/MePage";

export const metadata: Metadata = { title: "Me" };

export default function Page() {
  return <MePage />;
}
