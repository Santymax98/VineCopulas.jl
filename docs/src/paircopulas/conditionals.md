# Pair-copula conditionals

Vine algorithms require bivariate conditional distribution functions and their inverses. The public API is:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The aliases `h₁`, `h₂`, `h₁⁻¹`, and `h₂⁻¹` are also exported.

## Mathematical convention

```math
h_1(u,v) = \frac{\partial C(u,v)}{\partial v},
\qquad
h_2(u,v) = \frac{\partial C(u,v)}{\partial u}.
```

The inverse functions satisfy approximately

```math
h_1(h_1^{-1}(q\mid v),v)=q,
\qquad
h_2(u,h_2^{-1}(q\mid u))=q.
```

For singular copulas the inverse should be interpreted as a generalized inverse.

## Matrix helpers

For bivariate data stored row-wise as an `n × 2` matrix, `hfunc1(C, U)` and `hfunc2(C, U)` return vectors of conditional probabilities.

```@example conditionals
using VineCopulas

C = FrankCopula(2, 3.0)
U = [0.2 0.7; 0.5 0.5; 0.8 0.3]

hfunc1(C, U)
```
