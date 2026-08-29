# VineCopulas.jl

[![Docs stable](https://img.shields.io/badge/docs-stable-blue.svg)](https://santymax98.github.io/VineCopulas.jl/stable/)
[![Docs dev](https://img.shields.io/badge/docs-dev-blue.svg)](https://santymax98.github.io/VineCopulas.jl/dev/)
[![CI](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Santymax98/VineCopulas.jl/blob/main/LICENSE)
[![Julia 1.10+](https://img.shields.io/badge/julia-1.10%2B-9558B2.svg)](https://julialang.org/)

`VineCopulas.jl` provides native Julia C-vine, D-vine, and regular-vine copula models built on top of [`Copulas.jl`](https://github.com/lrnv/Copulas.jl). It supports explicit construction, evaluation, simulation, Rosenblatt transforms, sequential parameter fitting, pair-family and rotation selection, and data-driven vine-structure selection.

The package is intended as the vine layer of the Julia copula ecosystem:
`Copulas.jl` owns individual copula families and distribution-level semantics,
while `VineCopulas.jl` owns vine structures, pair-copula composition, traversal,
and vine-specific fitting/selection algorithms.

## Highlights

- `CVineCopula`, `DVineCopula`, and general `RVineCopula` models.
- First-class `CVineStructure`, `DVineStructure`, and `RVineStructure` objects.
- `pdf`, `logpdf`, `rand`, numerical `cdf`, Rosenblatt, and inverse Rosenblatt transforms.
- Pair-copula fitting and selection by log-likelihood, AIC, or BIC.
- Rotated/survival pair-copulas and an optional independence candidate.
- Fixed-structure fitting for C-, D-, and R-vines.
- Automatic C-/D-vine ordering and Dissmann-style R-vine structure selection.
- User-controlled vine truncation and weak-dependence thresholds.
- External numerical validation against R `rvinecopulib`.
- Reproducible evaluation and fitting benchmarks.

## Quick start

```julia
using VineCopulas
using Distributions
using Random

rng = MersenneTwister(42)

truth = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.4)],
     [FrankCopula(2, 2.0)]],
)

U = rand(rng, truth, 1_000)

fitted = fit(
    DVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    allow_rotations=true,
)

loglikelihood(fitted, U)
maximum(abs.(inverse_rosenblatt(fitted, rosenblatt(fitted, U)) .- U))
```

Data matrices use the `p × n` convention: rows are variables and columns are observations.

## Architecture in one minute

Vines decompose a high-dimensional copula density into bivariate pair-copula
terms evaluated at recursively computed conditional probabilities. In
`VineCopulas.jl`, those pair-copulas are ordinary `Copulas.Copula{2}` objects:

```julia
PairCopula === Copulas.Copula{2}
```

The public h-function API uses standard vine terminology:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

Semantically these correspond to conditional CDFs and conditional quantiles
through `Copulas.condition`. Family-specific and fused implementations may be
used as fast paths when they are faster or more stable.

## Documentation

The documentation is organized into:

- **Home** — package overview, quick example, and citation.
- **Manual** — foundations, pair-copula semantics, transforms, fitting/selection, and benchmarks.
- **Bestiary** — catalog of supported vine structures and pair-copula families.
- **Examples** — practical workflows with small reproducible examples.
- **Developer Guide** — architecture, extension contracts, testing, release process, and roadmap.
- **API** — public reference, internal non-stable reference, and references.

Use the [stable documentation](https://santymax98.github.io/VineCopulas.jl/stable/) for the latest registered release or the [development documentation](https://santymax98.github.io/VineCopulas.jl/dev/) for `main`.

## Validation and benchmarks

Run the package tests with:

```bash
julia --project=. -e 'using Pkg; Pkg.test()'
```

Run the external correctness gate with:

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmarks/correctness/run_correctness_gate.sh
```

Evaluation and fitting speed benchmarks are kept separate from correctness checks. See [`benchmarks/README.md`](benchmarks/README.md) for the short commands and report format.

## Current scope

The 0.1 series focuses on sequential fitting and structure selection for simplified vines. Automatic data-driven truncation selection, observation weights, missing/discrete-data fitting, nonparametric pair-copula selection, and joint full-vine maximum-likelihood estimation remain outside the current scope.

Automatic selection may use narrower **candidate parameter domains** than the mathematical domains exposed by `Copulas.jl`. Those bounds align the selection problem with `vinecopulib`; they do not restrict direct construction or direct use of the underlying pair-copulas.

Standard general R-vines can be fitted and evaluated at a user-selected truncation depth, but Rosenblatt/inverse Rosenblatt transforms, `rand`, `simulate_qmc`, and the simulation-based numerical `cdf` currently require a full-depth general R-vine. Truncated C- and D-vines retain their transform/simulation paths.

## Citation

If you use `VineCopulas.jl`, please cite the metadata in [`CITATION.cff`](CITATION.cff).
