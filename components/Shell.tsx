"use client";

import { nav, ui } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { PageLink, useCurrentPage, type PageId } from "@/lib/route";
import { DiscordStatus, LocalTime, NowPlaying, Visitors, Weather } from "@/components/Widgets";

const EMAIL = "erickfabiandonado@gmail.com";

function LangSwitch() {
  const { lang, setLang } = useLang();
  const t = useT();
  return (
    <div className="lang" role="group" aria-label={t(ui.language)}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">
        English
      </button>
      <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">
        Español
      </button>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const current = useCurrentPage();

  const skip = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("main")?.focus();
  };

  return (
    <div className="frame">
      <a className="skip" href="#main" onClick={skip}>
        {t(ui.skip)}
      </a>

      <header className="masthead">
        <PageLink to="home" className="wordmark" aria-label="Kanu">
          Kanu
        </PageLink>
        <div className="mast-side">
          <p className="realname">Erick Donado</p>
          <LangSwitch />
        </div>
      </header>

      <div className="layout">
        <nav className="pages" aria-label={t(ui.pages)}>
          <h2 className="widget-title">{t(ui.pages)}</h2>
          <ul>
            {nav.map((item) => {
              const tag = item.soon ? t(ui.soon) : item.locked ? t(ui.locked) : null;
              return (
                <li key={item.id} className={item.soon ? "soon" : undefined}>
                  {item.soon ? (
                    <span>{t(item.label)}</span>
                  ) : (
                    <PageLink
                      to={item.id as PageId}
                      aria-current={current === item.id ? "page" : undefined}
                    >
                      {t(item.label)}
                    </PageLink>
                  )}
                  {tag && <span className="tag">{tag}</span>}
                </li>
              );
            })}
          </ul>
        </nav>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <aside className="side">
          <LocalTime />
          <Weather />
          <NowPlaying />
          <DiscordStatus />
          <Visitors />
        </aside>
      </div>

      <footer className="foot">
        <div className="foot-links">
          <span className="email" title="Email">
            {EMAIL}
          </span>
          <a href="https://github.com/KanuSaru" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://linkedin.com/in/erickdonado" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://orcid.org/0009-0008-5752-3255" target="_blank" rel="noopener noreferrer">
            ORCID
          </a>
        </div>
        <p>{t(ui.madeIn)}, 2026</p>
      </footer>
    </div>
  );
}
