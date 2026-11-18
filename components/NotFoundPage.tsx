"use client";

// The page for addresses that don't exist. It follows the language of the address:
// /es/anything shows it in Spanish.

import { notFoundText as n } from "@/content/site";
import { useT } from "@/lib/i18n";
import { PageLink } from "@/lib/route";

export function NotFoundPage() {
  const t = useT();
  return (
    <section className="panel lost" aria-labelledby="lost-title">
      <p className="lost-code" aria-hidden="true">
        404
      </p>
      <h1 id="lost-title" className="panel-title">
        {t(n.title)}
      </h1>
      <p>{t(n.text)}</p>
      <p className="cv-links">
        <PageLink to="home" className="cv-button">
          {t(n.home)}
        </PageLink>
      </p>
    </section>
  );
}
