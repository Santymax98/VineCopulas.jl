# Architecture

`VineCopulas.jl` is organized around three layers: pair-copula primitives, vine traversal, and fitting/selection.

```text
src/
├─ PairCopulas/          conditional kernels and pair log densities
├─ Vines/                C-, D-, and R-vine structures and traversal
├─ fitting.jl            shared fitting utilities and entry point
├─ fitting/
│  ├─ pairs.jl           pair fitting, rotations, selection domains
│  ├─ cd_vines.jl        C- and D-vine sequential fitting
│  └─ rvines.jl          R-vine graph, structure selection, fitting
├─ VineCopula.jl         common vine interface and conditional API
├─ stats.jl              log-likelihood, parameter counts, AIC, BIC
└─ utils.jl              shared numerical utilities
```

The fitting layer is deliberately split into only three implementation files. The goal is to separate responsibilities without turning every helper into its own module.

## Pair layer

Pair copulas come from `Copulas.jl`. `VineCopulas.jl` adds fast or numerically stable implementations of `hfunc1`, `hfunc2`, `hinv1`, `hinv2`, and pair log-density hooks where the generic fallback is insufficient.

## Vine layer

`CVineCopula`, `DVineCopula`, and `RVineCopula` own structure validation and traversal. Evaluation code does not perform model selection.

## Fitting layer

Fitting reuses the public vine types. Sequential estimation creates the same model objects that users can construct explicitly. Selection-specific parameter bounds live only in the fitting layer and do not modify the underlying `Copulas.jl` family definitions.
