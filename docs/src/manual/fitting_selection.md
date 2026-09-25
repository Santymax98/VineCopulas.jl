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
| `pair_method` | Estimator per candidate: `:default` (maximum likelihood) or `:itau` |
| `independence_test` | `:none`, or `:kendall` to accept independence on an edge the asymptotic Kendall test does not reject |
| `independence_level` | Size of that test, `0.05` by default |

!!! tip
    Use `selection_criterion=:bic` for a conservative default. Use
    `selection_criterion=:loglik` mainly for diagnostics or controlled
    comparisons where model dimension is fixed.

`pair_method=:itau` fits each candidate by `fit(FT, U; method=:itau)` of
Copulas.jl, which inverts the sample Kendall tau instead of maximizing the
likelihood. It is closed form for the Gaussian, Clayton, Gumbel, Frank and Joe
families, and a one-dimensional profile in the degrees of freedom for the
Student family, so a sequential vine fit is several times faster than under
`:mle`. The estimate lives on the family's own parameter domain, not on the
finite selection boxes the `:mle` candidates use: a Student candidate can
return `ν = Inf`, the Gaussian endpoint of its profile, which the vine
evaluates as the Gaussian copula. The BB families have two parameters, which
tau alone does not identify, so they are fitted by `:mle` under `:itau`, as in
vinecopulib; `trace=true` prints the method used by each candidate. A family
outside the shipped sets that advertises no `:itau` fails as a candidate with
the Copulas.jl error, which `strict=true` raises. A candidate whose estimate
gives the sample zero density (a Clayton with `θ < 0`, which `:itau` returns
on a negative tau when `preselect=false` lets the unrotated candidate run)
scores `Inf` and loses; it is not an error under `strict=true`, because the
estimator did not fail.

`independence_test=:kendall` is the usual companion of `:itau`: an edge whose
sample tau the test does not reject at `independence_level` receives the
independence copula before any family is fitted, whatever
`include_independence` says, like the `threshold` gate.

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

At tree ``m`` the engine selects

```math
T_m \in \arg\max_{T \in \mathcal T(E_m)} \sum_{e \in T} w_e ,
```

where ``E_m`` is the set of proximity-admissible candidate edges, ``\mathcal T(E_m)``
its spanning trees, and ``w_e`` the weight `tree_criterion` attaches to the candidate
edge ``e = (a, b \mid D)`` from the two conditional pseudo-observation vectors
``u_{a \mid D}``, ``u_{b \mid D}``. `tree_criterion` changes ``w_e`` only; the
candidate set ``E_m`` is the same for every criterion. The deterministic
`tree_algorithm=:kruskal` path is the one used in the external parity tests.

### Built-in tree criteria

Each built-in criterion is the absolute value of a documented dependence
statistic, listed here with its estimator, its range and its reference (full
citations on the [References](../references.md) page):

| `tree_criterion` | ``w_e`` | range | reference |
|:--|:--|:--|:--|
| `:tau` | ``\lvert \hat\tau_b \rvert``, Kendall's tau-b (default) | ``[0, 1]`` | Kendall (1938); Dißmann et al. (2013) |
| `:rho` | ``\lvert \hat\rho_S \rvert``, Spearman's rho on average ranks | ``[0, 1]`` | Spearman (1904) |
| `:hoeffd` | ``\lvert \hat D \rvert``, Hoeffding's ``D`` in the Hollander & Wolfe form, scaled by 30 | ``[0, 1]`` | Hoeffding (1948); Hollander, Wolfe & Chicken (2014) |
| `:mcor` | ``\hat\rho_{\max}``, the maximum correlation, estimated by ACE | ``[0, 1]`` | Gebelein (1941); Rényi (1959); Breiman & Friedman (1985) |
| `:joe` | ``-\tfrac12 \log(1 - \hat r^2)``, ``\hat r`` the Pearson correlation of the normal scores ``\Phi^{-1}(u)`` | ``[0, \infty)`` | Joe (1989) |
| `:cxi` | ``\lvert \max\{\hat\xi(u_a \to u_b), \hat\xi(u_b \to u_a)\} \rvert``, the symmetrised Chatterjee coefficient | ``[0, 1]`` | Chatterjee (2021) |

Three notes on the less common ones.

- `:hoeffd` is Hoeffding's ``D_n`` statistic; its population value is ``30 \int (F_{ab} - F_a F_b)^2 \, dF_{ab}``, which is 0 under independence and 1 under any monotone functional relation. A non-monotone functional relation scores below 1 (a symmetric parabola gives about ``1/4``). Ties are counted strictly. The estimator needs at least five observations.
- `:mcor` is the maximum correlation coefficient ``\sup_{f, g} \operatorname{corr}(f(u_a), g(u_b))`` of Gebelein and Rényi, estimated by the alternating conditional expectations algorithm of Breiman & Friedman with a running-mean smoother of half-width ``\lceil n/5 \rceil``, at most 10 inner and 100 outer iterations, and stopping tolerances ``10^{-4}`` and ``2 \cdot 10^{-15}`` on the change of the mean squared difference between the two transforms. These are the constants of `vinecopulib`'s `mcor`, so the two agree on the same data. For a Gaussian pair ``\rho_{\max} = \lvert \rho \rvert``, and a functional relation, monotone or not, scores near 1.
- `:joe` is the mutual information of a Gaussian copula with correlation ``\hat r``, Joe's relative-entropy dependence measure under the Gaussian assumption. It is not bounded, and it is strictly increasing in ``\lvert \hat r \rvert``: a maximum spanning tree depends only on the order of its weights, so `:joe` selects the same trees as ``\lvert \hat r \rvert`` on normal scores, and its scale is visible only through `threshold`. It is `Inf` on a pair whose normal scores are exactly linearly dependent.
- `:cxi` is Chatterjee's ``\xi_n``, which measures how well one variable is a measurable function of the other and is therefore asymmetric; the criterion takes the larger of the two directions. The population value is in ``[0, 1]``; the estimate can be slightly negative, and the absolute value is taken.

The rank correlations and `:joe` do not see a symmetric non-monotone relation (a
parabola in ``u_a`` has ``\tau \approx 0``), while `:hoeffd`, `:mcor` and `:cxi`
do; the last two rank a functional relation above a noisy monotone one.

### A custom tree criterion

`tree_criterion` also accepts a function. It is called once per candidate edge
``(a, b \mid D)`` as `f(u_a, u_b, a, b, D)`, where `u_a` and `u_b` are the two
conditional pseudo-observation vectors and `a`, `b`, `D` are variable labels,
and its value is ``w_e``. The same function drives C-vine root choice and child
edges (there `D` is the roots chosen so far), D-vine order selection, and the
R-vine spanning trees. The built-in `:tau` is
`(ua, ub, a, b, D) -> abs(VineCopulas._kendall_tau_b(ua, ub))`.

The contract:

- the value must be a finite `Real`; `NaN`, `±Inf`, `missing`, or anything that
  is not a `Real` throws an `ArgumentError` naming the edge and the value;
- the value is used as is: no absolute value is taken, and the tree maximises
  it, so the sign is the caller's choice;
- the function should be deterministic in its arguments. Each edge is scored
  once per tree, so a random criterion is not refused, but the fit is then not
  reproducible without control of its randomness.

```julia
# A precomputed weight matrix for the first tree, |tau| above it.
W = my_tree1_weights(U)
model = fit(RVineCopula, U;
    tree_criterion=(ua, ub, a, b, D) -> isempty(D) ? W[a, b] : abs(VineCopulas._kendall_tau_b(ua, ub)))

# The Pearson correlation of the normal scores, the monotone image of :joe.
normal_r = (ua, ub, a, b, D) -> abs(cor(quantile.(Normal(), ua), quantile.(Normal(), ub)))
model = fit(RVineCopula, U; tree_criterion=normal_r)
```

### `threshold` follows the criterion's scale

`threshold` forces an independence pair-copula on every candidate edge with
``w_e <`` `threshold`, on the criterion's own scale, and it does not remove the
edge from the candidate set. Its admissible range therefore follows the
criterion: ``[0, 1]`` for `:tau`, `:rho`, `:hoeffd`, `:mcor` and `:cxi`;
``[0, \infty)`` for `:joe`; any finite value for a function.

With a custom criterion `threshold` is a cut on that function's scale and no
longer a dependence threshold in the usual sense. For example
`(ua, ub, a, b, D) -> abs(VineCopulas._kendall_tau_b(ua, ub)) + 2` leaves
``[0, 1]`` deliberately; with it, `threshold=2.3` is exactly `:tau` with
`threshold=0.3`, and `threshold=0.3` forces nothing.

### Group-constrained first tree

`groups` is an optional structural constraint for automatic R-vine selection.
It takes one integer group id per variable:

```julia
model = fit(RVineCopula, U; groups=[1, 1, 1, 2, 2, 2])
```

Let the variables be partitioned into groups $G_1,\ldots,G_K$. Among the
admissible first-tree spanning trees, `groups` restricts selection to those for
which every $G_k$ induces a connected subtree. Under the edge weights $w_e$
supplied by `tree_criterion`, tree 1 solves

```math
\max_{T} \sum_{e\in T} w_e
\qquad
\text{subject to } T[G_k]\text{ connected for every }k.
```

This is a clustered spanning-tree connectivity constraint. For the complete
candidate graph available at R-vine tree 1, the constrained maximum spanning
tree decomposes into maximum spanning trees within the groups and a maximum
spanning tree on the contracted graph of groups.

The implementation obtains the same optimum in one deterministic Kruskal pass:
within-group candidates are processed before cross-group candidates, while
decreasing edge weight and the existing deterministic tie break are preserved
inside each class.

Thus grouped tree-1 selection has the same asymptotic complexity as the
unconstrained Kruskal selection. Its implementation is tested against brute
force enumeration of all admissible spanning trees on small instances.

`groups` affects tree 1 only. From tree 2 onward, candidate edges are determined
by the R-vine proximity condition and selection proceeds exactly as in the
ordinary sequential fit.

Two limiting cases reproduce the unconstrained fit exactly:

```julia
groups = ones(Int, p)   # all variables in one group
groups = collect(1:p)   # one group per variable
```

`groups` composes with `tree_criterion`, `threshold`, `trunc`, and
`sampling_tail`. It cannot be combined with `structure`, because a fixed
structure already determines tree 1.

The partition should be interpreted as structural information supplied by the
user rather than inferred from the data. Its usefulness therefore depends on
whether the grouping is meaningful for the application.

The effect is particularly relevant for truncated vines, where the first trees
determine which dependencies are represented explicitly. In the special
full-depth Gaussian case, different R-vine structures can represent the same
Gaussian copula; remaining differences are then due to finite-sample
sequential estimation rather than to the group constraint itself.


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
