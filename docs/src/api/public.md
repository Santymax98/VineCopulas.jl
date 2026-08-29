```@meta
CurrentModule = VineCopulas
```

# Public API

## Core types

```@docs
AbstractVineStructure
AbstractVineCopula
VineCopula
PairCopula
CVineStructure
DVineStructure
RVineStructure
CVineCopula
DVineCopula
RVineCopula
VineEdge
```

## Fitting family sets

```@docs
DEFAULT_PAIR_FAMILIES
ALL_PARAMETRIC_PAIR_FAMILIES
```

Fitting is exposed through `Distributions.fit`, for example `fit(PairCopula, U)`, `fit(CVineCopula, U)`, `fit(DVineCopula, U)`, and `fit(RVineCopula, U)`.

## Structure accessors

```@docs
structure
order
edges
struct_array
truncation
truncate
rvine_matrix
```

## Pair conditionals

These functions are public convenience names for pair conditional CDFs and
conditional quantiles. Their generic semantics are defined by the
`Copulas.condition` interface; see [Pair-copula contract](../developer/pair_contract.md).

```@docs
hfunc1
hfunc2
hinv1
hinv2
h₁
h₂
h₁⁻¹
h₂⁻¹
```

## Simulation and transforms

```@docs
simulate_qmc
set_cdf_nsamples!
enable_deterministic_cdf!
rosenblatt
rosenblatt!
inverse_rosenblatt
inverse_rosenblatt!
```

## Model summaries

```@docs
loglikelihood
npars
aic
bic
```
