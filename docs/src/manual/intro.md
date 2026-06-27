# Introduction

A vine copula decomposes a multivariate copula density into a product of bivariate pair-copula densities evaluated at recursively computed conditional distribution values. `VineCopulas.jl` implements this construction in native Julia and delegates the underlying pair-copula families to `Copulas.jl`.

The package is organized around explicit model objects:

- [`CVineCopula`](@ref) for canonical vines with one root variable per tree;
- [`DVineCopula`](@ref) for drawable/path-like vines;
- [`RVineCopula`](@ref) for regular-vine structures represented through structure arrays and matrix exchange helpers.

All vine objects are subtypes of [`AbstractVineCopula`](@ref), which itself is a subtype of `Copulas.Copula`.

## Relationship with Copulas.jl

`Copulas.jl` provides the bivariate copula families. `VineCopulas.jl` supplies the conditional primitives and the recursive vine composition layer.

```text
Copulas.jl
└── bivariate copula families
    └── VineCopulas.jl
        ├── C-vines
        ├── D-vines
        └── R-vines
```

This means the mathematical definition and parameters of individual pair-copulas remain those of `Copulas.jl`, while the vine structure, pair-copula placement, Rosenblatt transforms, and conditional recursion are handled here.

## Data orientation

Matrices are interpreted as `p × n`: rows are dimensions and columns are observations. A single point is a vector of length `p`.

```julia
U = rand(rng, vine, 100)  # p × 100
logpdf(vine, U)           # vector of length 100
```
