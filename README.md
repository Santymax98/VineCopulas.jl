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

- stable explicit `CVineCopula` and `DVineCopula` constructors;
- experimental `RVineCopula` support for structure arrays, matrix exchange, density evaluation, and D-vine-like R-vines;
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
- automatic benchmarking dashboards against C++ implementations such as `vinecopulib`; local benchmarking scripts are provided under `benchmarks/`, with Student-t studied separately because its current performance is dominated by scalar Student-t CDF/quantile evaluations.

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


## RVineCopula status

`RVineCopula` is intentionally more experimental than `CVineCopula` and `DVineCopula` in this release. It supports explicit construction from structure arrays or matrix exchange representations, `rvine_matrix`, density/log-density evaluation, D-vine-like R-vines through the D-vine engine, and full non-truncated Rosenblatt / inverse Rosenblatt transforms on an experimental basis. It does not yet provide automatic R-vine structure selection, pair-copula family selection, parameter fitting, or stable support for all truncated general R-vine Rosenblatt transforms.

## Performance-oriented pair-copula layout

The package preserves concrete pair-copula container types whenever possible. Homogeneous vines such as Gaussian D-vines can therefore compile to specialized inner loops. Mixed-family vines remain supported through the generic `PairCopula` interface; passing tuple levels, for example `((C12, C23), (C13_2,))`, preserves more family information than forcing all levels into `Vector{PairCopula}`.

## Pair-copula conditional convention

```julia
hfunc1(C, u, v) = F₁|₂(u | v) = ∂C(u,v)/∂v
hfunc2(C, u, v) = F₂|₁(v | u) = ∂C(u,v)/∂u
```

`hinv1` inverts the first coordinate given the second; `hinv2` inverts the second coordinate given the first.


## Benchmark snapshot

Local benchmark scripts are provided under `benchmarks/`. The following snapshot was generated on a local macOS aarch64 Julia `1.12.0` setup with D-vines, `n = 10000`, and scenarios `(p,trunc) = (5,4), (10,2), (20,2)`. The ratio is `rvinecopulib median / Julia median`; values above `1` mean Julia was faster in that run.

| Family | p | trunc | Julia median | rvinecopulib median | Julia speed ratio |
|---|---:|---:|---:|---:|---:|
| `clayton` | 5 | 4 | 22.1 ms | 18.8 ms | 0.85× |
| `clayton` | 10 | 2 | 25.4 ms | 27.8 ms | 1.09× |
| `clayton` | 20 | 2 | 55.7 ms | 61.9 ms | 1.11× |
| `frank` | 5 | 4 | 20.9 ms | 15.6 ms | 0.74× |
| `frank` | 10 | 2 | 24.0 ms | 21.8 ms | 0.91× |
| `frank` | 20 | 2 | 52.5 ms | 48.8 ms | 0.93× |
| `gaussian` | 5 | 4 | 14.1 ms | 22.2 ms | 1.58× |
| `gaussian` | 10 | 2 | 16.9 ms | 32.6 ms | 1.93× |
| `gaussian` | 20 | 2 | 38.1 ms | 72.5 ms | 1.90× |
| `gumbel` | 5 | 4 | 30.6 ms | 30.3 ms | 0.99× |
| `gumbel` | 10 | 2 | 38.6 ms | 45.3 ms | 1.17× |
| `gumbel` | 20 | 2 | 84.6 ms | 101.4 ms | 1.20× |

`TCopula` is kept in a separate study route because it is numerically validated but currently performance-limited by scalar Student-t CDF/quantile evaluations. See `docs/src/comparison/benchmarks.md` and `benchmarks/tcopula_study/README.md` for details.

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
