"use client";

import type { Note, NoteSummary, NoteVersion } from "@/lib/notes";
import { notesText } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { NoteLink, PageLink } from "@/lib/route";
import { NoteFigure } from "@/components/NoteFigures";

type Lang = "en" | "es";

export function formatNoteDate(date: string, lang: Lang) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y) return date;
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, (m || 1) - 1, d || 1)));
}

/** The version in the current language, or the other one with a flag saying so. */
function pick<V>(versions: { en?: V; es?: V }, lang: Lang): { v: V; other: boolean } {
  const own = versions[lang];
  if (own) return { v: own, other: false };
  return { v: (versions.en ?? versions.es)!, other: true };
}

/** A list of notes: used on the Notes page and, shortened, on the home page. */
export function NotesList({ notes, compact = false }: { notes: NoteSummary[]; compact?: boolean }) {
  const { lang } = useLang();
  const t = useT();
  if (!notes.length) return <p className="empty">{t(notesText.empty)}</p>;
  return (
    <ul className={`note-list ${compact ? "is-compact" : ""}`}>
      {notes.map((n) => {
        const { v, other } = pick(n.versions, lang);
        return (
          <li key={n.slug}>
            <time dateTime={n.date}>{formatNoteDate(n.date, lang)}</time>
            <NoteLink slug={n.slug} className="note-list-title">
              {v.title}
            </NoteLink>
            {other && <span className="tag">{t(notesText.onlyTag)}</span>}
            {!compact && v.summary && <p className="note-list-summary">{v.summary}</p>}
            {!compact && v.tags.length > 0 && (
              <p className="note-tags">
                {v.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function NotesPage({ notes }: { notes: NoteSummary[] }) {
  const t = useT();
  return (
    <>
      <header className="page-head">
        <h1>{t(notesText.title)}</h1>
        <p>{t(notesText.lede)}</p>
      </header>
      <section className="panel">
        <NotesList notes={notes} />
      </section>
    </>
  );
}

export function NotePage({ note }: { note: Note }) {
  const { lang } = useLang();
  const t = useT();
  const { v, other } = pick<NoteVersion>(note.versions, lang);
  return (
    <article className="note" lang={other ? (lang === "en" ? "es" : "en") : undefined}>
      <p className="note-back">
        <PageLink to="notes">← {t(notesText.all)}</PageLink>
      </p>
      <header className="note-head">
        <h1>{v.title}</h1>
        <p className="note-meta">
          <time dateTime={note.date}>{formatNoteDate(note.date, lang)}</time>
          {v.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </p>
        {other && <p className="note-notice">{t(notesText.onlyNotice)}</p>}
      </header>
      <div className="note-body">
        {v.blocks.map((b, i) =>
          b.type === "html" ? (
            <div key={i} className="note-text" dangerouslySetInnerHTML={{ __html: b.html }} />
          ) : (
            <NoteFigure key={i} name={b.name} props={b.props} />
          ),
        )}
      </div>
      <p className="note-back">
        <PageLink to="notes">← {t(notesText.all)}</PageLink>
      </p>
    </article>
  );
}
