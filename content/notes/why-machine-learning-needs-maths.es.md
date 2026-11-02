---
title: Por qué el machine learning necesita matemáticas
date: 2026-11-02
tags: machine learning, matemáticas, aprendizaje
summary: Puedes entrenar un modelo sin matemáticas. Lo que no puedes es saber por qué se equivoca. Tres tipos de matemáticas hacen casi todo el trabajo, y aquí va para qué sirve cada uno.
---

Hoy puedes entrenar un modelo sin saber nada de matemáticas. Cinco líneas de scikit-learn y corre. El problema aparece después, cuando el modelo se equivoca y no tienes cómo preguntarle por qué.

Casi todo el machine learning se apoya en tres tipos de matemáticas. Cada uno responde una pregunta distinta.

## Álgebra lineal: qué son los datos

Un dataset es una tabla de números. Una foto es una cuadrícula de números. Una frase, cuando un modelo la lee, es una lista de números. El álgebra lineal es la aritmética de tablas enteras a la vez, y es el idioma en el que está escrito todo modelo.

Una capa de una red neuronal es una línea de álgebra lineal:

```
salida = activación(W · x + b)
```

`x` es la entrada, `W` es una tabla de pesos, `b` es un sesgo. Multiplicar, sumar, doblar. Una red profunda es esa línea repetida, con cada salida alimentando la siguiente entrada.

Cuando sabes esto, los errores dejan de ser un misterio. "Shapes (32, 64) and (128, 10) not aligned" significa dos tablas que no se pueden multiplicar, y puedes ver exactamente qué capa está mal.

## Cálculo: cómo aprende

Entrenar es encontrar los pesos que hacen el error del modelo lo más pequeño posible. Imagina el error como un paisaje: cada combinación de pesos es un punto, y su altura es qué tan equivocado está el modelo ahí. Entrenar es bajar la montaña.

La derivada te dice hacia dónde es cuesta abajo. Das un paso pequeño en esa dirección, vuelves a mirar, repites:

```python
w = 0.0
for paso in range(100):
    gradiente = 2 * (w - 3)      # pendiente del error (w - 3)²
    w = w - 0.1 * gradiente      # un paso pequeño cuesta abajo
print(w)                         # termina muy cerca de 3
```

Eso es el descenso por gradiente, y es la idea completa detrás de entrenar, desde una línea recta hasta un modelo de lenguaje. La retropropagación es solo una forma eficiente de calcular esa pendiente para millones de pesos a la vez.

No necesitas todas las técnicas de integración. Necesitas entender qué significan una derivada y un gradiente, y por qué el tamaño del paso (la tasa de aprendizaje) puede hacer que el entrenamiento se arrastre o se dispare.

## Estadística: si creerle o no

Esta es la que los principiantes se saltan, y es la que más importa. Un modelo aprende de una muestra y se usa en el mundo. La estadística es cómo juzgas si lo que aprendió se sostiene.

Es lo que te dice:

- por qué se evalúa con datos que el modelo nunca vio, y por qué un modelo con 99% en sus datos de entrenamiento puede ser inútil
- por qué un 95% de exactitud no significa nada cuando el 95% de tus ejemplos son de la misma clase
- si la diferencia entre dos modelos es real o es ruido
- por qué una correlación en tus datos no significa que una cosa cause la otra

En imágenes médicas, donde está mi propia investigación, esa es la diferencia entre un modelo que se ve bien en una tabla y uno en el que un médico podría confiar.

## Cuánto necesitas

Más o menos: la mitad estadística y probabilidad, un tercio álgebra lineal y el resto cálculo. Empieza las matemáticas a la par con tu primer Python, no antes: el código le da a las matemáticas algo que hacer, y las matemáticas explican lo que hace el código.

Si una fórmula no te entra, escríbela como un ciclo y córrela. Muchas veces es la forma más rápida de entenderla.
