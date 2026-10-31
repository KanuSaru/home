// The Work page, in English and Spanish. Edit freely; the page only lays it out.

import type { L } from "./site";

export type Line = { when: string | L; title: L; detail?: L; href?: string };

export const work = {
  title: { en: "Work", es: "Trabajo" },
  lede: {
    en: "Research, teaching and the things I build.",
    es: "Investigación, docencia y las cosas que construyo.",
  },

  // CV PDFs: put the files in public/cv/ and write their names here.
  // A button only appears for a file that's set.
  cv: {
    research: "Erick_Donado_CV_Research.pdf",
    industry: "Erick_Donado_CV_Industry.pdf",
  },
  cvLabels: {
    research: { en: "CV, research", es: "CV, investigación" },
    industry: { en: "CV, industry", es: "CV, industria" },
    note: { en: "PDF", es: "PDF" },
  },

  research: {
    title: { en: "Research", es: "Investigación" },
    where: {
      en: "Data Sciences research seedbed, Universidad Simón Bolívar, since 2023. Advisor: Dr. Juan Carlos Calabria Sarmiento.",
      es: "Semillero de investigación Data Sciences, Universidad Simón Bolívar, desde 2023. Tutor: Dr. Juan Carlos Calabria Sarmiento.",
    },
    lines: [
      {
        when: "2024–26",
        title: { en: "Breast cancer segmentation", es: "Segmentación de cáncer de mama" },
        detail: {
          en: "U-Net models that outline tumors in breast ultrasound images.",
          es: "Modelos U-Net que delinean tumores en imágenes de ultrasonido de mama.",
        },
      },
      {
        when: "2026",
        title: { en: "Bias in large language models", es: "Sesgos en modelos de lenguaje" },
        detail: {
          en: "How LLMs represent Afro-Colombian people, across race and gender.",
          es: "Cómo los LLM representan a las personas afrocolombianas, cruzando raza y género.",
        },
      },
      {
        when: "2026",
        title: { en: "Machine learning from the low level", es: "Machine learning desde bajo nivel" },
        detail: {
          en: "A machine learning framework written in plain C.",
          es: "Un framework de machine learning escrito en C puro.",
        },
      },
    ] as Line[],
    elite: {
      en: "Elite certification of the institutional research seedbed program (2025).",
      es: "Certificación Élite del programa institucional de semilleros (2025).",
    },
    mask: {
      en: "A segmentation mask, like the ones my models draw. It follows your pointer.",
      es: "Una máscara de segmentación, como las que dibujan mis modelos. Sigue tu puntero.",
    },
    maskTouch: {
      en: "A segmentation mask, like the ones my models draw. Drag across it.",
      es: "Una máscara de segmentación, como las que dibujan mis modelos. Arrástrala.",
    },
  },

  publications: {
    title: { en: "Publications", es: "Publicaciones" },
    lines: [
      {
        when: "2026",
        title: {
          en: "Automated breast cancer segmentation in ultrasound images using convolutional neural networks",
          es: "Segmentación automatizada de cáncer de mama en imágenes de ultrasonidos mediante redes neuronales convolucionales",
        },
        detail: {
          en: "Journal article, Publicaciones e Investigación, UNAD. Sole author.",
          es: "Artículo, revista Publicaciones e Investigación, UNAD. Autor único.",
        },
      },
      {
        when: "2024",
        title: {
          en: "Automated breast cancer segmentation in ultrasound images using self-learning deep learning models",
          es: "Segmentación automatizada del cáncer de mama en imágenes de ultrasonido usando modelos de aprendizaje profundo autoaprendientes",
        },
        detail: {
          en: "Book chapter, first author, in Conectando puntos (Ediciones Universidad Simón Bolívar).",
          es: "Capítulo de libro, primer autor, en Conectando puntos (Ediciones Universidad Simón Bolívar).",
        },
      },
    ] as Line[],
  },

  talks: {
    title: { en: "Talks", es: "Ponencias" },
    lines: [
      {
        when: { en: "Oct 2026", es: "oct 2026" },
        title: {
          en: "Racial and gender bias in large language models",
          es: "Sesgos raciales y de género en modelos de lenguaje de gran escala",
        },
        detail: { en: "XI International Seminar on Engineering and Design, Unisimón", es: "XI Seminario Internacional de Ingeniería y Diseño, Unisimón" },
      },
      {
        when: { en: "May 2026", es: "may 2026" },
        title: {
          en: "Rethinking machine learning from the low level: a framework in C",
          es: "Replanteando el machine learning desde bajo nivel: un framework en C",
        },
        detail: { en: "1st ACOFI Regional Meeting on Research and Innovation", es: "I Encuentro Regional de Investigación e Innovación ACOFI" },
      },
      {
        when: { en: "Sep 2025", es: "sept 2025" },
        title: { en: "Breast cancer segmentation with deep learning", es: "Segmentación de cáncer de mama con deep learning" },
        detail: { en: "EIEI ACOFI / CLADI, Cartagena", es: "EIEI ACOFI / CLADI, Cartagena" },
      },
      {
        when: { en: "May 2025", es: "may 2025" },
        title: { en: "Breast cancer segmentation with deep learning", es: "Segmentación de cáncer de mama con deep learning" },
        detail: { en: "Expotech UNAD, Bogotá · XXII RedCOLSI Atlántico meeting", es: "Expotech UNAD, Bogotá · XXII Encuentro RedCOLSI Atlántico" },
      },
      {
        when: { en: "Oct 2024", es: "oct 2024" },
        title: { en: "The evolution of AI and competitive programming", es: "La evolución de la IA y la programación competitiva" },
        detail: { en: "Invited talk, IEEE chapters launch, UNITECNAR, Cartagena", es: "Charla invitada, lanzamiento de capítulos IEEE, UNITECNAR, Cartagena" },
      },
      {
        when: { en: "Sep 2024", es: "sept 2024" },
        title: { en: "Breast cancer segmentation with deep learning", es: "Segmentación de cáncer de mama con deep learning" },
        detail: { en: "IX International Meeting on Artificial Intelligence, Unisimón", es: "IX Encuentro Internacional de Inteligencia Artificial, Unisimón" },
      },
      {
        when: { en: "May 2024", es: "may 2024" },
        title: { en: "Breast cancer segmentation with deep learning", es: "Segmentación de cáncer de mama con deep learning" },
        detail: { en: "XVI RedCOLSI Regional Meeting", es: "XVI Encuentro Regional RedCOLSI" },
      },
    ] as Line[],
  },

  teaching: {
    title: { en: "Teaching", es: "Docencia" },
    lines: [
      {
        when: "2024–26",
        title: { en: "Private classes, Chico Vence Academy", es: "Clases particulares, Academia Chico Vence" },
        detail: {
          en: "Math, geometry, statistics, physics, English and programming, from elementary school students to university.",
          es: "Matemáticas, geometría, estadística, física, inglés y programación, desde primaria hasta la universidad.",
        },
      },
      {
        when: "2024",
        title: { en: "Competitive programming coach, IEEEXtreme", es: "Entrenador de programación competitiva, IEEEXtreme" },
        detail: {
          en: "27 weekly sessions (108 hours) of data structures and algorithms for an IEEE Computer Society team, vacations included.",
          es: "27 sesiones semanales (108 horas) de estructuras de datos y algoritmos para un equipo de IEEE Computer Society, vacaciones incluidas.",
        },
      },
      {
        when: "2023–25",
        title: { en: "Teaching assistant, CAMFI, Unisimón", es: "Monitor académico, CAMFI, Unisimón" },
        detail: {
          en: "Tutoring in algorithms and programming for undergraduates.",
          es: "Tutorías de algoritmos y programación para estudiantes de pregrado.",
        },
      },
      {
        when: "2024",
        title: { en: "Workshop: data analysis and visualization with Python", es: "Taller: análisis y visualización de datos con Python" },
        detail: { en: "IEEE Computer Society, Unisimón chapter", es: "Capítulo IEEE Computer Society, Unisimón" },
      },
      {
        when: "2024",
        title: { en: "Foundations of teaching (120 hours)", es: "Formación en fundamentos básicos para la docencia (120 horas)" },
        detail: { en: "Course, Unisimón Pedagogy Department", es: "Curso, Departamento de Pedagogía, Unisimón" },
      },
    ] as Line[],
  },

  leadership: {
    title: { en: "Leadership and community", es: "Liderazgo y comunidad" },
    lines: [
      {
        when: "2024–26",
        title: { en: "President, IEEE Computational Intelligence Society student chapter", es: "Presidente, capítulo estudiantil IEEE Computational Intelligence Society" },
        detail: { en: "Universidad Simón Bolívar", es: "Universidad Simón Bolívar" },
      },
      {
        when: "2024",
        title: { en: "University Leadership School, 4th edition", es: "Escuela de Liderazgo Universitario, 4.ª edición" },
        detail: { en: "Unisimón student welfare office", es: "Bienestar Universitario, Unisimón" },
      },
      {
        when: "2024",
        title: { en: "Volunteer, Hacktoberfest Barranquilla", es: "Voluntario, Hacktoberfest Barranquilla" },
        detail: { en: "CaribeDev", es: "CaribeDev" },
      },
    ] as Line[],
  },

  projects: {
    title: { en: "Projects", es: "Proyectos" },
    lines: [
      {
        when: "2026",
        title: { en: "dither-moon", es: "dither-moon" },
        detail: {
          en: "Open-source library: the Moon at its real phase as 1-bit pixel art, from NASA's maps. On npm. It's the moon on this site.",
          es: "Librería de código abierto: la Luna en su fase real como pixel art de 1 bit, a partir de los mapas de la NASA. En npm. Es la luna de este sitio.",
        },
        href: "https://github.com/KanuSaru/dither-moon",
      },
      {
        when: "2026",
        title: { en: "Living Dex Planner", es: "Living Dex Planner" },
        detail: {
          en: "Plans the fastest way to complete a Pokémon living dex across game generations, with PokéAPI.",
          es: "Planea la forma más rápida de completar una living dex de Pokémon entre generaciones, con PokéAPI.",
        },
        href: "https://kanusaru.github.io/living-dex-planner/",
      },
      {
        when: "2026",
        title: { en: "Valle Sombrío", es: "Valle Sombrío" },
        detail: {
          en: "A Halloween SQL challenge with a live leaderboard. FastAPI, Railway, GitHub Pages.",
          es: "Un reto de SQL de Halloween con tabla de posiciones en vivo. FastAPI, Railway, GitHub Pages.",
        },
      },
      {
        when: "2026",
        title: { en: "OTP sign-in API", es: "API de inicio de sesión con OTP" },
        detail: {
          en: "One-time codes by email and JWT sessions. FastAPI, SQLAlchemy.",
          es: "Códigos de un solo uso por correo y sesiones JWT. FastAPI, SQLAlchemy.",
        },
      },
    ] as Line[],
  },

  awards: {
    title: { en: "Competitions and certificates", es: "Competencias y certificados" },
    lines: [
      {
        when: "2026",
        title: { en: "Fundamentals of Generative AI (75 h)", es: "Curso de Fundamentos de Inteligencia Artificial Generativa (75 h)" },
        detail: {
          en: "Universidad Internacional de La Rioja (UNIR), Spain. Grade 9.9/10.",
          es: "Universidad Internacional de La Rioja (UNIR), España. Calificación 9,9/10.",
        },
      },
      { when: "2025", title: { en: "NASA Space Apps Challenge", es: "NASA Space Apps Challenge" } },
      { when: "2025", title: { en: "GDG Barranquilla “Build with AI” hackathon (48 h)", es: "Hackatón “Build with AI” de GDG Barranquilla (48 h)" } },
      { when: "2025", title: { en: "IEEE certification in web design and development", es: "Certificación IEEE en diseño y desarrollo web" } },
      { when: "2025", title: { en: "COIL “Data and SDGs” with Universidad de Cádiz, Spain", es: "COIL “Datos y ODS” con la Universidad de Cádiz, España" } },
      { when: "2024", title: { en: "IEEEXtreme 18.0, team AngryKittens", es: "IEEEXtreme 18.0, equipo AngryKittens" } },
      { when: "2024", title: { en: "Winner, SolidWorks course contest, IEEE Uniautónoma", es: "Ganador, concurso del curso de SolidWorks, IEEE Uniautónoma" } },
    ] as Line[],
  },

  education: {
    title: { en: "Education", es: "Formación" },
    degree: { en: "Systems Engineering", es: "Ingeniería de Sistemas" },
    school: { en: "Universidad Simón Bolívar, Barranquilla · 2023 – now", es: "Universidad Simón Bolívar, Barranquilla · 2023 – actualidad" },
    notes: [
      { en: "GPA 4.05 / 5.00", es: "Promedio 4.05 / 5.00" },
      {
        en: "Honor roll, Undergraduate Research Excellence (Elite), 2025-2 and 2026-1",
        es: "Cuadro de honor, Excelencia Investigativa en Pregrado (Élite), 2025-2 y 2026-1",
      },
      { en: "English C1", es: "Inglés C1" },
    ] as L[],
  },
};
