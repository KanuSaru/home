"use client";

// Diagrams for the Learn ML notes, drawn in the site's style: bone lines on the panel,
// the pixel font for labels, blue for the one thing to look at, no gradients.
// Notes place them with a :: line (see NoteFigures.tsx):
//
//   ::loop       learn syntax ⇄ build projects
//   ::projects   what an AI answers when asked for project ideas
//   ::karaoke    three voices, mixed recordings, ICA, each voice alone
//   ::bell       the bell curve
//   ::houses     a small table of houses: rows and columns, a matrix
//   ::trend      height against weight for two groups: two columns saying the same thing
//   ::pca        a cloud of points with its two principal directions
//   ::compare    PCA next to ICA
//   ::curves     a straight line and a parabola
//   ::descent    gradient descent stepping down a curve (it moves)
//   ::landscape  a loss landscape in 3D, with a deep valley and a shallow one
//
// Each takes caption="…". The words inside the drawings follow the page's language.

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

type P = Record<string, string>;
type Lang = "en" | "es";
const tr = (lang: Lang, en: string, es: string) => (lang === "es" ? es : en);

function Figure({ p, label, children, wide }: { p: P; label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <figure className={`note-figure note-diagram ${wide ? "is-wide" : ""}`}>
      <div className="diagram" role="img" aria-label={label}>
        {children}
      </div>
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
  );
}

/** Arrowheads, shared by the drawings (each SVG needs its own copy). */
function Arrows() {
  return (
    <defs>
      <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="dg-fill" />
      </marker>
      <marker id="dg-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="dg-fill-blue" />
      </marker>
      <marker id="dg-arrow-ash" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="dg-fill-ash" />
      </marker>
    </defs>
  );
}

// the same "random" numbers on every visit and on the server, so drawings never jump
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ------------------------------------------------------------------ loop

function Loop({ p }: { p: P }) {
  const { lang } = useLang();
  const a = tr(lang, "Learn syntax", "Aprende sintaxis");
  const b = tr(lang, "Build projects", "Construye proyectos");
  return (
    <Figure p={p} label={`${a} → ${b} → ${a}`}>
      <svg viewBox="0 0 480 190">
        <Arrows />
        <rect className="dg-box" x="30" y="65" width="170" height="60" />
        <rect className="dg-box" x="280" y="65" width="170" height="60" />
        <text className="dg-t dg-fixed" x="115" y="101" textAnchor="middle">{a}</text>
        <text className="dg-t dg-fixed" x="365" y="101" textAnchor="middle">{b}</text>
        <path className="dg-line" d="M115 125V165H365V129" markerEnd="url(#dg-arrow)" />
        <path className="dg-line" d="M365 65V25H115V61" markerEnd="url(#dg-arrow)" />
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ projects

function Projects({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const items = [
    {
      name: t("1. To-do list manager", "1. Gestor de lista de tareas"),
      features: t("add tasks · mark them done · save them to a file", "agregar tareas · marcarlas como hechas · guardarlas en un archivo"),
      learn: t("variables, lists, functions, loops, files", "variables, listas, funciones, ciclos, archivos"),
    },
    {
      name: t("2. Number guessing game", "2. Juego de adivinar el número"),
      features: t("pick a random number · say “too high” or “too low” · count the tries", "elegir un número al azar · decir “muy alto” o “muy bajo” · contar los intentos"),
      learn: t("conditionals, loops, random numbers", "condicionales, ciclos, números al azar"),
    },
  ];
  return (
    <Figure p={p} label={t("An example of the answer", "Un ejemplo de la respuesta")} wide>
      <div className="dg-answer">
        <p className="dg-answer-level">{t("Beginner", "Principiante")}</p>
        {items.map((it) => (
          <div key={it.name} className="dg-answer-item">
            <p className="dg-answer-name">{it.name}</p>
            <p>
              <span>{t("Features", "Funciones")}</span> {it.features}
            </p>
            <p>
              <span>{t("You learn", "Aprendes")}</span> {it.learn}
            </p>
          </div>
        ))}
        <p className="dg-answer-more">{t("3. … and six more, up to advanced", "3. … y seis más, hasta avanzado")}</p>
      </div>
    </Figure>
  );
}

// ------------------------------------------------------------------ karaoke (ICA)

// a voice as a row of bars; each voice has its own rhythm
function bars(seed: number, n: number) {
  const r = seeded(seed);
  const f = 0.25 + r() * 0.5, ph = r() * 6;
  return Array.from({ length: n }, (_, i) => 3 + Math.round(15 * Math.abs(Math.sin(i * f + ph)) * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.19 + seed)))));
}

function Wave({ x, y, seed, cls }: { x: number; y: number; seed: number; cls: string }) {
  return (
    <g className={cls}>
      {bars(seed, 26).map((h, i) => (
        <rect key={i} x={x + i * 6} y={y - h} width="3" height={h * 2} />
      ))}
    </g>
  );
}

function Mic({ y }: { y: number }) {
  return (
    <g>
      <rect className="dg-solid" x="34" y={y - 16} width="14" height="20" />
      <path className="dg-line" d={`M29 ${y - 2}V${y + 4}H53V${y - 2}M41 ${y + 4}V${y + 14}M33 ${y + 14}H49`} />
    </g>
  );
}

function Karaoke({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const rows = [52, 132, 212];
  // the tangle: three wobbling lines on top of each other
  const tangle = (k: number) =>
    Array.from({ length: 41 }, (_, i) => {
      const x = 205 + i * 2.5;
      const y = 132 + Math.sin(i * (0.55 + k * 0.23) + k * 2) * (9 - k * 2);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join("");
  return (
    <Figure p={p} label={t("Three voices are recorded mixed together; ICA gives back each voice on its own", "Tres voces se graban mezcladas; ICA devuelve cada voz por separado")} wide>
      <svg viewBox="0 0 660 262">
        <Arrows />
        <text className="dg-m" x="41" y="16" textAnchor="middle">{t("3 voices", "3 voces")}</text>
        <text className="dg-m" x="255" y="98" textAnchor="middle">{t("mixed recording", "grabación mezclada")}</text>
        <text className="dg-m" x="560" y="16" textAnchor="middle">{t("each voice alone", "cada voz por separado")}</text>
        {rows.map((y, k) => (
          <g key={y}>
            <Mic y={y} />
            <path className={k === 1 ? "dg-line" : "dg-line dg-ash"} d={`M58 ${y - 4}C140 ${y - 4} 150 132 205 132`} />
            <path className={k === 0 ? "dg-line dg-thin" : k === 1 ? "dg-line dg-thin dg-blue" : "dg-line dg-thin dg-ash"} d={tangle(k)} />
            <path className="dg-line dg-thin" d={`M395 132L468 ${y}`} markerEnd="url(#dg-arrow)" />
            <Wave x={482} y={y} seed={k * 7 + 3} cls={k === 1 ? "dg-solid dg-blue" : k === 0 ? "dg-solid" : "dg-solid dg-ash"} />
          </g>
        ))}
        <rect className="dg-box dg-box-solid" x="315" y="107" width="80" height="50" />
        <text className="dg-t dg-on" x="355" y="139" textAnchor="middle">ICA</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ bell curve

function Bell({ p }: { p: P }) {
  const { lang } = useLang();
  const pts = Array.from({ length: 89 }, (_, i) => {
    const x = 40 + i * 5;
    const z = (x - 260) / 78;
    return `${i ? "L" : "M"}${x} ${(196 - 150 * Math.exp(-0.5 * z * z)).toFixed(1)}`;
  }).join("");
  return (
    <Figure p={p} label={tr(lang, "A bell curve: most values sit near the middle", "Una campana de Gauss: la mayoría de valores está cerca del centro")}>
      <svg viewBox="0 0 520 226">
        <path className="dg-line dg-ash" d="M30 196H490" />
        <path className="dg-line dg-dash dg-ash" d="M260 46V196" />
        <path className="dg-line dg-thick" d={pts} />
        <rect className="dg-solid dg-blue" x="256" y="42" width="8" height="8" />
        <path className="dg-line dg-thin dg-ash" d="M268 44L318 26" />
        <text className="dg-m" x="324" y="22">{tr(lang, "mean, median", "media, mediana")}</text>
        <text className="dg-m" x="324" y="40">{tr(lang, "and mode", "y moda")}</text>
        <text className="dg-m" x="260" y="218" textAnchor="middle">{tr(lang, "most values are here", "casi todos los valores están aquí")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ houses (a matrix)

function Houses({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const es = lang === "es";
  const rows = [
    [t("House 1", "Casa 1"), "2", "2", es ? "85" : "900", es ? "200.000" : "200,000"],
    [t("House 2", "Casa 2"), "3", "2", es ? "140" : "1,500", es ? "350.000" : "350,000"],
    [t("House 3", "Casa 3"), "1", "1", es ? "75" : "800", es ? "100.000" : "100,000"],
  ];
  return (
    <figure className="note-figure note-diagram is-wide">
      <div className="dg-scroll">
        <table className="dg-table">
          <thead>
            <tr>
              <td />
              <th scope="col">{t("bedrooms", "habitaciones")}</th>
              <th scope="col">{t("bathrooms", "baños")}</th>
              <th scope="col">{t("area (sq ft)", "área (m²)")}</th>
              <th scope="col">{t("price", "precio")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <th scope="row">{r[0]}</th>
                {r.slice(1).map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
  );
}

// ------------------------------------------------------------------ trend (height and weight)

function Trend({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const X = (h: number) => 70 + ((h - 150) / 40) * 410;
  const Y = (w: number) => 232 - ((w - 40) / 55) * 200;
  const hs = [150, 155, 160, 165, 170, 175, 180, 185, 190];
  const line = (off: number) => hs.map((h, i) => `${i ? "L" : "M"}${X(h)} ${Y(h - off)}`).join("");
  return (
    <Figure p={p} label={t("Height against weight for two groups: both lines rise the same way", "Estatura contra peso en dos grupos: las dos líneas suben igual")}>
      <svg viewBox="0 0 520 286">
        {[50, 60, 70, 80, 90].map((w) => (
          <g key={w}>
            <path className="dg-grid" d={`M70 ${Y(w)}H480`} />
            <text className="dg-m" x="60" y={Y(w) + 5} textAnchor="end">{w}</text>
          </g>
        ))}
        {[150, 160, 170, 180, 190].map((h) => (
          <text key={h} className="dg-m" x={X(h)} y="252" textAnchor="middle">{h}</text>
        ))}
        <path className="dg-line dg-ash" d="M70 32V232H480" />
        <path className="dg-line" d={line(100)} />
        <path className="dg-line dg-blue" d={line(105)} />
        {hs.map((h) => (
          <g key={h}>
            <rect className="dg-solid" x={X(h) - 3.5} y={Y(h - 100) - 3.5} width="7" height="7" />
            <rect className="dg-solid dg-blue" x={X(h) - 3.5} y={Y(h - 105) - 3.5} width="7" height="7" />
          </g>
        ))}
        <rect className="dg-solid" x="86" y="40" width="7" height="7" />
        <text className="dg-m" x="100" y="48">{t("group A", "grupo A")}</text>
        <rect className="dg-solid dg-blue" x="86" y="64" width="7" height="7" />
        <text className="dg-m" x="100" y="72">{t("group B", "grupo B")}</text>
        <text className="dg-m" x="275" y="276" textAnchor="middle">{t("height (cm)", "estatura (cm)")}</text>
        <text className="dg-m" x="18" y="132" textAnchor="middle" transform="rotate(-90 18 132)">{t("weight (kg)", "peso (kg)")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ PCA

const CLOUD = (() => {
  const r = seeded(11);
  const gauss = () => (r() + r() + r() + r() - 2) * 1.2;
  return Array.from({ length: 110 }, () => {
    const a = gauss() * 98, b = gauss() * 17;
    // along (0.8, -0.6) on screen (up and to the right), and across it
    return [260 + a * 0.8 - b * 0.6, 150 - a * 0.6 - b * 0.8];
  });
})();

function Pca({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  return (
    <Figure p={p} label={t("A cloud of points stretched along one direction; PC1 follows it, PC2 is the small leftover across it", "Una nube de puntos estirada en una dirección; PC1 la sigue, PC2 es el pequeño sobrante que la cruza")}>
      <svg viewBox="0 0 520 300">
        <Arrows />
        <path className="dg-line dg-ash" d="M56 24V270H496" />
        {CLOUD.map(([x, y], i) => (
          <rect key={i} className="dg-solid dg-ash" x={x - 2} y={y - 2} width="4" height="4" />
        ))}
        <path className="dg-line dg-thick dg-blue" d="M128 249L392 51" markerStart="url(#dg-arrow-blue)" markerEnd="url(#dg-arrow-blue)" />
        <path className="dg-line dg-thick" d="M284 182L236 118" markerStart="url(#dg-arrow)" markerEnd="url(#dg-arrow)" />
        <text className="dg-t dg-blue-t" x="404" y="46">PC1</text>
        <text className="dg-m" x="404" y="64">{t("most spread", "más dispersión")}</text>
        <text className="dg-t" x="150" y="100">PC2</text>
        <text className="dg-m" x="96" y="120">{t("what's left", "lo que sobra")}</text>
        <text className="dg-m" x="276" y="290" textAnchor="middle">{t("height", "estatura")}</text>
        <text className="dg-m" x="28" y="147" textAnchor="middle" transform="rotate(-90 28 147)">{t("weight", "peso")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ PCA next to ICA

function Compare({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const cols = [
    {
      name: "PCA",
      rows: [
        t("Declutters", "Despeja"),
        t("Two strings of the same color side by side: keep one", "Dos cuerdas del mismo color, una al lado de la otra: te quedas con una"),
        t("Cares about spread", "Le importa la dispersión"),
      ],
    },
    {
      name: "ICA",
      rows: [
        t("Unmixes", "Desmezcla"),
        t("Three strings of different colors tangled together: separate them", "Tres cuerdas de colores distintos enredadas: las separa"),
        t("Cares about independence", "Le importa la independencia"),
      ],
    },
  ];
  return (
    <figure className="note-figure note-diagram is-wide">
      <div className="dg-compare">
        {cols.map((c) => (
          <div key={c.name}>
            <p className="dg-compare-name">{c.name}</p>
            <ul>
              {c.rows.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {p.caption ? <figcaption>{p.caption}</figcaption> : null}
    </figure>
  );
}

// ------------------------------------------------------------------ line and parabola

function Curves({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  return (
    <Figure p={p} label={t("A straight line has one slope; a parabola's slope changes at every point", "Una recta tiene una sola pendiente; la de una parábola cambia en cada punto")}>
      <svg viewBox="0 0 520 190">
        <Arrows />
        <text className="dg-t" x="130" y="24" textAnchor="middle">{t("Line", "Recta")}</text>
        <text className="dg-t" x="390" y="24" textAnchor="middle">{t("Parabola", "Parábola")}</text>
        <path className="dg-line dg-thick" d="M50 150L210 80" markerStart="url(#dg-arrow)" markerEnd="url(#dg-arrow)" />
        <path className="dg-line dg-thick" d="M316 58Q390 246 464 58" markerStart="url(#dg-arrow)" markerEnd="url(#dg-arrow)" />
        <text className="dg-m" x="130" y="180" textAnchor="middle">{t("same slope everywhere", "la misma pendiente siempre")}</text>
        <text className="dg-m" x="390" y="180" textAnchor="middle">{t("the slope keeps changing", "la pendiente va cambiando")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ gradient descent

// the curve on screen: its lowest point is at x = 330 (y grows downward in an SVG)
const curveY = (x: number) => 206 - 0.002882 * (x - 330) * (x - 330);
const STEPS = (() => {
  const xs = [96];
  while (xs.length < 10) xs.push(xs[xs.length - 1] + 0.26 * (330 - xs[xs.length - 1]));
  xs.push(330);
  return xs;
})();

function Descent({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const [at, setAt] = useState(STEPS.length - 1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAt(0);
    const id = window.setInterval(() => setAt((n) => (n + 1) % (STEPS.length + 3)), 650);
    return () => window.clearInterval(id);
  }, []);
  const now = Math.min(at, STEPS.length - 1);
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = 84 + i * 5;
    return `${i ? "L" : "M"}${x} ${curveY(x).toFixed(1)}`;
  }).join("");
  return (
    <Figure p={p} label={t("Gradient descent: starting high on the curve, each step goes downhill and gets smaller, until the minimum", "Descenso de gradiente: empezando arriba en la curva, cada paso baja y se hace más pequeño, hasta el mínimo")}>
      <svg viewBox="0 0 520 262">
        <Arrows />
        <path className="dg-line dg-ash" d="M60 232V26" markerEnd="url(#dg-arrow-ash)" />
        <path className="dg-line dg-ash" d="M60 232H496" markerEnd="url(#dg-arrow-ash)" />
        <text className="dg-m" x="54" y="20" textAnchor="middle">{t("cost", "costo")}</text>
        <text className="dg-m" x="496" y="252" textAnchor="end">{t("weight", "peso")}</text>
        <path className="dg-line dg-thick" d={curve} />
        <path className="dg-line dg-dash dg-ash" d={`M${STEPS[0]} ${curveY(STEPS[0])}V232M330 ${curveY(330)}V232`} />
        {STEPS.map((x, i) => (
          <rect
            key={i}
            className={i === now ? "dg-solid dg-blue" : i < now ? "dg-solid" : "dg-solid dg-faint"}
            x={x - (i === now ? 5 : 3.5)}
            y={curveY(x) - (i === now ? 5 : 3.5)}
            width={i === now ? 10 : 7}
            height={i === now ? 10 : 7}
          />
        ))}
        <text className="dg-m" x={STEPS[0]} y="252" textAnchor="middle">{t("random start", "inicio al azar")}</text>
        <text className="dg-m" x="330" y="252" textAnchor="middle">{t("minimum", "mínimo")}</text>
        <path className="dg-line dg-thin dg-ash" d="M196 96L172 118" />
        <text className="dg-m" x="200" y="92">{t("one learning step", "un paso de aprendizaje")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------ loss landscape

// a bumpy surface with a deep valley, a shallow one and a hill ("peaks")
const height = (x: number, y: number) =>
  3 * (1 - x) * (1 - x) * Math.exp(-x * x - (y + 1) * (y + 1)) -
  10 * (x / 5 - x * x * x - y ** 5) * Math.exp(-x * x - y * y) -
  Math.exp(-(x + 1) * (x + 1) - y * y) / 3;

const LAND = (() => {
  const N = 26;
  // seen from a corner, a little from above (y is flipped so the deep valley faces us)
  const proj = (x: number, y: number) => {
    const z = height(x, -y);
    return [280 + (x - y) * 42, 172 + (x + y) * 25 - z * 6.5, z] as const;
  };
  const at = (i: number, j: number) => proj(-3 + (6 * i) / N, -3 + (6 * j) / N);
  const quads: { d: string; depth: number }[] = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
      quads.push({ d: `M${c.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}z`, depth: i + j });
    }
  quads.sort((a, b) => a.depth - b.depth); // far ones first, so near ones cover them
  // the surface's two valleys: the lowest point, and a smaller dip beside the hill
  return { quads, deep: proj(0.23, 1.63), shallow: proj(-1.35, -0.2) };
})();

function Landscape({ p }: { p: P }) {
  const { lang } = useLang();
  const t = (en: string, es: string) => tr(lang, en, es);
  const { quads, deep, shallow } = LAND;
  return (
    <Figure p={p} label={t("A loss landscape in 3D with hills, a deep valley and a shallower one", "Un paisaje de pérdida en 3D con colinas, un valle profundo y otro menos profundo")} wide>
      <svg viewBox="0 0 560 352">
        {quads.map((q, i) => (
          <path key={i} className="dg-quad" d={q.d} />
        ))}
        <rect className="dg-solid dg-blue" x={deep[0] - 5} y={deep[1] - 5} width="10" height="10" />
        <path className="dg-line dg-thin dg-blue" d={`M${deep[0]} ${deep[1] + 7}V326`} />
        <text className="dg-t dg-blue-t" x={deep[0]} y="345" textAnchor="middle">{t("deepest valley: the goal", "el valle más profundo: la meta")}</text>
        <rect className="dg-solid" x={shallow[0] - 4} y={shallow[1] - 4} width="8" height="8" />
        <path className="dg-line dg-thin" d={`M${shallow[0]} ${shallow[1] - 6}V24`} />
        <text className="dg-t" x={Math.max(150, shallow[0])} y="16" textAnchor="middle">{t("a shallow valley: a trap", "un valle menos profundo: una trampa")}</text>
      </svg>
    </Figure>
  );
}

// ------------------------------------------------------------------

export function LearnFigure({ name, props }: { name: string; props: P }): React.ReactNode | undefined {
  if (name === "loop") return <Loop p={props} />;
  if (name === "projects") return <Projects p={props} />;
  if (name === "karaoke") return <Karaoke p={props} />;
  if (name === "bell") return <Bell p={props} />;
  if (name === "houses") return <Houses p={props} />;
  if (name === "trend") return <Trend p={props} />;
  if (name === "pca") return <Pca p={props} />;
  if (name === "compare") return <Compare p={props} />;
  if (name === "curves") return <Curves p={props} />;
  if (name === "descent") return <Descent p={props} />;
  if (name === "landscape") return <Landscape p={props} />;
  return undefined;
}
