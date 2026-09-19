# Fitting and Selection

`VineCopulas.jl` uses sequential vine estimation. The package fits one tree at a
time, computes conditional pseudo-observations through h-functions, and then
uses those transformed observations to fit the next tree.

!!! note "Sequential vine fitting"
    `fit(CVineCopula, U)`, `fit(DVineCopula, U)`, and `fit(RVineCopula, U)`
    return the fitted vine copula itself. `method=:default` and
    `method=:sequential` are equivalent; joint `:mle` fitting is not provided.

## Quick fit

The simplest automatic R-vine fit is:

```@example fit-quick
using VineCopulas
using Distributions: fit
using Random

truth = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.4)],
     [FrankCopula(2, 2.0)]],
)

U = rand(MersenneTwister(7), truth, 250)
fitted = fit(RVineCopula, U)

(typeof(fitted), order(fitted), truncation(fitted))
```

The returned object is an ordinary `RVineCopula`: it can be evaluated,
simulated, truncated, and passed to `aic` or `bic`.

## Statistical fitted models and inference

Use `VineModel` when the fitting recipe, observations, likelihood summaries,
and coefficient vector are needed alongside the fitted distribution:

```julia
M = fit(VineModel, RVineCopula, U)

fitted_distribution(M)
fitting_method(M)       # :sequential
order(M); structure(M); truncation(M)
coef(M); coefnames(M)
StatsBase.aic(M); StatsBase.bic(M)
edge_table(M)
```

`edge_table(M)` derives one row per active edge with its tree, edge index,
conditioned and conditioning variables, family, rotation, and natural
parameters. It does not store a second copy of the fitted structure.

`StatsBase.aic(M)` and `StatsBase.bic(M)` use the final vine likelihood and
the number of active numerical pair-copula parameters. They are useful
comparative scores for sequential fits to the same data, but the parameters
are not a joint maximum-likelihood estimate; their usual joint-MLE asymptotic
interpretation is therefore not asserted here.

`VineCopulas.aicc(M)` and `VineCopulas.hqc(M)` are currently internal
convenience criteria computed from that same final likelihood and active
numerical parameter count. They do not assert a special sequential-vine
theory. A future sparse-vine criterion should consider mBICV instead.

Inference is a fixed-selection bootstrap:

```julia
I = infer(M; method=:bootstrap, nresamples=200, rng=MersenneTwister(1))
StatsBase.vcov(I)
StatsBase.stderror(I)
StatsBase.confint(I)
```

!!! warning "Conditional inference"
    Current vine covariance inference conditions on the selected structure,
    pair families, and rotations. Every replicate resamples observations and
    sequentially refits all active pair parameters, propagating
    pseudo-observations through the trees. It does not include model-selection
    uncertainty, and it intentionally does not offer a joint-MLE Hessian.

## Pair-family selection

Pair-copula selection chooses the best bivariate family for one edge. It can be
used directly:

```@example fit-pair
using VineCopulas
using Distributions: fit
using Random

C = ClaytonCopula(2, 1.8)
U2 = rand(MersenneTwister(9), C, 250)

pair = select_paircopula(
    U2;
    family_set=:default,
    selection_criterion=:bic,
    allow_rotations=true,
)

typeof(pair)
```

The main controls are:

| Keyword | Meaning |
|---|---|
| `family_set` | Candidate families, such as `:default`, `:all`, or an explicit tuple |
| `selection_criterion` | `:loglik`, `:aic`, or `:bic` |
| `allow_rotations` | Whether to include rotated candidates |
| `include_independence` | Whether independence can be selected |
| `preselect` | Whether dependence sign may prune rotation candidates |

!!! tip
    Use `selection_criterion=:bic` for a conservative default. Use
    `selection_criterion=:loglik` mainly for diagnostics or controlled
    comparisons where model dimension is fixed.

## Structure selection

Automatic R-vine fitting follows a Dissmann-style sequential procedure:

1. compute dependence weights for candidate edges;
2. build a maximum spanning tree;
3. fit pair-copulas on selected edges;
4. propagate conditional pseudo-observations;
5. build the next candidate graph under the proximity condition;
6. repeat until the requested truncation depth.

```@example fit-rvine-controls
using VineCopulas
using Distributions: fit
using Random

truth = DVineCopula(
    [1, 2, 3, 4],
    [[GaussianCopula(2, 0.5), ClaytonCopula(2, 1.3), FrankCopula(2, 2.0)],
     [GumbelCopula(2, 1.2), JoeCopula(2, 1.3)]];
    trunc=2,
)

U = rand(MersenneTwister(10), truth, 250)

model = fit(
    RVineCopula,
    U;
    trunc=2,
    tree_criterion=:tau,
    tree_algorithm=:kruskal,
    family_set=:default,
)

(order = order(model), truncation = truncation(model), edge_count = sum(length, edges(model)))
```

`tree_criterion=:tau` uses absolute Kendall's tau weights, while
`tree_criterion=:rho` uses absolute Spearman's rho weights. The deterministic
`tree_algorithm=:kruskal` path is the one used in the external parity tests.

`sampling_tail=js` asks the peeling step to place the variables `js` at the end
of `order(model)`, so that `admits_conditioning(model, js)` holds and
`rand(model, n; fixed=(js, Ujs))` draws exactly from the conditional copula.
It changes only how the selected trees are read into an order, never the trees
or the pair copulas, and it cannot be combined with `structure`. See
[Conditional simulation](simulation_transforms.md#Conditional-simulation).

## Fixed-structure fitting

If the R-vine structure is part of the statistical design, pass it explicitly:

```@example fit-fixed
using VineCopulas
using Distributions: fit
using Random

ord = [3, 1, 4, 2]
S = ([1, 4, 2], [4, 2], [2])
st = RVineStructure(ord, S; trunc=3)

source = RVineCopula(
    st,
    [
        [GaussianCopula(2, 0.4), ClaytonCopula(2, 1.5), FrankCopula(2, 2.0)],
        [GaussianCopula(2, 0.3), ClaytonCopula(2, 1.2)],
        [FrankCopula(2, 1.2)],
    ],
)

U = rand(MersenneTwister(12), source, 250)

refit = fit(RVineCopula, U; structure=st, family_set=:default)
(order(refit), truncation(refit))
```

!!! warning "Fixed structure is not fixed family"
    Passing `structure=st` fixes the vine graph/order. It does not freeze the
    pair-copula families unless the API path you use also supplies explicit
    edges or a previously constructed vine.

## Truncation

`trunc=q` limits fitting to the first `q` trees:

```julia
fit(RVineCopula, U; trunc=2)
```

For an existing model, use:

```julia
smaller = truncate(vine, 2)
```

Truncation returns a new model or structure and does not mutate the original.
It cannot restore pair-copulas that are not present in the input.

!!! warning "Level zero"
    The mathematical case `truncate(vine, 0)` corresponds to multivariate
    independence. The current public truncation API starts at level `1` because
    the existing engines assume at least one active tree. Level-zero truncation
    is a roadmap item, not a hidden feature.

## Model comparison

For explicit or fitted vine objects:

```@example fit-model-comparison
using VineCopulas
using Random

vine = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.5), ClaytonCopula(2, 1.3)],
     [FrankCopula(2, 1.8)]],
)
U = rand(MersenneTwister(14), vine, 200)

(loglikelihood = loglikelihood(vine, U),
 npars = npars(vine),
 AIC = aic(vine, U),
 BIC = bic(vine, U))
```

`AIC` and `BIC` are post-fit scores for the supplied model and data. They do not
by themselves prove that the sequential fitting procedure found a global
full-vine maximum likelihood optimum.

## Metadata and diagnostics

The fitted vine is deliberately a distribution, not a fitted-result container.
Its order, truncation, selected edge families, and post-fit scores can be
inspected directly. A richer fitted-result API for diagnostics such as selected
truncation, mBICV, selection traces, and edge-level convergence is planned
separately.
