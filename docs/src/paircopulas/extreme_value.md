# Extreme-value pair-copulas

Bivariate extreme-value copulas are supported through the Pickands dependence function representation supplied by `Copulas.jl`.

For an extreme-value copula,

```math
C(u,v) = \exp\left[-(x+y)A\left(\frac{x}{x+y}\right)\right],
\qquad x=-\log u,\quad y=-\log v,
```

where ``A`` is the Pickands dependence function.

## Conditional functions

For smooth tails, the implementation uses analytic h-functions derived from ``A`` and ``A'``. Inverse conditionals are solved in a safeguarded one-dimensional coordinate. Tails with jumps or flat conditional regions use generalized conditional quantiles.

## Tested examples

```@example ev-copulas
using VineCopulas
using Copulas

C = Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5))
q = hfunc1(C, 0.3, 0.7)
hinv1(C, q, 0.7)
```

Tested tails include logistic, Galambos, Hüsler–Reiss, Mixed, asymmetric logistic, asymmetric Galambos, asymmetric Mixed, Cuadras–Augé, Marshall–Olkin, BC2, and extreme-t.

This is one of the distinctive parts of `VineCopulas.jl`: smooth and singular extreme-value pair-copulas are handled separately instead of pretending that every inverse is an ordinary smooth inverse.
