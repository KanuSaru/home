"use client";

// The Guestbook page: a form to sign it, the approved messages, and my 88×31 button.
// Messages are kept by the Cloudflare Worker in guestbook/ (set up per its README).

import { useEffect, useRef, useState } from "react";
import { config, guestbookText as g, ui } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kanusaru.github.io/home";
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const API = config.guestbook.api.replace(/\/$/, "");
const SITE_KEY = config.guestbook.turnstileSiteKey;
const LIMIT = 600;

type Entry = { id: number; name: string; website: string; message: string; date: string };

const SAMPLE: Entry[] = [
  { id: 2, name: "Ana", website: "https://example.com", message: "Love the lily! The moon is so cool.", date: "2026-11-01T18:00:00Z" },
  { id: 1, name: "Sam", website: "", message: "Hi from another tiny site :)", date: "2026-10-31T21:00:00Z" },
];

// ---- Turnstile, Cloudflare's anti-bot check (its script loads only on this page)

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let turnstileScript: Promise<Turnstile> | null = null;
function loadTurnstile() {
  turnstileScript ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      turnstileScript = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return turnstileScript;
}

function useEntries() {
  const [entries, setEntries] = useState<Entry[] | null | undefined>(DEMO ? SAMPLE : undefined);
  useEffect(() => {
    if (DEMO || !API) return;
    let alive = true;
    fetch(`${API}/entries`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { entries: Entry[] }) => alive && setEntries(d.entries))
      .catch(() => alive && setEntries(null));
    return () => {
      alive = false;
    };
  }, []);
  return entries;
}

function formatDate(iso: string, lang: "en" | "es") {
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

function SignForm() {
  const t = useT();
  const { lang } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const open = DEMO || (API && SITE_KEY);
  const done = state === "sent";

  // draw the Turnstile check (again when the language changes)
  useEffect(() => {
    if (DEMO || !open || done) return;
    let alive = true;
    loadTurnstile()
      .then((ts) => {
        if (!alive || !box.current) return;
        widget.current = ts.render(box.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          language: lang,
          callback: (tok: string) => setToken(tok),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => alive && setError(t(g.failed)));
    return () => {
      alive = false;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
      setToken("");
    };
  }, [open, lang, done, t]);

  if (!open) return <p className="empty">{t(g.soon)}</p>;
  if (state === "sent") return <p className="gb-sent">{t(g.sent)}</p>;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name") || "").trim(),
      website: String(f.get("website") || "").trim(),
      message: String(f.get("message") || "").trim(),
      company: String(f.get("company") || ""),
      token,
    };
    if (!body.name || !body.message) return setError(t(g.missing));
    if (DEMO) return setState("sent");
    if (!token) return setError(t(g.waitCheck));
    setError("");
    setState("sending");
    try {
      const res = await fetch(`${API}/entries`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return setState("sent");
      const out = await res.json().catch(() => ({}));
      setError(
        out.error === "check-failed" ? t(g.checkFailed) : out.error === "too-many" ? t(g.tooMany) : out.error === "missing" ? t(g.missing) : t(g.failed),
      );
    } catch {
      setError(t(g.failed));
    }
    setState("idle");
    if (widget.current) window.turnstile?.reset(widget.current);
    setToken("");
  };

  return (
    <form className="gb-form" onSubmit={submit} noValidate>
      <label>
        <span>{t(g.name)}</span>
        <input name="name" maxLength={40} autoComplete="nickname" required />
      </label>
      <label>
        <span>{t(g.website)}</span>
        <input name="website" maxLength={120} inputMode="url" autoComplete="url" placeholder="https://" />
      </label>
      <label>
        <span>
          {t(g.message)} <small className="gb-count">{message.length}/{LIMIT}</small>
        </span>
        <textarea name="message" maxLength={LIMIT} rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {/* a trap: hidden from people, often filled in by bots */}
      <label className="gb-trap" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      {!DEMO && <div ref={box} className="gb-check" />}
      {error && (
        <p className="gb-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="gb-send" disabled={state === "sending"}>
        {state === "sending" ? t(g.sending) : t(g.send)}
      </button>
    </form>
  );
}

function LinkToMe() {
  const t = useT();
  const [copied, setCopied] = useState(false);
  // always the real site's address, wherever this page is being viewed (a preview, localhost…)
  const home = `${SITE_URL}/`;
  const code = `<a href="${home}"><img src="${home}button.gif" alt="Kanu" width="88" height="31"></a>`;
  return (
    <section className="panel" aria-labelledby="link-title">
      <h2 id="link-title" className="panel-title">
        {t(g.linkTitle)}
      </h2>
      <img className="my-button" src={`${BASE}/button.gif`} alt="Kanu" width={88} height={31} />
      <p className="small">{t(g.linkText)}</p>
      <div className="gb-code">
        <code>{code}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? t(g.copied) : t(g.copy)}
        </button>
      </div>
    </section>
  );
}

export function GuestbookPage() {
  const t = useT();
  const { lang } = useLang();
  const entries = useEntries();
  return (
    <>
      <header className="page-head">
        <h1>{t(g.title)}</h1>
        <p>{t(g.lede)}</p>
      </header>

      <div className="mosaic">
        <section className="panel" aria-labelledby="sign-title">
          <h2 id="sign-title" className="panel-title">
            {t(g.signTitle)}
            {DEMO && <span className="tag">{t(ui.example)}</span>}
          </h2>
          <SignForm />
        </section>
        <LinkToMe />

        <section className="panel wide" aria-labelledby="messages-title">
          <h2 id="messages-title" className="panel-title">
            {t(g.messagesTitle)}
          </h2>
          {!API && !DEMO ? (
            <p className="empty">{t(g.soon)}</p>
          ) : entries === undefined ? (
            <p className="empty">{t(g.loading)}</p>
          ) : entries === null ? (
            <p className="empty">{t(g.unavailable)}</p>
          ) : entries.length === 0 ? (
            <p className="empty">{t(g.empty)}</p>
          ) : (
            <ol className="gb-entries">
              {entries.map((e) => (
                <li key={e.id}>
                  <p className="gb-who">
                    {e.website ? (
                      <a href={e.website} target="_blank" rel="nofollow ugc noopener noreferrer">
                        {e.name}
                      </a>
                    ) : (
                      <b>{e.name}</b>
                    )}
                    <time dateTime={e.date}>{formatDate(e.date, lang)}</time>
                  </p>
                  <p className="gb-msg">{e.message}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
