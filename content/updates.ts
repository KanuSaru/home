// The updates log: what changed on the site, newest first.
// The sidebar shows the latest three; /updates/ shows them all.
// Add an entry at the top: { date: "2026-11-15", text: { en: "…", es: "…" } }

import type { L } from "./site";

export type Update = { date: string; text: L };

export const updates: Update[] = [
  {
    date: "2026-11-01",
    text: {
      en: "Brought over ideas from my first site on Nekoweb: a guestbook, this updates log, my mood, the quote under my name, and a button to link to me.",
      es: "Traje ideas de mi primer sitio en Nekoweb: un libro de visitas, este registro de cambios, mi estado de ánimo, la frase bajo mi nombre y un botón para enlazarme.",
    },
  },
  {
    date: "2026-11-01",
    text: {
      en: "A music player in the sidebar. It's its own package now, dither-player, for anyone who wants one.",
      es: "Un reproductor de música en la barra lateral. Ahora es su propio paquete, dither-player, para quien quiera uno.",
    },
  },
  {
    date: "2026-10-31",
    text: {
      en: "Notes are open, starting with how dither-moon draws the Moon. They have an RSS feed too.",
      es: "Las notas están abiertas, empezando por cómo dither-moon dibuja la Luna. También tienen feed RSS.",
    },
  },
  {
    date: "2026-10-31",
    text: {
      en: "The journal has its first entry. Solve the riddle to read it.",
      es: "El diario tiene su primera entrada. Resuelve el acertijo para leerla.",
    },
  },
  {
    date: "2026-10-31",
    text: {
      en: "A Work page, with my CVs to download.",
      es: "Una página de trabajo, con mis CV para descargar.",
    },
  },
];
