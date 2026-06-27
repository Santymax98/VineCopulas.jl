# Getting started

This page gives the smallest complete workflow: install the package, build a D-vine, evaluate its density, simulate from it, and check the Rosenblatt round-trip.

## Installation

Before registration, install directly from GitHub:

```julia
using Pkg
Pkg.add(url="https://github.com/Santymax98/VineCopulas.jl")
```

After registration in the General registry, installation will be:

```julia
using Pkg
Pkg.add("VineCopulas")
```

## A minimal D-vine

A D-vine of dimension three needs two first-tree pair-copulas and one second-tree conditional pair-copula:

```math
c(u_1,u_2,u_3) =
c_{12}(u_1,u_2)
c_{23}(u_2,u_3)
c_{13;2}\{F_{1\mid 2}(u_1\mid u_2), F_{3\mid 2}(u_3\mid u_2)\}.
```

In code:

```@example getting-started
using VineCopulas
using Distributions: logpdf, pdf
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

vine = DVineCopula(
    [1, 2, 3],
    [[C12, C23], [C13_2]],
)
```

The package uses the `p × n` convention for data matrices: rows are dimensions and columns are observations. A single point is a vector of length `p`.

```@example getting-started
u = [0.25, 0.50, 0.75]
logpdf(vine, u)
```

```@example getting-started
pdf(vine, u)
```

## Simulation

Simulation uses the inverse Rosenblatt transform internally.

```@example getting-started
rng = MersenneTwister(2026)
U = rand(rng, vine, 5)
size(U)
```

```@example getting-started
U
```

## Rosenblatt round-trip

For a correctly specified vine with implemented inverse conditionals, `inverse_rosenblatt(vine, rosenblatt(vine, U))` should recover `U` up to numerical tolerance.

```@example getting-started
Z = rosenblatt(vine, U)
U2 = inverse_rosenblatt(vine, Z)
maximum(abs.(U2 .- U))
```

## Model summaries

`VineCopulas.jl` includes lightweight likelihood summaries for explicit models.

```@example getting-started
(loglikelihood(vine, U), npars(vine), aic(vine, U), bic(vine, U))
```

## Next pages

- [Mathematical background](manual/mathematical_background.md) explains why copulas and vines separate marginal modeling from dependence modeling.
- [h-functions and inverses](manual/h_functions.md) explains the conditional primitives required by every pair-copula.
- [Supported pair-copula families](paircopulas/supported_families.md) gives the current support table.
- [Large simulation](examples/large_simulation.md) shows a larger synthetic workflow.
