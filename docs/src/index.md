````@raw html
---
layout: home

hero:
  name: VineCopulas.jl
  text:
  tagline: Native Julia vine copula models built on Copulas.jl.
  actions:
    - theme: brand
      text: Getting started
      link: /manual/intro
    - theme: alt
      text: View on GitHub
      link: https://github.com/santymax9807/VineCopulas.jl
    - theme: alt
      text: Vine structures
      link: /structures/cvines
---
````

# Welcome to VineCopulas.jl!

`VineCopulas.jl` is a native Julia package for explicit vine copula models built on top of [`Copulas.jl`](https://github.com/lrnv/Copulas.jl). It provides C-vine, D-vine, and regular-vine data structures that follow the `Distributions.jl` interface whenever possible.

The package is currently a correctness-oriented v0.1 core. It is designed for users who want to construct vine models explicitly, evaluate densities, simulate observations, and use Rosenblatt transforms with pair-copulas from `Copulas.jl`.

## Features

- `CVineCopula`, `DVineCopula`, and `RVineCopula` types.
- `pdf`, `logpdf`, `rand`, and numerical `cdf`.
- Rosenblatt and inverse Rosenblatt transforms.
- Truncated C-vines and D-vines.
- Pair-copula conditional primitives `hfunc1`, `hfunc2`, `hinv1`, and `hinv2`.
- Elliptical, Archimedean, BB, survival/rotated, and bivariate extreme-value pair-copulas via `Copulas.jl`.
- Modular tagged tests through `TestItems.jl`.

## Quick start

```julia
using VineCopulas
using Distributions: logpdf, pdf

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

vine = DVineCopula(
    [1, 2, 3],
    [[C12, C23], [C13_2]],
)

u = [0.2, 0.5, 0.7]
logpdf(vine, u)
pdf(vine, u)
```

## Current limitations

The first public version does not yet provide automatic pair-copula estimation, automatic family selection, automatic structure selection, or data-driven truncation selection. Those features are planned for later releases.

```@contents
Pages = [
    "manual/intro.md",
    "manual/conventions.md",
    "structures/cvines.md",
    "structures/dvines.md",
    "structures/rvines.md",
    "paircopulas/supported_families.md",
    "paircopulas/conditionals.md",
    "paircopulas/extreme_value.md",
    "manual/testing.md",
    "manual/limitations.md",
]
Depth = 2
```
