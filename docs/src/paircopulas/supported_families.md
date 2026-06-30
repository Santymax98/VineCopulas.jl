# Supported pair-copula families

`VineCopulas.jl` uses bivariate copulas from `Copulas.jl`. A family is considered supported as a vine pair-copula when the following pieces are available and tested:

1. bivariate density/log-density,
2. `hfunc1` and `hfunc2`,
3. `hinv1` and `hinv2` for simulation and inverse Rosenblatt transforms,
4. tests in the vine interface.

## Current support table

| Group | Family examples | Vine pair-copula status | Density path |
|---|---|---|---|
| Independence | `IndependentCopula` | Supported | Fast path |
| Elliptical | Gaussian | Supported and benchmark-oriented | Closed-form fast path |
| Elliptical | Student-t | Supported, correctness-oriented | Closed-form bivariate t copula path using scalar Student-t CDF/quantile routines |
| Archimedean one-parameter | Clayton, Frank, Gumbel, Joe | Supported | Closed form for Clayton/Frank/Gumbel; generator path for Joe |
| rvinecopulib BB families | BB1, BB6, BB7, BB8 | Supported | Generator path with family-specific hooks |
| Additional Archimedean | AMH, Gumbel–Barnett, Inverse Gaussian, BB2, BB3, BB9, BB10 | Supported by `Copulas.jl` integration | Generator path |
| Extreme-value | Logistic, Galambos, Hüsler–Reiss, Mixed, asymmetric tails, Marshall–Olkin, Cuadras–Augé, BC2, extreme-t | Supported/tested | Existing extreme-value path |
| Survival/rotated | `SurvivalCopula` wrappers | Supported when the base family has valid h-functions/inverses | Flip rules |
| Plackett, FGM, Raftery, M, W | Several miscellaneous `Copulas.jl` families | Not advertised as stable v0.1 vine families | Generic fallback |
| Empirical/Bernstein/Beta/Checkerboard | Nonparametric objects | Not part of stable v0.1 vine interface | Not targeted |

The parametric family set overlapping with `rvinecopulib` is explicitly represented in the source layout: independence, Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7 and BB8. Nonparametric `tll` is not part of the stable v0.1 Julia interface.

## Performance-oriented layout

Pair-copula methods are organized under `src/PairCopulas/`:

```text
src/PairCopulas/
  Generic.jl
  Ellipticals/GaussianCopula.jl
  Ellipticals/TCopula.jl
  Archimedeans/ArchimedeanCopula.jl
  Archimedeans/ClaytonCopula.jl
  Archimedeans/GumbelCopula.jl
  Archimedeans/FrankCopula.jl
  Archimedeans/JoeCopula.jl
  Archimedeans/BB1Copula.jl
  Archimedeans/BB6Copula.jl
  Archimedeans/BB7Copula.jl
  Archimedeans/BB8Copula.jl
  ExtremeValue/ExtremeValueCopula.jl
  Miscellaneous/IndependentCopula.jl
  Miscellaneous/MiscellaneousCopulas.jl
```

This layout separates the generic vine engines from family-specific numerical primitives. The long-term development pattern is to add closed-form `_pair_logpdf`, `hfunc1`, `hfunc2`, `hinv1`, and `hinv2` methods in the corresponding family file.

## Why the table is conservative

It is not enough for a bivariate copula to have a density. Vine simulation requires inverse conditional distributions. A family should only be documented as fully supported after it passes pair-copula conditional tests and vine-level density/simulation tests.

## Survival and rotations

Rotations are handled through `Copulas.SurvivalCopula` when the underlying base family has valid h-functions and inverse h-functions. The flip logic is implemented at the conditional level.
