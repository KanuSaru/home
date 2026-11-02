"use client";

// The music widget in the sidebar. The player itself is the dither-player package
// (github.com/KanuSaru/dither-player); this only feeds it the site's tracks, playlist
// and language, and dresses it in the site's colors (see .music in globals.css).
// The sidebar stays in place between pages, so the music keeps playing.

import { DitherPlayer } from "dither-player/react";
import { music, ui, widgets as w } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Set NEXT_PUBLIC_DEMO=1 for previews: a sample loop stands in for real tracks.
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const TRACKS = (DEMO ? [{ title: "Demo loop", file: "demo.mp3" }] : music.tracks).map((tr) => ({
  title: tr.title,
  src: `${BASE}/music/${tr.file}`,
}));

export function MusicPlayer() {
  const t = useT();
  const { lang } = useLang();
  return (
    <section className="widget">
      <h2 className="widget-title">
        {t(w.player.title)}
        {DEMO && <span className="tag">{t(ui.example)}</span>}
      </h2>
      <DitherPlayer
        className="music"
        tracks={TRACKS}
        playlist={music.playlist}
        lang={lang}
        artist="Kanu"
        labels={{ favesText: t(w.player.favesText) }}
      />
    </section>
  );
}
