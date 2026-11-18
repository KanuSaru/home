import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

// Written once, at build time, to robots.txt.
// Search engines only read robots.txt at the root of a domain, so this one starts
// counting once the site has its own domain; until then the sitemap is found through
// Search Console and the <link> tags on each page.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // everyone is welcome, AI crawlers included. The locked journal isn't blocked here on
    // purpose: its pages say "noindex" themselves, and crawlers can only read that if
    // they're allowed in. (Blocked, they could still list the bare address.)
    rules: { userAgent: "*", allow: "/" },
    sitemap: abs("/sitemap.xml"),
  };
}
