```@meta
CurrentModule = VineCopulas
```

# Public API

This page documents the stable public names exported by `VineCopulas.jl`.

## Core types

```@docs
AbstractVineCopula
VineCopula
PairCopula
CVineCopula
DVineCopula
RVineCopula
RVineStructure
VineEdge
```

## Structure accessors

```@docs
order
edges
struct_array
truncation
rvine_matrix
```

## Pair-copula conditionals

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

