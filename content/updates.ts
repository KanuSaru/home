// The updates log: what changed on the site, newest first.
// The sidebar shows the latest three; /updates/ shows them all.
// Add an entry at the top: { date: "2026-11-15", text: { en: "…", es: "…" } }

import type { L } from "./site";

export type Update = { date: string; text: L };

export const updates: Update[] = [
  {
    date: "2026-11-02",
    text: {
      en: "Every page now has its own Spanish address (/es/…), so the Spanish version can be found and shared. The switch at the top takes you to it.",
      es: "Cada página tiene ahora su propia dirección en español (/es/…), así la versión en español se puede encontrar y compartir. El botón de arriba te lleva a ella.",
    },
  },
  {
    date: "2026-11-02",
    text: {
      en: "New page: Learn ML, a free route into machine learning with checklists that remember your progress. Built on Ri's course at lachinemearning.com.",
      es: "Página nueva: Aprende ML, una ruta gratis hacia el machine learning con listas que recuerdan tu progreso. Hecha sobre el curso de Ri en lachinemearning.com.",
    },
  },
  {
    date: "2026-11-02",
    text: {
      en: 'Meet my daily driver: the Steam Deck. It now turns in 3D on the “Me” page. Drag it around. It’s drawn by dither-model, a new package that turns any STL into 1-bit pixel art.',
      es: 'Les presento a mi compañera: la Steam Deck. Ahora gira en 3D en la página “Yo”; pueden arrastrarla. La dibuja dither-model, un paquete nuevo que convierte cualquier STL en pixel art de 1 bit.',
    },
  },
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
