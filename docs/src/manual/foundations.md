# Foundations

Vine copulas are a way to build flexible high-dimensional dependence models from
bivariate copulas. They are useful because bivariate copulas are easier to
understand, fit, diagnose, and optimize than a single unrestricted
high-dimensional copula.

This page gives the conceptual map used throughout `VineCopulas.jl`.

!!! note "Scope"
    `VineCopulas.jl` models dependence on the copula scale. Marginal
    distributions, raw-data preprocessing, and Sklar distributions are handled by
    `Copulas.jl` and the wider `Distributions.jl` ecosystem.

## Vine copula theory

Sklar's theorem separates marginal behavior from dependence. For continuous
margins,

```math
F(x_1,\ldots,x_p)
    =
C\{F_1(x_1),\ldots,F_p(x_p)\},
```

where ``C`` is the copula. `VineCopulas.jl` works with observations

```math
u_j = F_j(x_j) \in (0,1),
```

or with pseudo-observations built from ranks. The package does not try to be a
general marginal modeling library. That boundary is intentional: `Copulas.jl`
owns individual copula families and Sklar-style composition, while
`VineCopulas.jl` owns vine structures, vine traversal, and vine-specific
selection algorithms.

A regular vine decomposes a multivariate copula density into a product of
bivariate pair-copula densities. The main modeling choice is no longer only
"which multivariate copula?", but:

- which variables are connected at each tree;
- which conditioning set each edge uses;
- which bivariate copula family belongs to each edge;
- how many trees should be retained.

That last point is truncation. A vine truncated after tree ``q`` keeps the first
``q`` trees and treats higher-order conditional dependence as independence.

!!! tip "Modeling intuition"
    The first tree captures ordinary pairwise dependence. Higher trees capture
    dependence that remains after conditioning on variables already used by the
    vine. In many applied datasets, most of the signal is in the first few
    trees.

## Data conventions

All multivariate routines use a `p × n` matrix layout:

```text
rows    -> variables
columns -> observations
```

For example, `U[3, 10]` is the tenth observation of variable three. This follows
the convention used by `Copulas.jl` and `Distributions.jl` for multivariate
samples.

```@example foundations-data
using VineCopulas
using Random

vine = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.5), ClaytonCopula(2, 1.4)],
     [FrankCopula(2, 2.0)]],
)

U = rand(MersenneTwister(2026), vine, 5)
size(U)
```

If your data are stored as `n × p`, transpose or reshape them before fitting.

!!! warning "Copula scale required"
    Fitting expects copula-scale data, typically pseudo-observations in
    ``(0,1)^p``. Passing raw variables with arbitrary margins changes the
    likelihood being optimized.

## Vine structures

`VineCopulas.jl` exposes three public vine model families:

- `CVineCopula`: a canonical vine, organized around root variables;
- `DVineCopula`: a drawable/path vine, organized around an ordered path;
- `RVineCopula`: a regular vine, allowing general tree structures subject to
  the proximity condition.

Each vine has a structural component and a pair-copula component. The structural
component describes the variable order, active truncation depth, and, for
R-vines, the tree structure. The pair-copula component stores the bivariate
copulas attached to edges.

```@example foundations-structure
using VineCopulas

pair_edges = [
    [GaussianCopula(2, 0.45), ClaytonCopula(2, 1.2), FrankCopula(2, 2.0)],
    [GumbelCopula(2, 1.3), JoeCopula(2, 1.4)],
]

cv = CVineCopula([4, 1, 2, 3], pair_edges; trunc=2)
st = structure(cv)

(order = order(st), truncation = truncation(st), trees = length(edges(cv)))
```

!!! note "Single source of truth"
    Structure objects encode their truncation level in the type parameter `q`.
    For an `RVineStructure{p,q}`, the structure array has exactly `q` trees, so
    `length(struct_array(st)) == truncation(st)` by construction.

## Pair-copula decomposition

For a D-vine with order ``(1,\ldots,p)``, the density factorizes as

```math
c(u_1,\ldots,u_p)
=
\prod_{k=1}^{p-1}
\prod_{i=1}^{p-k}
c_{i,i+k\,;\,i+1:\,i+k-1}
\left(
u_{i\mid i+1:\,i+k-1},
u_{i+k\mid i+1:\,i+k-1}
\right).
```

The conditional arguments are propagated with h-functions:

```math
h_1(u,v) = F_{1\mid 2}(u\mid v),
\qquad
h_2(u,v) = F_{2\mid 1}(v\mid u).
```

In code:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The names are vine terminology. Semantically, for a compatible bivariate
`Copulas.jl` copula, they correspond to conditioning through `Copulas.condition`.
Specialized implementations may be used for speed or numerical stability.

## Simplifying assumption

Current evaluation and fitting use simplified vines. A conditional pair-copula
may depend on the identity of the conditioning variables, but its parameters do
not vary with the realized values of those conditioning variables.

!!! warning "Non-simplified vines"
    Non-simplified vines are an important research direction, but they are not
    part of the current public fitting API. The simplified assumption should be
    stated explicitly in analyses where it matters.

## What this means in practice

A small manual D-vine can be built, evaluated, and simulated with ordinary Julia
objects:

```@example foundations-workflow
using VineCopulas
using Distributions: logpdf
using Random

dv = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.5)],
     [FrankCopula(2, 2.0)]],
)

u = [0.2, 0.6, 0.8]
sample = rand(MersenneTwister(11), dv, 100)

(logdensity = logpdf(dv, u), sample_size = size(sample))
```

This same object can be passed to `pdf`, `logpdf`, `rand`, `rosenblatt`,
`inverse_rosenblatt`, `aic`, and `bic`.
