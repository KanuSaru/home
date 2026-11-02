import type { Metadata } from "next";
import { LearnPage } from "@/components/LearnPage";

export const metadata: Metadata = {
  title: "Learn ML",
  description: "A free, self-taught route into machine learning, put in order, with checklists that remember your progress.",
};

export default function Page() {
  return <LearnPage />;
}
