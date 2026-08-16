# Getting started

## Installation

```julia
using Pkg
Pkg.add("VineCopulas")
```

Then load the package:

```julia
using VineCopulas
using Distributions
```

`VineCopulas.jl` reexports `Copulas.jl`, so the pair-copula families used on vine edges are available from the same session.

## Construct an explicit vine

A three-dimensional D-vine has two pair copulas in tree 1 and one conditional pair copula in tree 2:

```julia
C12 = GaussianCopula(2, 0.5)
C23 = ClaytonCopula(2, 1.5)
C13_2 = FrankCopula(2, 2.5)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
```

Evaluate or simulate it with the standard distribution interface:

```julia
u = [0.2, 0.5, 0.7]
logpdf(vine, u)
pdf(vine, u)
U = rand(vine, 1_000)
```

## Fit a vine

If the structure or ordering is not supplied, the fitting layer can select it from the data:

```julia
fitted = fit(
    RVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    tree_criterion=:tau,
    allow_rotations=true,
)
```

For a fixed structure, pass the desired order or `RVineStructure` explicitly. See [Fitting & Selection](../fitting/overview.md) for the complete controls.

## Data layout

All fitting and multivariate evaluation routines use `p × n` matrices:

```text
rows    -> variables
columns -> observations
```

If your data are stored as `n × p`, transpose them before fitting.
