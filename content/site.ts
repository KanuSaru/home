// Everything you read on the site lives here, in English and Spanish.
// Each piece of text is { en, es }. Components only handle layout.

export type L = { en: string; es: string };

// ---------------------------------------------------------------------------
// Accounts for the live widgets. Leave a value empty and its widget says
// "Not connected yet" instead of breaking.
// ---------------------------------------------------------------------------
export const config = {
  lastfm: {
    user: "KanuSaru",
    // Free read-only key from https://www.last.fm/api/account/create (the API key,
    // never the shared secret). Empty until you create one.
    apiKey: "",
  },
  discordId: "405104130110128150", // read through Lanyard (discord.gg/lanyard)
  goatcounter: "kanu", // kanu.goatcounter.com
  place: { name: "Barranquilla", lat: 10.9685, lon: -74.7813, timeZone: "America/Bogota" },
  // Your taped photo: put the image in public/ (e.g. public/avatar.jpg) and write its name here.
  avatar: "",
};

export const ui = {
  skip: { en: "Skip to content", es: "Ir al contenido" },
  language: { en: "Language", es: "Idioma" },
  pages: { en: "Pages", es: "Páginas" },
  soon: { en: "soon", es: "pronto" },
  locked: { en: "locked", es: "con llave" },
  example: { en: "example", es: "ejemplo" },
  notConnected: { en: "Not connected yet.", es: "Aún sin conectar." },
  unavailable: { en: "Unavailable right now.", es: "No disponible en este momento." },
  madeIn: { en: "Made in Barranquilla", es: "Hecho en Barranquilla" },
  favorite: { en: "all-time favorite", es: "favorito de siempre" },
};

export type NavItem = { id: "home" | "me" | "work" | "notes" | "journal"; label: L; soon?: boolean; locked?: boolean };

export const nav: NavItem[] = [
  { id: "home", label: { en: "Home", es: "Inicio" } },
  { id: "me", label: { en: "Me", es: "Yo" } },
  { id: "work", label: { en: "Work", es: "Trabajo" }, soon: true },
  { id: "notes", label: { en: "Notes", es: "Notas" }, soon: true },
  { id: "journal", label: { en: "Journal", es: "Diario" }, locked: true },
];

export const widgets = {
  time: {
    title: { en: "Local time", es: "Hora local" },
    here: { en: "Here in Barranquilla it's", es: "Aquí en Barranquilla son las" },
    same: { en: "Same time as you.", es: "La misma hora que tú." },
    ahead: { en: "You're {n} ahead of me.", es: "Vas {n} adelante de mí." },
    behind: { en: "You're {n} behind me.", es: "Vas {n} atrás de mí." },
    hour: { en: "1 hour", es: "1 hora" },
    hours: { en: "{n} hours", es: "{n} horas" },
  },
  weather: {
    title: { en: "Weather", es: "Clima" },
    humidity: { en: "humidity", es: "humedad" },
  },
  music: {
    title: { en: "Now playing", es: "Sonando" },
    now: { en: "Playing right now", es: "Sonando ahora mismo" },
    last: { en: "Last played {t}", es: "Sonó {t}" },
    via: { en: "via Last.fm", es: "vía Last.fm" },
  },
  discord: {
    title: { en: "On Discord", es: "En Discord" },
    online: { en: "Online", es: "En línea" },
    idle: { en: "Away", es: "Ausente" },
    dnd: { en: "Do not disturb", es: "No molestar" },
    offline: { en: "Offline", es: "Desconectado" },
    playing: { en: "Playing {x}", es: "Jugando {x}" },
  },
  visitors: {
    title: { en: "Visitors", es: "Visitantes" },
    note: { en: "people have passed through", es: "personas han pasado por aquí" },
  },
  moon: {
    title: { en: "Today's moon", es: "La luna de hoy" },
    caption: {
      en: "The real phase, right now. Drag it to see the far side.",
      es: "La fase real, ahora mismo. Arrástrala para ver la cara oculta.",
    },
    lit: { en: "{n}% lit", es: "{n}% iluminada" },
    fullIn: { en: "Full moon in {n} days", es: "Luna llena en {n} días" },
    fullTonight: { en: "Full moon tonight", es: "Luna llena esta noche" },
    phases: [
      { en: "New moon", es: "Luna nueva" },
      { en: "Waxing crescent", es: "Luna creciente" },
      { en: "First quarter", es: "Cuarto creciente" },
      { en: "Waxing gibbous", es: "Gibosa creciente" },
      { en: "Full moon", es: "Luna llena" },
      { en: "Waning gibbous", es: "Gibosa menguante" },
      { en: "Last quarter", es: "Cuarto menguante" },
      { en: "Waning crescent", es: "Luna menguante" },
    ],
  },
};

// WMO weather codes, as used by Open-Meteo
export const weatherWords: Record<number, L> = {
  0: { en: "clear sky", es: "despejado" },
  1: { en: "mostly clear", es: "mayormente despejado" },
  2: { en: "partly cloudy", es: "parcialmente nublado" },
  3: { en: "overcast", es: "nublado" },
  45: { en: "fog", es: "niebla" },
  48: { en: "fog", es: "niebla" },
  51: { en: "light drizzle", es: "llovizna ligera" },
  53: { en: "drizzle", es: "llovizna" },
  55: { en: "heavy drizzle", es: "llovizna fuerte" },
  61: { en: "light rain", es: "lluvia ligera" },
  63: { en: "rain", es: "lluvia" },
  65: { en: "heavy rain", es: "lluvia fuerte" },
  80: { en: "rain showers", es: "chubascos" },
  81: { en: "rain showers", es: "chubascos" },
  82: { en: "violent showers", es: "chubascos fuertes" },
  95: { en: "thunderstorm", es: "tormenta eléctrica" },
  96: { en: "thunderstorm with hail", es: "tormenta con granizo" },
  99: { en: "thunderstorm with hail", es: "tormenta con granizo" },
};

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
export const home = {
  intro: {
    en: "I'm Erick Donado, or at least I'm lucky enough to believe so. A product of everything around me, passionate about every kind of art and the wonders of the earth and of space.",
    es: "Soy Erick Donado, o al menos tengo la fortuna de creerlo. Producto de todo lo que me rodea, apasionado por todo tipo de arte y por las maravillas de la tierra y del espacio.",
  },
  sub: {
    en: "I study Systems Engineering in Barranquilla and do research on machine learning. Lately I'm obsessed with Oxygen Not Included, making tracks on a sampler, and playing chess, not well but with a lot of joy.",
    es: "Estudio Ingeniería de Sistemas en Barranquilla e investigo en machine learning. Últimamente estoy obsesionado con Oxygen Not Included, haciendo tracks en un sampler y jugando ajedrez, no muy bien pero con mucho gusto.",
  },
  meLink: { en: "More about me", es: "Más sobre mí" },
  scene: {
    label: {
      en: "A white lily in pixel art, slowly opening and closing.",
      es: "Un lirio blanco en pixel art, que se abre y se cierra despacio.",
    },
    hint: {
      en: "Drag to turn the lily.",
      es: "Arrastra para girar el lirio.",
    },
  },
  madeTitle: { en: "Things I've made", es: "Cosas que he hecho" },
  notes: {
    title: { en: "Notes", es: "Notas" },
    text: {
      en: "Academic writing: machine learning, systems, and whatever I'm studying.",
      es: "Escritos académicos: machine learning, sistemas y lo que esté estudiando.",
    },
    empty: { en: "Nothing posted yet.", es: "Aún no hay publicaciones." },
  },
  journal: {
    title: { en: "Journal", es: "Diario" },
    text: {
      en: "My personal journal. To read it, you'll have to solve a riddle.",
      es: "Mi diario personal. Para leerlo, tendrás que resolver un acertijo.",
    },
    open: { en: "Try the riddle", es: "Intentar el acertijo" },
  },
};

export type Project = {
  name: string;
  kind: L;
  year: string;
  text: L;
  links?: { label: L; href: string }[];
};

export const projects: Project[] = [
  {
    name: "Breast cancer segmentation",
    kind: { en: "Research", es: "Investigación" },
    year: "2024–26",
    text: {
      en: "U-Net models that outline tumors in breast ultrasound images. Two publications and five conferences.",
      es: "Modelos U-Net que delinean tumores en imágenes de ultrasonido de mama. Dos publicaciones y cinco congresos.",
    },
  },
  {
    name: "Bias in language models",
    kind: { en: "Research", es: "Investigación" },
    year: "2026",
    text: {
      en: "How large language models represent Afro-Colombian people, across race and gender.",
      es: "Cómo los modelos de lenguaje representan a las personas afrocolombianas, cruzando raza y género.",
    },
  },
  {
    name: "ML framework in C",
    kind: { en: "From scratch", es: "Desde cero" },
    year: "2026",
    text: {
      en: "Machine learning written in plain C, to see what training really does underneath the libraries.",
      es: "Machine learning escrito en C puro, para ver qué hace realmente el entrenamiento debajo de las librerías.",
    },
  },
  {
    name: "Valle Sombrío",
    kind: { en: "Game", es: "Juego" },
    year: "2026",
    text: {
      en: "A Halloween SQL challenge with a live leaderboard.",
      es: "Un reto de SQL de Halloween con tabla de posiciones en vivo.",
    },
  },
  {
    name: "Living Dex Planner",
    kind: { en: "Tool", es: "Herramienta" },
    year: "2026",
    text: {
      en: "Plans the fastest way to complete a Pokémon living dex across game generations.",
      es: "Planea la forma más rápida de completar una living dex de Pokémon entre generaciones.",
    },
    links: [
      { label: { en: "Open it", es: "Abrir" }, href: "https://kanusaru.github.io/living-dex-planner/" },
      { label: { en: "Code", es: "Código" }, href: "https://github.com/KanuSaru/living-dex-planner" },
    ],
  },
  {
    name: "OTP sign-in API",
    kind: { en: "Backend", es: "Backend" },
    year: "2026",
    text: {
      en: "Sign-in with one-time codes by email and JWT sessions.",
      es: "Inicio de sesión con códigos de un solo uso por correo y sesiones JWT.",
    },
  },
];

// ---------------------------------------------------------------------------
// Me
// ---------------------------------------------------------------------------
export type Row = { name: string; note: L; star?: boolean };

export const me = {
  title: { en: "Me", es: "Yo" },
  lede: {
    en: "The things I do and the things I love, outside of a CV.",
    es: "Lo que hago y lo que amo, por fuera de una hoja de vida.",
  },
  hello: {
    title: { en: "Hi, I'm Kanu", es: "Hola, soy Kanu" },
    paras: [
      {
        en: "Kanu is my nickname. KanuSaru came from words I heard in other languages at some point and thought sounded good.",
        es: "Kanu es mi apodo. KanuSaru viene de palabras que en algún momento escuché en otros idiomas y pensé que sonaban bien.",
      },
      {
        en: "I live in Barranquilla, but I've never held on to one place, like a nomad. The best time of my life was in Chile, years ago, when I got to explore that beautiful country with my father.",
        es: "Vivo en Barranquilla, pero nunca me he aferrado a un sitio, como un nómada. La mejor época de mi vida fue en Chile, hace bastantes años, cuando tuve la fortuna de explorar ese bello país junto a mi padre.",
      },
    ],
  },
  music: {
    title: { en: "Music", es: "Música" },
    text: {
      en: "All over the place: hip-hop, jazz, house, rock and more, with seasons where I listen to classical.",
      es: "Muy variada: hip-hop, jazz, house, rock y más, con temporadas en las que escucho música clásica.",
    },
    rows: [
      {
        name: "Loving",
        note: {
          en: "The self-titled album by Loving. My favorite album, by a long way.",
          es: "El álbum homónimo de Loving. Mi álbum favorito, por mucho.",
        },
        star: true,
      },
    ] as Row[],
  },
  sampler: {
    title: { en: "On the sampler", es: "En el sampler" },
    text: {
      en: "I recently got an EP-133 K.O. II and I've already made a few tracks I'm proud of. I'm getting better little by little. The goal is to play live, maybe a set with some improvisation on the sampler, not exactly as a DJ.",
      es: "Hace poco compré el EP-133 K.O. II y ya hice algunos tracks de los que me siento orgulloso. Poco a poco voy mejorando. La meta es tocar en vivo, quizás un set con algo de improvisación en el sampler, no necesariamente como DJ.",
    },
  },
  games: {
    title: { en: "Games", es: "Juegos" },
    rows: [
      {
        name: "Wakfu",
        note: { en: "5,000+ hours, 2,000 of them on Steam.", es: "Más de 5.000 horas, 2.000 de ellas en Steam." },
      },
      {
        name: "The Binding of Isaac",
        note: { en: "Platinumed it once. Doing it again.", es: "Lo platiné una vez. Voy por la segunda." },
      },
      {
        name: "Terraria",
        note: {
          en: "Lost my forever-world when I changed PCs. It wasn't saved to the cloud.",
          es: "Perdí mi mundo de siempre al cambiar de PC. No estaba guardado en la nube.",
        },
      },
    ] as Row[],
  },
  oni: {
    title: { en: "Oxygen Not Included", es: "Oxygen Not Included" },
    text: {
      en: "The game I've fallen for and become obsessed with. It's a sandbox, but it has so many systems you need to understand that it's almost a pure engineering game, with cute characters and details that make each new problem fun to solve. One of the most challenging games I've ever played.",
      es: "El juego que estoy amando y con el que me he llegado a obsesionar. Es un sandbox, pero tiene tantos sistemas que tienes que comprender que es casi un juego puramente de ingeniería, con personajes lindos y detalles que hacen divertido resolver los problemas que se presentan cada tanto. De los juegos más desafiantes que he jugado.",
    },
    thesis: {
      en: "I'm seriously thinking about writing my thesis on its systems and how they relate to real-life ones.",
      es: "Estoy pensando seriamente en hacer mi tesis sobre sus sistemas y cómo se relacionan con los de la vida real.",
    },
  },
  reading: {
    title: { en: "Reading", es: "Lectura" },
    rows: [
      {
        name: "Omoide Emanon & Sasurai Emanon",
        note: {
          en: "The novel and manga that has moved me most in my whole life. There was truly a before and after. My favorite work, no doubt, and Emanon is the character I identify with most.",
          es: "La novela y manga que más me ha tocado en toda mi vida. De verdad hubo un antes y un después. Mi obra favorita sin duda, y Emanon es el personaje con el que más me identifico.",
        },
        star: true,
      },
    ] as Row[],
    text: {
      en: "I also read a lot that isn't academic, mostly mystery and detective books.",
      es: "También leo mucho que no es académico, sobre todo libros de misterio y detectives.",
    },
  },
  chess: {
    title: { en: "Chess", es: "Ajedrez" },
    text: {
      en: "The sport I play most. I'm not very good, but I enjoy it a lot, and I love the brilliant moments in every game. Grandmaster games, obviously; mine aren't that good. Chess tends to be very romantic.",
      es: "El deporte que más practico. No soy muy bueno, pero lo disfruto mucho, y aprecio los momentos brillantes de cada partida. Partidas entre grandes maestros, claro; las mías no son tan buenas. El ajedrez suele ser muy romántico.",
    },
  },
  dream: {
    title: { en: "A dream", es: "Un sueño" },
    text: {
      en: "My biggest dream is to teach, or to lead the education of young people who really want to unlock their potential. It's something I missed growing up: a mentor to guide me and push me to give everything, to build my foundations and make things with a positive impact on the world.",
      es: "Mi mayor sueño es educar, o ser la cabeza que coordine la educación de jóvenes que realmente quieran explotar su potencial. Es algo que me faltó de joven: un mentor que me guiara y exprimiera todo de mí para formar mis bases y desarrollar cosas con un impacto positivo en el mundo.",
    },
    more: {
      en: "I really mean it. I wish education worked that way, built around the real interests of the people receiving it.",
      es: "Lo digo de verdad. Quisiera que la educación fuera así, potenciando los verdaderos intereses de quienes la reciben.",
    },
  },
  gallery: {
    title: { en: "Gallery", es: "Galería" },
    text: {
      en: "Empty for now. Art I make will live here.",
      es: "Vacía por ahora. Aquí vivirá el arte que haga.",
    },
  },
};

// ---------------------------------------------------------------------------
// Journal (the riddle itself is in content/journal.ts)
// ---------------------------------------------------------------------------
export const journalText = {
  title: { en: "Journal", es: "Diario" },
  lede: {
    en: "My personal journal. It's sealed: solve the riddle to read it.",
    es: "Mi diario personal. Está sellado: resuelve el acertijo para leerlo.",
  },
  riddle: { en: "The riddle", es: "El acertijo" },
  answer: { en: "Your answer", es: "Tu respuesta" },
  hint: {
    en: "Capitals, accents and punctuation don't matter.",
    es: "No importan las mayúsculas, las tildes ni la puntuación.",
  },
  open: { en: "Open the journal", es: "Abrir el diario" },
  opening: { en: "Opening…", es: "Abriendo…" },
  wrong: { en: "That's not it. Try another answer.", es: "No es eso. Prueba otra respuesta." },
  soon: { en: "The riddle is coming soon.", es: "El acertijo llega pronto." },
  count: { en: "{n} sealed entries, the latest from {d}.", es: "{n} entradas selladas, la más reciente del {d}." },
  countOne: { en: "1 sealed entry, from {d}.", es: "1 entrada sellada, del {d}." },
  none: { en: "Nothing sealed yet.", es: "Aún no hay nada sellado." },
  opened: { en: "Unsealed. Entries appear in the language they were written in.", es: "Abierto. Las entradas aparecen en el idioma en que fueron escritas." },
  lockAgain: { en: "Seal it again", es: "Volver a sellar" },
};
