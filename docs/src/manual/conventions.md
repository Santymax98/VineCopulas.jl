# Conventions

## Data orientation

`VineCopulas.jl` uses `p × n` matrices for observations:

- rows are variables/dimensions;
- columns are observations;
- a single observation is a vector of length `p`.

This is consistent with many `Distributions.jl` multivariate conventions.

## Edge orientation

The edge array is triangular. For a full vine in dimension ``p``, tree ``k`` contains ``p-k`` pair-copulas. In code:

```julia
edges[k][i]
```

represents the ``i``th pair-copula in tree ``k``.

## Conditional convention

For a bivariate copula ``C`` and coordinates ``(u, v)``, the package uses

```math
h_1(u,v) = F_{1\mid 2}(u\mid v) = \frac{\partial C(u,v)}{\partial v},
```

```math
h_2(u,v) = F_{2\mid 1}(v\mid u) = \frac{\partial C(u,v)}{\partial u}.
```

The ASCII API is:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The Unicode aliases are also exported:

```julia
h₁(C, u, v)
h₂(C, u, v)
h₁⁻¹(C, q, v)
h₂⁻¹(C, q, u)
```

## Probability boundaries

Copulas are defined on ``[0,1]^p``, but densities and conditional inverses are often singular or undefined exactly at the boundary. The implementation clamps exact boundary values only when necessary to avoid invalid evaluations.

## Truncation

For C-vines and D-vines, `trunc` controls the number of active trees. A truncation level of `p - 1` corresponds to the full vine. A truncation level of `q < p - 1` omits higher-order trees.
