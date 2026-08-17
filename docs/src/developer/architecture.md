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

Hot vine traversals use a small internal fused protocol:

```julia
_pair_step(C, u, v, buf)       # (logpdf, h1, h2)
_pair_logpdf_h1(C, u, v, buf)  # (logpdf, h1)
_pair_logpdf_h2(C, u, v, buf)  # (logpdf, h2)
_pair_hfuncs(C, u, v)          # (h1, h2)
```

The generic methods compose the standalone primitives, so arbitrary compatible bivariate copulas retain the same evaluation contract. Family specializations reuse transformed coordinates. In particular, Gaussian and Student fused steps compute the two marginal quantiles once per edge/observation instead of once per primitive. Archimedean specializations dispatch through generator-level hooks so family-specific stability formulas are preserved. These functions are internal; the public h-function API is unchanged.

Batched internal helpers (`_pair_hfuncs!`, `_pair_hfunc1!`, `_pair_hfunc2!`) support local scratch reuse during fitting and traversal without storing mutable workspaces in a vine object.

## Vine layer

`CVineCopula`, `DVineCopula`, and `RVineCopula` own structure validation and traversal. Evaluation code does not perform model selection. Density traversal requests only the fused subset required by the next tree: C-vines propagate one conditional, D-vines propagate both, and the standard R-vine execution plan uses per-edge liveness. The final active tree computes density only because no later pair consumes its conditional outputs.

Work buffers are owned by each call. D-vine density updates disjoint active states in place rather than copying the complete left/right matrices at every tree; Rosenblatt and inverse Rosenblatt reuse call-local work arrays. This keeps the engines reentrant and thread-safe while reducing allocation pressure.

## Fitting layer

Fitting reuses the public vine types. Sequential estimation creates the same model objects that users can construct explicitly. Selection-specific parameter bounds live only in the fitting layer and do not modify the underlying `Copulas.jl` family definitions.
