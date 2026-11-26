"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { config, epigraph, nav, ui } from "@/content/site";
import { swapLang, useLang, useT, type Lang } from "@/lib/i18n";
import { PageLink, useCurrentPage, type PageId } from "@/lib/route";
import { DiscordStatus, LocalTime, Mood, NowPlaying, Visitors, Weather } from "@/components/Widgets";
import { MusicPlayer } from "@/components/MusicPlayer";
import { UpdatesWidget } from "@/components/Updates";
import { person } from "@/content/seo";

const EMAIL = "hello@erickdonado.com";

function LangSwitch({ short = false, hidden = false }: { short?: boolean; hidden?: boolean }) {
  const { lang, setLang } = useLang();
  const t = useT();
  const path = usePathname() ?? "/";
  // while hidden, the copy stays out of the way of keyboards and screen readers
  const off = hidden ? { tabIndex: -1 } : {};
  // real links, so search engines find each page in the other language too;
  // a click switches in place and keeps your spot on the page
  const go = (l: Lang) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLang(l);
  };
  const options: { l: Lang; long: string; label: string }[] = [
    { l: "en", long: "English", label: "English" },
    { l: "es", long: "Español", label: "Español" },
  ];
  return (
    <div className="lang" role="group" aria-label={t(ui.language)} aria-hidden={hidden || undefined}>
      {options.map((o) => (
        <Link
          key={o.l}
          href={swapLang(path, o.l)}
          hrefLang={o.l}
          lang={o.l}
          aria-current={lang === o.l ? "true" : undefined}
          aria-label={o.label}
          onClick={go(o.l)}
          {...off}
        >
          {short ? (
            o.l.toUpperCase()
          ) : (
            <>
              {/* the narrowest phones show EN / ES so the header stays on one row */}
              <span className="lang-long">{o.long}</span>
              <span className="lang-short" aria-hidden="true">
                {o.l.toUpperCase()}
              </span>
            </>
          )}
        </Link>
      ))}
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

/**
 * On phones and tablets the sidebar (updates, time, weather, music…) becomes a drawer
 * that slides in from the right. The Menu button sits in the masthead, and a copy
 * floats at the top right once the masthead scrolls away. While the drawer is open,
 * the rest of the page can't be scrolled, tabbed into or read by screen readers.
 */
function useMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // moving to another page (or language) closes it
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const behind = [...document.querySelectorAll<HTMLElement>(".masthead, .pages, #main, .foot, .to-top, .menu-float, .skip")];
    root.classList.add("menu-open");
    behind.forEach((el) => el.setAttribute("inert", ""));
    // the close button gets focus, so the keyboard starts inside the drawer
    document.querySelector<HTMLElement>(".side-close")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // a wide window (a tablet turned sideways) shows the sidebar as a column again
    const wide = matchMedia("(min-width: 60rem)");
    const onWide = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onWide);
    return () => {
      root.classList.remove("menu-open");
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      // back to whichever Menu button is on screen
      const inline = document.querySelector<HTMLElement>(".menu-inline");
      const r = inline?.getBoundingClientRect();
      const target = r && r.bottom > 0 && r.top < window.innerHeight ? inline : document.querySelector<HTMLElement>(".menu-float");
      target?.focus({ preventScroll: true });
    };
  }, [open]);

  return { open, setOpen };
}

function MenuButton({ inline, open, onOpen, shown = true }: { inline?: boolean; open: boolean; onOpen: () => void; shown?: boolean }) {
  const t = useT();
  return (
    <button
      type="button"
      className={`menu-btn ${inline ? "menu-inline" : "menu-float"} ${shown ? "is-shown" : ""}`}
      aria-controls="side"
      aria-expanded={open}
      aria-hidden={!shown || undefined}
      tabIndex={shown ? undefined : -1}
      onClick={onOpen}
    >
      {/* three pixel bars, the usual sign for a menu */}
      <svg viewBox="0 0 7 6" aria-hidden="true" shapeRendering="crispEdges">
        <path d="M0 0h7v1H0zM0 2.5h7v1H0zM0 5h7v1H0z" fill="currentColor" />
      </svg>
      <span>{t(ui.menu)}</span>
    </button>
  );
}

/** The floating Menu button shows only while the one in the masthead is off screen. */
function FloatingMenu({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".menu-inline");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <MenuButton open={open} onOpen={onOpen} shown={shown} />;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const current = useCurrentPage();
  const mastLang = useRef<HTMLDivElement>(null);
  const menu = useMenu();
  const openMenu = () => menu.setOpen(true);
  const closeMenu = () => menu.setOpen(false);

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
        <MenuButton inline open={menu.open} onOpen={openMenu} />
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

        <aside id="side" className={`side ${menu.open ? "is-open" : ""}`}>
          {/* only on phones and tablets, at the top of the drawer */}
          <div className="side-head">
            <LangSwitch />
            <button type="button" className="side-close" onClick={closeMenu}>
              {t(ui.close)} <span aria-hidden="true">✕</span>
            </button>
          </div>
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
          {config.kofi && (
            <a href={`https://ko-fi.com/${config.kofi}`} target="_blank" rel="noopener noreferrer">
              Ko-fi
            </a>
          )}
        </div>
        <p>
          {person.fullName} · {t(ui.madeIn)}, 2026
        </p>
      </footer>
      <FloatingControls mastLang={mastLang} />
      <FloatingMenu open={menu.open} onOpen={openMenu} />
      <div className={`side-backdrop ${menu.open ? "is-open" : ""}`} onClick={closeMenu} aria-hidden="true" />
    </div>
  );
}
