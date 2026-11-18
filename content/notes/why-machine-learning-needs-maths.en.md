---
title: Why machine learning needs maths
date: 2026-11-02
tags: machine learning, maths, learning
summary: A scary formula is usually a few simple steps written very compactly. Here's why the maths is worth learning, what statistics, linear algebra and calculus each do in machine learning, and the ideas behind PCA and gradient descent without the jargon.
description: What statistics, linear algebra and calculus each do in machine learning, and the ideas behind PCA and gradient descent, without the jargon.
---

Show this to someone who has just learned Pythagoras and they'll want to close the book:

$$D(x, y) = \left( \sum_{i=1}^{n} |x_i - y_i|^p \right)^{\frac{1}{p}}$$

It's the Minkowski distance. Now say the same thing as steps:

1. Take two points and subtract them, one coordinate at a time. For 7 and 3, the gap is 4.
2. Raise each gap to a power. With a power of 2, a gap of 4 becomes 16, and a gap of 1 stays 1. Big gaps get punished much more than small ones.
3. Add up all the punished gaps.
4. Undo the power at the end, so the answer is a distance again and not an inflated number.

Nothing in there is harder than school arithmetic. With a power of 2 it's exactly Pythagoras. The formula only looks scary because it packs four steps into one line.

That's the point of this note. Maths notation is compression. Once you can read it, a line of symbols is easier than a paragraph of words, and the advanced ideas stop looking like a wall.

## Nobody is born good at this

I don't believe in "maths people". Some pick things up faster, but what separates people is practice, and the fact that maths is stacked: every idea stands on earlier ones.

Take this integral:

$$\int \frac{1}{x^3} \, \ln x \; dx$$

To solve it you need fractions, exponent rules, rewriting an expression in an equivalent form, what a function is, what the natural logarithm is, what a derivative is, and integration by parts. If one of those is shaky, the whole question feels impossible, and it's easy to decide you're just bad at it. You're not. You're missing a step underneath.

How deep you go depends on where you're headed. For research you'll spend more time with maths than with code. For building and shipping models, you won't solve triple integrals at work; you need to understand what the tools are doing.

## The three branches

Almost all of machine learning sits on three kinds of maths. In order of how much you'll use them:

- **Statistics**: whether what the model learned can be trusted
- **Linear algebra**: how the data is represented and transformed
- **Calculus**: how the model learns

## Statistics: can I trust this?

Real data is messy, and statistics is the toolbox for getting something trustworthy out of it. It answers questions like:

- Where does my data come from, and how well does it represent the real world?
- Is my model good, or was the test I gave it too easy?
- Is the difference between two models real, or noise?

You'll hear the phrase **ground truth** constantly: the answers we treat as correct, which everything else is measured against. A lot of the work is making human data fit for maths: balanced, numerical, and clean enough to feed into a function.

Language models are statistics too. ChatGPT, Claude and Gemini are, in the end, very large probability machines. They don't read words the way you do. They work with chunks called tokens and have learned which chunks tend to follow which. Mention "car" and "engine" in your question and "truck" becomes far more likely to come next than "water". The answer you get is the most probable continuation.

### Untangling a mix: ICA

Sometimes what you measured is several things blended together. Picture three friends singing at once at a karaoke bar, with three microphones in the room. Every microphone records all three voices, at different volumes. Each recording is a tangle.

::karaoke caption="Three voices go in mixed. ICA works out which part of the tangle belongs to whom."

**Independent component analysis** (ICA) takes those tangled recordings and gives you back each voice on its own. Nobody tells it who was singing where, which is why it's also called blind source separation.

The trick is statistical. When you mix many independent things, the result tends towards the bell curve, the most ordinary shape data can take. A single voice is less ordinary: it has spikes and flat stretches of its own. ICA looks for the directions in the data that look least like a bell curve, and those turn out to be the original voices.

::bell caption="The bell curve: most values crowd around the average. A mix of many things looks like this; a single voice doesn't."

## Linear algebra: the shape of the data

A model only understands numbers, and the numbers need structure. A house with 3 bedrooms, 2 bathrooms, 1,200 square feet and a price of 250,000 becomes a list:

$$\text{house} = \begin{bmatrix} 3 \\ 2 \\ 1200 \\ 250000 \end{bmatrix}$$

That's a **vector**. Stack many houses and you get a table, with a row per house and a column per thing you measured. That's a **matrix**. So from the very first step, your data is linear algebra.

::houses caption="Three houses as a matrix: each row is a house, each column is something we measured."

The core of a neural network is one line:

$$z = \left( \sum_{i=1}^{n} x_i \times w_i \right) + b$$

Read it piece by piece. Each $x_i$ is one of the house's attributes. Each $w_i$ is a **weight**, a number that says how much that attribute matters. $b$ is the **bias**, one more number added at the end. The $\sum$ just means: do the multiplication for every attribute and add the results. Do that for many attributes and many houses at once and it's a matrix multiplication. A neural network is a long chain of them.

Multiplying by a matrix transforms data: it stretches it, squashes it, turns it. A model keeps transforming the data until it lands on something useful, like a class, a price, or the next token of a sentence.

### Keeping what matters: PCA

Real tables often say the same thing twice. Height and weight are a good example: taller people are usually heavier, so the two columns mostly move together. Why store two columns when one direction, "bigger person", explains most of it?

::trend caption="Height and weight for two groups. Both lines say the same thing: as one goes up, so does the other."

That's **principal component analysis** (PCA). It finds the directions along which the data spreads out the most, and lets you describe everything using those directions. The first direction carries the most information. The second carries the leftover wiggle the first couldn't explain, and so on.

::pca caption="The data already points in a direction; PCA just finds it. PC1 runs along the cloud, PC2 across it."

How does it find them? With an idea that sounds worse than it is: **eigendecomposition**. You know that $12 = 2 \times 2 \times 3$, its prime factors. A matrix can be broken down into building blocks too:

- **Eigenvectors**: the core directions built into the matrix
- **Eigenvalues**: how strong each of those directions is

Multiplying a vector by a matrix normally stretches it and turns it. An eigenvector is a direction the matrix refuses to turn. It only gets longer or shorter, and the eigenvalue is by how much.

PCA builds a table of how every pair of columns moves together (the covariance matrix) and breaks it down this way. The eigenvector with the largest eigenvalue is the direction of largest spread. Keep the few biggest and drop the rest, and you have a smaller dataset that still says almost everything the big one did.

PCA and ICA are easy to confuse, and they do different jobs:

::compare

In practice PCA often runs first, as a clean-up step before ICA.

## Calculus: how the model learns

Say the network makes a prediction and it's wrong. How do we tell it to be less wrong?

First we need to measure how wrong. That's the **loss function**: it takes the model's prediction and the real answer and returns one number. The bigger the number, the worse the prediction. It's the same idea as the distance at the top of this note, with the prediction and the ground truth as the two points.

Now picture the loss as a landscape. Every possible setting of the weights is a place, and its height is how wrong the model is there. Training is walking downhill.

On a straight line like $y = mx + b$ the slope is the same everywhere: it's $m$. On a curve like $y = ax^2 + bx + c$ it changes at every point, and calculus is the maths of that kind of continuous change.

::curves

 The **derivative** is the slope where you're standing. It tells you which way is down.

So training is a loop:

1. Compute the slope where you are.
2. Take a small step the opposite way.
3. Repeat.

That's **gradient descent**: descending, using the gradient.

::descent caption="Each square is one step. The steeper the slope, the bigger the step, so the steps shrink as it gets close to the bottom."

Written as a formula, one step is:

$$w \leftarrow w - \eta \cdot \frac{\partial L}{\partial w}$$

$L$ is the loss, $\frac{\partial L}{\partial w}$ is the slope of the loss for the weight $w$, and $\eta$ (the learning rate) is how big a step to take. The code says the same thing:

```python
w = 0.0
for step in range(100):
    gradient = 2 * (w - 3)       # slope of the error (w - 3)²
    w = w - 0.1 * gradient       # one small step downhill
print(w)                         # ends very close to 3
```

A real model doesn't have one weight; it has millions, so the landscape isn't a curve but a surface with far more dimensions than we can draw. In three it looks like this:

::landscape caption="With more than one weight the curve becomes a surface. Going downhill can end in a shallow valley and never find the deepest one, which is why where you start and how big your steps are both matter."

We can't change the inputs. The weights and the bias are the only numbers we're allowed to move, so those are what the loop adjusts.

Two names come up together here, and they do different jobs:

- **Backpropagation** works out how much each weight was responsible for the error.
- **Gradient descent** uses that to move each weight to a better value.

Backpropagation rests on the chain rule. If the output depends on a value through several layers, the slope of the whole thing is the slopes of each layer multiplied together:

$$\frac{dL}{dx} = \frac{dL}{dz} \cdot \frac{dz}{dy} \cdot \frac{dy}{dx}$$

 That's what lets a network with millions of weights learn at all.

## Start from the ground up

All of this is why I'd rather you build the maths from the bottom than skip ahead. If you can't multiply powers, the power rule of calculus won't make sense, and you'll blame calculus.

Take your time and be patient with yourself. Go back to the unit tests on Khan Academy every so often so what you learned stays fresh. That's how people become "good at maths".

If a formula still won't click, write it as a loop and run it. That's often the fastest way in.
