# -----------------------------------------------------------------------------
# Groups for the first R-vine tree, derived from the data
# -----------------------------------------------------------------------------
#
# `fit(RVineCopula, U; groups=g)` takes the partition as given. This file adds
# the step before it: a partition of the variables by hierarchical clustering
# of the tree-1 distances `1 - w_ij`, where `w_ij` is the weight that the fit
# itself gives to the tree-1 edge `(i, j)`. The clustering is the one step that
# needs Clustering.jl, and it lives in `ext/VineCopulasClusteringExt.jl`.

# The linkages of `Clustering.hclust` whose merge heights do not decrease, so
# that the largest-gap rule for `k` reads a monotone sequence.
const _GROUP_LINKAGES = (:single, :average, :complete, :ward, :ward_presquared)

"""
    dependence_groups(U; k=nothing, linkage=:average, tree_criterion=:tau, weights=nothing)

Partition the `p` variables of the pseudo-observations `U` (`p × n`) into groups of
strong mutual dependence, for `fit(RVineCopula, U; groups=g)`. Returns a
`Vector{Int}` of `p` group ids.

The method is hierarchical clustering of the distances ``d_{ij} = 1 - w_{ij}``,
where ``w_{ij}`` is the weight that `fit` gives to the tree-1 edge ``(i, j)``
under the same `tree_criterion` and `weights`. Pass those two keywords to both
calls, and the partition and the first tree read the same weights.

!!! note "Clustering.jl"
    The clustering step is a package extension. Run `using Clustering` before the
    first call; without it the call throws an `ArgumentError`.

# Keywords

- `k`: the number of groups, an integer in `1:p`. With `k = nothing` the tree is cut
  at the first largest gap between two consecutive merge heights, which gives `k` in
  `2:(p - 1)`. If `p <= 2`, or if every gap is zero, the rule gives `k = 1`. One group
  and `p` groups both reproduce the unconstrained fit.
- `linkage`: the linkage of `Clustering.hclust`, one of `:single`, `:average`,
  `:complete`, `:ward` and `:ward_presquared`.
- `tree_criterion`: as in `fit`. The distance needs weights on ``[0, 1]``, so
  `:joe`, whose values lie in ``[0, \\infty)``, is refused, and a function must return
  values on ``[0, 1]``.
- `weights`: observation weights, as in `fit`.

# Statistical interpretation

A partition from `dependence_groups` is a function of the same data that the vine is
then fitted to. The constrained first tree is therefore a two-stage selection, and its
fit statistics do not count the choice of the partition. A partition from domain
knowledge (sectors, regions, asset classes) has no such stage.

# Examples

```julia
using VineCopulas, Clustering
g = dependence_groups(U)                                   # k by the largest gap
g = dependence_groups(U; k=4, linkage=:complete)
vc = fit(RVineCopula, U; groups=dependence_groups(U; tree_criterion=:rho), tree_criterion=:rho)
```
"""
function dependence_groups(U::AbstractMatrix{<:Real}; k::Union{Nothing,Integer}=nothing, linkage::Symbol=:average, tree_criterion=:tau, weights=nothing,)
    p = size(U, 1)
    linkage in _GROUP_LINKAGES || throw(ArgumentError("linkage must be one of $(_GROUP_LINKAGES); got :$linkage"))
    k === nothing || 1 <= k <= p || throw(ArgumentError("k must be nothing or an integer in 1:$p; got $k"))
    _check_tree_criterion(tree_criterion)
    tree_criterion === :joe && throw(ArgumentError("dependence_groups uses the distance 1 - w, so it needs tree weights on [0, 1]; tree_criterion = :joe takes values in [0, ∞)"))
    X = _fit_data(U, p)
    w = _fit_weights(weights, size(X, 2))
    _check_weighted_tree_criterion(tree_criterion, w)
    p == 1 && return [1]
    return _hclust_groups(_tree1_distances(X, tree_criterion, w), k === nothing ? nothing : Int(k), linkage)
end

"""
    _tree1_distances(X, criterion, weights)

The `p × p` matrix ``1 - w_{ij}`` of the tree-1 candidates of `X`, with a zero diagonal.
The weights are the ones that `_rvine_tree1_candidates` gives to the R-vine fit.
A weight outside ``[0, 1]`` throws an `ArgumentError` that names the edge.
"""
function _tree1_distances(X::Matrix{Float64}, criterion, weights)
    p = size(X, 1)
    D = zeros(p, p)
    for c in _rvine_tree1_candidates(X, criterion, weights)
        0.0 <= c.weight <= 1.0 || throw(ArgumentError("dependence_groups uses the distance 1 - w, so it needs tree weights on [0, 1]; tree_criterion gave $(c.weight) on the edge ($(c.a), $(c.b))"))
        D[c.a, c.b] = D[c.b, c.a] = 1.0 - c.weight
    end
    return D
end

"""
    _gap_k(heights)

The number of groups at the first largest gap between two consecutive merge heights
of a hierarchical clustering of `length(heights) + 1` variables. The heights are read
in increasing order, as `Clustering.cutree` reads them. A cut between merge `i` and
merge `i + 1` keeps the first `i` merges and leaves `p - i` groups, so the result lies
in `2:(p - 1)`. It is `1` if `p <= 2` or if every gap is zero.
"""
function _gap_k(heights::AbstractVector{<:Real})
    p = length(heights) + 1
    p <= 2 && return 1
    gaps = diff(sort(heights))
    g, i = findmax(gaps)
    g > 0 || return 1
    return p - i
end

"""
    _hclust_groups(D, k, linkage)

Cut the hierarchical clustering of the distance matrix `D` under `linkage` into `k`
groups, or into `_gap_k` groups if `k === nothing`. The method is in
`VineCopulasClusteringExt`. This fallback throws the `ArgumentError` that says to load
Clustering.jl.
"""
_hclust_groups(D, k, linkage) = throw(ArgumentError("dependence_groups needs Clustering.jl; run `using Clustering` first"))
