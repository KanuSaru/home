"use client";

import { home, projects, widgets } from "@/content/site";
import { useT } from "@/lib/i18n";
import { PageLink } from "@/lib/route";
import { Moon } from "@/components/Moon";
import { MoonReadout } from "@/components/Widgets";

export function HomePage() {
  const t = useT();
  return (
    <>
      <h1 className="sr-only">Erick Donado (Kanu)</h1>

      <section className="hero panel" aria-label={t(widgets.moon.title)}>
        <div className="hero-text">
          <p className="lede">{t(home.intro)}</p>
          <p>{t(home.sub)}</p>
          <p>
            <PageLink to="me" className="more">
              {t(home.meLink)}
            </PageLink>
          </p>
        </div>
        <figure className="hero-moon">
          <Moon label={t(widgets.moon.title)} />
          <figcaption>
            <h2 className="widget-title">{t(widgets.moon.title)}</h2>
            <MoonReadout />
            <p className="small muted">{t(widgets.moon.caption)}</p>
          </figcaption>
        </figure>
      </section>

      <section className="panel" aria-labelledby="made-title">
        <h2 id="made-title" className="panel-title">
          {t(home.madeTitle)}
        </h2>
        <ul className="made">
          {projects.map((p) => (
            <li key={p.name}>
              <div className="made-head">
                <h3>{p.name}</h3>
                <span className="readout">
                  {t(p.kind)}, {p.year}
                </span>
              </div>
              <p className="small">{t(p.text)}</p>
              {p.links && (
                <p className="made-links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {t(l.label)}
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="pair">
        <section className="panel" aria-labelledby="notes-title">
          <h2 id="notes-title" className="panel-title">
            {t(home.notes.title)}
          </h2>
          <p>{t(home.notes.text)}</p>
          <p className="empty">{t(home.notes.empty)}</p>
        </section>
        <section className="panel locked" aria-labelledby="journal-title">
          <h2 id="journal-title" className="panel-title">
            {t(home.journal.title)}
            <svg className="lock" viewBox="0 0 12 14" aria-hidden="true">
              <path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="6" width="10" height="7.5" fill="currentColor" />
            </svg>
          </h2>
          <p>{t(home.journal.text)}</p>
          <p>
            <PageLink to="journal" className="more">
              {t(home.journal.open)}
            </PageLink>
          </p>
        </section>
      </div>
    </>
  );
}
