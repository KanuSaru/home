---
title: Why machine learning needs maths
date: 2026-11-02
tags: machine learning, maths, learning
summary: You can train a model without maths. You can't tell why it's wrong without it. Three kinds of maths do almost all the work, and here's what each one is for.
---

You can train a model today without knowing any maths. Five lines of scikit-learn and it runs. The problem shows up later, when the model is wrong and you have no way to ask it why.

Almost all of machine learning sits on three kinds of maths. Each one answers a different question.

## Linear algebra: what the data is

A dataset is a table of numbers. A photo is a grid of numbers. A sentence, once a model reads it, is a list of numbers. Linear algebra is the arithmetic of whole tables at once, and it's the language every model is written in.

A layer of a neural network is one line of it:

```
output = activation(W · x + b)
```

`x` is the input, `W` is a table of weights, `b` is a bias. Multiply, add, bend. A deep network is that line repeated, each output feeding the next input.

When you know this, error messages stop being mysterious. "Shapes (32, 64) and (128, 10) not aligned" means two tables that can't be multiplied, and you can see exactly which layer is wrong.

## Calculus: how it learns

Training means finding the weights that make the model's error as small as possible. Picture the error as a landscape: every possible set of weights is a point, and its height is how wrong the model is there. Training is walking downhill.

The derivative tells you which way is downhill. Take a small step that way, check again, repeat:

```python
w = 0.0
for step in range(100):
    gradient = 2 * (w - 3)       # slope of the error (w - 3)²
    w = w - 0.1 * gradient       # one small step downhill
print(w)                         # ends very close to 3
```

That's gradient descent, and it's the whole idea behind training, from a straight line to a language model. Backpropagation is just an efficient way to get that slope for millions of weights at once.

You don't need every integration technique. You need to understand what a derivative and a gradient mean, and why the size of the step (the learning rate) can make training crawl or blow up.

## Statistics: whether to believe it

This is the one beginners skip, and it's the one that matters most. A model learns from a sample and is used on the world. Statistics is how you judge whether what it learned holds up.

It's what tells you:

- why you test on data the model never saw, and why a model that scores 99% on its training data can be useless
- why 95% accuracy means nothing when 95% of your examples are the same class
- whether a difference between two models is real or noise
- why a correlation in your data doesn't mean one thing causes the other

In medical imaging, where my own research is, this is the difference between a model that looks good in a table and one a doctor could trust.

## How much you need

Roughly: half statistics and probability, a third linear algebra, the rest calculus. Start the maths alongside your first Python, not before it: the code gives the maths something to do, and the maths explains what the code is doing.

If a formula won't click, write it as a loop and run it. That's often the fastest way in.
