import { HomePage } from "@/components/HomePage";
import { getNotes, summarize } from "@/lib/notes";

export default function Page() {
  return <HomePage notes={summarize(getNotes()).slice(0, 3)} />;
}
