"use client";

import { useEffect, useRef, useState } from "react";
import { config, epigraph, nav, ui } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { PageLink, useCurrentPage, type PageId } from "@/lib/route";
import { DiscordStatus, LocalTime, Mood, NowPlaying, Visitors, Weather } from "@/components/Widgets";
import { MusicPlayer } from "@/components/MusicPlayer";
import { UpdatesWidget } from "@/components/Updates";
import { CursorCat } from "@/components/CursorCat";

const EMAIL = "erickfabiandonado@gmail.com";

function LangSwitch({ short = false, hidden = false }: { short?: boolean; hidden?: boolean }) {
  const { lang, setLang } = useLang();
  const t = useT();
  // while hidden, the copy stays out of the way of keyboards and screen readers
  const off = hidden ? { tabIndex: -1 } : {};
  return (
    <div className="lang" role="group" aria-label={t(ui.language)} aria-hidden={hidden || undefined}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en" aria-label={short ? "English" : undefined} {...off}>
        {short ? "EN" : "English"}
      </button>
      <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es" aria-label={short ? "Español" : undefined} {...off}>
        {short ? "ES" : "Español"}
      </button>
    </div>
  );
}

/**
 * Two controls that stay on screen once the masthead scrolls away: a short EN | ES
 * switch at the top right (the full one in the masthead takes over again at the top),
 * and a button at the bottom right that goes back to the top.
 */
function FloatingControls({ mastLang }: { mastLang: React.RefObject<HTMLDivElement | null> }) {
  const t = useT();
  const [langShown, setLangShown] = useState(false);
  const [topShown, setTopShown] = useState(false);

  useEffect(() => {
    const el = mastLang.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLangShown(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [mastLang]);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setTopShown(window.scrollY > window.innerHeight * 0.75);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // keyboard users land back at the start of the page too
    document.querySelector<HTMLElement>(".wordmark")?.focus({ preventScroll: true });
  };

  return (
    <>
      <div className={`float-lang ${langShown ? "is-shown" : ""}`}>
        <LangSwitch short hidden={!langShown} />
      </div>
      <button
        type="button"
        className={`to-top ${topShown ? "is-shown" : ""}`}
        onClick={toTop}
        aria-label={t(ui.toTop)}
        title={t(ui.toTop)}
        aria-hidden={!topShown || undefined}
        tabIndex={topShown ? undefined : -1}
      >
        {/* a pixel arrow, drawn on a 7×8 grid */}
        <svg viewBox="0 0 7 8" aria-hidden="true" shapeRendering="crispEdges">
          <path d="M3 0h1v1h1v1h1v1h1v1H5v4H2V4H0V3h1V2h1V1h1z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const current = useCurrentPage();
  const mastLang = useRef<HTMLDivElement>(null);

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
        <div className="mast-main">
          <PageLink to="home" className="wordmark" aria-label="Kanu">
            Kanu
          </PageLink>
          <p className="epigraph">{t(epigraph)}</p>
        </div>
        <div className="mast-side">
          <p className="realname">Erick Donado</p>
          <div ref={mastLang}>
            <LangSwitch />
          </div>
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
          <UpdatesWidget />
          <LocalTime />
          <Weather />
          <NowPlaying />
          <MusicPlayer />
          <DiscordStatus />
          <Mood />
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
          <a href="https://steamcommunity.com/id/KanuSaru/" target="_blank" rel="noopener noreferrer">
            Steam
          </a>
          {/* the profile link opens it in Discord; the username is there for adding me by hand */}
          <a href={`https://discord.com/users/${config.discordId}`} target="_blank" rel="noopener noreferrer">
            Discord (kanusaru)
          </a>
        </div>
        <p>{t(ui.madeIn)}, 2026</p>
      </footer>
      <FloatingControls mastLang={mastLang} />
      <CursorCat />
    </div>
  );
}
