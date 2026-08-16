# VineCopulas.jl

[![Docs stable](https://img.shields.io/badge/docs-stable-blue.svg)](https://santymax98.github.io/VineCopulas.jl/stable/)
[![Docs dev](https://img.shields.io/badge/docs-dev-blue.svg)](https://santymax98.github.io/VineCopulas.jl/dev/)
[![CI](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/Santymax98/VineCopulas.jl/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Santymax98/VineCopulas.jl/blob/main/LICENSE)
[![Julia 1.10+](https://img.shields.io/badge/julia-1.10%2B-9558B2.svg)](https://julialang.org/)

`VineCopulas.jl` provides native Julia C-vine, D-vine, and regular-vine copula models built on top of [`Copulas.jl`](https://github.com/lrnv/Copulas.jl). It supports explicit construction, evaluation, simulation, Rosenblatt transforms, sequential parameter fitting, pair-family and rotation selection, and data-driven vine-structure selection.

## Highlights

- `CVineCopula`, `DVineCopula`, and general `RVineCopula` models.
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

## Documentation

The documentation is organized into six top-level sections:

- **Home** — package overview, quick example, and citation.
- **Guide** — installation, first models, simulation, examples, and compatibility.
- **Bestiary** — vine structures and pair-copula families.
- **Fitting & Selection** — pair fitting, vine fitting, structure learning, and selection controls.
- **Benchmarks** — correctness and performance against `rvinecopulib`.
- **Developer** — architecture, API, testing, upstream notes, and roadmap.

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

## Scope

Version 0.1.1 focuses on sequential fitting and structure selection for simplified vines. Automatic data-driven truncation selection, observation weights, missing/discrete-data fitting, nonparametric pair-copula selection, and joint full-vine maximum-likelihood estimation remain outside the current scope.

Automatic selection may use narrower **candidate parameter domains** than the mathematical domains exposed by `Copulas.jl`. Those bounds align the selection problem with `vinecopulib`; they do not restrict direct construction or direct use of the underlying pair-copulas.

Standard general R-vines can be fitted and evaluated at a user-selected truncation depth, but Rosenblatt/inverse Rosenblatt transforms, `rand`, `simulate_qmc`, and the simulation-based numerical `cdf` currently require a full-depth general R-vine. Truncated C- and D-vines retain their transform/simulation paths.

## Citation

If you use `VineCopulas.jl`, please cite the metadata in [`CITATION.cff`](CITATION.cff).
