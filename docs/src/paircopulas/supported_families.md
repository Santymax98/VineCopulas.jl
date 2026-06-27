# Supported pair-copula families

`VineCopulas.jl` uses bivariate copulas from `Copulas.jl`. A family is considered supported as a vine pair-copula when the following pieces are available and tested:

1. bivariate density/log-density,
2. `hfunc1` and `hfunc2`,
3. `hinv1` and `hinv2` for simulation and inverse Rosenblatt transforms,
4. tests in the vine interface.

## Current support table

| Group | Family examples | `Copulas.jl` family exists | Vine pair-copula status |
|---|---|---:|---|
| Elliptical | Gaussian, Student-t | Yes | Tested |
| Archimedean | Clayton, Frank, Gumbel, AMH, Joe | Yes | Tested |
| Additional Archimedean | Gumbel–Barnett, Inverse Gaussian | Yes | Tested |
| BB families | BB1, BB2, BB3, BB6, BB7, BB8, BB9, BB10 | Yes | Tested |
| Extreme-value | Logistic, Galambos, Hüsler–Reiss, Mixed, asymmetric tails, Marshall–Olkin, Cuadras–Augé, BC2, extreme-t | Yes | Tested |
| Survival/rotated | `SurvivalCopula` wrappers | Yes | Tested through flip rules |
| Independence | `IndependentCopula` | Yes | Usually not needed explicitly in truncated trees |
| Plackett | `PlackettCopula` | Yes | Not yet advertised as tested vine pair-copula |
| FGM | `FGMCopula` | Yes | Not yet advertised as tested vine pair-copula |
| Raftery | `RafteryCopula` | Yes | Not yet advertised as tested vine pair-copula |
| M copula | `MCopula` | Yes | Not yet advertised as tested vine pair-copula |
| W copula | `WCopula` | Yes | Not yet advertised as tested vine pair-copula |
| Empirical/Bernstein/Beta/Checkerboard | Several nonparametric objects | Yes | Not part of stable v0.1 vine interface |
| Subset copulas | `subsetdims` from `Copulas.jl` | Yes | Useful in `Copulas.jl`; not a pair-family target here |

`Copulas.jl` exports many copula families and utilities, including `SklarDist`, `pseudos`, `condition`, `subsetdims`, Plackett, FGM, Raftery, M and W copulas, and many extreme-value families. `VineCopulas.jl` does not automatically guarantee that every `Copulas.jl` bivariate family has a stable inverse conditional path in vine algorithms.

## Why the table is conservative

It is not enough for a bivariate copula to have a density. Vine simulation requires inverse conditional distributions. A family should only be documented as fully supported after it passes pair-copula conditional tests and vine-level density/simulation tests.

## Survival and rotations

Rotations are handled through `Copulas.SurvivalCopula` when the underlying base family has valid h-functions and inverse h-functions. The flip logic is implemented at the conditional level.
