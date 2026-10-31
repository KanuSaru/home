---
title: Cómo dither-moon dibuja la Luna
date: 2026-10-31
tags: gráficos, astronomía, javascript
summary: La luna de mi página de inicio no es una imagen. Se calcula a partir de dónde están el Sol y la Luna en este momento, se envuelve con el mapa de la NASA y se dibuja píxel a píxel, encendido o apagado. Aquí explico cómo, paso a paso.
---

La luna de mi página de inicio no es una imagen. Varias veces por segundo, un pequeño programa calcula dónde están el Sol y la Luna en este momento, ilumina una esfera de acuerdo con eso, la envuelve con el mapa de la Luna de la NASA y decide, para cada píxel, si va encendido o apagado. Lo empaqueté como [dither-moon](https://github.com/KanuSaru/dither-moon) para que cualquiera pueda ponerlo en su propia página.

Esta nota lo recorre paso a paso. Todas las lunas de aquí abajo están vivas: muestran la fecha escrita debajo y puedes arrastrarlas para girarlas.

## 1. En qué punto de su ciclo está la Luna

Una fase es pura geometría. El Sol siempre ilumina la mitad de la Luna; lo que cambia es cuánto de esa mitad iluminada mira hacia nosotros. Eso depende del ángulo entre el Sol y la Tierra visto desde la Luna, llamado **ángulo de fase**. Con 0° vemos todo el lado iluminado (luna llena); con 180°, nada (luna nueva).

Para obtener ese ángulo, la librería calcula dónde están el Sol y la Luna en el cielo en ese instante, con las series clásicas de baja precisión del libro *Astronomical Algorithms* de Jean Meeus. Para el Sol basta una posición media más una corrección por la órbita elíptica de la Tierra. La Luna necesita más: su posición media más las mayores oscilaciones que causan su propia órbita, inclinada y alargada, y el tirón del Sol. El mayor de esos términos, por sí solo, la mueve más de 6°. De las dos posiciones sale el ángulo de fase, y de ahí la fracción iluminada:

```
fracción iluminada = (1 + cos(ángulo de fase)) / 2
```

Lo comprobé con eclipses, que son las lunas nuevas y llenas con la hora más precisa que existe: el resultado cae a unos cinco minutos. Un ciclo fijo de 29,5 días puede equivocarse hasta en medio día, porque el mes real se acelera y se frena.

::moons dates="2026-11-13,2026-11-17,2026-11-21,2026-11-24" labels="13 nov|17 nov|21 nov|24 nov" caption="El mismo código en cuatro fechas de este noviembre: una luna creciente al 16 %, cuarto creciente, gibosa al 87 % y luna llena."

Un detalle sobre los nombres: luna nueva, cuarto creciente, luna llena y cuarto menguante son instantes, no días. Por eso la librería solo usa esos nombres a menos de un día del momento exacto, y los nombres intermedios ("gibosa creciente", "luna menguante"…) el resto del tiempo.

## 2. Una esfera iluminada de lado

El dibujo empieza pequeño: un lienzo cuadrado de unos cien píxeles de lado. Para cada píxel, si cae dentro del círculo, el programa busca el punto correspondiente en la cara frontal de una esfera. En una esfera de radio 1, ese punto también es la dirección hacia la que mira la superficie ahí (su *normal*), que es todo lo que hace falta para iluminarla.

La forma obvia de sombrear una esfera es la ley de Lambert: el brillo sigue el coseno del ángulo entre la superficie y la luz, así que la esfera se oscurece hacia los bordes. La Luna no hace eso. Una luna llena parece un disco plano y parejo, porque su suelo polvoriento devuelve la luz hacia el Sol. Ese comportamiento se parece más a la ley de **Lommel–Seeliger**, que además tiene en cuenta el ángulo desde el que miras:

```
brillo ∝ μ₀ / (μ₀ + μ)
μ₀ = cos(ángulo hacia el Sol), μ = cos(ángulo hacia quien mira)
```

Encima va una curva de tonos que mantiene sólida la mayor parte del lado iluminado y deja el degradado cerca de la línea de sombra, donde más importa en 1 bit.

::moon date=2026-11-21 surface=flat caption="Solo la iluminación: una esfera blanca lisa bajo el ángulo real del Sol el 21 de noviembre. Fíjate en lo pareja que se mantiene hasta su borde derecho."

## 3. Envolverla con el mapa de la NASA

Luego viene la superficie. El Scientific Visualization Studio de la NASA publica el [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720), un mapa de color y un mapa de elevación de toda la Luna hechos con datos del Lunar Reconnaissance Orbiter, de uso libre.

Cada punto de la esfera se convierte en una latitud y una longitud, y estas en una posición del mapa. El mapa se preparó de antemano: pasado a grises, reducido a 512 × 256, un poco desenfocado y llevado hacia dos tonos. Los mares oscuros (*maria*) quedan alrededor de un nivel y las tierras altas, más claras, alrededor de otro, y a este tamaño se lee mejor cuando las tierras altas salen casi sólidas y los mares como un patrón parejo de puntos. Los detalles finos, como cráteres pequeños y rayos brillantes, solo se vuelven ruido con tan pocos píxeles.

Los dos mapas viajan dentro de la librería, unos 33 KB, así que nunca tiene que descargar nada de otro sitio.

::moon date=2026-11-21 relief=0 caption="Con el mapa de la NASA, todavía sin relieve. Los mares oscuros son las formas en las que la gente ve una cara o un conejo."

## 4. Cráteres que atrapan la luz

La elevación no se dibuja como altura. En su lugar, para cada punto la librería mira el mapa de elevación justo al este y al oeste, y justo al norte y al sur, para obtener la **pendiente** ahí. Inclina la normal de la superficie según esa pendiente antes de iluminarla, así que la pared de un cráter que mira al Sol se aclara y la que le da la espalda se oscurece.

Esto casi no se nota en luna llena, porque la luz viene justo desde detrás de nosotros. Importa sobre todo a lo largo de la línea de sombra (el *terminador*), donde la luz del Sol llega rasante y cada pendiente marca una diferencia. Es la misma razón por la que la Luna se ve con más textura con binoculares alrededor del cuarto creciente.

La inclinación se calcula en el sistema de referencia propio de la Luna y luego se gira de vuelta a la vista. Así los cráteres siguen iluminados desde el lado correcto aunque la Luna se balancee o la arrastres.

::moon date=2026-11-17 caption="Cuarto creciente, con relieve. Mira a lo largo de la línea de sombra recta: ahí es donde aparecen los cráteres."

## 5. Encendido o apagado: tramado ordenado

A estas alturas cada píxel tiene un brillo entre 0 y 1, pero la luna se dibuja con un solo color sobre nada: cada píxel es tinta o vacío. La regla más simple es un umbral: encendido si el brillo pasa de la mitad. Eso tira a la basura todo lo intermedio.

El **tramado ordenado** (*ordered dithering*) le da a cada píxel su propio umbral, tomado de una cuadrícula pequeña que se repite por toda la imagen. dither-moon usa la **matriz de Bayer** de 4 × 4: los números del 0 al 15, ordenados para que umbrales consecutivos queden lo más lejos posible entre sí.

::bayer caption="La matriz de Bayer de 4 × 4. Cada píxel se compara con la celda que le toca, como (valor + 0,5) / 16. Las celdas más claras son umbrales más altos."

Así, un gris del 50 % se vuelve un tablero de ajedrez, uno del 25 % un punto cada dos píxeles y cada dos filas, y así sucesivamente: dieciséis niveles de gris a partir de solo encendido y apagado.

::ramp labels="Gris continuo|Un mismo umbral para todos los píxeles|Tramado ordenado (Bayer 4 × 4)" caption="El mismo degradado de izquierda a derecha, de tres maneras."

¿Por qué no difusión de error, como Floyd–Steinberg, que suele verse más natural? Porque la luna se mueve. La difusión de error le pasa el error de redondeo de cada píxel a sus vecinos, así que un cambio mínimo en cualquier parte reacomoda los puntos de toda la imagen, y una animación titila. Con una cuadrícula ordenada el patrón queda fijo a la pantalla, cada píxel se decide por su cuenta y una luna que se balancea despacio se ve tranquila. Además es muy barato: una comparación por píxel.

El lado nocturno tampoco queda del todo vacío. Conserva un 5 % del brillo de la superficie, justo lo suficiente para que las tierras altas más claras crucen los umbrales más bajos como puntos dispersos, algo parecido a la luz cenicienta.

## 6. Píxeles, estrellas y girarla con la mano

El lienzo pequeño se muestra 2 o 3 veces más grande con `image-rendering: pixelated`, así que cada píxel de la luna se vuelve un cuadrado nítido en vez de una mancha borrosa. Se redibuja unas nueve veces por segundo. Una tasa de cuadros baja le va bien al estilo pixelado y casi no gasta batería.

Lo demás es ambiente:

- **Balanceo**: la luna oscila unos pocos grados de lado a lado y de arriba abajo, un guiño a la *libración*, la oscilación lenta real que nos deja ver un poco más de la mitad de la Luna a lo largo de un mes.
- **Estrellas**: ubicadas con un hash para que sean las mismas en cada visita, y cada una se enciende y se apaga a su propio ritmo.
- **Arrastrar**: arrastrar de lado a lado de la luna la gira cerca de media vuelta, para ver la cara oculta. Seis segundos después de soltarla, vuelve sola al lado que siempre mira a la Tierra.

::moon size=large drift=sway stars=1 info=1 caption="La luna de hoy. Arrástrala para ver la cara oculta; regresa sola."

## Úsala

Funciona en cualquier página con una etiqueta de script, o como componente de React:

```html
<script src="https://cdn.jsdelivr.net/npm/dither-moon@1/dist/dither-moon.js"></script>
<dither-moon info lang="es" style="width: 240px; color: #e7e2d6"></dither-moon>
```

```bash
npm install dither-moon
```

Los cálculos de fase también están por separado (`moonPhase()`, `nextFullMoon()`), sin dependencias. El código está en [GitHub](https://github.com/KanuSaru/dither-moon) y el paquete en [npm](https://www.npmjs.com/package/dither-moon).

### Fuentes

- Jean Meeus, *Astronomical Algorithms*, 2.ª ed. (Willmann-Bell, 1998): posiciones del Sol y la Luna, y el ángulo de fase.
- NASA Scientific Visualization Studio, [CGI Moon Kit](https://svs.gsfc.nasa.gov/4720), a partir de datos del Lunar Reconnaissance Orbiter (LROC y LOLA).
- Bryce E. Bayer, "An optimum method for two-level rendition of continuous-tone pictures" (1973): la matriz de umbrales.
