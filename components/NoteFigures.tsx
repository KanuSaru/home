"use client";

// Live figures that notes can place with a :: line (see lib/markdown.ts).
//   ::moon   one moon        date, surface (nasa | procedural | flat), relief, info, caption
//   ::moons  a row of moons  dates="a,b,c" labels="x|y|z" caption
//   ::ramp   a gray ramp, then thresholded, then dithered    labels="a|b|c" caption
//   ::bayer  the 4×4 threshold grid                           caption

import { useEffect, useRef } from "react";
import { DitherMoon } from "dither-moon/react";
import { useLang } from "@/lib/i18n";

// a plain white ball: no map, so only the lighting shows
const FLAT = { width: 1, height: 1, albedo: [255] };

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function Caption({ text }: { text?: string }) {
  return text ? <figcaption>{text}</figcaption> : null;
}

function OneMoon({ p, lang }: { p: Record<string, string>; lang: string }) {
  const surface = p.surface === "flat" ? FLAT : p.surface === "procedural" ? "procedural" : "nasa";
  return (
    <DitherMoon
      className="note-moon"
      date={p.date || null}
      surface={surface as never}
      relief={p.relief != null ? Number(p.relief) : undefined}
      drift={(p.drift as "sway" | "spin" | "none") || "none"}
      stars={p.stars != null ? Number(p.stars) : 0}
      pixelSize={p.pixel ? Number(p.pixel) : undefined}
      info={p.info === "1"}
      lang={lang}
    />
  );
}

function MoonFigure({ p }: { p: Record<string, string> }) {
  const { lang } = useLang();
  return (
    <figure className={`note-figure ${p.size === "large" ? "is-large" : ""}`}>
      <OneMoon p={p} lang={lang} />
      <Caption text={p.caption} />
    </figure>
  );
}

function MoonRow({ p }: { p: Record<string, string> }) {
  const { lang } = useLang();
  const dates = (p.dates || "").split(",").map((d) => d.trim()).filter(Boolean);
  const labels = (p.labels || "").split("|");
  return (
    <figure className="note-figure">
      <div className="note-moons">
        {dates.map((d, i) => (
          <div key={d}>
            <OneMoon p={{ ...p, date: d }} lang={lang} />
            {labels[i] && <span className="note-moon-label">{labels[i]}</span>}
          </div>
        ))}
      </div>
      <Caption text={p.caption} />
    </figure>
  );
}

function Ramp({ p }: { p: Record<string, string> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const labels = (p.labels || "").split("|");
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const PX = 3;
    const ROW = 10; // moon pixels per row
    const GAP = 4;
    function draw() {
      const box = canvas.parentElement!;
      const W = Math.max(40, Math.floor(box.clientWidth / PX));
      const H = ROW * 3 + GAP * 2;
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${W * PX}px`;
      canvas.style.height = `${H * PX}px`;
      const ink = getComputedStyle(canvas).color.match(/[\d.]+/g)!.map(Number);
      const img = ctx.createImageData(W, H);
      const put = (x: number, y: number, a: number) => {
        const i = (y * W + x) * 4;
        img.data[i] = ink[0];
        img.data[i + 1] = ink[1];
        img.data[i + 2] = ink[2];
        img.data[i + 3] = a;
      };
      for (let x = 0; x < W; x++) {
        const v = x / (W - 1);
        for (let y = 0; y < ROW; y++) {
          put(x, y, Math.round(255 * v)); // smooth
          if (v > 0.5) put(x, y + ROW + GAP, 255); // one threshold for every pixel
          const yy = y + 2 * (ROW + GAP);
          if (v > (BAYER[(yy & 3) * 4 + (x & 3)] + 0.5) / 16) put(x, yy, 255); // a threshold per pixel
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, []);
  return (
    <figure className="note-figure">
      <div className="note-ramp">
        <canvas ref={ref} aria-label={labels.filter(Boolean).join(", ")} role="img" />
        <ol className="note-ramp-labels">
          {labels.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      </div>
      <Caption text={p.caption} />
    </figure>
  );
}

function Bayer({ p }: { p: Record<string, string> }) {
  return (
    <figure className="note-figure">
      <div className="note-bayer" role="img" aria-label="4 × 4: 0 8 2 10 / 12 4 14 6 / 3 11 1 9 / 15 7 13 5">
        {BAYER.map((v, i) => (
          <span key={i} style={{ ["--v" as string]: (v + 0.5) / 16, color: v < 8 ? "var(--bone)" : "var(--ground)" }}>
            {v}
          </span>
        ))}
      </div>
      <Caption text={p.caption} />
    </figure>
  );
}

export function NoteFigure({ name, props }: { name: string; props: Record<string, string> }) {
  if (name === "moon") return <MoonFigure p={props} />;
  if (name === "moons") return <MoonRow p={props} />;
  if (name === "ramp") return <Ramp p={props} />;
  if (name === "bayer") return <Bayer p={props} />;
  return null;
}
