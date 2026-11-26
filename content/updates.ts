// The updates log: what changed on the site, newest first.
// The sidebar shows the latest three; /updates/ shows them all.
// Add an entry at the top: { date: "2026-11-15", text: { en: "…", es: "…" } }

import type { L } from "./site";

export type Update = { date: string; text: L };

export const updates: Update[] = [
  {
    date: "2026-11-26",
    text: {
      en: "A friend's scroll wheel died and he couldn't get around the site, so now there's a scrollbar: on a computer, move the mouse to the right edge and it appears. On phones, a Menu button opens the sidebar from the right, and my name and the language switch stay beside \u201cKanu\u201d. Oh, and the site finally has its own icon.",
      es: "A un amigo se le dañó la rueda del mouse y no podía moverse por el sitio, así que ahora hay barra de desplazamiento: en computador, lleva el mouse al borde derecho y aparece. En celular, un botón de Menú abre la barra lateral desde la derecha, y mi nombre y el cambio de idioma se quedan al lado de \u201cKanu\u201d. Ah, y el sitio por fin tiene su propio ícono.",
    },
  },
  {
    date: "2026-11-18",
    text: {
      en: "My home has its own address now: erickdonado.com. Old links still work and take you here. Two new tools are on the Work page as well: leave-a-mark, the guestbook behind this site, and still-breathing, which checks every link here once a month.",
      es: "Mi hogar ya tiene su propia dirección: erickdonado.com. Los enlaces viejos siguen funcionando y te traen aquí. También hay dos herramientas nuevas en la página de Trabajo: leave-a-mark, el libro de visitas de este sitio, y still-breathing, que revisa cada enlace de aquí una vez al mes.",
    },
  },
  {
    date: "2026-11-13",
    text: {
      en: "Learn ML got easier to follow: time estimates, essentials marked apart from extras, a self-check at the end of each phase, a glossary, and a code to back up your progress. Notes now show their reading time and sections.",
      es: "Aprende ML es más fácil de seguir: tiempos estimados, lo esencial separado de lo extra, una autoevaluación al final de cada fase, un glosario y un código para respaldar tu progreso. Las notas ahora muestran su tiempo de lectura y sus secciones.",
    },
  },
  {
    date: "2026-11-10",
    text: {
      en: "The journal is now a sealed envelope: solve the riddle, the wax seal breaks, and the entries read as handwritten letters. Also: the songs I've played most this month in the Music widget, and longer versions of the two notes for Learn ML.",
      es: "El diario ahora es un sobre sellado: resuelve el acertijo, el sello de cera se rompe y las entradas se leen como cartas escritas a mano. Además: las canciones que más he escuchado este mes en el widget de Música y versiones más completas de las dos notas de Aprende ML.",
    },
  },
  {
    date: "2026-11-02",
    text: {
      en: "Two new notes to read before Learn ML: why machine learning needs maths, and how to learn to code when AI can write it for you.",
      es: "Dos notas nuevas para leer antes de Aprende ML: por qué el machine learning necesita matemáticas y cómo aprender a programar cuando la IA puede hacerlo por ti.",
    },
  },
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
      en: "New page: Learn ML, a free route into machine learning with checklists that remember your progress.",
      es: "Página nueva: Aprende ML, una ruta gratis hacia el machine learning con listas que recuerdan tu progreso.",
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
