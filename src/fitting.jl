# =============================================================================
# VineCopulas.jl — fitting and model-selection layer
#
# This file is the package fitting layer. It is included after the C-/D-/R-vine
# core types and before stats.jl.
#
# Design goals
# ------------
# 1. Preserve the Distributions.jl / Copulas.jl fitting API for vine models,
#    while keeping automatic pair-family selection VineCopulas-owned:
#
#       select_paircopula(U)                     # quick selected pair copula
#       fit(CVineCopula, U)                      # quick C-vine
#       fit(DVineCopula, U)
#       fit(RVineCopula, U)
#
# 2. Reuse Copulas.jl family definitions and native fitting methods where their
#    parameter domains match the vine-selection problem. Selection-only bounded
#    solvers are kept local when parity requires a narrower candidate domain.
#
# 3. Use sequential pair-copula estimation for vines. This is deliberately
#    called `:sequential`, not `:mle`: it is not a joint MLE of all vine
#    parameters.
#
# 4. Keep R-vine structure learning graph-native. The learned sequence of
#    trees is converted to the package's (order, struct_array, edges)
#    representation only after selection.
#
# 5. Add a standard-R-vine computational plan based on conditional states
#    (variable | conditioning set). This avoids the fragile label-min/max
#    traversal for newly fitted R-vines and also works for non-identity orders.
#
# Current scope
# -------------
# - continuous pseudo-observations
# - pair selection by loglik / AIC / BIC
# - optional 0/90/180/270 reflected pair-copula rotations
# - fixed or automatic C-/D-vine order
# - fixed or Dissmann-style automatic R-vine structure
# - Kendall tau-b, Spearman rho, Hoeffding D, maximum correlation, Gaussian
#   mutual information, Chatterjee xi, or user-supplied tree weights
# - group-constrained first tree for R-vines: every group of variables
#   induces a connected subtree of tree 1
# - user-specified truncation and dependence threshold
# - threaded edge and family-candidate fitting (`threaded=true`), identical to
#   the sequential fit by construction
#
# Intentionally deferred
# ----------------------
# - nonparametric TLL pair copulas
# - discrete margins
# - observation weights / missing-value pairwise logic
# - automatic sparse truncation/threshold (mBICV)
# - joint vine MLE / sequential-estimator covariance
# =============================================================================

# -----------------------------------------------------------------------------
# Public family sets
# -----------------------------------------------------------------------------

"""
    DEFAULT_PAIR_FAMILIES

Stable parametric family set used by automatic pair-copula selection.
It intentionally overlaps the common parametric core used in vinecopulib:
Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7 and BB8.
Independence is handled separately by `include_independence=true`.
"""
const DEFAULT_PAIR_FAMILIES = (
    Copulas.GaussianCopula,
    Copulas.TCopula,
    Copulas.ClaytonCopula,
    Copulas.GumbelCopula,
    Copulas.FrankCopula,
    Copulas.JoeCopula,
    Copulas.BB1Copula,
    Copulas.BB6Copula,
    Copulas.BB7Copula,
    Copulas.BB8Copula,
)

"""
    ALL_PARAMETRIC_PAIR_FAMILIES

Broader parametric set exposed by Copulas.jl/VineCopulas.jl. The default set
is deliberately smaller because it is the set that should receive the
strongest correctness and benchmark coverage first.
"""
const ALL_PARAMETRIC_PAIR_FAMILIES = (
    Copulas.GaussianCopula,
    Copulas.TCopula,
    Copulas.ClaytonCopula,
    Copulas.GumbelCopula,
    Copulas.FrankCopula,
    Copulas.JoeCopula,
    Copulas.AMHCopula,
    Copulas.GumbelBarnettCopula,
    Copulas.InvGaussianCopula,
    Copulas.BB1Copula,
    Copulas.BB2Copula,
    Copulas.BB3Copula,
    Copulas.BB6Copula,
    Copulas.BB7Copula,
    Copulas.BB8Copula,
    Copulas.BB9Copula,
    Copulas.BB10Copula,
)
export DEFAULT_PAIR_FAMILIES, ALL_PARAMETRIC_PAIR_FAMILIES


@inline function _resolve_family_set(family_set)
    family_set === :default && return DEFAULT_PAIR_FAMILIES
    family_set === :all && return ALL_PARAMETRIC_PAIR_FAMILIES
    family_set isa Tuple && return family_set
    family_set isa AbstractVector && return Tuple(family_set)
    throw(ArgumentError("family_set must be :default, :all, a tuple, or a vector of bivariate copula types"))
end

# -----------------------------------------------------------------------------
# Small utilities
# -----------------------------------------------------------------------------

@inline _choose2(n::Integer) = n <= 1 ? 0 : (n * (n - 1)) ÷ 2

@inline function _check_selection_criterion(criterion::Symbol)
    criterion in (:loglik, :aic, :bic) || throw(ArgumentError("selection_criterion must be :loglik, :aic, or :bic"))
    return criterion
end

# Built-in tree criteria. Each is a documented dependence statistic; see
# `_tree_dependence` for the estimator and the range of every entry.
const _TREE_CRITERIA = (:tau, :rho, :hoeffd, :mcor, :joe, :cxi)

@inline function _check_tree_criterion(criterion::Symbol)
    criterion in _TREE_CRITERIA || throw(ArgumentError("tree_criterion must be one of $(_TREE_CRITERIA), or a function (u_a, u_b, a, b, D) -> Real"))
    return criterion
end
@inline _check_tree_criterion(criterion::Function) = criterion
@inline _check_tree_criterion(criterion) = throw(ArgumentError("tree_criterion must be one of $(_TREE_CRITERIA), or a function (u_a, u_b, a, b, D) -> Real"))

"""
    _check_groups(groups, p)

`groups` is `nothing` or a vector of `p` integer group ids, one per variable; the ids
themselves carry no meaning beyond equality.
"""
@inline function _check_groups(groups, p::Int)
    groups === nothing && return nothing
    groups isa AbstractVector{<:Integer} || throw(ArgumentError("groups must be nothing or a vector of integer group ids, one per variable"))
    length(groups) == p || throw(DimensionMismatch("groups has length $(length(groups)) but the data has $p variables"))
    return collect(Int, groups)
end

"""
    _check_threshold(threshold, criterion)

`threshold` is compared with the tree criterion's value on the criterion's own scale
(`force_independence = w_e < threshold`), so its admissible range follows the criterion:
`[0, 1]` for `:tau`, `:rho`, `:hoeffd`, `:mcor` and `:cxi`, `[0, ∞)` for `:joe`, and any
finite value for a custom function.
"""
@inline function _check_threshold(threshold::Real, criterion)
    t = Float64(threshold)
    isfinite(t) || throw(ArgumentError("threshold must be finite"))
    if criterion isa Function
        return t
    elseif criterion === :joe
        t >= 0.0 || throw(ArgumentError("threshold must be non-negative for tree_criterion = :joe, whose values lie in [0, ∞)"))
    else
        0.0 <= t <= 1.0 || throw(ArgumentError("threshold must lie in [0,1] for tree_criterion = :$criterion, whose values lie in [0, 1]"))
    end
    return t
end

function _fit_data(U::AbstractMatrix{<:Real}, p::Int)
    X0 = _as_pxn(p, U)
    size(X0, 2) >= 2 || throw(ArgumentError("at least two observations are required"))

    # Hot fitting paths already operate on p×n Matrix{Float64} pseudo-data.
    # Validate and reuse those matrices when every value is strictly interior.
    # We copy only when conversion/clamping is actually required.
    if X0 isa Matrix{Float64}
        needs_copy = false
        @inbounds for x in X0
            isfinite(x) || throw(ArgumentError("copula data must be finite"))
            0.0 <= x <= 1.0 || throw(ArgumentError("copula data must lie in [0,1]"))
            needs_copy |= (x == 0.0 || x == 1.0)
        end
        !needs_copy && return X0
    end

    X = Matrix{Float64}(undef, p, size(X0, 2))
    @inbounds for j in axes(X0, 2), i in 1:p
        x = Float64(X0[i, j])
        isfinite(x) || throw(ArgumentError("copula data must be finite"))
        0.0 <= x <= 1.0 || throw(ArgumentError("copula data must lie in [0,1]"))
        X[i, j] = _clp(x)
    end
    return X
end

@inline _state_key(v::Int, D) = (v, Tuple(sort!(collect(Int, D))))

@inline function _set_intersection_sorted(a::Vector{Int}, b::Vector{Int})
    out = Int[]
    i = 1
    j = 1
    @inbounds while i <= length(a) && j <= length(b)
        if a[i] == b[j]
            push!(out, a[i]); i += 1; j += 1
        elseif a[i] < b[j]
            i += 1
        else
            j += 1
        end
    end
    return out
end

@inline function _setdiff_one(a::Vector{Int}, b::Vector{Int})
    # `a` and `b` are sorted and, for a valid proximity candidate,
    # a \ b contains exactly one element.
    @inbounds for x in a
        searchsortedfirst(b, x) > length(b) && return x
        k = searchsortedfirst(b, x)
        (k > length(b) || b[k] != x) && return x
    end
    return 0
end

@inline function _sorted_complete(a::Int, b::Int, D::Vector{Int})
    x = Vector{Int}(undef, length(D) + 2)
    @inbounds begin
        x[1] = a
        x[2] = b
        for k in eachindex(D)
            x[k + 2] = D[k]
        end
    end
    sort!(x)
    unique!(x)
    return x
end

# -----------------------------------------------------------------------------
# Fast dependence measures without adding a new direct dependency
# -----------------------------------------------------------------------------

mutable struct _Fenwick
    bit::Vector{Int}
end
_Fenwick(n::Int) = _Fenwick(zeros(Int, n))

@inline function _fenwick_add!(F::_Fenwick, i::Int, delta::Int=1)
    n = length(F.bit)
    @inbounds while i <= n
        F.bit[i] += delta
        i += i & -i
    end
    return nothing
end

@inline function _fenwick_sum(F::_Fenwick, i::Int)
    s = 0
    @inbounds while i > 0
        s += F.bit[i]
        i -= i & -i
    end
    return s
end

function _tie_pairs(x::AbstractVector{<:Real})
    n = length(x)
    n <= 1 && return 0
    sx = sort(collect(x))
    ties = 0
    i = 1
    @inbounds while i <= n
        j = i + 1
        while j <= n && sx[j] == sx[i]
            j += 1
        end
        ties += _choose2(j - i)
        i = j
    end
    return ties
end

"""
    _kendall_tau_b(x, y)

O(n log n) Kendall tau-b. Ties in x are handled by querying all observations
in an x-tie block before inserting that block into the Fenwick tree.
"""
function _kendall_tau_b(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    length(y) == n || throw(DimensionMismatch("x and y must have equal length"))
    n <= 1 && return 0.0

    ys = sort(unique(collect(y)))
    yrank = Dict{eltype(ys), Int}(v => i for (i, v) in enumerate(ys))
    perm = sortperm(1:n; by=i -> (x[i], y[i]))

    F = _Fenwick(length(ys))
    seen = 0
    S = 0
    start = 1

    @inbounds while start <= n
        stop = start
        xv = x[perm[start]]
        while stop < n && x[perm[stop + 1]] == xv
            stop += 1
        end

        # Query against strictly earlier x-blocks only.
        for k in start:stop
            r = yrank[y[perm[k]]]
            less = _fenwick_sum(F, r - 1)
            leq = _fenwick_sum(F, r)
            greater = seen - leq
            S += less - greater
        end

        # Only now insert this x-tie block.
        for k in start:stop
            _fenwick_add!(F, yrank[y[perm[k]]])
            seen += 1
        end
        start = stop + 1
    end

    n0 = _choose2(n)
    n1 = _tie_pairs(x)
    n2 = _tie_pairs(y)
    denom = sqrt(float((n0 - n1) * (n0 - n2)))
    return iszero(denom) ? 0.0 : S / denom
end

function _average_ranks(x::AbstractVector{<:Real})
    n = length(x)
    p = sortperm(x)
    r = Vector{Float64}(undef, n)
    i = 1
    @inbounds while i <= n
        j = i
        xi = x[p[i]]
        while j < n && x[p[j + 1]] == xi
            j += 1
        end
        ravg = (i + j) / 2
        for k in i:j
            r[p[k]] = ravg
        end
        i = j + 1
    end
    return r
end

function _pearson(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    n == length(y) || throw(DimensionMismatch("x and y must have equal length"))
    n <= 1 && return 0.0
    mx = sum(x) / n
    my = sum(y) / n
    sxx = 0.0
    syy = 0.0
    sxy = 0.0
    @inbounds for i in 1:n
        dx = x[i] - mx
        dy = y[i] - my
        sxx += dx * dx
        syy += dy * dy
        sxy += dx * dy
    end
    den = sqrt(sxx * syy)
    return iszero(den) ? 0.0 : sxy / den
end

_spearman_rho(x, y) = _pearson(_average_ranks(x), _average_ranks(y))

# Number of observations `k` with `x[k] < x[i]` for every `i`: the "min" rank, zero-based.
function _strict_ranks(x::AbstractVector{<:Real})
    n = length(x)
    p = sortperm(x)
    r = Vector{Int}(undef, n)
    i = 1
    @inbounds while i <= n
        j = i
        xi = x[p[i]]
        while j < n && x[p[j + 1]] == xi
            j += 1
        end
        for k in i:j
            r[p[k]] = i - 1
        end
        i = j + 1
    end
    return r
end

# Number of observations `k` with `x[k] < x[i]` and `y[k] < y[i]` for every `i`, in
# O(n log n): sweep the x-order, and query a Fenwick tree over the y-ranks before the
# current x-tie block is inserted, so equal x never counts.
function _bivariate_strict_ranks(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    ys = sort(unique(collect(y)))
    yrank = Dict{eltype(ys), Int}(v => i for (i, v) in enumerate(ys))
    perm = sortperm(1:n; by=i -> (x[i], y[i]))
    F = _Fenwick(length(ys))
    q = Vector{Int}(undef, n)
    start = 1
    @inbounds while start <= n
        stop = start
        xv = x[perm[start]]
        while stop < n && x[perm[stop + 1]] == xv
            stop += 1
        end
        for k in start:stop
            q[perm[k]] = _fenwick_sum(F, yrank[y[perm[k]]] - 1)
        end
        for k in start:stop
            _fenwick_add!(F, yrank[y[perm[k]]])
        end
        start = stop + 1
    end
    return q
end

"""
    _hoeffding_d(x, y)

Hoeffding's ``D`` statistic (Hoeffding 1948) in the computational form of Hollander &
Wolfe, scaled by 30 so that the population value lies in ``[-1/2, 1]``: 0 under
independence, 1 under a monotone functional relation. With ``R_i``, ``S_i`` the ranks of
``x_i``, ``y_i`` and ``Q_i`` one plus the number of observations below ``(x_i, y_i)`` in
both coordinates,

```math
D_n = 30\\,\\frac{(n-2)(n-3) D_1 + D_2 - 2(n-2) D_3}{n(n-1)(n-2)(n-3)(n-4)},
\\quad
D_1 = \\sum_i (Q_i-1)(Q_i-2),\\;
D_2 = \\sum_i (R_i-1)(R_i-2)(S_i-1)(S_i-2),\\;
D_3 = \\sum_i (R_i-2)(S_i-2)(Q_i-1).
```

Ties are counted strictly (an equal coordinate is not "below"), which is the form
vinecopulib's `hoeffd` criterion computes. Requires `n ≥ 5`; O(n log n).
"""
function _hoeffding_d(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    length(y) == n || throw(DimensionMismatch("x and y must have equal length"))
    n >= 5 || throw(ArgumentError("Hoeffding's D needs at least 5 observations, got $n"))
    R = _strict_ranks(x)
    S = _strict_ranks(y)
    Q = _bivariate_strict_ranks(x, y)
    D1 = 0.0
    D2 = 0.0
    D3 = 0.0
    @inbounds for i in 1:n
        r = R[i]
        s = S[i]
        q = Q[i]
        D1 += q * (q - 1)
        D2 += r * (r - 1) * s * (s - 1)
        D3 += (r - 1) * (s - 1) * q
    end
    nf = float(n)
    den = nf * (nf - 1) * (nf - 2) * (nf - 3) * (nf - 4)
    return 30 * ((nf - 2) * (nf - 3) * D1 + D2 - 2 * (nf - 2) * D3) / den
end

# Running mean of half-width `wl` (window `2wl + 1`) over `v`; the first and last `wl`
# entries, whose window would leave the vector, take the nearest full-window value.
# `v` must have at least `2wl + 1` entries.
function _running_mean(v::AbstractVector{Float64}, wl::Int)
    n = length(v)
    m = 2 * wl + 1
    out = Vector{Float64}(undef, n)
    c = 0.0
    @inbounds for i in 1:m
        c += v[i]
    end
    @inbounds out[wl + 1] = c / m
    @inbounds for i in (wl + 2):(n - wl)
        c += v[i + wl] - v[i - wl - 1]
        out[i] = c / m
    end
    @inbounds out[1:wl] .= out[wl + 1]
    @inbounds out[(n - wl + 1):n] .= out[n - wl]
    return out
end

# Smoothed conditional expectation of `phi` given the variable whose sort
# permutation is `perm` and whose zero-based ranks are `ranks`: smooth `phi` in that
# variable's order and map the result back to observation order.
function _ace_conditional_expectation(phi::Vector{Float64}, perm::Vector{Int}, ranks::Vector{Int}, wl::Int)
    sm = _running_mean(phi[perm], wl)
    return sm[ranks .+ 1]
end

# Centre `phi` and scale it to unit sample standard deviation, in place. Returns
# `false` when the vector is constant, so the caller can stop.
function _ace_standardise!(phi::Vector{Float64})
    n = length(phi)
    phi .-= sum(phi) / n
    s = sqrt(sum(abs2, phi) / (n - 1))
    s > 0 || return false
    phi ./= s
    return true
end

"""
    _maximum_correlation(x, y)

The maximum correlation coefficient of Gebelein (1941) and Rényi (1959),
``\\sup_{f, g} \\operatorname{corr}(f(x), g(y))``, estimated by the alternating conditional
expectations (ACE) algorithm of Breiman & Friedman (1985): the transforms ``f``, ``g``
are updated in turn as the smoothed conditional expectation of the other, with a
running-mean smoother of half-width ``\\lceil n/5 \\rceil``, at most 10 inner and 100 outer
iterations, and stopping tolerances ``10^{-4}`` (inner) and ``2 \\cdot 10^{-15}`` (outer)
on the change of the mean squared difference of the two transforms. The value is the
Pearson correlation of the converged transforms, in ``[0, 1]``. These are the constants
of vinecopulib's `mcor` criterion, so the two agree on the same data. Requires
`n ≥ 3`, so that at least one full smoothing window exists.
"""
function _maximum_correlation(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    length(y) == n || throw(DimensionMismatch("x and y must have equal length"))
    n >= 3 || throw(ArgumentError("the maximum correlation needs at least 3 observations, got $n"))
    wl = ceil(Int, n / 5)
    px = sortperm(x)
    py = sortperm(y)
    rx = Vector{Int}(undef, n)
    ry = Vector{Int}(undef, n)
    @inbounds for j in 1:n
        rx[px[j]] = j - 1
        ry[py[j]] = j - 1
    end
    # Initial transforms: standardised ranks.
    scale = sqrt(n * (n - 1) / 12)
    shift = (n - 1) / 2 - 1
    phi0 = (rx .- shift) ./ scale
    phi1 = (ry .- shift) ./ scale

    outer_eps = 1.0
    outer_err = 1.0
    outer = 1
    while outer <= 100 && outer_err > 2e-15
        inner_eps = 1.0
        inner_err = 1.0
        inner = 1
        while inner <= 10 && inner_err > 1e-4
            phi1 = _ace_conditional_expectation(phi0, py, ry, wl)
            _ace_standardise!(phi1) || return 0.0
            eps = sum(abs2, phi1 .- phi0) / n
            inner_err = abs(inner_eps - eps)
            inner_eps = eps
            inner += 1
        end
        phi0 = _ace_conditional_expectation(phi1, px, rx, wl)
        _ace_standardise!(phi0) || return 0.0
        eps = sum(abs2, phi1 .- phi0) / n
        outer_err = abs(outer_eps - eps)
        outer_eps = eps
        outer += 1
    end
    return _pearson(phi0, phi1)
end

"""
    _gaussian_mutual_information(x, y)

Joe's (1989) relative-entropy dependence measure under a Gaussian copula: with ``r`` the
Pearson correlation of the normal scores ``\\Phi^{-1}(x)``, ``\\Phi^{-1}(y)``, the mutual
information ``-\\tfrac12 \\log(1 - r^2)``, in ``[0, \\infty)``. It is strictly increasing in
``|r|``, so as a tree criterion it selects the same trees as ``|r|`` on normal scores;
its scale matters only to `threshold`. This is vinecopulib's `joe` criterion. The value
is `Inf` when the normal scores are exactly linearly dependent.
"""
function _gaussian_mutual_information(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    r = _pearson(StatsFuns.norminvcdf.(x), StatsFuns.norminvcdf.(y))
    return -0.5 * log1p(-r * r)
end

"""
    _chatterjee_xi(x, y)

Chatterjee's (2021) coefficient ``\\xi_n(x \\to y)``: with the observations sorted by `x`
(ties in `x` keep their sample order), ``r_i`` the number of ``y_j \\le y_{(i)}`` and
``\\ell_i`` the number of ``y_j \\ge y_{(i)}``,

```math
\\xi_n = 1 - \\frac{n \\sum_{i=1}^{n-1} |r_{i+1} - r_i|}{2 \\sum_{i=1}^{n} \\ell_i (n - \\ell_i)},
```

which reduces to ``1 - 3 \\sum_i |r_{i+1} - r_i| / (n^2 - 1)`` without ties in `y`. It
measures how well `y` is a function of `x`, so it is asymmetric; the population value is
in ``[0, 1]`` and the estimate can be slightly negative. A constant `y` gives 0.
"""
function _chatterjee_xi(x::AbstractVector{<:Real}, y::AbstractVector{<:Real})
    n = length(x)
    length(y) == n || throw(DimensionMismatch("x and y must have equal length"))
    n <= 1 && return 0.0
    perm = sortperm(x; alg=MergeSort)
    ysorted = y[perm]
    # r_i = #{y_j ≤ y_i}: the max rank; ℓ_i = #{y_j ≥ y_i}: the max rank of -y.
    r = n .- _strict_ranks(-ysorted)
    l = n .- _strict_ranks(ysorted)
    num = 0.0
    @inbounds for i in 1:(n - 1)
        num += abs(r[i + 1] - r[i])
    end
    den = 0.0
    @inbounds for i in 1:n
        den += l[i] * (n - l[i])
    end
    den > 0 || return 0.0
    return 1 - n * num / (2 * den)
end

# The symmetrised coefficient: the larger of the two directions, so a functional
# relation is detected whichever way it runs (vinecopulib's `cxi`).
_symmetric_chatterjee_xi(x, y) = max(_chatterjee_xi(x, y), _chatterjee_xi(y, x))

"""
    _tree_dependence(x, y, a, b, D, criterion)

Weight of the candidate edge `(a, b | D)` whose conditional pseudo-observations are `x`
and `y`. The built-in criteria are the absolute value of a documented statistic:

| `criterion` | statistic | range |
|:--|:--|:--|
| `:tau` | Kendall's ``\\tau_b`` (`_kendall_tau_b`) | ``[0, 1]`` |
| `:rho` | Spearman's ``\\rho_S`` (`_spearman_rho`) | ``[0, 1]`` |
| `:hoeffd` | Hoeffding's ``D`` (`_hoeffding_d`) | ``[0, 1]`` |
| `:mcor` | maximum correlation by ACE (`_maximum_correlation`) | ``[0, 1]`` |
| `:joe` | Gaussian-copula mutual information (`_gaussian_mutual_information`) | ``[0, \\infty)`` |
| `:cxi` | symmetrised Chatterjee ``\\xi`` (`_symmetric_chatterjee_xi`) | ``[0, 1]`` |

A function is called as `criterion(x, y, a, b, D)` and its value, used as is (no absolute
value), is the weight. It must be a finite `Real`; anything else is an `ArgumentError`
naming the edge and the value.
"""
@inline function _tree_dependence(x, y, a, b, D, criterion::Symbol)
    criterion === :tau && return abs(_kendall_tau_b(x, y))
    criterion === :rho && return abs(_spearman_rho(x, y))
    criterion === :hoeffd && return abs(_hoeffding_d(x, y))
    criterion === :mcor && return abs(_maximum_correlation(x, y))
    criterion === :joe && return _gaussian_mutual_information(x, y)
    criterion === :cxi && return abs(_symmetric_chatterjee_xi(x, y))
    _check_tree_criterion(criterion)
    return 0.0
end
function _tree_dependence(x, y, a, b, D, criterion::Function)
    w = criterion(x, y, a, b, D)
    (w isa Real && isfinite(w)) || throw(ArgumentError("tree_criterion returned $(repr(w)) on the edge ($a, $b | $(join(D, ", "))); it must return a finite Real"))
    return Float64(w)
end

@inline function _check_vine_fit_method(method::Symbol)
    method in (:default, :sequential) || throw(ArgumentError("vine fitting supports method=:default or :sequential; got $method"))
    return :sequential
end

function Distributions.fit(::Type{VT}, U, method; kwargs...) where {VT<:AbstractVineCopula}
    return Distributions.fit(VT, U; method=method, kwargs...)
end

function Distributions.fit(::Type{Copulas.CopulaModel}, ::Type{<:AbstractVineCopula}, U; kwargs...,)
    throw(ArgumentError(
        "CopulaModel integration for VineCopulas sequential fitting is not currently available; " *
        "use fit(VineType, U) for the fitted vine copula"
    ))
end

function Distributions.fit(::Type{Copulas.CopulaModel}, ::Type{<:AbstractVineCopula}, U, method; kwargs...,)
    throw(ArgumentError(
        "CopulaModel integration for VineCopulas sequential fitting is not currently available; " *
        "use fit(VineType, U) for the fitted vine copula"
    ))
end

# Implementation is split into three focused files to keep the fitting layer navigable.
include("fitting/pairs.jl")
include("fitting/cd_vines.jl")
include("fitting/rvines.jl")
