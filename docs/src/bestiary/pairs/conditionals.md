# Pair-copula conditionals

Conditional distributions are the main recursive building blocks of vine
copulas. For a bivariate copula ``C``,

```math
h_1(u,v)
=
F_{1\mid 2}(u\mid v)
=
\frac{\partial C(u,v)}{\partial v},
```

and

```math
h_2(u,v)
=
F_{2\mid 1}(v\mid u)
=
\frac{\partial C(u,v)}{\partial u}.
```

`VineCopulas.jl` exposes these operations through

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The inverse functions solve for the conditioned coordinate. In particular,

```math
h_1^{-1}(q,v)
=
F_{1\mid2}^{-1}(q\mid v),
```

while

```math
h_2^{-1}(q,u)
=
F_{2\mid1}^{-1}(q\mid u).
```

These quantities are used repeatedly in vine density evaluation, simulation,
Rosenblatt transforms, inverse Rosenblatt transforms, and the recursive
pseudo-observations generated during sequential fitting.

## Relation with Copulas.jl

`Copulas.jl` defines the mathematical representation of the underlying
bivariate copula and provides its conditional-distribution interface.

For a compatible `C <: Copulas.Copula{2}`, the generic
`VineCopulas.jl` conditional implementation is equivalent to

```julia
hfunc1(C, u, v) =
    cdf(condition(C, 2, v), u)

hfunc2(C, u, v) =
    cdf(condition(C, 1, u), v)

hinv1(C, q, v) =
    quantile(condition(C, 2, v), q)

hinv2(C, q, u) =
    quantile(condition(C, 1, u), q)
```

The index passed to `condition` denotes the coordinate whose value is fixed.
Therefore,

```julia
condition(C, 2, v)
```

represents the conditional distribution of the first coordinate given that
the second coordinate is equal to `v`.

Similarly,

```julia
condition(C, 1, u)
```

represents the conditional distribution of the second coordinate given that
the first coordinate is equal to `u`.

This convention is important because interchanging the conditioning
coordinate changes `hfunc1` and `hfunc2`.

## Generic fallback

A bivariate copula implemented in `Copulas.jl` does not need a duplicated
conditional implementation in `VineCopulas.jl` merely to be evaluated inside
a vine.

When the required conditional distribution supports `cdf` and `quantile`,
the generic pair-copula fallback delegates these operations to
`Copulas.condition`.

This keeps the mathematical conditional-distribution machinery in
`Copulas.jl` while allowing `VineCopulas.jl` to focus on vine-specific
algorithms.

## Specialized kernels

Some pair-copula families provide specialized `hfunc1`, `hfunc2`, `hinv1`,
or `hinv2` methods.

These methods must preserve exactly the same conditional convention as the
generic fallback, but may be useful when they provide:

- closed-form expressions;
- fewer allocations;
- fewer expensive transformations;
- improved numerical or tail stability;
- specialized handling of singular copulas or generalized inverses.

The generic `Copulas.condition` implementation therefore defines the common
semantics, while specialized pair-copula kernels provide optional fast or
numerically robust paths.

## Evaluation support versus fitting support

A family being usable as a pair-copula edge does **not** imply that it is
automatically available for family selection.

Generic evaluation requires a reliable bivariate density and conditional
distribution interface.

Automatic fitting and selection additionally require fitting support,
parameter-domain information, rotation handling where applicable, candidate
metadata, and dedicated correctness tests.

In short,

```text
pair-copula evaluation support ≠ automatic selection support
```
