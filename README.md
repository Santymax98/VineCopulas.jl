# VineCopulas.jl

`VineCopulas.jl` is a native Julia extension of the `Copulas.jl` ecosystem for C-vine, D-vine and regular-vine copula models. The implementation favors composability, explicit mathematical conventions and the standard `Distributions.jl` interface.

## Current scope

Implemented:

- `CVineCopula`, `DVineCopula` and `RVineCopula`
- `logpdf`, `pdf`, `rand` and numerical `cdf`
- Rosenblatt and inverse Rosenblatt transforms
- ASCII and Unicode pair-copula conditional primitives
- truncated C- and D-vines
- survival/rotated pair-copulas
- smooth and singular bivariate extreme-value pair-copulas
- R-vine matrix exchange helpers
- log-likelihood, parameter count, AIC and BIC

Not yet part of the stable scope:

- pair-copula estimation and family selection
- automatic vine-structure selection
- general truncated R-vine Rosenblatt traversal
- allocation-free compiled kernels

## Quickstart

```julia
using VineCopulas
using Distributions
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13 = FrankCopula(2, 3.0)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13]])
u = [0.2, 0.5, 0.7]

logpdf(vine, u)
pdf(vine, u)
cdf(vine, u; method=:qmc, N=10_000)

U = rand(MersenneTwister(123), vine, 1_000)
Z = rosenblatt(vine, U)
U2 = inverse_rosenblatt(vine, Z)
```

## Pair-copula conditional convention

```julia
hfunc1(C, u, v) = F₁|₂(u | v) = ∂C(u,v)/∂v
hfunc2(C, u, v) = F₂|₁(v | u) = ∂C(u,v)/∂u
```

`hinv1` inverts the first coordinate given the second; `hinv2` inverts the second coordinate given the first.

The Archimedean implementation uses one target/base protocol. Family dispatch is added only when a closed-form inverse or a numerically stable coordinate system is required.

### Current Archimedean inverse status

| Family | `_inv_ϕ¹` path |
|---|---|
| Clayton | specialized analytic; finite-support branch for negative parameters |
| AMH | specialized analytic |
| Gumbel | specialized analytic with Lambert W |
| Joe | specialized safeguarded scalar inversion |
| Frank | specialized analytic, positive and negative bivariate parameters |
| Gumbel–Barnett | specialized analytic with stable `W₋₁` evaluation |
| Inverse Gaussian | specialized analytic |
| BB1 | specialized numerical inversion in `z = log(s)` |
| BB2 | specialized analytic in a logarithmic coordinate |
| BB3 | specialized numerical inversion in a transformed logarithmic coordinate |
| BB6 | specialized stable inversion in its natural generator coordinate |
| BB7 | specialized stable inversion in its natural generator coordinate |
| BB8 | specialized numerical inversion in the direct generator coordinate |
| BB9 | specialized analytic inversion in a shifted-log coordinate |
| BB10 | specialized numerical inversion in the direct generator coordinate |

The BB families share a compact internal protocol based on stable coordinates, inverse coordinates, log-derivatives and inverse log-derivatives. Family-specific code is retained only where the mathematics or numerical geometry genuinely differs. Standard log-domain primitives come directly from `LogExpFunctions`; only composed operations remain local.

## Vine conventions

### C-vine

`edges[k][i]` represents

```math
C_{r,c\mid D},
```

with `r = order[k]`, `c = order[k+i]` and `D = order[1:k-1]`. Pair-copula coordinates are `(root, child)`.

### D-vine

`edges[k][i]` represents

```math
C_{a,b\mid D},
```

with `a = order[i]`, `b = order[i+k]` and `D = order[i+1:i+k-1]`. Pair-copula coordinates are `(left, right)`.

### R-vine

The preferred constructor is:

```julia
RVineCopula(order, struct_array, edges; trunc=length(order)-1)
```

The matrix constructor is an exchange format:

```julia
RVineCopula(matrix, edges)
```

Natural D-vine structures delegate to the D-vine engine. General full R-vine traversal remains experimental; general truncated R-vine Rosenblatt transforms intentionally throw an explicit error instead of returning incomplete results.

## Extreme-value conditionals

Smooth Pickands tails share generic analytic h-functions and a safeguarded one-dimensional inverse in the unconstrained logit of the Pickands coordinate. `LogTail` reuses the analytic Gumbel inverse. Tails with jumps or flat conditional regions (`CuadrasAugeTail`, `MOTail`, `BC2Tail`) use the generalized inverse supplied by `BivEVDistortion`. Per-family methods are introduced only when they provide an analytic inverse or demonstrably improve stability.

## Testing

The test suite uses `TestItems.jl` and is organized around small tagged testitems plus shared contracts in `test/common.jl`. The previous large regression suites are preserved under `test/legacy` and are run through `test/regression` so coverage is not lost during the migration.

Run from a clean Julia session:

```julia
using Pkg
Pkg.activate(".")
Pkg.resolve()
Pkg.test()
```

During development, tests can be filtered by tags such as `:CVine`, `:DVine`, `:RVine`, `:PairCopula`, `:ExtremeValue`, `:Rosenblatt`, or `:Truncation`. See the Testing page in the documentation for examples.

## Documentation

The documentation is built with `Documenter.jl` from the `docs` environment:

```julia
using Pkg
Pkg.activate("docs")
Pkg.develop(PackageSpec(path=pwd()))
Pkg.instantiate()
include("docs/make.jl")
```

## Design notes

- `eps(T)` is not used as the lower probability bound; every representable interior probability is preserved.
- `mbic` is not exported because an alias to ordinary BIC would be mathematically misleading.
- `npars` currently counts parameters exposed by `Distributions.params`; it is a structural count, not a universal free-parameter analysis.
- Current vine kernels allocate `Float64` workspaces. Generic element types and preallocated kernels belong to the performance phase.

