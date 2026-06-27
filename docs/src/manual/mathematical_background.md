# Mathematical background

## Copulas and Sklar's theorem

Let ``X=(X_1,\ldots,X_p)`` be a random vector with joint distribution function ``F`` and marginal distribution functions ``F_1,\ldots,F_p``. Sklar's theorem states that there exists a copula ``C`` such that

```math
F(x_1,\ldots,x_p) = C\{F_1(x_1),\ldots,F_p(x_p)\}.
```

If the margins are continuous, the copula is unique. This separates marginal modeling from dependence modeling. In practice, one often transforms data to pseudo-observations

```math
u_{ij} = \frac{\operatorname{rank}(x_{ij})}{n+1},
```

or obtains ``u_{ij}=\widehat F_j(x_{ij})`` from fitted marginal models. `VineCopulas.jl` works on the copula scale, so input data should already be in ``[0,1]^p``.

`Copulas.jl` provides the general copula layer, pseudo-observation utilities and `SklarDist`; `VineCopulas.jl` focuses on the vine composition layer.

## Why vines?

A direct ``p``-dimensional parametric copula may be too rigid. Vine copulas address this by decomposing the joint copula density into bivariate building blocks. These bivariate blocks can come from different families and can capture different dependence patterns across pairs and conditional pairs.

Under the simplifying assumption, the conditional pair-copulas do not vary with the actual value of the conditioning variables. This is the standard simplified vine copula model implemented by `VineCopulas.jl`.

## The copula scale

A vine copula density ``c`` is a density on the unit hypercube. It is not a full model for raw data until combined with marginal densities:

```math
f(x_1,\ldots,x_p) = c(u_1,\ldots,u_p)\prod_{j=1}^p f_j(x_j),
\qquad u_j = F_j(x_j).
```

This package implements ``c`` and its simulation/transformation methods. Marginal modeling belongs upstream.

## Dependence summaries

Common dependence summaries include Kendall's ``\tau``, Spearman's ``\rho``, and tail-dependence coefficients. They are useful for exploratory analysis and structure selection, but `VineCopulas.jl` v0.1 does not yet implement automatic selection based on them. For now, the user constructs the vine explicitly.
