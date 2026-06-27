````@raw html
---
layout: home

hero:
  name: VineCopulas.jl
  text: Native Julia vine copula models
  tagline: Explicit C-vine, D-vine and R-vine copula constructions built on Copulas.jl.
  image:
    src: /assets/logo.png
    alt: VineCopulas.jl logo
  actions:
    - theme: brand
      text: Getting started
      link: /getting_started
    - theme: alt
      text: Mathematical background
      link: /manual/mathematical_background
    - theme: alt
      text: View on GitHub
      link: https://github.com/Santymax98/VineCopulas.jl
features:
  - title: Explicit vine models
    details: Construct C-vines, D-vines and supported R-vines directly from bivariate pair-copulas.
  - title: Copulas.jl ecosystem
    details: Reuse bivariate families from Copulas.jl and compose them into higher-dimensional dependence models.
  - title: Transform-based simulation
    details: Simulate and transform data using Rosenblatt and inverse Rosenblatt maps.
  - title: Research friendly
    details: Designed for transparent mathematics, experimentation and future Bayesian/statistical workflows in Julia.
---
````

# VineCopulas.jl

`VineCopulas.jl` is a native Julia package for explicit vine copula models built on top of [`Copulas.jl`](https://github.com/lrnv/Copulas.jl). It focuses on constructing vine copulas from known bivariate building blocks, evaluating densities, simulating observations, and using conditional distribution transforms.

A vine copula is useful when a single multivariate copula family is too restrictive. Instead of forcing all dependence into one parametric object, a vine decomposes a multivariate copula density into many bivariate pair-copula densities, each placed on an edge of a tree sequence.

## What is implemented?

- `CVineCopula`, `DVineCopula` and `RVineCopula` model types.
- `pdf`, `logpdf`, `rand`, numerical `cdf` and `simulate_qmc`.
- Rosenblatt and inverse Rosenblatt transforms.
- Truncated C-vines and D-vines.
- Pair-copula conditional primitives: `hfunc1`, `hfunc2`, `hinv1`, `hinv2`.
- Elliptical, Archimedean, BB, survival/rotated and bivariate extreme-value pair-copulas where the required conditional primitives are available.
- Lightweight model summaries: `loglikelihood`, `npars`, `aic`, and `bic`.

## What is not implemented yet?

`VineCopulas.jl` v0.1 is not an automatic fitting package. It does not yet provide automatic family selection, parameter estimation, structure selection or truncation selection. These are planned for later versions. See [Simulation vs fitting](manual/simulation_vs_fitting.md) and [Limitations](manual/limitations.md).

## First example

```@example home
using VineCopulas
using Distributions: logpdf, pdf
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
u = [0.2, 0.5, 0.7]

(logpdf(vine, u), pdf(vine, u))
```

```@contents
Pages = [
    "getting_started.md",
    "manual/mathematical_background.md",
    "manual/pair_copula_decomposition.md",
    "manual/h_functions.md",
    "manual/rosenblatt.md",
    "paircopulas/supported_families.md",
    "examples/minimal_dvine.md",
    "examples/large_simulation.md",
    "comparison/rvinecopulib.md",
    "citation.md",
]
Depth = 2
```
