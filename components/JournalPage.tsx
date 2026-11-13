"use client";

import { useState } from "react";
import { journalText as j } from "@/content/site";
import { riddle, sealed } from "@/content/journal";
import { useLang, useT } from "@/lib/i18n";
import { importJournalKey, openEntry, openWithAnswer } from "@/lib/seal.mjs";

type Entry = { id: string; group: string; date: string; title: string; body: string; lang: "en" | "es" | null };

// Kept for the visit only: navigating away and back stays open, a reload seals it again.
let opened: Entry[] | null = null;

function formatDate(date: string, lang: "en" | "es") {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg className={`lock ${open ? "is-open" : ""}`} viewBox="0 0 12 14" aria-hidden="true">
      <path className="shackle" d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="6" width="10" height="7.5" fill="currentColor" />
    </svg>
  );
}

// The wax seal on the envelope. It's drawn twice, each copy cut to one side of a jagged
// crack, so when the riddle is solved the two halves can fall apart.
const CRACK = "32,-2 29,10 35,19 28,29 34,38 29,48 33,56 31,66";
function WaxSeal() {
  const wax = (
    <>
      <path d="M32 3c5 0 7 3 12 4s9 1 11 6 1 8 3 12 5 8 3 13-6 6-8 10-2 9-7 11-8 0-13 1-9 4-14 2-6-6-10-9-8-5-9-10 2-8 2-13-3-9 0-13 8-4 12-7 5-7 10-7c3 0 5-1 8 0z" />
      <circle className="seal-ring" cx="32" cy="32" r="19.5" />
      <text className="seal-letter" x="32" y="43" textAnchor="middle">
        K
      </text>
    </>
  );
  return (
    <svg className="seal" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id="seal-left">
          <polygon points={`-4,-4 ${CRACK} -4,68`} />
        </clipPath>
        <clipPath id="seal-right">
          <polygon points={`68,-4 ${CRACK} 68,68`} />
        </clipPath>
      </defs>
      <g className="seal-half seal-half-left" clipPath="url(#seal-left)">
        {wax}
      </g>
      <g className="seal-half seal-half-right" clipPath="url(#seal-right)">
        {wax}
      </g>
    </svg>
  );
}

const BREAK_MS = 950; // how long the seal takes to fall off

export function JournalPage() {
  const t = useT();
  const { lang } = useLang();
  const [entries, setEntries] = useState<Entry[] | null>(opened);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [breaking, setBreaking] = useState(false);

  const hasRiddle = Boolean(riddle.en || riddle.es) && sealed.locks.length > 0;
  const latest = sealed.entries[0]?.date;
  // translations of one entry count once
  const entryCount = new Set(sealed.entries.map((e) => e.group ?? e.id)).size;

  // one version per entry: the visitor's language if it exists, otherwise whatever there is
  const shown = entries
    ? [...new Map(entries.map((e) => [e.group, e] as const)).keys()].map((g) => {
        const versions = entries.filter((e) => e.group === g);
        return versions.find((e) => e.lang === lang) ?? versions.find((e) => !e.lang) ?? versions[0];
      })
    : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setWrong(false);
    try {
      const raw = await openWithAnswer(sealed, answer);
      if (!raw) {
        setWrong(true);
        return;
      }
      const key = await importJournalKey(raw);
      const list: Entry[] = [];
      for (const entry of sealed.entries) {
        const secret = await openEntry(key, entry);
        list.push({
          id: entry.id,
          group: entry.group ?? entry.id,
          date: entry.date,
          title: secret.title,
          body: secret.body,
          lang: secret.lang ?? null,
        });
      }
      // the seal breaks first, then the letters come out (at once with reduced motion)
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setBreaking(true);
        await new Promise((done) => setTimeout(done, BREAK_MS));
      }
      opened = list;
      setEntries(list);
      setBreaking(false);
      setAnswer("");
    } catch {
      setWrong(true);
    } finally {
      setBusy(false);
    }
  }

  function sealAgain() {
    opened = null;
    setEntries(null);
  }

  return (
    <>
      <header className="page-head">
        <h1>{t(j.title)}</h1>
        <p>{t(j.lede)}</p>
      </header>

      {!entries && (
        <section className="panel riddle" aria-labelledby="riddle-title">
          <h2 id="riddle-title" className="panel-title">
            {t(j.riddle)}
            <LockIcon open={false} />
          </h2>

          {!hasRiddle ? (
            <p className="empty">{t(j.soon)}</p>
          ) : (
            <>
              {/* a sealed envelope: the riddle is written on it, and the seal breaks when it's solved */}
              <div className={`envelope ${breaking ? "is-opening" : ""}`}>
                <svg className="envelope-flap" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points="0,0 50,100 100,0" />
                </svg>
                <WaxSeal />
                <blockquote className="riddle-text">{t(riddle)}</blockquote>
              </div>
              <form className="answer" onSubmit={submit} noValidate>
                <label htmlFor="journal-answer">{t(j.answer)}</label>
                <div className="answer-row">
                  <input
                    id="journal-answer"
                    name="answer"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setWrong(false);
                    }}
                    aria-describedby="answer-hint answer-status"
                    aria-invalid={wrong || undefined}
                  />
                  <button type="submit" disabled={busy || breaking || !answer.trim()}>
                    {busy ? t(j.opening) : t(j.open)}
                  </button>
                </div>
                <p id="answer-hint" className="small muted">
                  {t(j.hint)}
                </p>
                <p id="answer-status" className="wrong" role="status">
                  {wrong ? t(j.wrong) : ""}
                </p>
              </form>
            </>
          )}

          <p className="readout sealed-count">
            {entryCount === 0
              ? t(j.none)
              : entryCount === 1
                ? t(j.countOne, { d: formatDate(latest!, lang) })
                : t(j.count, { n: entryCount, d: formatDate(latest!, lang) })}
          </p>
        </section>
      )}

      {entries && (
        <>
          <div className="unsealed-bar">
            <p className="small muted">
              <LockIcon open={true} /> {t(j.opened)}
            </p>
            <button type="button" className="text-button" onClick={sealAgain}>
              {t(j.lockAgain)}
            </button>
          </div>
          {shown!.map((entry) => (
            <article key={entry.group} className="letter" lang={entry.lang ?? undefined}>
              <span className="tape letter-tape" aria-hidden="true" />
              <p className="letter-date">{formatDate(entry.date, lang)}</p>
              {entry.title && <h2 className="letter-title">{entry.title}</h2>}
              {entry.body.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>
          ))}
        </>
      )}
    </>
  );
}
