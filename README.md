# VineCopulas.jl

[![Docs dev](https://img.shields.io/badge/docs-dev-blue.svg)](https://santymax98.github.io/VineCopulas.jl/dev/)
[![CI](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Santymax98/VineCopulas.jl/blob/main/LICENSE)
[![Julia 1.10+](https://img.shields.io/badge/julia-1.10%2B-9558B2.svg)](https://julialang.org/)
[![Repo status: active](https://img.shields.io/badge/repo%20status-active-brightgreen.svg)](https://www.repostatus.org/#active)
[![Citation](https://img.shields.io/badge/citation-CFF-informational.svg)](https://github.com/Santymax98/VineCopulas.jl/blob/main/CITATION.cff)

`VineCopulas.jl` is a native Julia package for explicit C-vine, D-vine and regular-vine copula models built on top of [`Copulas.jl`](https://github.com/lrnv/Copulas.jl). It provides a construction and evaluation core for users who want to compose bivariate pair-copulas into higher-dimensional dependence models.

Documentation: <https://santymax98.github.io/VineCopulas.jl/dev/>

## Current scope

Implemented:

- `CVineCopula`, `DVineCopula` and `RVineCopula`;
- `pdf`, `logpdf`, `rand` and numerical `cdf`;
- Rosenblatt and inverse Rosenblatt transforms;
- pair-copula conditional primitives `hfunc1`, `hfunc2`, `hinv1`, and `hinv2`;
- truncated C-vines and D-vines;
- survival/rotated pair-copulas through `SurvivalCopula` flip logic;
- smooth and singular bivariate extreme-value pair-copulas;
- R-vine matrix exchange helpers;
- log-likelihood, parameter count, AIC and BIC;
- modular tests with `TestItems.jl`.

Not yet part of the stable scope:

- automatic parameter estimation;
- automatic pair-copula family selection;
- automatic vine structure selection;
- automatic truncation selection;
- fitted model wrappers;
- non-simplified vines;
- systematic benchmarking against C++ implementations such as `vinecopulib`.

## Quick start

```julia
using VineCopulas
using Distributions: logpdf, pdf
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])

u = [0.2, 0.5, 0.7]
logpdf(vine, u)
pdf(vine, u)

U = rand(MersenneTwister(123), vine, 1_000)
Z = rosenblatt(vine, U)
U2 = inverse_rosenblatt(vine, Z)
maximum(abs.(U2 .- U))
```

Matrices are interpreted as `p × n`: rows are dimensions and columns are observations.

## Pair-copula conditional convention

```julia
hfunc1(C, u, v) = F₁|₂(u | v) = ∂C(u,v)/∂v
hfunc2(C, u, v) = F₂|₁(v | u) = ∂C(u,v)/∂u
```

`hinv1` inverts the first coordinate given the second; `hinv2` inverts the second coordinate given the first.

## Development

Run tests with:

```julia
using Pkg
Pkg.test()
```

Build documentation with:

```julia
using Pkg
Pkg.activate("docs")
Pkg.develop(PackageSpec(path=pwd()))
Pkg.instantiate()
include("docs/make.jl")
```

## Citation

If you use `VineCopulas.jl`, please cite the repository using the metadata in `CITATION.cff` or the BibTeX entry in the documentation.
