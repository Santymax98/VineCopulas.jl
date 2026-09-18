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

In a large panel the variables often come with a known partition: sectors,
regions, asset classes. `groups` restricts the first tree to the spanning
trees in which every group induces a connected subtree, and selects the best
of those under the same criterion. It is an optional structural prior on tree
1, not part of Dißmann's procedure, and only the R-vine engine takes it.

```julia
model = fit(RVineCopula, U; groups=[1, 1, 1, 2, 2, 2])
```

**The problem it solves.** Let ``V = \{1, \dots, p\}``, let the tree-1
candidate graph be the complete graph ``K_V`` (every pair is admissible;
`threshold` forces an independence copula on an edge but does not remove it
from the candidate set), let ``w`` be the criterion's weights, and let
``V = G_1 \,\dot\cup\, \cdots \,\dot\cup\, G_K`` be the partition. Write
``\mathcal T(S)`` for the spanning trees of the complete graph on ``S``, and

```math
\mathcal T_{\mathcal G} = \{ T \in \mathcal T(V) : T[G_k] \text{ is connected for every } k \}.
```

Unconstrained selection solves ``\max_{T \in \mathcal T(V)} \sum_{e \in T} w_e``;
`groups` solves

```math
\max_{T \in \mathcal T_{\mathcal G}} \sum_{e \in T} w_e .
```

An edge of ``T`` is *within* if both ends lie in one group and *cross*
otherwise, and ``V / \mathcal G`` is the quotient multigraph whose vertices are
the groups and whose edges are the cross pairs with their weights.

**Lemma 1.** ``T \in \mathcal T_{\mathcal G}`` if and only if
``T = \big(\bigcup_k T_k\big) \cup C`` with ``T_k \in \mathcal T(G_k)`` for every
``k`` and ``C`` a set of cross edges whose image in ``V / \mathcal G`` is a
spanning tree of ``V / \mathcal G``.

*Proof.* (``\Rightarrow``) ``T[G_k]`` is acyclic, as a subgraph of a tree, and
connected, so it is a spanning tree of ``G_k`` with ``|G_k| - 1`` edges, and
these are exactly the within edges of ``T`` in ``G_k``. Counting,
``|V| - 1 = \sum_k (|G_k| - 1) + |C|`` gives ``|C| = K - 1``. Contracting each
connected ``T[G_k]`` to a point maps ``T`` onto a connected multigraph on ``K``
vertices with ``K - 1`` edges, that is, a spanning tree of ``V / \mathcal G``.
(``\Leftarrow``) The union is connected, within a group by ``T_k`` and across
groups by ``C``, and has ``\sum_k (|G_k| - 1) + (K - 1) = |V| - 1`` edges, so it
is a spanning tree, and ``T[G_k] \supseteq T_k`` is connected. ``\square``

**Proposition 2 (decomposition).** The two parts of Lemma 1 are chosen
independently and the objective is additive over them, so

```math
\max_{T \in \mathcal T_{\mathcal G}} \sum_{e \in T} w_e
\;=\;
\sum_{k=1}^{K} \max_{T_k \in \mathcal T(G_k)} \sum_{e \in T_k} w_e
\;+\;
\max_{C \in \mathcal T(V / \mathcal G)} \sum_{e \in C} w_e ,
```

and a maximiser is any union of a maximum spanning tree of each ``K_{G_k}``
with a maximum spanning tree of ``V / \mathcal G``. A maximum spanning tree of
a multigraph uses only the heaviest edge between any two vertices, so the
second term is the maximum spanning tree of the simple graph on the groups
with edge weight ``\max\{w_{ab} : a \in G_k,\, b \in G_l\}``. ``\square``

**Proposition 3 (the sort key is exact).** Kruskal's algorithm over the
tree-1 candidates ordered by the key ``(\text{is cross},\, -w_e,\, \dots)``,
every within edge before every cross edge, each block in descending weight,
the existing deterministic tie-break after, returns a maximiser of
Proposition 2.

*Proof.* Phase 1 sees only within edges. A union-find component never holds
two groups during this phase, so for each ``k`` the test "the two ends are in
different components" is Kruskal's test on ``K_{G_k}`` with the edges in
descending weight; by Kruskal's theorem the accepted edges of ``G_k`` form a
maximum spanning tree of ``K_{G_k}``, and since ``K_{G_k}`` is connected the
phase ends with each group as one component. Phase 2 sees only cross edges,
and every component is now exactly one group, so the test is Kruskal's test
on ``V / \mathcal G`` with the edges in descending weight; the accepted cross
edges form a maximum spanning tree of ``V / \mathcal G``. By Lemma 1 the union
is in ``\mathcal T_{\mathcal G}``, and it attains the right-hand side of
Proposition 2. ``\square``

**Remarks.**

1. The constrained optimum is at most the unconstrained one, since
   ``\mathcal T_{\mathcal G} \subseteq \mathcal T(V)``, with equality if and only
   if some unconstrained maximum spanning tree already has every ``T[G_k]``
   connected. Where the groups are the strongly dependent blocks of the data,
   the two coincide and the constraint changes nothing; where the data
   contradict the partition, tree 1 gives up cross-group edges, and the
   dependence they carried moves to conditional pair-copulas in the higher
   trees.
2. Ties are broken by the same deterministic key as before, so the result is
   unique given the key, and `groups = ones(Int, p)` or `groups = 1:p` is the
   unconstrained fit exactly: with one group there are no cross edges, and
   with singleton groups there are no within edges, so the key reduces to the
   old one.
3. The argument needs a complete candidate graph inside each group, which
   holds for tree 1 only. From tree 2 the vertices are the edges of the
   previous tree and the proximity condition fixes the candidate set, so a
   group constraint there would not decompose, and `groups` does not offer
   one.
4. The cost is unchanged: one sort of the ``\binom{p}{2}`` candidates.
5. Statistically the constraint is a prior on tree 1 alone: within-group
   dependence is explained by direct pair-copulas first, and exactly ``K - 1``
   direct cross-group pairs are modelled in tree 1; cross-group dependence is
   otherwise carried by conditional pair-copulas in the higher trees. The
   constraint decides which pairs are modelled directly, not how well they
   fit: at full depth every R-vine is the same model when the pair-copula
   family can represent the joint law, and the log-likelihood difference is
   then sequential-estimation error. At a truncation level the choice is
   visible, and a partition that cuts across the true blocks costs
   log-likelihood. `benchmarks/fitting/grouped_tree1.jl` measures both on
   block-structured Gaussian data.
6. In the language of constrained spanning trees, ``\mathcal T_{\mathcal G}``
   is the set of *clustered* spanning trees of the partition, in the sense
   of the clustered tree problems (Wu & Lin 2015; see also the generalised
   network design survey of Feremans, Labbé & Laporte 2003), and Proposition
   2 is the observation that the clustered maximum spanning tree with a
   complete candidate graph decomposes into local trees and a tree on the
   contracted graph. Among vine models, the closest relatives we know are the
   regular-vine market-sector model of Brechmann & Czado (2013), which
   imposes a sector-wise structure through sector indices, and the
   candidate-edge restriction of Müller & Czado (2019), which removes edges
   from the candidate set through a graphical Lasso. Neither is this
   constraint: `groups` removes no candidate and adds no variable, it
   restricts the admissible trees. We know of no vine paper that states it,
   and the package documents it as an optional structural prior.

`groups` composes with every other selection control: `tree_criterion`
supplies the weights ``w``, `threshold` still forces independence copulas on
the weak edges of the selected tree, `trunc` still cuts the depth, and
`sampling_tail` still peels the selected trees. It cannot be combined with
`structure`, which fixes tree 1 already.

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
