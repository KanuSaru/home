"use client";

import { me, ui, type Row } from "@/content/site";
import { useT } from "@/lib/i18n";

function Panel({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: Row[] }) {
  const t = useT();
  return (
    <ul className="rows">
      {rows.map((r) => (
        <li key={r.name}>
          <p className="row-name">
            {r.star && (
              <span className="star" title={t(ui.favorite)} aria-label={t(ui.favorite)}>
                ★
              </span>
            )}
            {r.name}
          </p>
          <p className="small">{t(r.note)}</p>
        </li>
      ))}
    </ul>
  );
}

export function MePage() {
  const t = useT();
  return (
    <>
      <header className="page-head">
        <h1>{t(me.title)}</h1>
        <p>{t(me.lede)}</p>
      </header>

      <div className="mosaic">
        <Panel title={t(me.hello.title)} className="wide">
          {me.hello.paras.map((p) => (
            <p key={p.en.slice(0, 20)}>{t(p)}</p>
          ))}
        </Panel>

        <Panel title={t(me.music.title)}>
          <p>{t(me.music.text)}</p>
          <Rows rows={me.music.rows} />
        </Panel>

        <Panel title={t(me.sampler.title)}>
          <p>{t(me.sampler.text)}</p>
        </Panel>

        <Panel title={t(me.oni.title)} className="feature">
          <p>{t(me.oni.text)}</p>
          <p className="callout">{t(me.oni.thesis)}</p>
        </Panel>

        <Panel title={t(me.games.title)}>
          <Rows rows={me.games.rows} />
        </Panel>

        <Panel title={t(me.reading.title)}>
          <Rows rows={me.reading.rows} />
          <p>{t(me.reading.text)}</p>
        </Panel>

        <Panel title={t(me.chess.title)}>
          <p>{t(me.chess.text)}</p>
        </Panel>

        <Panel title={t(me.dream.title)} className="wide">
          <p className="lede-sm">{t(me.dream.text)}</p>
          <p>{t(me.dream.more)}</p>
        </Panel>

        <Panel title={t(me.gallery.title)} className="wide empty-panel">
          <p className="empty">{t(me.gallery.text)}</p>
        </Panel>
      </div>

      <p className="legend">
        <span className="star" aria-hidden="true">
          ★
        </span>{" "}
        {t(ui.favorite)}
      </p>
    </>
  );
}
