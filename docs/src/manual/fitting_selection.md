# Fitting and Selection

`VineCopulas.jl` uses sequential vine estimation. The package fits one tree at a
time, computes conditional pseudo-observations through h-functions, and then
uses those transformed observations to fit the next tree.

!!! note "Quick fit versus fitted result"
    `fit(RVineCopula, U)` returns the fitted vine copula itself. Use
    `fit(CopulaModel, RVineCopula, U)` when you need metadata such as
    log-likelihood, convergence status, number of iterations, selected order, or
    selection details.

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

## Pair-family selection

Pair-copula selection chooses the best bivariate family for one edge. It can be
used directly:

```@example fit-pair
using VineCopulas
using Distributions: fit
using Random

C = ClaytonCopula(2, 1.8)
U2 = rand(MersenneTwister(9), C, 250)

pair = fit(
    PairCopula,
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

## Threaded fitting

The pair-copula fits of one tree are independent of each other, and so are the
family candidates of one edge. `threaded=true` runs both on tasks:

```julia
fit(RVineCopula, U; threaded=true)
fit(CopulaModel, DVineCopula, U; threaded=true)
fit(PairCopula, U2; threaded=true)
```

Start Julia with the threads you want to use (`julia -t 8`, or
`JULIA_NUM_THREADS=8`) and keep BLAS single-threaded
(`LinearAlgebra.BLAS.set_num_threads(1)`), since the pair likelihoods are scalar
work and a BLAS pool would only compete with the tasks. On one thread the
keyword changes nothing but the scheduling.

The result does not depend on the thread count or on the order in which the
fits finish. The candidate list of an edge is fixed before any fit runs (family
order, then rotation order), each candidate writes its own slot, and the best
candidate is read off the slots in that order, exactly as the sequential loop
chooses it. The edges of a tree write their own slots too, and the h-function
propagation to the next tree runs only after every edge of the tree has
finished. `fit(…; threaded=true)` therefore returns the same structure,
families, rotations and parameters as `fit(…)`, and the two fits can be compared
bit for bit.

- `strict=true` raises the same error as the sequential fit: every candidate of
  the edge is fitted first, and the error of the first failing candidate in
  family order is rethrown.
- `trace=true` prints the same lines as the sequential fit, in edge order: the
  lines of an edge are collected while its candidates run and printed once the
  edge has finished, and the edges of a tree are printed in tree order once the
  tree has finished.

The speed-up is bounded by the number of independent fits at each stage. Tree
``t`` of a ``p``-variable vine has ``p - t`` edges, so the top trees of a full
fit have little to parallelise at the edge level and the gain there comes from
the candidate level, which is at most the number of family–rotation candidates
of an edge (about twenty with the default family set and rotations). The
sequential parts, dependence weights, the spanning tree, and the h-function
propagation, are unchanged; see the [benchmark manual](benchmarks.md) for
measured timings.

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

Use `CopulaModel` when the fit process itself matters:

```julia
M = fit(CopulaModel, RVineCopula, U; family_set=:default)
M.result
```

Future diagnostics such as selected truncation, mBICV, selection traces, and
edge-level convergence details belong in fitted-result metadata rather than in
the vine distribution object.
