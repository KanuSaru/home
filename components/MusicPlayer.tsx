"use client";

// The music widget in the sidebar.
//
// With tracks of my own (music.tracks) it's the dither-player package
// (github.com/KanuSaru/dither-player), dressed in the site's colors (see .music in
// globals.css); the sidebar stays in place between pages, so the music keeps playing.
//
// Without them it lists the songs I've played most this month, from Last.fm, with a
// link to my playlist. No outside player is loaded.

import { DitherPlayer } from "dither-player/react";
import { config, music, ui, widgets as w } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { useRemembered } from "@/components/Widgets";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Set NEXT_PUBLIC_DEMO=1 for previews: sample data stands in for the real thing.
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const TRACKS = music.tracks.map((tr) => ({ title: tr.title, src: `${BASE}/music/${tr.file}` }));

type TopTracks = { toptracks?: { track?: { name: string; url: string; playcount: string; artist: { name: string } }[] } };
type Top = { name: string; artist: string; url: string; plays: number };

const SAMPLE: Top[] = [
  { name: "Example song", artist: "Example artist", url: "https://www.last.fm/", plays: 31 },
  { name: "Another example song", artist: "Example artist", url: "https://www.last.fm/", plays: 24 },
  { name: "A third one", artist: "Someone else", url: "https://www.last.fm/", plays: 19 },
];

function TopSongs() {
  const t = useT();
  const { user, apiKey } = config.lastfm;
  const url =
    !DEMO && user && apiKey
      ? `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&period=1month&limit=5`
      : null;
  const { data: live } = useRemembered<TopTracks>(url, 30 * 60_000, "lastfm-top");
  const songs: Top[] | null = DEMO
    ? SAMPLE
    : live
      ? (live.toptracks?.track ?? []).map((tr) => ({ name: tr.name, artist: tr.artist.name, url: tr.url, plays: Number(tr.playcount) }))
      : null;
  const spotify = /spotify\.com/.test(music.playlist);

  return (
    <>
      <p className="small muted">{t(w.player.topText)}</p>
      {!DEMO && !url && <p className="small muted">{t(ui.notConnected)}</p>}
      {url && live === undefined && <p className="readout">…</p>}
      {url && live === null && <p className="small muted">{t(ui.unavailable)}</p>}
      {songs && songs.length === 0 && <p className="small muted">{t(w.player.topEmpty)}</p>}
      {songs && songs.length > 0 && (
        <ol className="top-songs">
          {songs.map((s, i) => (
            <li key={`${s.name}-${s.artist}`}>
              <span className="top-n" aria-hidden="true">
                {i + 1}
              </span>
              <span className="top-text">
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
                <span className="small muted">
                  {s.artist} · {t(w.player.plays, { n: s.plays })}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
      {music.playlist && (
        <p className="small">
          <a href={music.playlist} target="_blank" rel="noopener noreferrer">
            {t(spotify ? w.player.playlist : w.player.playlistOther)}
          </a>
        </p>
      )}
      {(songs || url) && <p className="fineprint">{t(w.music.via)}</p>}
    </>
  );
}

export function MusicPlayer() {
  const t = useT();
  const { lang } = useLang();
  return (
    <section className="widget">
      <h2 className="widget-title">
        {t(w.player.title)}
        {DEMO && <span className="tag">{t(ui.example)}</span>}
      </h2>
      {TRACKS.length > 0 ? (
        <DitherPlayer
          className="music"
          tracks={TRACKS}
          playlist={music.playlist}
          lang={lang}
          artist="Kanu"
          labels={{ favesText: t(w.player.favesText) }}
        />
      ) : (
        <TopSongs />
      )}
    </section>
  );
}
