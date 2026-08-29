````@raw html
---
layout: home

title: VineCopulas.jl Documentation

description: Flexible vine copula models for Julia, built on Copulas.jl.

hero:
  name: VineCopulas.jl
  text: Flexible vine copula models for Julia
  tagline: Build, fit, select, evaluate, and simulate C-vines, D-vines, and R-vines on top of Copulas.jl.
  image:
    src: logo.png
    alt: VineCopulas.jl
  actions:
    - theme: brand
      text: Getting started
      link: manual/getting_started
    - theme: alt
      text: Manual
      link: manual/foundations
    - theme: alt
      text: API
      link: api/public

features:
  - title: C-, D-, and R-vines
    details: Explicit and fitted vine copula models with flexible pair-copula families and truncation support.
  - title: Fitting & selection
    details: Pair-family, parameter, rotation, and dependence-structure selection through a unified Julia interface.
  - title: Fast vine engines
    details: Fused pair kernels, reusable work buffers, and allocation-conscious C-, D-, and R-vine traversals.
  - title: Copulas.jl ecosystem
    details: Built directly on Copulas.jl and the broader Distributions.jl statistical ecosystem.
---
````
# VineCopulas.jl

`VineCopulas.jl` is a native Julia package for building, fitting, selecting, evaluating, and simulating C-vine, D-vine, and regular-vine copula models on top of `Copulas.jl`.

The package follows the `Distributions.jl`/`Copulas.jl` ecosystem: explicit vine models are copulas, pair copulas come from `Copulas.jl`, and fitting is exposed through `fit`.

Vine models are useful when dependence is high-dimensional but can be described
through interpretable bivariate building blocks. `VineCopulas.jl` focuses on the
vine layer: structures, pair composition, traversal, simulation, sequential
fitting, and structure selection. The mathematics of individual pair-copula
families remains the responsibility of `Copulas.jl`.

## What is available

- C-vine, D-vine, and general R-vine models.
- First-class `CVineStructure`, `DVineStructure`, and `RVineStructure` objects.
- `pdf`, `logpdf`, `rand`, numerical `cdf`, Rosenblatt, and inverse Rosenblatt transforms.
- Pair-copula fitting with family and rotation selection.
- Sequential fitting for fixed vine structures.
- Automatic C-vine and D-vine ordering.
- Dissmann-style R-vine structure selection with maximum spanning trees.
- AIC, BIC, log-likelihood, Kendall-``\tau``, and Spearman-``\rho`` controls.
- Truncated vine evaluation and user-controlled fitting truncation.
- External correctness checks against `rvinecopulib` and reproducible performance benchmarks.

!!! warning "Current modeling scope"
    The package currently implements simplified vines. General R-vine density
    evaluation supports truncation, but Rosenblatt/inverse Rosenblatt transforms
    for truncated standard general R-vines remain future work. Truncated C- and
    D-vines retain their transform and simulation paths.

## Quick example

```@example home-quick
using VineCopulas
using Distributions: fit, logpdf
using Random

rng = MersenneTwister(42)
truth = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.4)],
     [FrankCopula(2, 2.0)]],
)

U = rand(rng, truth, 300)

fitted = fit(
    DVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    allow_rotations=true,
)

(order = order(fitted),
 truncation = truncation(fitted),
 loglikelihood = loglikelihood(fitted, U))
```

Explicit vines are ordinary copulas:

```@example home-quick
u = [0.2, 0.5, 0.7]
(logdensity = logpdf(truth, u),
 roundtrip_error = maximum(abs.(inverse_rosenblatt(truth, rosenblatt(truth, U)) .- U)))
```

Matrices are interpreted as `p × n`: rows are variables and columns are observations.

## Documentation map

The site has five conceptual sections plus the home page:

- **Home** — this overview, quick example, and citation.
- **Manual** — theory, conventions, pair-copula semantics, fitting, transforms, and benchmarks.
- **Bestiary** — supported vine structures and pair-copula families.
- **Examples** — practical workflows with small, reproducible code.
- **Developer Guide** — architecture, contracts, testing, release process, upstream follow-ups, and roadmap.
- **API** — public reference, internal non-stable reference, and literature/software references.

The version selector in the documentation provides the development site, the latest stable release, and retained tagged versions.

## Citation

If you use `VineCopulas.jl`, please cite the package metadata in `CITATION.cff`:

```bibtex
@software{jimenez_vinecopulas,
  author  = {Santiago Jimenez and contributors},
  title   = {VineCopulas.jl},
  url     = {https://github.com/Santymax98/VineCopulas.jl},
  version = {0.1.2},
  year    = {2026}
}
```
