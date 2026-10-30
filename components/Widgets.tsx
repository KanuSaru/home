"use client";

import { useEffect, useState } from "react";
import { config, ui, weatherWords, widgets as w } from "@/content/site";
import { useLang, useT } from "@/lib/i18n";
import { moonPhase, nextFullMoon } from "dither-moon";

// Set NEXT_PUBLIC_DEMO=1 to show labeled example data instead of live data
// (used for previews where outside requests are blocked).
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

function Panel({ title, children, example }: { title: string; children: React.ReactNode; example?: boolean }) {
  const t = useT();
  return (
    <section className="widget">
      <h2 className="widget-title">
        {title}
        {example && <span className="tag">{t(ui.example)}</span>}
      </h2>
      {children}
    </section>
  );
}

/** Poll a JSON endpoint; returns undefined while loading, null on failure. */
function usePoll<T>(url: string | null, everyMs: number) {
  const [data, setData] = useState<T | null | undefined>(undefined);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as T;
        if (alive) setData(json);
      } catch {
        if (alive) setData((prev) => (prev === undefined ? null : prev));
      }
    };
    load();
    const id = window.setInterval(load, everyMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [url, everyMs]);
  return data;
}

// ---------------------------------------------------------------- time

export function LocalTime() {
  const t = useT();
  const { lang } = useLang();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  let clock = "--:--";
  let diff = "";
  if (now) {
    clock = new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
      timeZone: config.place.timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(now);
    // offset between the visitor's clock and Barranquilla's (UTC−5, no daylight saving)
    const visitorOffset = -now.getTimezoneOffset() / 60;
    const delta = visitorOffset - -5;
    if (delta === 0) diff = t(w.time.same);
    else {
      const n = Math.abs(delta);
      const span = n === 1 ? t(w.time.hour) : t(w.time.hours, { n: Number.isInteger(n) ? n : n.toFixed(1) });
      diff = t(delta > 0 ? w.time.ahead : w.time.behind, { n: span });
    }
  }

  return (
    <Panel title={t(w.time.title)}>
      <p className="small">{t(w.time.here)}</p>
      <p className="readout big">{clock}</p>
      {diff && <p className="small muted">{diff}</p>}
    </Panel>
  );
}

// ---------------------------------------------------------------- weather

type Meteo = { current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number } };

export function Weather() {
  const t = useT();
  const { lat, lon, timeZone } = config.place;
  const url = DEMO
    ? null
    : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=${encodeURIComponent(timeZone)}`;
  const live = usePoll<Meteo>(url, 15 * 60_000);
  const data: Meteo | null | undefined = DEMO
    ? { current: { temperature_2m: 29, relative_humidity_2m: 74, weather_code: 2 } }
    : live;

  return (
    <Panel title={t(w.weather.title)} example={DEMO}>
      {data === undefined && <p className="readout">…</p>}
      {data === null && <p className="small muted">{t(ui.unavailable)}</p>}
      {data && (
        <>
          <p className="readout big">{Math.round(data.current.temperature_2m)}°C</p>
          <p className="small">
            {t(weatherWords[data.current.weather_code] ?? weatherWords[3])}, {data.current.relative_humidity_2m}%{" "}
            {t(w.weather.humidity)}
          </p>
        </>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------- moon readout

export function MoonReadout() {
  const t = useT();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 10 * 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <p className="readout">…</p>;
  const m = moonPhase(now);
  const days = (nextFullMoon(now).getTime() - now.getTime()) / 86_400_000;
  return (
    <dl className="moon-readout">
      <div>
        <dt className="sr-only">Phase</dt>
        <dd className="readout big">{t(w.moon.phases[m.phaseIndex])}</dd>
      </div>
      <div>
        <dt className="sr-only">Lit</dt>
        <dd className="readout">{t(w.moon.lit, { n: Math.round(m.illumination * 100) })}</dd>
      </div>
      <div>
        <dt className="sr-only">Next full moon</dt>
        <dd className="readout">
          {days < 1 ? t(w.moon.fullTonight) : t(w.moon.fullIn, { n: Math.round(days) })}
        </dd>
      </div>
    </dl>
  );
}

// ---------------------------------------------------------------- music

type LastFm = {
  recenttracks?: {
    track: {
      name: string;
      artist: { "#text": string };
      album: { "#text": string };
      image: { "#text": string; size: string }[];
      "@attr"?: { nowplaying: string };
      date?: { uts: string };
    }[];
  };
};

function ago(lang: "en" | "es", unixSeconds: number) {
  const s = Math.round(unixSeconds - Date.now() / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const abs = Math.abs(s);
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}

export function NowPlaying() {
  const t = useT();
  const { lang } = useLang();
  const { user, apiKey } = config.lastfm;
  const url =
    !DEMO && user && apiKey
      ? `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${apiKey}&format=json&limit=1`
      : null;
  const live = usePoll<LastFm>(url, 60_000);

  let track: { name: string; artist: string; cover?: string; now: boolean; when?: number } | null = null;
  if (DEMO) track = { name: "Loving", artist: "Loving", now: true };
  else if (live?.recenttracks?.track?.[0]) {
    const tr = live.recenttracks.track[0];
    track = {
      name: tr.name,
      artist: tr.artist["#text"],
      cover: tr.image?.find((i) => i.size === "large")?.["#text"] || undefined,
      now: tr["@attr"]?.nowplaying === "true",
      when: tr.date ? Number(tr.date.uts) : undefined,
    };
  }

  return (
    <Panel title={t(w.music.title)} example={DEMO}>
      {!DEMO && !url && <p className="small muted">{t(ui.notConnected)}</p>}
      {url && live === undefined && <p className="readout">…</p>}
      {url && live === null && <p className="small muted">{t(ui.unavailable)}</p>}
      {track && (
        <div className="track">
          <div className="cover" aria-hidden="true">
            {track.cover ? <img src={track.cover} alt="" /> : <span className="cover-blank" />}
          </div>
          <div className="track-text">
            <p className="track-name">{track.name}</p>
            <p className="small">{track.artist}</p>
            <p className="small muted">
              {track.now ? (
                <>
                  <span className="eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  {t(w.music.now)}
                </>
              ) : track.when ? (
                t(w.music.last, { t: ago(lang, track.when) })
              ) : null}
            </p>
          </div>
        </div>
      )}
      {(track || url) && <p className="fineprint">{t(w.music.via)}</p>}
    </Panel>
  );
}

// ---------------------------------------------------------------- discord

type Lanyard = {
  data?: {
    discord_status: "online" | "idle" | "dnd" | "offline";
    activities: { type: number; name: string; state?: string }[];
  };
};

export function DiscordStatus() {
  const t = useT();
  const url = !DEMO && config.discordId ? `https://api.lanyard.rest/v1/users/${config.discordId}` : null;
  const live = usePoll<Lanyard>(url, 30_000);

  let status: "online" | "idle" | "dnd" | "offline" | null = null;
  let activity: string | null = null;
  let custom: string | null = null;
  if (DEMO) {
    status = "online";
    activity = "Oxygen Not Included";
  } else if (live?.data) {
    status = live.data.discord_status;
    activity = live.data.activities.find((a) => a.type === 0)?.name ?? null;
    custom = live.data.activities.find((a) => a.type === 4)?.state ?? null;
  }

  return (
    <Panel title={t(w.discord.title)} example={DEMO}>
      {!DEMO && !url && <p className="small muted">{t(ui.notConnected)}</p>}
      {url && live === undefined && <p className="readout">…</p>}
      {url && live === null && <p className="small muted">{t(ui.unavailable)}</p>}
      {status && (
        <>
          <p className="status">
            <span className={`dot dot-${status}`} aria-hidden="true" />
            {t(w.discord[status])}
          </p>
          {activity && <p className="small">{t(w.discord.playing, { x: activity })}</p>}
          {custom && <p className="small muted">“{custom}”</p>}
        </>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------- visitors

export function Visitors() {
  const t = useT();
  const code = config.goatcounter;
  const url = !DEMO && code ? `https://${code}.goatcounter.com/counter/TOTAL.json` : null;
  const live = usePoll<{ count: string }>(url, 5 * 60_000);
  const count = DEMO ? 1337 : live ? Number(String(live.count).replace(/\D/g, "")) : null;

  return (
    <Panel title={t(w.visitors.title)} example={DEMO}>
      {!DEMO && !url && <p className="small muted">{t(ui.notConnected)}</p>}
      {url && live === undefined && <p className="readout">…</p>}
      {url && live === null && <p className="small muted">{t(ui.unavailable)}</p>}
      {count !== null && (
        <>
          <p className="odometer" aria-label={String(count)}>
            {String(count)
              .padStart(6, "0")
              .split("")
              .map((d, i) => (
                <span key={i}>{d}</span>
              ))}
          </p>
          <p className="small muted">{t(w.visitors.note)}</p>
        </>
      )}
    </Panel>
  );
}
