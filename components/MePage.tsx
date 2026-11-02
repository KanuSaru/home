"use client";

import { DitherModel } from "dither-model/react";
import { me, ui, type Row } from "@/content/site";
import { useT } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// the screen of the Steam Deck model, drawn dark (millimetres, the CAD file's units)
const DECK_SCREEN: [number, number, number, number, number, number][] = [[-88, -49.4, -1, 88, 50.6, 1]];

function Panel({
  title,
  tag,
  className,
  children,
}: {
  title: string;
  tag?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <h2 className="panel-title">
        {title}
        {tag && <span className="tag">{tag}</span>}
      </h2>
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
        <Panel title={t(me.hello.title)} tag={t(me.hello.pronouns)} className="wide">
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

        <section className="panel wide deck">
          <div className="deck-head">
            <h2 className="panel-title">{t(me.deck.title)}</h2>
            <DitherModel
              className="deck-model"
              src={`${BASE}/models/steam-deck.json`}
              width={240}
              height={120}
              pixelSize={2}
              dark={DECK_SCREEN}
              label={t(me.deck.model)}
            />
          </div>
          <p>{t(me.deck.text)}</p>
          <ul className="rows specs">
            {me.deck.rows.map((r) => (
              <li key={r.name.en}>
                <p className="row-name">{t(r.name)}</p>
                <p className="small">{t(r.note)}</p>
              </li>
            ))}
          </ul>
          <p className="credit">
            {t(me.deck.credit)}{" "}
            <a href="https://gitlab.steamos.cloud/SteamHardware/SteamDeck" target="_blank" rel="noopener noreferrer">
              Steam Deck CAD
            </a>{" "}
            {t(me.deck.creditBy)},{" "}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY-NC-SA 4.0
            </a>
            , {t(me.deck.simplified)}.
          </p>
        </section>

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
