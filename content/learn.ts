// The ML field guide on /learn/: a free, self-taught route into machine learning.
// The route and the choice of resources come from Ri's course at lachinemearning.com;
// the explanations, checklists and project ideas are rewritten here.
// Each piece of text is { en, es }. Resource names stay as their authors wrote them.

import type { L } from "./site";

export type ResType = "course" | "video" | "docs" | "practice" | "book" | "read" | "tool";
export type Resource = { name: string; url: string; type: ResType; desc: L; start?: boolean };
export type Term = { term: L; def: L };
export type Module = { id: string; title: L; chips: { label: L; key?: boolean }[]; idea: L; body?: L; terms?: Term[]; res: Resource[] };
export type Phase = { id: string; n: string; title: L; short: L; when: L; lead: L; meta: L[]; extra?: "maths" | "ai"; build: L; modules: Module[] };

const KA = "https://www.khanacademy.org/math/";

const r = (name: string, url: string, type: ResType, en: string, es: string, start = false): Resource => ({
  name,
  url,
  type,
  desc: { en, es },
  ...(start ? { start: true } : {}),
});
const t = (en: string, enDef: string, es: string, esDef: string): Term => ({ term: { en, es }, def: { en: enDef, es: esDef } });
const c = (en: string, es: string, key = false) => ({ label: { en, es }, ...(key ? { key: true } : {}) });

export const learn = {
  title: { en: "Learn ML", es: "Aprende ML" },
  lede: {
    en: "A free, self-taught route into machine learning, put in order. Tick things off as you go; your progress stays in your browser.",
    es: "Una ruta gratis y autodidacta hacia el machine learning, puesta en orden. Marca lo que vayas terminando; tu progreso se queda en tu navegador.",
  },
  intro: {
    en: "This is a map, not a course. The teaching comes from the best free material online, in a deliberate order, with each idea explained in one plain sentence before you dive in.",
    es: "Esto es un mapa, no un curso. Lo que enseña es el mejor material gratuito de internet, en un orden pensado, con cada idea explicada en una frase sencilla antes de entrar.",
  },
  facts: {
    cost: { en: "Cost", es: "Costo" },
    free: { en: "Free", es: "Gratis" },
    for: { en: "For", es: "Para" },
    beginners: { en: "Beginners", es: "Principiantes" },
    phases: { en: "Phases", es: "Fases" },
    resources: { en: "Resources", es: "Recursos" },
  },
  progress: {
    title: { en: "Your progress", es: "Tu progreso" },
    count: { en: "{d} of {n} done", es: "{d} de {n} listos" },
    next: { en: "Up next", es: "Lo que sigue" },
    allDone: { en: "Every resource ticked off. Go build something.", es: "Todo marcado. Ahora a construir algo." },
    search: { en: "Search topics, terms, resources", es: "Buscar temas, términos, recursos" },
    hide: { en: "Hide finished", es: "Ocultar lo terminado" },
    reset: { en: "Reset progress", es: "Borrar progreso" },
    confirm: { en: "Click again to erase", es: "Clic otra vez para borrar" },
    none: { en: "Nothing matches that search.", es: "Nada coincide con esa búsqueda." },
    modules: { en: "{n} modules", es: "{n} módulos" },
  },
  route: { en: "The route", es: "La ruta" },
  how: {
    title: { en: "How to use it", es: "Cómo usarlo" },
    items: [
      {
        title: { en: "Do, then move on", es: "Hazlo y sigue" },
        text: {
          en: "Watch or read a little, then try it yourself straight away. It sticks when you get stuck and work your way out.",
          es: "Mira o lee un poco y pruébalo tú mismo de inmediato. Se queda cuando te atascas y sales por tu cuenta.",
        },
      },
      {
        title: { en: "The order is the point", es: "El orden es lo importante" },
        text: {
          en: "Maths and code together, then data science, then deep learning, then LLMs. Jumping ahead leaves you copying code you can't debug.",
          es: "Mate y código a la vez, luego ciencia de datos, luego deep learning, luego LLMs. Saltarse pasos te deja copiando código que no sabes depurar.",
        },
      },
      {
        title: { en: "Too hard? Step back", es: "¿Muy difícil? Retrocede" },
        text: {
          en: "If a module stops making sense, drop a level and come back. Pushing through confused wastes more time than revisiting a basic.",
          es: "Si un módulo deja de tener sentido, baja un nivel y vuelve. Seguir confundido gasta más tiempo que repasar lo básico.",
        },
      },
      {
        title: { en: "Build from day one", es: "Construye desde el día uno" },
        text: {
          en: "Each phase ends with a small project. Finishing small things teaches more than starting another course.",
          es: "Cada fase termina con un proyecto pequeño. Terminar cosas pequeñas enseña más que empezar otro curso.",
        },
      },
    ],
    reads: { en: "Background reads by Ri", es: "Lecturas de fondo de Ri" },
    readLinks: [
      { label: { en: "Why the maths matters (PDF)", es: "Por qué importan las mates (PDF, en inglés)" }, url: "https://lachinemearning.com/why_maths_in_ml_.pdf" },
      {
        label: { en: "Learning to code among vibecoders (PDF)", es: "Aprender a programar entre vibecoders (PDF, en inglés)" },
        url: "https://lachinemearning.com/Guide%20to%20learning%20how%20to%20code%20in%20the%20sea%20of%20vibecoders.pdf",
      },
    ],
  },
  labels: {
    phase: { en: "Phase", es: "Fase" },
    step: { en: "Step {n}", es: "Paso {n}" },
    start: { en: "start here", es: "empieza aquí" },
    build: { en: "Build this", es: "Construye esto" },
    buildNote: { en: "my suggestion, not part of Ri's course", es: "sugerencia mía, no es parte del curso de Ri" },
    types: {
      course: { en: "course", es: "curso" },
      video: { en: "video", es: "video" },
      docs: { en: "docs", es: "docs" },
      practice: { en: "practice", es: "práctica" },
      book: { en: "book", es: "libro" },
      read: { en: "read", es: "lectura" },
      tool: { en: "tool", es: "herramienta" },
    } satisfies Record<ResType, L>,
  },
  maths: {
    weightsTitle: { en: "How much of each you need", es: "Cuánto necesitas de cada una" },
    weights: [
      { label: { en: "Statistics ~½", es: "Estadística ~½" }, share: 50 },
      { label: { en: "Linear algebra ~⅓", es: "Álgebra lineal ~⅓" }, share: 33 },
      { label: { en: "Calculus", es: "Cálculo" }, share: 17 },
    ],
    climbTitle: { en: "The Khan Academy climb", es: "La escalada en Khan Academy" },
    steps: [
      {
        courses: [
          { name: { en: "Algebra 2", es: "Álgebra 2" }, url: KA + "algebra2" },
          { name: { en: "High-school statistics", es: "Estadística de bachillerato" }, url: KA + "probability" },
        ],
        text: { en: "Run both at once: algebra is the toolkit, stats teaches reasoning about chance.", es: "Las dos a la vez: el álgebra es la caja de herramientas, la estadística enseña a razonar sobre el azar." },
      },
      {
        courses: [{ name: { en: "Pre-calculus", es: "Precálculo" }, url: KA + "precalculus" }],
        text: { en: "Functions and graphs, the bridge into calculus.", es: "Funciones y gráficas, el puente hacia el cálculo." },
      },
      {
        courses: [
          { name: { en: "Calculus 1", es: "Cálculo 1" }, url: KA + "calculus-1" },
          { name: { en: "College algebra", es: "Álgebra universitaria" }, url: KA + "college-algebra" },
          { name: { en: "Linear algebra", es: "Álgebra lineal" }, url: KA + "linear-algebra" },
        ],
        text: { en: "How things change, firmer foundations, and the maths of matrices.", es: "Cómo cambian las cosas, bases más firmes y las mates de las matrices." },
      },
      {
        courses: [{ name: { en: "Calculus 2", es: "Cálculo 2" }, url: KA + "calculus-2" }],
        text: { en: "Deepens the calculus that reappears in how models learn.", es: "Profundiza el cálculo que reaparece en cómo aprenden los modelos." },
      },
    ],
  },
  ai: {
    label: { en: "Using AI while you learn to code", es: "Usar IA mientras aprendes a programar" },
    title: { en: "A tutor, not a ghostwriter", es: "Un tutor, no alguien que lo haga por ti" },
    text: {
      en: "Asking an LLM to explain an error or review code you wrote is tutoring. Asking it to write the function skips the part that does the teaching. Once you can follow every line it gives you, use it freely; Phase 05 covers how.",
      es: "Pedirle a un LLM que te explique un error o revise código que escribiste es tutoría. Pedirle que escriba la función se salta justo la parte que enseña. Cuando puedas seguir cada línea que te da, úsalo sin miedo; la Fase 05 explica cómo.",
    },
  },
  credit: {
    text: {
      en: "The route and the choice of resources come from Ri's free course at lachinemearning.com. This page reorganizes it with rewritten explanations, checklists and project ideas. Every resource is free and run by its own authors.",
      es: "La ruta y la selección de recursos vienen del curso gratuito de Ri en lachinemearning.com. Esta página lo reorganiza con explicaciones reescritas, listas de chequeo e ideas de proyecto. Cada recurso es gratis y lo mantienen sus propios autores.",
    },
    links: [
      { label: { en: "Original course", es: "Curso original" }, url: "https://lachinemearning.com/course.html" },
      { label: { en: "Ri on YouTube", es: "Ri en YouTube" }, url: "https://www.youtube.com/@iris-lachinemearning" },
      { label: { en: "Tip Ri on Ko-fi", es: "Apoya a Ri en Ko-fi" }, url: "https://ko-fi.com/lachinemearningiris" },
    ],
    english: { en: "Almost every resource is in English.", es: "Casi todos los recursos están en inglés." },
  },
};

export const phases: Phase[] = [
  {
    id: "maths",
    n: "01",
    title: { en: "Mathematics", es: "Matemáticas" },
    short: { en: "Maths", es: "Mates" },
    when: { en: "Runs with Phase 02", es: "Va junto con la Fase 02" },
    lead: {
      en: "Three tracks you run at the same time, not one after another. Khan Academy is the backbone because it starts gently and fills gaps as you go.",
      es: "Tres frentes que llevas al mismo tiempo, no uno tras otro. Khan Academy es la columna vertebral porque empieza suave y va llenando vacíos.",
    },
    meta: [
      { en: "Parallel with code", es: "En paralelo con código" },
      { en: "Khan Academy backbone", es: "Base en Khan Academy" },
    ],
    extra: "maths",
    build: {
      en: "Without any libraries, write Python functions for mean, variance, standard deviation and matrix multiplication. Then check your answers against NumPy.",
      es: "Sin librerías, escribe funciones en Python para la media, la varianza, la desviación estándar y la multiplicación de matrices. Luego compara tus resultados con NumPy.",
    },
    modules: [
      {
        id: "stats",
        title: { en: "Statistics & probability", es: "Estadística y probabilidad" },
        chips: [c("Start here", "Empieza aquí", true), c("Steps 1 onward", "Desde el paso 1")],
        idea: {
          en: "Statistics is how you make careful claims about a whole when you've only seen a sample.",
          es: "La estadística es cómo afirmas algo con cuidado sobre un todo cuando solo has visto una muestra.",
        },
        body: {
          en: "The most-used maths in ML and the one beginners tend to skip: describing data, putting a number on uncertainty, and telling a real pattern from noise. Begin it alongside Algebra 2.",
          es: "Las mates más usadas en ML y las que más se saltan los principiantes: describir datos, ponerle número a la incertidumbre y distinguir un patrón real del ruido. Empiézala junto con Álgebra 2.",
        },
        res: [
          r("Khan Academy: Statistics & Probability", KA + "statistics-probability", "course", "Bottom-up, the natural place to begin.", "Desde cero, el lugar natural para empezar.", true),
          r("StatQuest with Josh Starmer", "https://www.youtube.com/c/joshstarmer", "video", "Stats and ML with clear visuals and humour. Good entry point if equations put you off.", "Estadística y ML con visuales claros y humor. Buena entrada si las ecuaciones te espantan."),
        ],
      },
      {
        id: "linalg",
        title: { en: "Linear algebra", es: "Álgebra lineal" },
        chips: [c("Step 3", "Paso 3")],
        idea: {
          en: "A table of numbers is a matrix. Linear algebra is the arithmetic of whole tables at once.",
          es: "Una tabla de números es una matriz. El álgebra lineal es la aritmética de tablas enteras a la vez.",
        },
        body: {
          en: "Data is stored as grids of numbers, so this is the language every model uses to move data around. Bring it in next to Calculus 1.",
          es: "Los datos se guardan como cuadrículas de números, así que este es el idioma con el que todo modelo mueve datos. Métela junto a Cálculo 1.",
        },
        res: [
          r("Khan Academy: Linear Algebra", KA + "linear-algebra", "course", "The full grounding, slow and with exercises.", "La base completa, despacio y con ejercicios."),
          r("3Blue1Brown: Essence of Linear Algebra", "https://www.3blue1brown.com/topics/linear-algebra", "video", "Watch for the intuition; practise the mechanics on Khan.", "Míralo por la intuición; practica la mecánica en Khan."),
        ],
      },
      {
        id: "calc",
        title: { en: "Calculus", es: "Cálculo" },
        chips: [c("Steps 2 to 4", "Pasos 2 a 4"), c("Smallest share", "La parte más pequeña")],
        idea: {
          en: "Calculus studies change and slope. A model “learning” is mostly stepping downhill on its own error.",
          es: "El cálculo estudia el cambio y la pendiente. Que un modelo “aprenda” es, sobre todo, bajar paso a paso por la cuesta de su propio error.",
        },
        body: {
          en: "Keep it from eating your schedule. You need the core idea of derivatives and gradients, not every integration technique. Climb pre-calculus, then Calculus 1, then Calculus 2.",
          es: "No dejes que se coma tu horario. Necesitas la idea central de derivadas y gradientes, no todas las técnicas de integración. Sube precálculo, luego Cálculo 1, luego Cálculo 2.",
        },
        res: [
          r("Khan Academy: Pre-calculus", KA + "precalculus", "course", "The bridge step. Do it before Calculus 1.", "El paso puente. Hazlo antes de Cálculo 1."),
          r("Khan Academy: Calculus 1", KA + "calculus-1", "course", "Derivatives and rates of change, the part that matters most.", "Derivadas y razones de cambio, la parte que más importa."),
          r("3Blue1Brown: Essence of Calculus", "https://www.3blue1brown.com/topics/calculus", "video", "Makes derivatives feel obvious.", "Hace que las derivadas se sientan obvias."),
        ],
      },
    ],
  },
  {
    id: "code",
    n: "02",
    title: { en: "Learn to code", es: "Aprende a programar" },
    short: { en: "Code", es: "Código" },
    when: { en: "Runs with Phase 01", es: "Va junto con la Fase 01" },
    lead: {
      en: "Maths without code is theory you can't test, and code without maths is copying what you don't understand. The goal isn't software engineering: write a script, read someone else's, and fix your own without panic. Python is all you need.",
      es: "Mates sin código es teoría que no puedes probar, y código sin mates es copiar lo que no entiendes. La meta no es ser ingeniero de software: escribir un script, leer el de otro y arreglar el tuyo sin pánico. Python es todo lo que necesitas.",
    },
    meta: [
      { en: "Python only", es: "Solo Python" },
      { en: "Parallel with maths", es: "En paralelo con mates" },
    ],
    extra: "ai",
    build: {
      en: "Write a small command-line tool you'd actually use (a study timer, an expense logger, a file renamer). Keep it in a Git repo with a commit per working step.",
      es: "Escribe una herramienta de terminal pequeña que de verdad usarías (un temporizador de estudio, un registro de gastos, un renombrador de archivos). Guárdala en un repo de Git con un commit por cada paso que funcione.",
    },
    modules: [
      {
        id: "fund",
        title: { en: "Programming fundamentals", es: "Fundamentos de programación" },
        chips: [c("Start here", "Empieza aquí", true), c("Pick one, finish it", "Elige uno y termínalo", true)],
        idea: {
          en: "A program is an ordered list of instructions. Almost every program is built from about six ideas.",
          es: "Un programa es una lista ordenada de instrucciones. Casi todo programa se arma con unas seis ideas.",
        },
        body: {
          en: "Choose one resource and finish it end to end instead of sampling all four. Type the examples out yourself.",
          es: "Elige un recurso y termínalo de principio a fin en vez de probar los cuatro. Escribe los ejemplos tú mismo.",
        },
        terms: [
          t("Variables & types", "Named values. Many early bugs are a value having a different type than you assumed.", "Variables y tipos", "Valores con nombre. Muchos errores al inicio son un valor de un tipo distinto al que creías."),
          t("Control flow", "If/else picks a path; loops repeat until a condition stops them.", "Flujo de control", "If/else elige un camino; los ciclos repiten hasta que una condición los detiene."),
          t("Functions", "Named, reusable blocks with inputs and an output. Small ones are easier to fix.", "Funciones", "Bloques con nombre y reutilizables, con entradas y una salida. Las pequeñas se arreglan más fácil."),
          t("Data structures", "Lists, dictionaries, sets. The right container removes a lot of problems.", "Estructuras de datos", "Listas, diccionarios, conjuntos. El contenedor correcto elimina muchos problemas."),
        ],
        res: [
          r("W3Schools: Python", "https://www.w3schools.com/python/", "course", "Run code in the browser as you read. The gentlest start.", "Corre código en el navegador mientras lees. El inicio más suave."),
          r("Harvard CS50P: Intro to Python", "https://cs50.harvard.edu/python/", "course", "A real university course with proper problem sets. The most solid option.", "Un curso universitario de verdad, con buenos talleres. La opción más sólida."),
          r("Automate the Boring Stuff", "https://automatetheboringstuff.com/", "book", "Teaches Python by automating useful chores.", "Enseña Python automatizando tareas útiles."),
          r("The official Python tutorial", "https://docs.python.org/3/tutorial/", "docs", "Dry but correct. Best as a reference once you've started.", "Seco pero correcto. Mejor como referencia cuando ya empezaste."),
        ],
      },
      {
        id: "debug",
        title: { en: "Debugging & problem solving", es: "Depuración y resolución de problemas" },
        chips: [c("The real skill", "La habilidad real", true)],
        idea: {
          en: "An error message tells you where the computer got confused. Read it from the bottom up.",
          es: "Un mensaje de error te dice dónde se confundió el computador. Léelo de abajo hacia arriba.",
        },
        body: {
          en: "Broken is the normal state of code. What separates beginners from professionals is mostly how calmly and quickly they find the mistake.",
          es: "Lo normal es que el código esté roto. Lo que separa a principiantes de profesionales es, sobre todo, con cuánta calma y rapidez encuentran el error.",
        },
        terms: [
          t("Read the error", "Most messages say exactly what went wrong and where.", "Lee el error", "La mayoría de mensajes dicen justo qué falló y dónde."),
          t("Print everything", "Find the line where what you believe and what's true split apart.", "Imprime todo", "Encuentra la línea donde lo que crees y lo que pasa se separan."),
          t("Shrink the problem", "A ten-line failing example is easy to fix; a 300-line one isn't.", "Achica el problema", "Un ejemplo de diez líneas que falla es fácil de arreglar; uno de 300, no."),
          t("Rubber duck", "Explain the code line by line out loud. You'll often catch the bug mid-sentence.", "El patito de goma", "Explica el código línea por línea en voz alta. Muchas veces encuentras el error a mitad de frase."),
        ],
        res: [
          r("Python Tutor", "https://pythontutor.com/", "tool", "Watch your code run line by line with memory drawn out.", "Mira tu código correr línea por línea, con la memoria dibujada."),
          r("Exercism: Python track", "https://exercism.org/tracks/python", "practice", "Hundreds of small exercises with mentor feedback.", "Cientos de ejercicios cortos con retroalimentación de mentores."),
          r("Codewars", "https://www.codewars.com/", "practice", "Short ranked puzzles. Ten minutes a day beats a weekend binge.", "Retos cortos con ranking. Diez minutos al día le ganan a un maratón de fin de semana."),
        ],
      },
      {
        id: "git",
        title: { en: "The terminal & Git", es: "La terminal y Git" },
        chips: [c("Tooling", "Herramientas")],
        idea: {
          en: "Git takes snapshots of a whole project so you can always return to a version that worked.",
          es: "Git toma fotos de todo el proyecto para que siempre puedas volver a una versión que funcionaba.",
        },
        body: {
          en: "No course teaches this and every job assumes it. The terminal is how you run things; GitHub hosts your snapshots and doubles as your portfolio.",
          es: "Ningún curso lo enseña y todo trabajo lo da por sentado. La terminal es cómo corres las cosas; GitHub guarda tus fotos y de paso es tu portafolio.",
        },
        res: [
          r("MIT: The Missing Semester", "https://missing.csail.mit.edu/", "course", "Shell, editors, Git and tooling. Exactly the gap other courses leave.", "Shell, editores, Git y herramientas. Justo el vacío que dejan otros cursos."),
          r("Learn Git Branching", "https://learngitbranching.js.org/", "practice", "Visual, interactive Git. Branches click in an afternoon.", "Git visual e interactivo. Las ramas se entienden en una tarde."),
          r("GitHub Skills", "https://skills.github.com/", "practice", "Short guided exercises inside real repositories.", "Ejercicios guiados cortos dentro de repositorios reales."),
        ],
      },
    ],
  },
  {
    id: "ds",
    n: "03",
    title: { en: "Data science & ML", es: "Ciencia de datos y ML" },
    short: { en: "Data science", es: "Ciencia de datos" },
    when: { en: "After 01 and 02", es: "Después de 01 y 02" },
    lead: {
      en: "Most real work lives here: getting data, cleaning it, examining it, applying tools that already exist, and putting the result where people can use it. Inventing clever algorithms is a small part of the job.",
      es: "Aquí vive casi todo el trabajo real: conseguir datos, limpiarlos, examinarlos, aplicar herramientas que ya existen y dejar el resultado donde la gente lo pueda usar. Inventar algoritmos ingeniosos es una parte pequeña del oficio.",
    },
    meta: [
      { en: "7 modules", es: "7 módulos" },
      { en: "Deployment lives here", es: "Aquí está el despliegue" },
    ],
    build: {
      en: "Pick a Kaggle dataset you find fun. Clean it, explore it, train a scikit-learn model, then serve predictions from a FastAPI endpoint inside Docker.",
      es: "Elige un dataset de Kaggle que te parezca divertido. Límpialo, explóralo, entrena un modelo con scikit-learn y luego sirve predicciones desde un endpoint de FastAPI dentro de Docker.",
    },
    modules: [
      {
        id: "stack",
        title: { en: "The data stack", es: "Las herramientas de datos" },
        chips: [c("Foundations", "Bases", true)],
        idea: {
          en: "Pandas is a spreadsheet you drive with code. SQL asks a database for exactly the rows you need. NumPy is the fast arrays underneath both.",
          es: "Pandas es una hoja de cálculo que manejas con código. SQL le pide a una base de datos justo las filas que necesitas. NumPy son los arreglos rápidos debajo de ambos.",
        },
        body: { en: "Beginners often skip SQL and regret it later.", es: "Los principiantes suelen saltarse SQL y luego se arrepienten." },
        res: [
          r("Kaggle Learn: Pandas", "https://www.kaggle.com/learn/pandas", "course", "The library you'll live in. Short and practical.", "La librería en la que vas a vivir. Corto y práctico."),
          r("NumPy: absolute beginner's guide", "https://numpy.org/doc/stable/user/absolute_beginners.html", "docs", "Arrays, shapes and vectorised maths from zero.", "Arreglos, dimensiones y mates vectorizadas desde cero."),
          r("W3Schools: SQL", "https://www.w3schools.com/sql/", "course", "Query basics in a try-it-yourself style.", "Lo básico de consultas, probando tú mismo."),
          r("Kaggle Learn: Intro to SQL", "https://www.kaggle.com/learn/intro-to-sql", "course", "Real queries against real tables in a notebook.", "Consultas reales sobre tablas reales en un notebook."),
        ],
      },
      {
        id: "clean",
        title: { en: "Data cleaning", es: "Limpieza de datos" },
        chips: [],
        idea: { en: "Bad data in, bad answers out, no matter how clever the model.", es: "Si entran datos malos, salen respuestas malas, por muy listo que sea el modelo." },
        body: {
          en: "Real data has missing values, typos and wrong formats. Cleaning makes it trustworthy before you ask it anything.",
          es: "Los datos reales traen valores faltantes, errores de tipeo y formatos equivocados. Limpiarlos los vuelve confiables antes de preguntarles algo.",
        },
        res: [
          r("Kaggle Learn: Data Cleaning", "https://www.kaggle.com/learn/data-cleaning", "course", "The messy-data problems you'll actually hit.", "Los problemas de datos sucios con los que de verdad te vas a topar."),
          r("Kaggle Learn: Feature Engineering", "https://www.kaggle.com/learn/feature-engineering", "course", "Turning raw columns into inputs a model can use.", "Convertir columnas crudas en entradas que un modelo pueda usar."),
        ],
      },
      {
        id: "eda",
        title: { en: "Exploratory data analysis", es: "Análisis exploratorio de datos" },
        chips: [c("Before you model", "Antes de modelar")],
        idea: {
          en: "Get to know a dataset before trusting it: count things, plot things, look for anything odd.",
          es: "Conoce un dataset antes de confiar en él: cuenta cosas, grafica cosas, busca lo raro.",
        },
        body: {
          en: "The cheapest step in the process, and it catches mistakes that would quietly ruin a model weeks later. Expect to loop between cleaning and EDA several times.",
          es: "El paso más barato del proceso, y atrapa errores que arruinarían un modelo en silencio semanas después. Cuenta con ir y volver entre limpieza y exploración varias veces.",
        },
        terms: [
          t("Shape first", "Rows, columns, types, missing values. Look at raw rows too.", "Primero la forma", "Filas, columnas, tipos, valores faltantes. Mira filas crudas también."),
          t("Distributions", "Skew, double peaks, impossible values.", "Distribuciones", "Sesgos, dos picos, valores imposibles."),
          t("Relationships", "Correlation shows things move together, not that one causes the other.", "Relaciones", "La correlación muestra que dos cosas se mueven juntas, no que una cause la otra."),
          t("Leakage", "A column that secretly contains the answer. Perfect in testing, useless in reality.", "Fuga de datos", "Una columna que en secreto trae la respuesta. Perfecta en pruebas, inútil en la realidad."),
        ],
        res: [
          r("Kaggle Learn: Data Visualization", "https://www.kaggle.com/learn/data-visualization", "course", "Which plot to reach for and how to make it.", "Qué gráfica usar y cómo hacerla.", true),
          r("Python Data Science Handbook", "https://jakevdp.github.io/PythonDataScienceHandbook/", "book", "Full book online. Chapters 3 and 4 are the EDA core.", "El libro completo en línea. Los capítulos 3 y 4 son el núcleo de la exploración."),
          r("Seaborn: official tutorial", "https://seaborn.pydata.org/tutorial.html", "docs", "Statistical plots in one line each.", "Gráficas estadísticas en una línea cada una."),
        ],
      },
      {
        id: "ml",
        title: { en: "Machine learning", es: "Machine learning" },
        chips: [c("The big one", "El grande", true)],
        idea: {
          en: "A model is a maths function. Training searches for the version of that function that best matches the answers you already know.",
          es: "Un modelo es una función matemática. Entrenar es buscar la versión de esa función que mejor coincide con las respuestas que ya conoces.",
        },
        body: {
          en: "Feed it inputs with known answers, let it adjust its formula until outputs match, then trust it on new inputs. Reinforcement learning, the third branch, waits until Phase 04.",
          es: "Dale entradas con respuestas conocidas, deja que ajuste su fórmula hasta que las salidas coincidan y luego confía en él con entradas nuevas. El aprendizaje por refuerzo, la tercera rama, espera hasta la Fase 04.",
        },
        terms: [
          t("Weights", "How much each input matters.", "Pesos", "Cuánto importa cada entrada."),
          t("Bias", "A baseline that shifts the whole result up or down.", "Sesgo (bias)", "Una base que sube o baja todo el resultado."),
          t("Supervised", "Every training example comes with the right answer.", "Supervisado", "Cada ejemplo de entrenamiento trae la respuesta correcta."),
          t("Unsupervised", "Finds structure in data with no answers attached.", "No supervisado", "Encuentra estructura en datos que no traen respuestas."),
        ],
        res: [
          r("Google: ML Crash Course", "https://developers.google.com/machine-learning/crash-course", "course", "About 15 hours, well produced, low maths barrier.", "Unas 15 horas, bien hecho, pocas mates de entrada.", true),
          r("Kaggle Learn: Intro to ML", "https://www.kaggle.com/learn/intro-to-machine-learning", "practice", "Train your first model in a browser notebook.", "Entrena tu primer modelo en un notebook del navegador."),
          r("Microsoft: ML for Beginners", "https://github.com/microsoft/ML-For-Beginners", "course", "A gentle full curriculum with lessons and quizzes.", "Un currículo completo y amable, con lecciones y quices."),
          r("scikit-learn: User Guide", "https://scikit-learn.org/stable/user_guide.html", "docs", "The library you'll build real models with.", "La librería con la que vas a construir modelos reales."),
          r("Kaggle: Datasets", "https://www.kaggle.com/datasets", "practice", "Thousands of real datasets. Pick one you enjoy.", "Miles de datasets reales. Escoge uno que te guste."),
        ],
      },
      {
        id: "ethics",
        title: { en: "Data ethics", es: "Ética de datos" },
        chips: [],
        idea: {
          en: "A model trained on biased data repeats that bias at scale, with confidence.",
          es: "Un modelo entrenado con datos sesgados repite ese sesgo a gran escala, y con seguridad.",
        },
        body: {
          en: "Ask who could be harmed and how you'd find out before you ship anything. This is part of the job, not an extra.",
          es: "Pregúntate a quién podría perjudicar y cómo te enterarías antes de publicar cualquier cosa. Esto es parte del trabajo, no un extra.",
        },
        res: [
          r("Kaggle Learn: Intro to AI Ethics", "https://www.kaggle.com/learn/intro-to-ai-ethics", "course", "Bias, fairness and auditing a model, hands-on.", "Sesgo, equidad y auditoría de un modelo, con práctica."),
          r("fast.ai: Practical Data Ethics", "https://ethics.fast.ai/", "course", "A full course on real-world consequences.", "Un curso completo sobre consecuencias en el mundo real."),
        ],
      },
      {
        id: "mlops",
        title: { en: "Deployment & MLOps", es: "Despliegue y MLOps" },
        chips: [c("Shipping it", "Ponerlo en el mundo", true)],
        idea: {
          en: "A model in a notebook is a sketch. MLOps is everything around it: build it reproducibly, serve it, and notice when it drifts.",
          es: "Un modelo en un notebook es un boceto. MLOps es todo lo que lo rodea: construirlo de forma reproducible, servirlo y notar cuando se desvía.",
        },
        body: {
          en: "Deployment turns a model into something other people can use: packaged, behind an address your app can call, and watched afterwards.",
          es: "Desplegar convierte un modelo en algo que otros pueden usar: empaquetado, detrás de una dirección a la que tu app puede llamar, y vigilado después.",
        },
        terms: [
          t("Serving", "Wrap the model in a small API. FastAPI plus Docker is the standard first stack.", "Servir", "Envuelve el modelo en una API pequeña. FastAPI con Docker es la combinación inicial estándar."),
          t("Reproducibility", "Same data, code and settings, versioned, give the same model.", "Reproducibilidad", "Los mismos datos, código y ajustes, versionados, dan el mismo modelo."),
          t("Monitoring & drift", "The world changes and your model doesn't. Watch inputs and predictions.", "Monitoreo y deriva", "El mundo cambia y tu modelo no. Vigila entradas y predicciones."),
          t("Pipelines", "Collect, clean, train, evaluate, deploy, on a schedule.", "Pipelines", "Recolectar, limpiar, entrenar, evaluar y desplegar, con horario."),
        ],
        res: [
          r("Google MLCC: Production ML Systems", "https://developers.google.com/machine-learning/crash-course/production-ml-systems", "read", "What changes once a model leaves the notebook.", "Qué cambia cuando un modelo sale del notebook.", true),
          r("FastAPI: official docs", "https://fastapi.tiangolo.com/", "docs", "A Python function becomes an API endpoint in about ten lines.", "Una función de Python se vuelve un endpoint en unas diez líneas."),
          r("Docker: Get Started", "https://docs.docker.com/get-started/", "docs", "Containers, so “works on my machine” stops being a problem.", "Contenedores, para que “en mi máquina funciona” deje de ser un problema."),
          r("MLOps Zoomcamp", "https://github.com/DataTalksClub/mlops-zoomcamp", "course", "Experiment tracking, pipelines, deployment, monitoring.", "Seguimiento de experimentos, pipelines, despliegue, monitoreo."),
          r("Made With ML", "https://madewithml.com/", "course", "Design, build, deploy and iterate on a production ML system.", "Diseña, construye, despliega e itera un sistema de ML en producción."),
        ],
      },
      {
        id: "vec",
        title: { en: "Embeddings & vector databases", es: "Embeddings y bases de datos vectoriales" },
        chips: [c("Newer piece", "Pieza más nueva")],
        idea: {
          en: "An embedding turns meaning into coordinates. A vector database finds the nearest points fast.",
          es: "Un embedding convierte el significado en coordenadas. Una base de datos vectorial encuentra rápido los puntos más cercanos.",
        },
        body: {
          en: "Similar things land close together, so “find what's nearest” powers semantic search, recommendations and the retrieval step in RAG.",
          es: "Las cosas parecidas quedan cerca, así que “busca lo más cercano” es lo que mueve la búsqueda semántica, las recomendaciones y el paso de recuperación en RAG.",
        },
        terms: [
          t("Similarity", "Cosine similarity is the usual measure of closeness.", "Similitud", "La similitud coseno es la medida de cercanía más común."),
          t("Chunking", "How you split documents is the biggest lever on retrieval quality.", "Fragmentación", "Cómo partes los documentos es lo que más pesa en la calidad de la recuperación."),
          t("ANN indexes", "Approximate search gives up a little accuracy for huge speed.", "Índices ANN", "La búsqueda aproximada sacrifica un poco de precisión a cambio de muchísima velocidad."),
        ],
        res: [
          r("Chroma: docs", "https://docs.trychroma.com/", "docs", "The easiest vector database to run on your laptop.", "La base de datos vectorial más fácil de correr en tu portátil.", true),
          r("Pinecone: Learn", "https://www.pinecone.io/learn/", "read", "Vendor-written but excellent explainers on embeddings and search.", "Escritos por una empresa, pero explicaciones excelentes de embeddings y búsqueda."),
          r("Sentence Transformers", "https://sbert.net/", "tool", "Make embeddings locally with a few lines of Python.", "Crea embeddings en local con unas pocas líneas de Python."),
          r("FAISS: wiki", "https://github.com/facebookresearch/faiss/wiki", "docs", "Meta's similarity-search library and a tour of ANN indexes.", "La librería de búsqueda por similitud de Meta y un recorrido por los índices ANN."),
          r("pgvector", "https://github.com/pgvector/pgvector", "tool", "Vector search inside Postgres. Often all you need.", "Búsqueda vectorial dentro de Postgres. Muchas veces es todo lo que necesitas."),
        ],
      },
    ],
  },
  {
    id: "dl",
    n: "04",
    title: { en: "Deep learning", es: "Deep learning" },
    short: { en: "Deep learning", es: "Deep learning" },
    when: { en: "After 03", es: "Después de 03" },
    lead: {
      en: "Deep learning stacks many simple functions so the output of one layer feeds the next. That lets a model learn patterns far too complex for one formula. Vision models and language models are the same idea arranged in different shapes.",
      es: "El deep learning apila muchas funciones simples para que la salida de una capa alimente la siguiente. Así un modelo aprende patrones demasiado complejos para una sola fórmula. Los modelos de visión y los de lenguaje son la misma idea acomodada de formas distintas.",
    },
    meta: [
      { en: "Core first", es: "Primero lo esencial" },
      { en: "RL comes last", es: "RL va al final" },
    ],
    build: {
      en: "Train an image classifier on a small dataset you collect yourself, then write a one-page note on where it fails and why.",
      es: "Entrena un clasificador de imágenes con un dataset pequeño que recojas tú mismo y escribe una nota de una página sobre dónde falla y por qué.",
    },
    modules: [
      {
        id: "core",
        title: { en: "Core concepts", es: "Conceptos esenciales" },
        chips: [c("Do not skip", "No te lo saltes", true)],
        idea: {
          en: "A network is many tiny functions in layers, learning by nudging every weight to shrink its error.",
          es: "Una red son muchas funciones diminutas en capas, que aprenden empujando cada peso un poquito para achicar su error.",
        },
        body: {
          en: "Learn these before any specific architecture. Every deep learning system shares them.",
          es: "Apréndelos antes de cualquier arquitectura específica. Todo sistema de deep learning los comparte.",
        },
        terms: [
          t("Neuron", "Multiplies each input by a weight, adds a bias, outputs one number.", "Neurona", "Multiplica cada entrada por un peso, suma un sesgo y saca un número."),
          t("Activation", "Lets the network bend and curve instead of drawing only straight lines.", "Activación", "Deja que la red se doble y se curve en vez de trazar solo líneas rectas."),
          t("Layers", "Neurons side by side, then stacked, each feeding the next.", "Capas", "Neuronas lado a lado, luego apiladas, cada una alimentando la siguiente."),
          t("Backpropagation", "Traces the error backwards and adjusts each weight a little, millions of times.", "Retropropagación", "Recorre el error hacia atrás y ajusta cada peso un poco, millones de veces."),
        ],
        res: [
          r("3Blue1Brown: Neural Networks", "https://www.3blue1brown.com/topics/neural-networks", "video", "The best visual explanation of neurons and backprop.", "La mejor explicación visual de neuronas y retropropagación.", true),
          r("Andrej Karpathy: Zero to Hero", "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", "video", "Build a network from scratch. Code along, don't just watch.", "Construye una red desde cero. Programa a la par, no solo mires."),
          r("Andrew Ng: Deep Learning Specialization", "https://www.deeplearning.ai/courses/deep-learning-specialization/", "course", "The structured course once the intuition lands. Free to audit.", "El curso estructurado cuando ya tengas la intuición. Gratis como oyente."),
        ],
      },
      {
        id: "cnn",
        title: { en: "Vision models (CNNs)", es: "Modelos de visión (CNN)" },
        chips: [c("Model family", "Familia de modelos")],
        idea: {
          en: "A CNN slides small filters across an image. Early layers find edges; later layers find whole objects.",
          es: "Una CNN desliza filtros pequeños por la imagen. Las primeras capas encuentran bordes; las últimas, objetos completos.",
        },
        body: { en: "Built for images, where meaning lives in patches of nearby pixels.", es: "Hecha para imágenes, donde el significado vive en parches de píxeles cercanos." },
        res: [
          r("fast.ai: Practical Deep Learning", "https://course.fast.ai/", "course", "You train a working image classifier in lesson one.", "Entrenas un clasificador de imágenes que funciona desde la primera lección.", true),
          r("Stanford CS231n: Notes", "https://cs231n.github.io/", "read", "The classic deep dive on CNNs.", "La inmersión clásica en las CNN."),
        ],
      },
      {
        id: "rnn",
        title: { en: "Sequence models (RNNs & LSTMs)", es: "Modelos de secuencias (RNN y LSTM)" },
        chips: [c("Model family", "Familia de modelos")],
        idea: {
          en: "Reads one step at a time and carries a memory of what came before.",
          es: "Lee un paso a la vez y lleva una memoria de lo que vino antes.",
        },
        body: { en: "For data where order matters: text, speech, time series.", es: "Para datos donde el orden importa: texto, voz, series de tiempo." },
        res: [
          r("StatQuest: RNNs & LSTMs", "https://www.youtube.com/watch?v=AsNTP8Kwu80", "video", "Beginner-paced explanation of memory in networks.", "Explicación a ritmo de principiante de la memoria en las redes."),
          r("colah's blog: Understanding LSTMs", "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", "read", "The famous illustrated write-up.", "El famoso artículo ilustrado."),
        ],
      },
      {
        id: "tf",
        title: { en: "Transformers", es: "Transformers" },
        chips: [c("Model family", "Familia de modelos")],
        idea: {
          en: "Looks at the whole input at once and learns, for each token, which other tokens matter.",
          es: "Mira toda la entrada a la vez y aprende, para cada token, qué otros tokens importan.",
        },
        body: {
          en: "The architecture behind modern language models and most of today's AI. Still stacked functions underneath.",
          es: "La arquitectura detrás de los modelos de lenguaje modernos y de casi toda la IA de hoy. Por debajo siguen siendo funciones apiladas.",
        },
        res: [
          r("3Blue1Brown: But what is a GPT?", "https://www.youtube.com/watch?v=wjZofJX0v4M", "video", "Visual intro to transformers and attention.", "Introducción visual a los transformers y la atención.", true),
          r("The Illustrated Transformer", "https://jalammar.github.io/illustrated-transformer/", "read", "Picture-by-picture walkthrough of the architecture.", "Recorrido imagen por imagen de la arquitectura."),
          r("Hugging Face: NLP Course", "https://huggingface.co/learn/nlp-course", "course", "Use real transformer models in code.", "Usa transformers reales desde el código."),
        ],
      },
      {
        id: "rl",
        title: { en: "Reinforcement learning", es: "Aprendizaje por refuerzo" },
        chips: [c("Different kind of learning", "Otra forma de aprender")],
        idea: {
          en: "Supervised learning uses an answer key. Reinforcement learning learns from consequences.",
          es: "El aprendizaje supervisado usa una hoja de respuestas. El aprendizaje por refuerzo aprende de las consecuencias.",
        },
        body: {
          en: "An agent acts, gets a reward or penalty, and works out which behaviour pays off. It sits here because modern RL uses a neural network as the agent's policy, and chat models are tuned with RL from human feedback.",
          es: "Un agente actúa, recibe una recompensa o un castigo y descubre qué comportamiento le conviene. Va aquí porque el RL moderno usa una red neuronal como política del agente, y los modelos de chat se ajustan con RL a partir de retroalimentación humana.",
        },
        terms: [
          t("Agent & environment", "The decision-maker and the world it acts in.", "Agente y entorno", "Quien decide y el mundo en el que actúa."),
          t("Reward", "One number for good or bad. Design it badly and the agent games it.", "Recompensa", "Un número para bueno o malo. Diséñala mal y el agente le hace trampa."),
          t("Policy", "The strategy. In deep RL, a neural network.", "Política", "La estrategia. En deep RL, una red neuronal."),
          t("Explore vs exploit", "Take the known reward, or try something that might pay more.", "Explorar vs. explotar", "Tomar la recompensa conocida o probar algo que podría dar más."),
        ],
        res: [
          r("Hugging Face: Deep RL Course", "https://huggingface.co/learn/deep-rl-course", "course", "Hands-on from unit one in free Colab notebooks.", "Práctico desde la primera unidad, en notebooks gratis de Colab.", true),
          r("OpenAI: Spinning Up in Deep RL", "https://spinningup.openai.com/", "read", "Theory with readable implementations. After the HF course.", "Teoría con implementaciones legibles. Después del curso de HF."),
          r("Gymnasium", "https://gymnasium.farama.org/", "tool", "Standard practice environments, from cartpole to Atari.", "Entornos de práctica estándar, desde cartpole hasta Atari."),
          r("Sutton & Barto: RL, an Introduction", "http://incompleteideas.net/book/the-book-2nd.html", "book", "The field's textbook. Dense, but the reference.", "El libro de texto del área. Denso, pero es la referencia."),
        ],
      },
    ],
  },
  {
    id: "llm",
    n: "05",
    title: { en: "Working with LLMs", es: "Trabajar con LLMs" },
    short: { en: "LLMs", es: "LLMs" },
    when: { en: "Last, on purpose", es: "Al final, a propósito" },
    lead: {
      en: "LLMs are daily tools for learning and building. They come last because they're most useful once you know enough to catch them being wrong. Many apps with a chatbot are a model plus a prompt.",
      es: "Los LLMs son herramientas diarias para aprender y construir. Van al final porque sirven más cuando ya sabes lo suficiente para pillarlos equivocándose. Muchas apps con chatbot son un modelo más un prompt.",
    },
    meta: [{ en: "Prompt → API → agents", es: "Prompt → API → agentes" }],
    build: {
      en: "Build a small agent with two tools (for example, search your notes in Chroma and run a Python calculation), a cap on steps, and five test tasks you re-run after every change.",
      es: "Construye un agente pequeño con dos herramientas (por ejemplo, buscar en tus notas con Chroma y correr un cálculo en Python), un límite de pasos y cinco tareas de prueba que vuelvas a correr tras cada cambio.",
    },
    modules: [
      {
        id: "partner",
        title: { en: "LLMs as a learning partner", es: "Los LLMs como compañeros de estudio" },
        chips: [],
        idea: {
          en: "An LLM predicts likely next words. It doesn't look facts up, so verify anything that matters.",
          es: "Un LLM predice las palabras siguientes más probables. No consulta datos, así que verifica todo lo que importe.",
        },
        body: {
          en: "Paste an error, ask for a concept explained five ways, or have it quiz you. Treat every answer as a smart friend's guess.",
          es: "Pega un error, pide que te expliquen un concepto de cinco formas o que te haga un quiz. Toma cada respuesta como la suposición de un amigo listo.",
        },
        res: [
          r("Anthropic: Learn", "https://www.anthropic.com/learn", "read", "Guides on getting useful, accurate answers.", "Guías para sacar respuestas útiles y precisas."),
          r("DeepLearning.AI: Short Courses", "https://www.deeplearning.ai/short-courses/", "course", "Hour-long courses on building with LLMs.", "Cursos de una hora sobre construir con LLMs."),
        ],
      },
      {
        id: "prompt",
        title: { en: "Prompt engineering", es: "Ingeniería de prompts" },
        chips: [],
        idea: { en: "Say who it should be, what you want, and show one example.", es: "Di quién debe ser, qué quieres y muestra un ejemplo." },
        body: {
          en: "The model only has what you give it. “Fix my code” is weak; a role, the code, the error and the output you want is strong.",
          es: "El modelo solo tiene lo que le das. “Arregla mi código” es débil; un rol, el código, el error y la salida que quieres es fuerte.",
        },
        res: [
          r("Anthropic: Prompt Engineering", "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview", "docs", "Clear instructions, examples, step-by-step reasoning.", "Instrucciones claras, ejemplos, razonamiento paso a paso.", true),
          r("Prompting Guide", "https://www.promptingguide.ai/", "read", "Thorough reference of techniques with examples.", "Referencia completa de técnicas, con ejemplos."),
        ],
      },
      {
        id: "api",
        title: { en: "Calling an LLM API", es: "Llamar la API de un LLM" },
        chips: [c("Chatting → building", "De chatear a construir", true)],
        idea: {
          en: "One request in, one reply out. The API remembers nothing; your code holds the conversation.",
          es: "Entra una petición, sale una respuesta. La API no recuerda nada; tu código guarda la conversación.",
        },
        body: {
          en: "The same conversation as a chat box, done in Python so you can build your own apps.",
          es: "La misma conversación que en un chat, pero en Python para que puedas construir tus propias apps.",
        },
        terms: [
          t("Messages & roles", "A system instruction, then alternating user and assistant turns.", "Mensajes y roles", "Una instrucción de sistema y luego turnos alternos de usuario y asistente."),
          t("Tokens", "Roughly three-quarters of a word. You pay per token in and out.", "Tokens", "Más o menos tres cuartos de palabra. Pagas por token de entrada y de salida."),
          t("Temperature", "Randomness in wording, not intelligence.", "Temperatura", "Aleatoriedad en la redacción, no inteligencia."),
          t("Streaming", "Get the reply piece by piece.", "Streaming", "Recibir la respuesta pedazo a pedazo."),
          t("Structured output", "Ask for JSON when your code needs to use the answer.", "Salida estructurada", "Pide JSON cuando tu código tenga que usar la respuesta."),
          t("API keys", "Keep them in environment variables, never in the file.", "Llaves de API", "Guárdalas en variables de entorno, nunca en el archivo."),
        ],
        res: [
          r("Anthropic: Get Started", "https://docs.claude.com/en/docs/get-started", "docs", "Your first API call in Python.", "Tu primera llamada a la API en Python.", true),
          r("Anthropic: Messages API reference", "https://platform.claude.com/docs/en/api/messages", "docs", "Every parameter. Keep it open while you build.", "Todos los parámetros. Tenla abierta mientras construyes."),
          r("W3Schools: Python Requests", "https://www.w3schools.com/python/module_requests.asp", "course", "How code sends and receives data over HTTP.", "Cómo el código envía y recibe datos por HTTP."),
          r("Ollama", "https://ollama.com/", "tool", "Run an open model locally. No key, no bill.", "Corre un modelo abierto en local. Sin llave, sin factura."),
        ],
      },
      {
        id: "ctx",
        title: { en: "Context, caching & cost", es: "Contexto, caché y costos" },
        chips: [c("Costs money", "Cuesta plata")],
        idea: {
          en: "The context window is everything the model sees at once, and you pay for all of it on every call.",
          es: "La ventana de contexto es todo lo que el modelo ve a la vez, y lo pagas completo en cada llamada.",
        },
        body: {
          en: "Filling it with junk makes answers worse, so choosing what goes in is a skill (context engineering). Caching lets you pay once for a prefix that never changes; put stable content first and changing content last.",
          es: "Llenarla de basura empeora las respuestas, así que elegir qué entra es una habilidad (ingeniería de contexto). La caché te deja pagar una vez por un prefijo que no cambia; pon primero lo estable y al final lo que cambia.",
        },
        terms: [
          t("Context engineering", "Curate what the model sees instead of stuffing everything in.", "Ingeniería de contexto", "Escoger lo que ve el modelo en vez de meterle todo."),
          t("Prompt caching", "Reuse a processed, unchanged prefix cheaply. One edit near the top breaks it.", "Caché de prompts", "Reusar barato un prefijo ya procesado que no cambió. Un cambio cerca del inicio lo rompe."),
          t("Batching", "Async jobs at a discount when speed doesn't matter.", "Lotes", "Trabajos asíncronos con descuento cuando la velocidad no importa."),
          t("Routing", "A cheap model for easy steps, the expensive one only where it earns it.", "Enrutamiento", "Un modelo barato para los pasos fáciles y el caro solo donde vale la pena."),
        ],
        res: [
          r("Anthropic: Context windows", "https://platform.claude.com/docs/en/build-with-claude/context-windows", "docs", "What counts toward the window.", "Qué cuenta dentro de la ventana.", true),
          r("Anthropic: Prompt caching", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", "docs", "How prefix caching works and what invalidates it.", "Cómo funciona la caché de prefijos y qué la invalida."),
          r("Anthropic: Batch processing", "https://platform.claude.com/docs/en/build-with-claude/batch-processing", "docs", "Async jobs at lower cost.", "Trabajos asíncronos a menor costo."),
          r("Anthropic: Effective context engineering", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", "read", "Why curating context beats stuffing it.", "Por qué escoger el contexto le gana a llenarlo."),
        ],
      },
      {
        id: "agents",
        title: { en: "Agents, harnesses & the loop", es: "Agentes, el arnés y el ciclo" },
        chips: [c("Where it's going", "Hacia dónde va")],
        idea: {
          en: "An agent is a model in a loop with tools: it asks, your code acts, the result goes back in.",
          es: "Un agente es un modelo en un ciclo con herramientas: él pide, tu código actúa y el resultado vuelve a entrar.",
        },
        body: {
          en: "The model never runs anything itself. Everything around it (tool definitions, execution, memory, permissions, the loop) is the harness, and that's what you build. Most problems don't need an agent; one good prompt or a fixed chain is cheaper and more predictable.",
          es: "El modelo nunca ejecuta nada por sí mismo. Todo lo que lo rodea (definir herramientas, ejecutarlas, memoria, permisos, el ciclo) es el arnés, y eso es lo que construyes. La mayoría de problemas no necesitan un agente; un buen prompt o una cadena fija es más barato y predecible.",
        },
        terms: [
          t("Harness", "The code around the model that runs tools and manages the loop.", "Arnés", "El código alrededor del modelo que ejecuta herramientas y maneja el ciclo."),
          t("Tools", "Describe them as carefully as your prompt; it's all the model sees.", "Herramientas", "Descríbelas con el mismo cuidado que tu prompt; es todo lo que ve el modelo."),
          t("Evals", "Known-good tasks you re-run after every change.", "Evaluaciones", "Tareas con resultado conocido que vuelves a correr tras cada cambio."),
          t("Limits", "Fewest tools that work, hard caps on steps and spend.", "Límites", "Las mínimas herramientas que funcionen, topes firmes de pasos y de gasto."),
        ],
        res: [
          r("Anthropic: Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents", "read", "Workflows vs agents and the patterns worth knowing.", "Flujos de trabajo vs. agentes y los patrones que vale la pena conocer.", true),
          r("Hugging Face: AI Agents Course", "https://huggingface.co/learn/agents-course", "course", "Build the think-act-observe loop yourself.", "Construye tú mismo el ciclo pensar-actuar-observar."),
          r("Anthropic: Tool use", "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", "docs", "Defining tools and handling the model's calls.", "Definir herramientas y manejar las llamadas del modelo."),
          r("Model Context Protocol", "https://modelcontextprotocol.io/", "docs", "An open standard for plugging tools and data into models.", "Un estándar abierto para conectar herramientas y datos a los modelos."),
        ],
      },
    ],
  },
];

/** Every resource gets a stable id, phase.module.index, which is what progress is saved under. */
export const resId = (p: Phase, m: Module, i: number) => `${p.id}.${m.id}.${i}`;
