# VineCopulas.jl

`VineCopulas.jl` is an experimental native Julia extension of the `Copulas.jl` ecosystem for C-vine, D-vine and regular vine copula models. The package follows the `Distributions.jl` interface whenever possible.

The goal is not to reproduce the R/C++ API of existing vine-copula libraries. The goal is a Julian, composable and mathematically transparent implementation that uses `Copulas.jl` pair-copulas and exposes standard functions such as `logpdf`, `pdf`, `cdf`, `rand`, `rosenblatt` and `inverse_rosenblatt`.

## Current v0.1.0 scope

Implemented core operations:

- `CVineCopula`
- `DVineCopula`
- `RVineCopula`
- `logpdf` / `pdf`
- `rand` through inverse Rosenblatt transforms
- `rosenblatt` / `inverse_rosenblatt`
- QMC-based `cdf`
- ASCII and Unicode h-functions: `hfunc1`, `hfunc2`, `hinv1`, `hinv2`, and `h₁`, `h₂`, `h₁⁻¹`, `h₂⁻¹`
- R-vine matrix/structure support as exchange format

Planned after v0.1.0:

- pair-copula parameter estimation
- family selection
- structure selection
- truncation selection
- compiled high-performance kernels
- benchmarks against `rvinecopulib`

## Quickstart

```julia
using VineCopulas
using Distributions
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13 = GaussianCopula([1.0 0.2; 0.2 1.0])

vine = DVineCopula(
    [1, 2, 3],
    [[C12, C23],
     [C13]]
)

u = [0.2, 0.5, 0.7]

logpdf(vine, u)
pdf(vine, u)
cdf(vine, u; method=:qmc, N=10_000)

U = rand(MersenneTwister(123), vine, 1000)   # 3×1000
Z = rosenblatt(vine, U)
U2 = inverse_rosenblatt(vine, Z)
```

## C-vine convention

For a C-vine, `edges[k][i]` represents

```math
C_{r,c \mid D},
```

where

```julia
r = order[k]
c = order[k+i]
D = order[1:k-1]
```

The pair-copula coordinates are `(root, child)`.

## D-vine convention

For a D-vine, `edges[k][i]` represents

```math
C_{a,b \mid D},
```

where

```julia
a = order[i]
b = order[i+k]
D = order[i+1:i+k-1]
```

The pair-copula coordinates are `(left, right)`.

## R-vine support

The preferred explicit constructor is:

```julia
rv = RVineCopula(order, struct_array, edges)
```

A matrix constructor is also provided as an exchange format:

```julia
rv = RVineCopula(M, edges)
```

For structures recognized as natural D-vines, `RVineCopula` delegates core operations to the D-vine engine. A general R-vine traversal is included but should be treated as experimental until the high-performance compiled kernel is completed.

## CDF

For general vine copulas, the multivariate CDF is approximated using Monte Carlo or quasi-Monte Carlo simulation from the fitted vine:

```julia
cdf(vine, u; method=:qmc, N=10_000, randomized=true)
cdf(vine, u; method=:mc,  N=50_000)
```

This mirrors the practical approach used in high-performance vine-copula software: the CDF is numerical, not a closed-form exact expression.
