// What search engines and AI assistants read about the site: page titles and
// descriptions (not shown on the page itself), and the facts about me that go into
// the structured data and llms.txt. Edit freely.

import type { L } from "./site";

export type SeoPage = "home" | "me" | "work" | "notes" | "learn" | "guestbook" | "updates" | "journal";

/** The name people search for comes first; Kanu is the alias. */
export const siteName = "Erick Donado (Kanu)";

export const pages: Record<SeoPage, { title: L; description: L }> = {
  home: {
    title: { en: siteName, es: siteName },
    description: {
      en: "Personal site of Erick Donado (Kanu), a Systems Engineering student at Universidad Simón Bolívar in Barranquilla, Colombia, who researches machine learning for medical imaging.",
      es: "Sitio personal de Erick Donado (Kanu), estudiante de Ingeniería de Sistemas en la Universidad Simón Bolívar de Barranquilla, Colombia, que investiga machine learning aplicado a imágenes médicas.",
    },
  },
  me: {
    title: { en: "Me", es: "Yo" },
    description: {
      en: "Who Erick Donado is outside a CV: the music, games, books and art he loves, and the Steam Deck he does everything on.",
      es: "Quién es Erick Donado por fuera de una hoja de vida: la música, los juegos, los libros y el arte que ama, y la Steam Deck en la que hace todo.",
    },
  },
  work: {
    title: { en: "Work", es: "Trabajo" },
    description: {
      en: "Erick Donado's research on breast cancer segmentation in ultrasound and bias in language models, his publications, talks, teaching and projects, with research and industry CVs.",
      es: "La investigación de Erick Donado en segmentación de cáncer de mama en ultrasonido y sesgos en modelos de lenguaje, sus publicaciones, ponencias, docencia y proyectos, con hojas de vida de investigación e industria.",
    },
  },
  notes: {
    title: { en: "Notes", es: "Notas" },
    description: {
      en: "Erick Donado's academic notes on machine learning, graphics and systems, with an RSS feed.",
      es: "Las notas académicas de Erick Donado sobre machine learning, gráficos y sistemas, con feed RSS.",
    },
  },
  learn: {
    title: { en: "Learn ML", es: "Aprende ML" },
    description: {
      en: "A free, self-taught route into machine learning: maths, Python, data science, deep learning and LLMs, in order, with checklists that remember your progress.",
      es: "Una ruta gratis y autodidacta hacia el machine learning: matemáticas, Python, ciencia de datos, deep learning y LLMs, en orden, con listas que recuerdan tu progreso.",
    },
  },
  guestbook: {
    title: { en: "Guestbook", es: "Libro de visitas" },
    description: {
      en: "Leave a message on Erick Donado's guestbook.",
      es: "Deja un mensaje en el libro de visitas de Erick Donado.",
    },
  },
  updates: {
    title: { en: "Updates", es: "Cambios" },
    description: {
      en: "Everything that has changed on Erick Donado's site, newest first.",
      es: "Todo lo que ha cambiado en el sitio de Erick Donado, de lo más reciente a lo más antiguo.",
    },
  },
  journal: {
    title: { en: "Journal", es: "Diario" },
    description: { en: "A locked journal.", es: "Un diario con llave." },
  },
};

// Proof that the site is yours, for Google Search Console and Bing Webmaster Tools.
// Choose "HTML tag" when they ask how to verify, and paste only the content="…" value.
// (With a custom domain you can verify through DNS instead and leave these empty.)
export const verification = {
  google: "",
  bing: "",
};

// Facts about me, for structured data (schema.org) and llms.txt.
export const person = {
  name: "Erick Donado",
  fullName: "Erick Fabián Donado Fonseca",
  alternateNames: ["Kanu", "KanuSaru", "Erick Fabián Donado Fonseca"],
  jobTitle: { en: "Systems Engineering student and machine learning researcher", es: "Estudiante de Ingeniería de Sistemas e investigador en machine learning" },
  university: "Universidad Simón Bolívar",
  universityUrl: "https://www.unisimon.edu.co/",
  city: "Barranquilla",
  country: "CO",
  knowsAbout: [
    "Machine learning",
    "Deep learning",
    "Medical image segmentation",
    "U-Net",
    "Breast ultrasound",
    "Bias in large language models",
    "Python",
    "C",
    "Web development",
    "Competitive programming",
  ],
  languages: ["es", "en"],
  // profiles that belong to me: they tie the site to everything else with my name on it
  sameAs: [
    "https://github.com/KanuSaru",
    "https://linkedin.com/in/erickdonado",
    "https://orcid.org/0009-0008-5752-3255",
    "https://steamcommunity.com/id/KanuSaru/",
    "https://kanusaru.nekoweb.org/",
  ],
  summary: {
    en: "Erick Donado (Kanu) is a Systems Engineering student at Universidad Simón Bolívar in Barranquilla, Colombia. He researches machine learning in the university's Data Sciences research seedbed: U-Net models that segment breast cancer in ultrasound images (a 2026 journal article and a 2024 book chapter), racial and gender bias in large language models, and a machine learning framework written in C. He teaches programming and maths, and builds open-source tools such as dither-moon, dither-player and dither-model.",
    es: "Erick Donado (Kanu) es estudiante de Ingeniería de Sistemas en la Universidad Simón Bolívar de Barranquilla, Colombia. Investiga en machine learning en el semillero Data Sciences de la universidad: modelos U-Net que segmentan cáncer de mama en imágenes de ultrasonido (un artículo de revista de 2026 y un capítulo de libro de 2024), sesgos raciales y de género en modelos de lenguaje, y un framework de machine learning escrito en C. Enseña programación y matemáticas, y construye herramientas de código abierto como dither-moon, dither-player y dither-model.",
  },
};

// The publications, as structured data on the Work page.
export const publications = [
  {
    type: "ScholarlyArticle" as const,
    year: "2026",
    title: {
      en: "Automated breast cancer segmentation in ultrasound images using convolutional neural networks",
      es: "Segmentación automatizada de cáncer de mama en imágenes de ultrasonidos mediante redes neuronales convolucionales",
    },
    venue: { type: "Periodical", name: "Publicaciones e Investigación" },
    publisher: "Universidad Nacional Abierta y a Distancia (UNAD)",
    inLanguage: "es",
  },
  {
    type: "Chapter" as const,
    year: "2024",
    title: {
      en: "Automated breast cancer segmentation in ultrasound images using self-learning deep learning models",
      es: "Segmentación automatizada del cáncer de mama en imágenes de ultrasonido usando modelos de aprendizaje profundo autoaprendientes",
    },
    venue: { type: "Book", name: "Conectando puntos" },
    publisher: "Ediciones Universidad Simón Bolívar",
    inLanguage: "es",
  },
];
