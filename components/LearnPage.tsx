"use client";

import { useEffect, useMemo, useState } from "react";
import { learn, phases, resId, type Module, type Phase } from "@/content/learn";
import { useLang, useT } from "@/lib/i18n";
import { config } from "@/content/site";
import { NotesList } from "@/components/NotesPage";
import type { NoteSummary } from "@/lib/notes";

const KEY = "learn-progress-v1";
const HIDE_KEY = "learn-hide-done";
const CELLS = 24; // the progress bar is drawn as a row of cells, like a game's HP bar

type Done = Record<string, true>;

const ALL = phases.flatMap((p) => p.modules.flatMap((m) => m.res.map((r, i) => ({ id: resId(p, m, i), r, m, p }))));

function count(done: Done, p: Phase, m?: Module) {
  const mods = m ? [m] : p.modules;
  let d = 0;
  let n = 0;
  for (const mod of mods)
    mod.res.forEach((_, i) => {
      n++;
      if (done[resId(p, mod, i)]) d++;
    });
  return { d, n };
}

/** A row of cells, filled from the left. */
function Cells({ d, n, label }: { d: number; n: number; label: string }) {
  const on = n ? Math.round((d / n) * CELLS) : 0;
  return (
    <div className="cells" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={n} aria-valuenow={d}>
      {Array.from({ length: CELLS }, (_, i) => (
        <i key={i} className={i < on ? "on" : undefined} />
      ))}
    </div>
  );
}

/** A pixel check, drawn on a 7×6 grid like the back-to-top arrow. */
function Check() {
  return (
    <svg viewBox="0 0 7 6" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M6 0h1v2H6v1H5v1H4v1H3v1H2V5H1V4H0V2h1v1h1v1h1V3h1V2h1V1h1z" fill="currentColor" />
    </svg>
  );
}

function MathsExtra() {
  const t = useT();
  const m = learn.maths;
  return (
    <div className="learn-extra">
      <div className="learn-sub">
        <h4 className="widget-title">{t(m.weightsTitle)}</h4>
        <div className="weights" role="img" aria-label={m.weights.map((w) => t(w.label)).join(", ")}>
          {m.weights.map((w, i) => (
            <span key={i} className={`w${i + 1}`} style={{ flexGrow: w.share }}>
              {t(w.label)}
            </span>
          ))}
        </div>
      </div>
      <div className="learn-sub">
        <h4 className="widget-title">{t(m.climbTitle)}</h4>
        <ol className="climb">
          {m.steps.map((s, i) => (
            <li key={i}>
              <span className="when">{t(learn.labels.step, { n: i + 1 })}</span>
              <div className="tl-body">
                <p className="tl-title">
                  {s.courses.map((c, j) => (
                    <span key={c.url}>
                      {j > 0 && <span className="muted"> · </span>}
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {t(c.name)}
                      </a>
                    </span>
                  ))}
                </p>
                <p className="small muted">{t(s.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AiExtra() {
  const t = useT();
  return (
    <div className="callout learn-extra">
      <p className="widget-title">{t(learn.ai.label)}</p>
      <p className="row-name">{t(learn.ai.title)}</p>
      <p className="small">{t(learn.ai.text)}</p>
    </div>
  );
}

function ModuleBlock({
  p,
  m,
  done,
  toggle,
}: {
  p: Phase;
  m: Module;
  done: Done;
  toggle: (id: string) => void;
}) {
  const t = useT();
  const { d, n } = count(done, p, m);
  return (
    <article className="module" id={`${p.id}-${m.id}`}>
      <div className="module-head">
        <h3 className="row-name">{t(m.title)}</h3>
        <span className="readout">
          {d}/{n}
        </span>
      </div>
      {m.chips.length > 0 && (
        <p className="chips">
          {m.chips.map((c) => (
            <span key={c.label.en} className={`tag ${c.key ? "is-key" : ""}`}>
              {t(c.label)}
            </span>
          ))}
        </p>
      )}
      <p className="idea">{t(m.idea)}</p>
      {m.body && <p className="small muted">{t(m.body)}</p>}
      {m.terms && (
        <dl className="terms">
          {m.terms.map((x) => (
            <div key={x.term.en}>
              <dt>{t(x.term)}</dt>
              <dd>{t(x.def)}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="res">
        {m.res.map((r, i) => {
          const id = resId(p, m, i);
          const on = !!done[id];
          const box = `res-${id.replace(/\./g, "-")}`;
          return (
            <li key={id} className={on ? "is-done" : undefined}>
              <label className="check">
                <input id={box} type="checkbox" checked={on} onChange={() => toggle(id)} />
                <span className="box" aria-hidden="true">
                  <Check />
                </span>
                <span className="sr-only">{r.name}</span>
              </label>
              <div className="res-body">
                <p className="res-name">
                  {r.start && (
                    <span className="star" title={t(learn.labels.start)}>
                      ★
                    </span>
                  )}
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {r.name}
                  </a>
                  <span className="tag">{t(learn.labels.types[r.type])}</span>
                  {r.start && <span className="sr-only">{t(learn.labels.start)}</span>}
                </p>
                <p className="small muted">{t(r.desc)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export function LearnPage({ reads = [] }: { reads?: NoteSummary[] }) {
  const t = useT();
  const { lang } = useLang();
  const [done, setDone] = useState<Done>({});
  const [hide, setHide] = useState(false);
  const [query, setQuery] = useState("");
  const [armed, setArmed] = useState(false);

  // progress lives in this browser only
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (saved && typeof saved === "object") setDone(saved);
      setHide(localStorage.getItem(HIDE_KEY) === "1");
    } catch {}
  }, []);

  const save = (next: Done) => {
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const toggle = (id: string) => {
    const next = { ...done };
    if (next[id]) delete next[id];
    else next[id] = true;
    save(next);
  };

  const onHide = (on: boolean) => {
    setHide(on);
    try {
      localStorage.setItem(HIDE_KEY, on ? "1" : "0");
    } catch {}
  };

  // the reset button asks twice, then forgets about it after a few seconds
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(id);
  }, [armed]);
  const reset = () => {
    if (!armed) return setArmed(true);
    setArmed(false);
    save({});
  };

  // search looks at the visible language and English, so names and terms both match
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    const out = new Set<string>();
    for (const p of phases)
      for (const m of p.modules) {
        const texts = [m.title, m.idea, m.body, ...(m.terms ?? []).flatMap((x) => [x.term, x.def]), ...m.res.map((r) => r.desc)]
          .filter(Boolean)
          .flatMap((x) => [x!.en, x![lang]]);
        const hay = [...texts, ...m.res.map((r) => r.name), ...m.res.map((r) => t(learn.labels.types[r.type]))].join(" ").toLowerCase();
        if (hay.includes(q)) out.add(`${p.id}.${m.id}`);
      }
    return out;
  }, [q, lang, t]);

  const total = ALL.length;
  const finished = ALL.filter((x) => done[x.id]).length;
  const next = ALL.find((x) => !done[x.id]);
  const label = t(learn.progress.count, { d: finished, n: total });
  const anyShown = !matches || matches.size > 0;

  return (
    <div className={`learn ${hide ? "hide-done" : ""}`}>
      <header className="page-head">
        <h1>{t(learn.title)}</h1>
        <p>{t(learn.lede)}</p>
      </header>

      <div className="mosaic">
        <section className="panel wide learn-top">
          <p className="lede-sm">{t(learn.intro)}</p>
          <dl className="facts">
            <div>
              <dt className="widget-title">{t(learn.facts.cost)}</dt>
              <dd className="readout big">{t(learn.facts.free)}</dd>
            </div>
            <div>
              <dt className="widget-title">{t(learn.facts.for)}</dt>
              <dd className="readout big">{t(learn.facts.beginners)}</dd>
            </div>
            <div>
              <dt className="widget-title">{t(learn.facts.phases)}</dt>
              <dd className="readout big">{phases.length}</dd>
            </div>
            <div>
              <dt className="widget-title">{t(learn.facts.resources)}</dt>
              <dd className="readout big">{total}</dd>
            </div>
          </dl>
        </section>

        <section className="panel wide learn-progress">
          <h2 className="panel-title">
            {t(learn.progress.title)}
            <span className="tag">{label}</span>
          </h2>
          <Cells d={finished} n={total} label={label} />
          <p className="next">
            {next ? (
              <>
                <span className="widget-title">{t(learn.progress.next)}</span>
                <a href={`#${next.p.id}-${next.m.id}`}>{next.r.name}</a>
                <span className="muted small">
                  {t(next.p.short)} · {t(next.m.title)}
                </span>
              </>
            ) : (
              <span>{t(learn.progress.allDone)}</span>
            )}
          </p>
          <div className="learn-tools">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(learn.progress.search)}
              aria-label={t(learn.progress.search)}
            />
            <label className="check toggle">
              <input type="checkbox" checked={hide} onChange={(e) => onHide(e.target.checked)} />
              <span className="box" aria-hidden="true">
                <Check />
              </span>
              {t(learn.progress.hide)}
            </label>
            <button type="button" className="text-button" onClick={reset} aria-live="polite">
              {armed ? t(learn.progress.confirm) : t(learn.progress.reset)}
            </button>
          </div>
        </section>

        {!q && (
          <>
            <nav className="panel learn-route" aria-label={t(learn.route)}>
              <h2 className="panel-title">{t(learn.route)}</h2>
              <ol>
                {phases.map((p) => {
                  const { d, n } = count(done, p);
                  return (
                    <li key={p.id}>
                      <span className="readout big">{p.n}</span>
                      <div className="tl-body">
                        <a className="tl-title" href={`#${p.id}`}>
                          {t(p.title)}
                        </a>
                        <span className="small muted">
                          {t(learn.progress.modules, { n: p.modules.length })} · {t(p.when)}
                        </span>
                      </div>
                      <span className="readout">
                        {d}/{n}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <section className="panel learn-how">
              <h2 className="panel-title">{t(learn.how.title)}</h2>
              <ul className="rows">
                {learn.how.items.map((x) => (
                  <li key={x.title.en}>
                    <p className="row-name">{t(x.title)}</p>
                    <p className="small">{t(x.text)}</p>
                  </li>
                ))}
              </ul>
              {reads.length > 0 && (
                <div className="reads">
                  <p className="widget-title">{t(learn.how.reads)}</p>
                  <NotesList notes={reads} compact />
                </div>
              )}
            </section>
          </>
        )}

        {phases.map((p) => {
          const mods = p.modules.filter((m) => !matches || matches.has(`${p.id}.${m.id}`));
          if (!mods.length) return null;
          const { d, n } = count(done, p);
          return (
            <section key={p.id} id={p.id} className="panel wide phase">
              <header className="phase-head">
                <span className="phase-n" aria-hidden="true">
                  {p.n}
                </span>
                <div className="phase-text">
                  <h2 className="panel-title">
                    <span className="sr-only">
                      {t(learn.labels.phase)} {p.n}:{" "}
                    </span>
                    {t(p.title)}
                  </h2>
                  {!q && <p>{t(p.lead)}</p>}
                  <p className="chips">
                    {p.meta.map((x) => (
                      <span key={x.en} className="tag">
                        {t(x)}
                      </span>
                    ))}
                    <span className="tag">{t(p.when)}</span>
                    <span className="readout">
                      {d}/{n}
                    </span>
                  </p>
                </div>
              </header>

              {!q && p.extra === "maths" && <MathsExtra />}
              {!q && p.extra === "ai" && <AiExtra />}

              {mods.map((m) => (
                <ModuleBlock key={m.id} p={p} m={m} done={done} toggle={toggle} />
              ))}

              {!q && (
                <div className="build">
                  <p className="widget-title">{t(learn.labels.build)}</p>
                  <p>{t(p.build)}</p>
                </div>
              )}
            </section>
          );
        })}

        {!anyShown && <p className="empty wide">{t(learn.progress.none)}</p>}

        <section className="panel wide learn-support">
          <h2 className="panel-title">{t(learn.support.title)}</h2>
          <p>{t(learn.support.text)}</p>
          {lang === "es" && <p className="small muted">{t(learn.support.english)}</p>}
          {config.kofi && (
            <p className="cv-links">
              <a className="cv-button" href={`https://ko-fi.com/${config.kofi}`} target="_blank" rel="noopener noreferrer">
                {t(learn.support.button)}
              </a>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
