# Architecture

`VineCopulas.jl` is organized around three layers: pair-copula primitives, vine traversal, and fitting/selection. The package is the native Julia vine layer on top of `Copulas.jl`; it should not duplicate `Copulas.jl` as a general pair-copula mathematics library.

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

Pair copulas come from `Copulas.jl`. In particular, `PairCopula` is an alias for `Copulas.Copula{2}` rather than a VineCopulas-specific family hierarchy.

The semantic fallback for pair conditionals is the public `Copulas.jl` conditioning interface:

```julia
cdf(condition(C, 2, v), u)
cdf(condition(C, 1, u), v)

quantile(condition(C, 2, v), q)
quantile(condition(C, 1, u), q)
```

`hfunc1`, `hfunc2`, `hinv1`, and `hinv2` are public vine terminology for these operations. A compatible bivariate `Copulas.jl` copula should therefore be usable on a vine edge without any VineCopulas-specific methods.

`VineCopulas.jl` may still add fast or numerically stable implementations of `hfunc1`, `hfunc2`, `hinv1`, `hinv2`, and pair log-density hooks where the generic fallback is insufficient or materially slower. These specializations are optional fast paths, not a second mathematical source of truth.

Hot vine traversals use a small internal fused protocol:

```julia
_pair_step(C, u, v, buf)       # (logpdf, h1, h2)
_pair_logpdf_h1(C, u, v, buf)  # (logpdf, h1)
_pair_logpdf_h2(C, u, v, buf)  # (logpdf, h2)
_pair_hfuncs(C, u, v)          # (h1, h2)
```

The generic methods compose the standalone primitives, so arbitrary compatible bivariate copulas retain the same evaluation contract. Family specializations reuse transformed coordinates. In particular, Gaussian and Student fused steps compute the two marginal quantiles once per edge/observation instead of once per primitive. Archimedean specializations dispatch through generator-level hooks so family-specific stability formulas are preserved. These functions are internal; the public h-function API is unchanged.

Batched internal helpers (`_pair_hfuncs!`, `_pair_hfunc1!`, `_pair_hfunc2!`) support local scratch reuse during fitting and traversal without storing mutable workspaces in a vine object.

Reusable mathematical behavior for an individual pair-copula family should generally live in `Copulas.jl`. Fused operations that exist because a vine traversal needs several quantities at once belong in `VineCopulas.jl`.

## Vine layer

`CVineCopula`, `DVineCopula`, and `RVineCopula` own structure validation and traversal. Evaluation code does not perform model selection. Density traversal requests only the fused subset required by the next tree: C-vines propagate one conditional, D-vines propagate both, and the standard R-vine execution plan uses per-edge liveness. The final active tree computes density only because no later pair consumes its conditional outputs.

Work buffers are owned by each call. D-vine density updates disjoint active states in place rather than copying the complete left/right matrices at every tree; Rosenblatt and inverse Rosenblatt reuse call-local work arrays. This keeps the engines reentrant and thread-safe while reducing allocation pressure.

## Fitting layer

Fitting reuses the public vine types. Sequential estimation creates the same model objects that users can construct explicitly. Selection-specific parameter bounds live only in the fitting layer and do not modify the underlying `Copulas.jl` family definitions.

Quick fitting, for example `fit(RVineCopula, U)`, returns the fitted vine copula itself. Rich fitting metadata belongs in `CopulaModel`, not in the vine distribution object. This keeps the probabilistic model distinct from diagnostics such as selection scores, fitting method, convergence status, selected truncation, and selection traces.
