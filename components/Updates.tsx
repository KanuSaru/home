"use client";

import { updates, type Update } from "@/content/updates";
import { widgets as w } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { PageLink } from "@/lib/route";

function shortDate(date: string, lang: "en" | "es") {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, (m || 1) - 1, d || 1)));
}

function List({ items }: { items: Update[] }) {
  const { lang } = useLang();
  const t = useT();
  return (
    <ol className="updates">
      {items.map((u, i) => (
        <li key={u.date + i}>
          <time dateTime={u.date}>{shortDate(u.date, lang)}</time>
          <p>{t(u.text)}</p>
        </li>
      ))}
    </ol>
  );
}

/** The latest three, for the sidebar. */
export function UpdatesWidget() {
  const t = useT();
  if (!updates.length) return null;
  return (
    <section className="widget">
      <h2 className="widget-title">{t(w.updates.title)}</h2>
      <List items={updates.slice(0, 3)} />
      {updates.length > 3 && (
        <p className="small">
          <PageLink to="updates">{t(w.updates.all)}</PageLink>
        </p>
      )}
    </section>
  );
}

/** Every entry, on /updates/. */
export function UpdatesPage() {
  const t = useT();
  return (
    <>
      <header className="page-head">
        <h1>{t(w.updates.title)}</h1>
        <p>{t(w.updates.lede)}</p>
      </header>
      <section className="panel">
        <List items={updates} />
      </section>
    </>
  );
}
