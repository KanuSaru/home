"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { learn, phases, resId, type Module, type Phase } from "@/content/learn";
import { useLang, useT } from "@/lib/i18n";
import { config } from "@/content/site";
import { NotesList, formatNoteDate } from "@/components/NotesPage";
import { PageLink } from "@/lib/route";
import type { NoteSummary } from "@/lib/notes";

const KEY = "learn-progress-v1";
const HIDE_KEY = "learn-hide-done";
const CELLS = 24; // the progress bar is drawn as a row of cells, like a game's HP bar

type Done = Record<string, true>;

const LEVEL_CLASS = { 1: "is-essential", 2: "is-reinforce", 3: "is-deeper" } as const;

const ALL = phases.flatMap((p) => p.modules.flatMap((m) => m.res.map((r, i) => ({ id: resId(p, m, i), r, m, p }))));
// ---- the progress code: every module's ticks as a small number, packed into one line of text.
// "KL1." + base64 of "maths.stats=3~check.maths=5~…" (each number is a set of bits, one per item)
const CODE_PREFIX = "KL1.";
const GROUPS: { key: string; size: number }[] = [
  ...phases.flatMap((p) => p.modules.map((m) => ({ key: `${p.id}.${m.id}`, size: m.res.length }))),
  ...phases.map((p) => ({ key: `check.${p.id}`, size: p.check.length })),
];

function toCode(done: Done) {
  const parts: string[] = [];
  for (const g of GROUPS) {
    let mask = 0;
    for (let i = 0; i < g.size; i++) if (done[`${g.key}.${i}`]) mask |= 1 << i;
    if (mask) parts.push(`${g.key}=${mask.toString(36)}`);
  }
  if (!parts.length) return "";
  return CODE_PREFIX + btoa(parts.join("~")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The ticks a code holds, or null if it isn't one. Unknown modules are skipped, so old codes still load. */
function fromCode(code: string): Done | null {
  const text = code.trim();
  if (!text.startsWith(CODE_PREFIX)) return null;
  let plain: string;
  try {
    plain = atob(text.slice(CODE_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return null;
  }
  const out: Done = {};
  for (const part of plain.split("~")) {
    const [key, value] = part.split("=");
    const g = GROUPS.find((x) => x.key === key);
    const mask = parseInt(value ?? "", 36);
    if (!g || !Number.isFinite(mask)) continue;
    for (let i = 0; i < g.size; i++) if (mask & (1 << i)) out[`${g.key}.${i}`] = true;
  }
  return Object.keys(out).length ? out : null;
}

// every term the modules define, with where it comes from
const TERMS = phases.flatMap((p) => p.modules.flatMap((m) => (m.terms ?? []).map((x) => ({ ...x, p, m }))));

const ESSENTIAL = ALL.filter((x) => x.r.level === 1);
const EXTRA = ALL.filter((x) => x.r.level !== 1);

// counts the essentials (level 1) unless told to count everything
function count(done: Done, p: Phase, m?: Module, all = false) {
  const mods = m ? [m] : p.modules;
  let d = 0;
  let n = 0;
  for (const mod of mods)
    mod.res.forEach((r, i) => {
      if (!all && r.level !== 1) return;
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
        {n > 0 ? (
          <span className="readout">
            {d}/{n}
          </span>
        ) : (
          <span className="tag">{t(learn.levels.optional)}</span>
        )}
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
        {m.res
          .map((r, i) => ({ r, i }))
          .sort((a, b) => a.r.level - b.r.level)
          .map(({ r, i }) => {
          const id = resId(p, m, i);
          const on = !!done[id];
          const box = `res-${id.replace(/\./g, "-")}`;
          return (
            <li key={id} className={`${LEVEL_CLASS[r.level]} ${on ? "is-done" : ""}`}>
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
                  <span className="tag tag-level">{t(learn.levels.list[r.level - 1].tag)}</span>
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

function Backup({ done, onLoad }: { done: Done; onLoad: (next: Done) => void }) {
  const t = useT();
  const b = learn.backup;
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [status, setStatus] = useState("");
  const code = toCode(done);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  const load = (e: React.FormEvent) => {
    e.preventDefault();
    const got = fromCode(pasted);
    if (!got) return setStatus(t(b.bad));
    // added to what's already here, so loading never loses a tick
    const next = { ...done, ...got };
    onLoad(next);
    setPasted("");
    setStatus(t(b.loaded, { n: Object.keys(next).length }));
  };

  return (
    <details className="backup">
      <summary>{t(b.title)}</summary>
      <p className="small muted">{t(b.text)}</p>
      {code ? (
        <div className="backup-row">
          <label htmlFor="learn-code">{t(b.yours)}</label>
          <input id="learn-code" readOnly value={code} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={copy}>
            {copied ? t(b.copied) : t(b.copy)}
          </button>
        </div>
      ) : (
        <p className="small muted">{t(b.empty)}</p>
      )}
      <form className="backup-row" onSubmit={load}>
        <label htmlFor="learn-paste">{t(b.paste)}</label>
        <input
          id="learn-paste"
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value);
            setStatus("");
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder={CODE_PREFIX + "…"}
        />
        <button type="submit" disabled={!pasted.trim()}>
          {t(b.load)}
        </button>
      </form>
      <p className="small" role="status">
        {status}
      </p>
    </details>
  );
}

function Glossary({ go }: { go: (target: string) => void }) {
  const t = useT();
  const { lang } = useLang();
  const g = learn.glossary;
  const [shown, setShown] = useState(false);
  const [filter, setFilter] = useState("");
  const f = filter.trim().toLowerCase();
  const terms = useMemo(
    () =>
      [...TERMS]
        .sort((a, b) => a.term[lang].localeCompare(b.term[lang], lang))
        .filter((x) => !f || `${x.term[lang]} ${x.term.en} ${x.def[lang]}`.toLowerCase().includes(f)),
    [lang, f],
  );
  return (
    <section id="glossary" className={`panel wide learn-glossary ${shown ? "is-open" : "is-folded"}`}>
      <header className="phase-head">
        <span className="phase-n" aria-hidden="true">
          Aa
        </span>
        <div className="phase-text">
          <h2 className="panel-title">{t(g.title)}</h2>
          <p className="chips">
            <span className="tag">{t(g.count, { n: TERMS.length })}</span>
            <span className="small muted">{t(g.lede)}</span>
          </p>
        </div>
        <button type="button" className="phase-toggle" aria-expanded={shown} aria-controls="glossary-body" onClick={() => setShown((v) => !v)}>
          <span aria-hidden="true">{shown ? "–" : "+"}</span>
          {t(shown ? learn.fold.close : learn.fold.open)}
          <span className="sr-only">: {t(g.title)}</span>
        </button>
      </header>
      <div id="glossary-body" className="phase-body" hidden={!shown}>
        <div className="learn-tools">
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t(g.filter)} aria-label={t(g.filter)} />
        </div>
        {terms.length === 0 ? (
          <p className="empty">{t(g.none)}</p>
        ) : (
          <dl className="glossary">
            {terms.map((x) => (
              <div key={`${x.p.id}.${x.m.id}.${x.term.en}`}>
                <dt>{t(x.term)}</dt>
                <dd>
                  {t(x.def)}{" "}
                  <span className="small muted">
                    {t(g.from)}{" "}
                    <a href={`#${x.p.id}-${x.m.id}`} onClick={() => go(`${x.p.id}-${x.m.id}`)}>
                      {t(x.m.title)}
                    </a>
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

export function LearnPage({ reads = [] }: { reads?: NoteSummary[] }) {
  const t = useT();
  const { lang } = useLang();
  const [done, setDone] = useState<Done>({});
  const [hide, setHide] = useState(false);
  const [query, setQuery] = useState("");
  const [armed, setArmed] = useState(false);
  // one phase open at a time by default: the one you're on. The rest stay folded.
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // opens a phase and goes to it (or to a module inside it): "maths", "maths-stats"
  const go = useCallback((target: string) => {
    const phase = target.split("-")[0];
    if (!phases.some((p) => p.id === phase)) return;
    setOpen((o) => ({ ...o, [phase]: true }));
    // after the phase has unfolded
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start" })));
  }, []);

  // progress lives in this browser only
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (saved && typeof saved === "object") setDone(saved);
      setHide(localStorage.getItem(HIDE_KEY) === "1");
      // unfold the phase with the first thing still to do
      const first = ESSENTIAL.find((x) => !(saved && saved[x.id])) ?? ALL[0];
      setOpen({ [first.p.id]: true });
    } catch {
      setOpen({ [phases[0].id]: true });
    }
    // a link straight to a phase or module opens it
    const fromHash = () => {
      const target = decodeURIComponent(location.hash.slice(1));
      if (target) go(target);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [go]);

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

  // the bar follows the essentials; the rest is counted apart
  const total = ESSENTIAL.length;
  const finished = ESSENTIAL.filter((x) => done[x.id]).length;
  const extras = EXTRA.filter((x) => done[x.id]).length;
  const next = ESSENTIAL.find((x) => !done[x.id]);
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
              <dd className="readout big">{ALL.length}</dd>
            </div>
          </dl>
        </section>

        <section className="panel wide learn-auto" aria-labelledby="learn-auto-title">
          <h2 id="learn-auto-title" className="panel-title">
            {t(learn.auto.title)}
          </h2>
          {learn.auto.paras.map((para) => (
            <p key={para.en.slice(0, 24)}>{t(para)}</p>
          ))}
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
                        <a className="tl-title" href={`#${p.id}`} onClick={() => go(p.id)}>
                          {t(p.title)}
                        </a>
                        <span className="small muted">
                          {t(p.time)} · {t(learn.progress.modules, { n: p.modules.length })} · {t(p.when)}
                        </span>
                      </div>
                      <span className="readout">
                        {d}/{n}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="small pace">
                {t(learn.pace.total)} <span className="muted">{t(learn.pace.note)}</span>
              </p>
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
              <div className="levels">
                <p className="widget-title">{t(learn.levels.title)}</p>
                <dl>
                  {learn.levels.list.map((x, i) => (
                    <div key={x.tag.en} className={LEVEL_CLASS[(i + 1) as 1 | 2 | 3]}>
                      <dt>
                        <span className="tag tag-level">{t(x.tag)}</span>
                      </dt>
                      <dd className="small">{t(x.text)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {reads.length > 0 && (
                <div className="reads">
                  <p className="widget-title">{t(learn.how.reads)}</p>
                  <NotesList notes={reads} compact />
                </div>
              )}
            </section>
          </>
        )}

        <section className="panel wide learn-progress">
          <h2 className="panel-title">
            {t(learn.progress.title)}
            <span className="tag">{label}</span>
          </h2>
          <Cells d={finished} n={total} label={label} />
          <p className="small muted">{t(learn.progress.extras, { d: extras, n: EXTRA.length })}</p>
          <p className="next">
            {next ? (
              <>
                <span className="widget-title">{t(learn.progress.next)}</span>
                <a href={`#${next.p.id}-${next.m.id}`} onClick={() => go(`${next.p.id}-${next.m.id}`)}>
                  {next.r.name}
                </a>
                <span className="muted small">
                  {t(next.p.short)} · {t(next.m.title)}
                </span>
              </>
            ) : (
              <span>{t(learn.progress.allDone)}</span>
            )}
          </p>
          {next && finished > 0 && (
            <p>
              <a className="cv-button" href={`#${next.p.id}-${next.m.id}`} onClick={() => go(`${next.p.id}-${next.m.id}`)}>
                {t(learn.fold.resume)}
              </a>
            </p>
          )}
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
          <Backup done={done} onLoad={save} />
        </section>

        {phases.map((p) => {
          const mods = p.modules.filter((m) => !matches || matches.has(`${p.id}.${m.id}`));
          if (!mods.length) return null;
          const { d, n } = count(done, p);
          const isOpen = !!q || !!open[p.id];
          return (
            <section key={p.id} id={p.id} className={`panel wide phase ${isOpen ? "is-open" : "is-folded"}`}>
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
                  {!q && isOpen && <p>{t(p.lead)}</p>}
                  <p className="chips">
                    <span className="tag tag-time">
                      {t(p.time)} {t(learn.pace.perDay)}
                    </span>
                    {isOpen &&
                      p.meta.map((x) => (
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
                {!q && (
                  <button
                    type="button"
                    className="phase-toggle"
                    aria-expanded={isOpen}
                    aria-controls={`${p.id}-body`}
                    onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
                  >
                    <span aria-hidden="true">{isOpen ? "–" : "+"}</span>
                    {t(isOpen ? learn.fold.close : learn.fold.open)}
                    <span className="sr-only">: {t(p.title)}</span>
                  </button>
                )}
              </header>

              {/* folded phases stay in the page (hidden), so links and search engines still find them */}
              <div id={`${p.id}-body`} className="phase-body" hidden={!isOpen}>
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

              {!q && (
                <div className="selfcheck">
                  <p className="row-name">{t(learn.check.title)}</p>
                  <p className="small muted">{t(learn.check.text)}</p>
                  <ul>
                    {p.check.map((c, i) => {
                      const id = `check.${p.id}.${i}`;
                      return (
                        <li key={id}>
                          <label className="check">
                            <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} />
                            <span className="box" aria-hidden="true">
                              <Check />
                            </span>
                            <span>{t(c)}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              </div>
            </section>
          );
        })}

        {!anyShown && <p className="empty wide">{t(learn.progress.none)}</p>}

        {!q && <Glossary go={go} />}

        <p className="small muted wide learn-reviewed">
          {t(learn.reviewed.label, { d: formatNoteDate(learn.reviewed.date, lang) })} {t(learn.reviewed.report)}{" "}
          <PageLink to="guestbook">{t(learn.reviewed.guestbook)}</PageLink>.
        </p>

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
