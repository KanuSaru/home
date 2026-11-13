---
title: Por qué el machine learning necesita matemáticas
date: 2026-11-02
tags: machine learning, matemáticas, aprendizaje
summary: Una fórmula que asusta casi siempre son unos pocos pasos simples escritos de forma muy compacta. Aquí va por qué vale la pena aprender las matemáticas, qué hacen la estadística, el álgebra lineal y el cálculo en machine learning, y las ideas detrás de PCA y el descenso de gradiente sin la jerga.
---

Muéstrale esto a alguien que acaba de aprender Pitágoras y va a querer cerrar el libro:

```
D(x, y) = ( Σ |xᵢ − yᵢ|ᵖ ) ^ (1/p)
```

Es la distancia de Minkowski. Ahora di lo mismo en pasos:

1. Toma dos puntos y réstalos, coordenada por coordenada. Para 7 y 3, la diferencia es 4.
2. Eleva cada diferencia a una potencia. Con potencia 2, una diferencia de 4 se vuelve 16, y una de 1 se queda en 1. Las diferencias grandes se castigan mucho más que las pequeñas.
3. Suma todas las diferencias castigadas.
4. Deshaz la potencia al final, para que el resultado vuelva a ser una distancia y no un número inflado.

Nada de eso es más difícil que la aritmética del colegio. Con potencia 2 es exactamente Pitágoras. La fórmula solo asusta porque mete cuatro pasos en una línea.

Ese es el punto de esta nota. La notación matemática es compresión. Cuando la sabes leer, una línea de símbolos es más fácil que un párrafo de palabras, y las ideas avanzadas dejan de parecer un muro.

## Nadie nace sabiendo esto

No creo en la "gente de matemáticas". Algunos aprenden más rápido, pero lo que separa a las personas es la práctica, y el hecho de que las matemáticas se apilan: cada idea se apoya en las anteriores.

Toma una integral como `∫ (1/x³) · ln x dx`. Para resolverla necesitas fracciones, reglas de exponentes, reescribir una expresión en una forma equivalente, saber qué es una función, qué es el logaritmo natural, qué es una derivada, e integración por partes. Si una de esas está floja, toda la pregunta se siente imposible, y es fácil concluir que simplemente eres malo para esto. No lo eres. Te falta un escalón de abajo.

Qué tan profundo llegas depende de a dónde vas. En investigación vas a pasar más tiempo con matemáticas que con código. Para construir y desplegar modelos, no vas a resolver integrales triples en el trabajo; necesitas entender qué están haciendo las herramientas.

## Las tres ramas

Casi todo el machine learning se apoya en tres tipos de matemáticas. En orden de cuánto las vas a usar:

- **Estadística**: si se puede confiar en lo que aprendió el modelo
- **Álgebra lineal**: cómo se representan y se transforman los datos
- **Cálculo**: cómo aprende el modelo

## Estadística: ¿puedo confiar en esto?

Los datos reales son un desorden, y la estadística es la caja de herramientas para sacar de ahí algo confiable. Responde preguntas como:

- ¿De dónde vienen mis datos y qué tan bien representan el mundo real?
- ¿Mi modelo es bueno, o la prueba que le puse era muy fácil?
- ¿La diferencia entre dos modelos es real, o es ruido?

Vas a oír todo el tiempo la expresión **ground truth**: las respuestas que tomamos como correctas, contra las que se mide todo lo demás. Mucho del trabajo es dejar los datos humanos listos para las matemáticas: balanceados, numéricos y lo bastante limpios para entrar en una función.

Los modelos de lenguaje también son estadística. ChatGPT, Claude y Gemini son, al final, máquinas de probabilidad muy grandes. No leen palabras como tú. Trabajan con pedazos llamados tokens y han aprendido qué pedazos suelen seguir a cuáles. Menciona "carro" y "motor" en tu pregunta, y "camión" se vuelve mucho más probable como siguiente palabra que "agua". La respuesta que recibes es la continuación más probable.

### Desenredar una mezcla: ICA

A veces lo que mediste son varias cosas mezcladas. Imagina a tres amigos cantando al tiempo en un karaoke, con tres micrófonos en el salón. Cada micrófono graba las tres voces, a distinto volumen. Cada grabación es un enredo.

El **análisis de componentes independientes** (ICA) toma esas grabaciones enredadas y te devuelve cada voz por separado. Nadie le dice quién cantaba dónde, y por eso también se le llama separación ciega de fuentes.

El truco es estadístico. Cuando mezclas muchas cosas independientes, el resultado tiende a la campana de Gauss, la forma más corriente que pueden tomar los datos. Una sola voz es menos corriente: tiene picos y tramos planos propios. ICA busca las direcciones de los datos que menos se parecen a una campana, y esas resultan ser las voces originales.

## Álgebra lineal: la forma de los datos

Un modelo solo entiende números, y los números necesitan estructura. Una casa con 3 habitaciones, 2 baños, 110 metros cuadrados y un precio de 250.000 se vuelve una lista:

```
[3, 2, 110, 250000]
```

Eso es un **vector**. Apila muchas casas y tienes una tabla, con una fila por casa y una columna por cada cosa que mediste. Eso es una **matriz**. Así que desde el primer paso, tus datos son álgebra lineal.

El corazón de una red neuronal es una línea:

```
z = (x₁·w₁ + x₂·w₂ + … + xₙ·wₙ) + b
```

`x` son los atributos de la casa. `w` son los **pesos**, números que dicen cuánto importa cada atributo. `b` es el **sesgo**, un número más que se suma al final. Haz eso para muchos atributos y muchas casas a la vez y es una multiplicación de matrices. Una red neuronal es una cadena larga de ellas.

Multiplicar por una matriz transforma los datos: los estira, los aplasta, los gira. Un modelo sigue transformando los datos hasta llegar a algo útil, como una clase, un precio o el siguiente token de una frase.

### Quedarse con lo que importa: PCA

Las tablas reales suelen decir lo mismo dos veces. La estatura y el peso son un buen ejemplo: la gente más alta suele pesar más, así que las dos columnas se mueven casi juntas. ¿Para qué guardar dos columnas si una sola dirección, "persona más grande", explica casi todo?

Eso es el **análisis de componentes principales** (PCA). Encuentra las direcciones en las que los datos más se dispersan y te deja describir todo usando esas direcciones. La primera dirección lleva la mayor parte de la información. La segunda lleva el sobrante que la primera no pudo explicar, y así sucesivamente.

¿Cómo las encuentra? Con una idea que suena peor de lo que es: la **descomposición en valores propios**. Sabes que 12 se descompone en 2 × 2 × 3, sus factores primos. Una matriz también se puede descomponer en sus bloques:

- **Vectores propios** (eigenvectores): las direcciones centrales que trae la matriz
- **Valores propios** (eigenvalores): qué tan fuerte es cada una de esas direcciones

Multiplicar un vector por una matriz normalmente lo estira y lo gira. Un vector propio es una dirección que la matriz se niega a girar. Solo se alarga o se acorta, y el valor propio dice cuánto.

PCA arma una tabla de cómo se mueve junta cada pareja de columnas (la matriz de covarianza) y la descompone así. El vector propio con el valor propio más grande es la dirección de mayor dispersión. Te quedas con los pocos más grandes, sueltas el resto, y tienes un conjunto de datos más pequeño que sigue diciendo casi todo lo que decía el grande.

PCA e ICA se confunden fácil, y hacen trabajos distintos:

- **PCA** despeja. Dos cuerdas del mismo color, una al lado de la otra: te quedas con una. Le importa la dispersión.
- **ICA** desmezcla. Tres cuerdas de colores distintos enredadas: las separa. Le importa la independencia.

En la práctica, PCA suele correr primero, como limpieza antes de ICA.

## Cálculo: cómo aprende el modelo

Digamos que la red hace una predicción y se equivoca. ¿Cómo le decimos que se equivoque menos?

Primero hay que medir cuánto se equivocó. Esa es la **función de pérdida**: toma la predicción del modelo y la respuesta real, y devuelve un número. Entre más grande el número, peor la predicción. Es la misma idea de la distancia del principio de esta nota, con la predicción y el ground truth como los dos puntos.

Ahora imagina la pérdida como un paisaje. Cada posible ajuste de los pesos es un lugar, y su altura es qué tan equivocado está el modelo ahí. Entrenar es caminar cuesta abajo.

En una línea recta la pendiente es la misma en todas partes. En una curva cambia en cada punto, y el cálculo es la matemática de ese tipo de cambio continuo. La **derivada** es la pendiente donde estás parado. Te dice hacia dónde queda abajo.

Así que entrenar es un ciclo:

1. Calcula la pendiente donde estás.
2. Da un paso pequeño en la dirección contraria.
3. Repite.

Eso es el **descenso de gradiente**: descender, usando el gradiente.

```python
w = 0.0
for paso in range(100):
    gradiente = 2 * (w - 3)      # pendiente del error (w - 3)²
    w = w - 0.1 * gradiente      # un paso pequeño cuesta abajo
print(w)                         # termina muy cerca de 3
```

Las entradas no las podemos cambiar. Los pesos y el sesgo son los únicos números que tenemos permiso de mover, así que eso es lo que ajusta el ciclo.

Aquí aparecen dos nombres juntos, y hacen trabajos distintos:

- La **retropropagación** (backpropagation) averigua cuánta culpa tuvo cada peso en el error.
- El **descenso de gradiente** usa eso para mover cada peso a un valor mejor.

La retropropagación se apoya en la regla de la cadena. Si la salida depende de un valor a través de varias capas, la pendiente del total es el producto de las pendientes de cada capa. Eso es lo que permite que aprenda una red con millones de pesos.

## Empieza desde abajo

Por todo esto prefiero que construyas las matemáticas desde la base y no que te saltes pasos. Si no sabes multiplicar potencias, la regla de la potencia del cálculo no va a tener sentido, y le vas a echar la culpa al cálculo.

Tómate tu tiempo y ten paciencia contigo. Vuelve cada tanto a las pruebas de unidad de Khan Academy para que lo aprendido siga fresco. Así es como la gente se vuelve "buena para las matemáticas".

Si una fórmula sigue sin hacer clic, escríbela como un ciclo y córrela. Muchas veces es la entrada más rápida.
