# =============================================================================
# VineCopulas.jl — fitting and model-selection layer
#
# This file is the package fitting layer. It is included after the C-/D-/R-vine
# core types and before stats.jl.
#
# Design goals
# ------------
# 1. Preserve the Distributions.jl / Copulas.jl fitting API:
#
#       fit(PairCopula, U)                       # quick selected pair copula
#       fit(CopulaModel, PairCopula, U)          # full statistical model
#       fit(CVineCopula, U)                      # quick C-vine
#       fit(CopulaModel, CVineCopula, U)         # full model
#       fit(DVineCopula, U)
#       fit(CopulaModel, DVineCopula, U)
#       fit(RVineCopula, U)
#       fit(CopulaModel, RVineCopula, U)
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
# - Kendall tau-b or Spearman rho tree weights
# - user-specified truncation and dependence threshold
# - observation weights (weighted tree criterion, weighted pseudo-likelihood)
#
# Intentionally deferred
# ----------------------
# - nonparametric TLL pair copulas
# - discrete margins
# - missing-value pairwise logic
# - automatic sparse truncation/threshold (mBICV)
# - multithreaded edge fitting
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
    throw(ArgumentError(
        "family_set must be :default, :all, a tuple, or a vector of bivariate copula types"
    ))
end

# -----------------------------------------------------------------------------
# Small utilities
# -----------------------------------------------------------------------------

@inline _choose2(n::Integer) = n <= 1 ? 0 : (n * (n - 1)) ÷ 2

@inline function _check_selection_criterion(criterion::Symbol)
    criterion in (:loglik, :aic, :bic) || throw(ArgumentError(
        "selection_criterion must be :loglik, :aic, or :bic"
    ))
    return criterion
end

@inline function _check_tree_criterion(criterion::Symbol)
    criterion in (:tau, :rho) || throw(ArgumentError(
        "tree_criterion must currently be :tau or :rho"
    ))
    return criterion
end

@inline function _check_threshold(threshold::Real)
    t = Float64(threshold)
    isfinite(t) || throw(ArgumentError("threshold must be finite"))
    0.0 <= t <= 1.0 || throw(ArgumentError(
        "threshold must lie in [0,1] because tree dependence scores are absolute rank correlations"
    ))
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

# -----------------------------------------------------------------------------
# Observation weights
# -----------------------------------------------------------------------------
#
# `weights=nothing` is the unweighted path and is left untouched. A vector is
# validated once at the vine entry point and handed down as a `Vector{Float64}`
# aligned with the columns of the fit data. The tree criterion is invariant to
# the scale of the weights; the pair fits normalise their own copy so that
# `sum(w) == n` (see `_normalize_weights`), which makes a weight "how many
# observations this row counts for" and keeps the selection sample size at n.

_fit_weights(::Nothing, n::Int) = nothing

function _fit_weights(weights::AbstractVector{<:Real}, n::Int)
    length(weights) == n || throw(DimensionMismatch(
        "weights must have one entry per observation; got $(length(weights)) weights for $n observations"
    ))
    w = Vector{Float64}(undef, n)
    s = 0.0
    @inbounds for i in 1:n
        wi = Float64(weights[i])
        isfinite(wi) || throw(ArgumentError("weights must be finite"))
        wi >= 0.0 || throw(ArgumentError("weights must be non-negative"))
        w[i] = wi
        s += wi
    end
    s > 0.0 || throw(ArgumentError("weights must not all be zero"))
    return w
end

_fit_weights(weights, ::Int) = throw(ArgumentError(
    "weights must be nothing or a vector of non-negative reals; got $(typeof(weights))"
))

# Fresh copy scaled so that `sum(w) == n`. `ones(n)` is returned unscaled and
# `c .* ones(n)` maps to exactly `ones(n)` when `c` is a power of two, so those
# weighted fits reproduce the unweighted fit bit for bit.
function _normalize_weights(w::AbstractVector{<:Real})
    n = length(w)
    scale = n / sum(w)
    return isone(scale) ? copy(w) : w .* scale
end

# Effective sample size for the selection criterion: n on the unweighted path
# and `sum(w)` on the weighted one (equal to n after normalisation).
@inline _weighted_nobs(U::AbstractMatrix, ::Nothing) = size(U, 2)
@inline _weighted_nobs(::AbstractMatrix, w::AbstractVector{<:Real}) = sum(w)

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

# Prefix sums over `Int` counts for the unweighted statistics, and over the
# weights' own element type for the weighted ones.
mutable struct _Fenwick{T<:Real}
    bit::Vector{T}
end
_Fenwick(n::Int) = _Fenwick(zeros(Int, n))

@inline function _fenwick_add!(F::_Fenwick{T}, i::Int, delta::T=one(T)) where {T<:Real}
    n = length(F.bit)
    @inbounds while i <= n
        F.bit[i] += delta
        i += i & -i
    end
    return nothing
end

@inline function _fenwick_sum(F::_Fenwick{T}, i::Int) where {T<:Real}
    s = zero(T)
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

# -----------------------------------------------------------------------------
# Weighted dependence measures
# -----------------------------------------------------------------------------
#
# With w ≡ 1 every function below reduces to its unweighted counterpart, and
# with integer weights it equals the unweighted statistic of the sample in
# which row i is repeated w[i] times.

# Σ_{i<j, x_i == x_j} w_i w_j, the weighted count of tied pairs. Every
# accumulator takes its type from the weights.
function _tie_pairs_w(x::AbstractVector{<:Real}, w::AbstractVector{<:Real})
    n = length(x)
    T = eltype(w)
    ties = zero(T) / 2
    n <= 1 && return ties
    p = sortperm(x)
    i = 1
    @inbounds while i <= n
        j = i + 1
        s = w[p[i]]
        s2 = abs2(w[p[i]])
        while j <= n && x[p[j]] == x[p[i]]
            s += w[p[j]]
            s2 += abs2(w[p[j]])
            j += 1
        end
        ties += (abs2(s) - s2) / 2
        i = j
    end
    return ties
end

"""
    _kendall_tau_w(x, y, w)

Weighted Kendall tau-b,

    τ_w = Σ_{i<j} w_i w_j sgn(x_i − x_j) sgn(y_i − y_j) / √((W0 − W1)(W0 − W2)),

with `W0 = Σ_{i<j} w_i w_j` and `W1`, `W2` the weighted counts of pairs tied in
`x` and in `y`. It is the same O(n log n) sweep as [`_kendall_tau_b`](@ref)
with weight sums in place of counts, and it equals tau-b when `w ≡ 1`.
"""
function _kendall_tau_w(x::AbstractVector{<:Real}, y::AbstractVector{<:Real}, w::AbstractVector{<:Real})
    n = length(x)
    length(y) == n || throw(DimensionMismatch("x and y must have equal length"))
    length(w) == n || throw(DimensionMismatch("x and w must have equal length"))
    n <= 1 && return zero(eltype(w)) / 2

    ys = sort(unique(collect(y)))
    yrank = Dict{eltype(ys), Int}(v => i for (i, v) in enumerate(ys))
    perm = sortperm(1:n; by=i -> (x[i], y[i]))

    T = eltype(w)
    F = _Fenwick(zeros(T, length(ys)))
    seen = zero(T)
    S = zero(T)
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
            S += w[perm[k]] * (less - greater)
        end

        # Only now insert this x-tie block.
        for k in start:stop
            wk = w[perm[k]]
            _fenwick_add!(F, yrank[y[perm[k]]], wk)
            seen += wk
        end
        start = stop + 1
    end

    W0 = (abs2(sum(w)) - sum(abs2, w)) / 2
    W1 = _tie_pairs_w(x, w)
    W2 = _tie_pairs_w(y, w)
    denom = sqrt((W0 - W1) * (W0 - W2))
    return iszero(denom) ? zero(S / denom) : S / denom
end

# Weighted average ranks: a tie block of total weight W_tie preceded by weight
# W_less takes the rank W_less + (W_tie + 1) / 2, the mean rank of the block in
# the sample where each row is repeated w[i] times.
function _average_ranks_w(x::AbstractVector{<:Real}, w::AbstractVector{<:Real})
    n = length(x)
    p = sortperm(x)
    T = eltype(w)
    r = Vector{typeof((zero(T) + 1) / 2)}(undef, n)
    less = zero(T)
    i = 1
    @inbounds while i <= n
        j = i
        xi = x[p[i]]
        wtie = w[p[i]]
        while j < n && x[p[j + 1]] == xi
            j += 1
            wtie += w[p[j]]
        end
        ravg = less + (wtie + 1) / 2
        for k in i:j
            r[p[k]] = ravg
        end
        less += wtie
        i = j + 1
    end
    return r
end

function _pearson_w(x::AbstractVector{<:Real}, y::AbstractVector{<:Real}, w::AbstractVector{<:Real})
    n = length(x)
    n == length(y) || throw(DimensionMismatch("x and y must have equal length"))
    n == length(w) || throw(DimensionMismatch("x and w must have equal length"))
    sw = zero(eltype(w))
    mx = zero(eltype(w)) * zero(eltype(x))
    my = zero(eltype(w)) * zero(eltype(y))
    n <= 1 && return zero(mx / sw)
    @inbounds for i in 1:n
        sw += w[i]
        mx += w[i] * x[i]
        my += w[i] * y[i]
    end
    mx /= sw
    my /= sw
    sxx = zero(mx * mx)
    syy = zero(my * my)
    sxy = zero(mx * my)
    @inbounds for i in 1:n
        dx = x[i] - mx
        dy = y[i] - my
        sxx += w[i] * dx * dx
        syy += w[i] * dy * dy
        sxy += w[i] * dx * dy
    end
    den = sqrt(sxx * syy)
    return iszero(den) ? zero(sxy / den) : sxy / den
end

_spearman_rho_w(x, y, w) = _pearson_w(_average_ranks_w(x, w), _average_ranks_w(y, w), w)

@inline function _tree_dependence(x, y, criterion::Symbol, ::Nothing=nothing)
    _check_tree_criterion(criterion)
    criterion === :tau && return abs(_kendall_tau_b(x, y))
    return abs(_spearman_rho(x, y))
end

@inline function _tree_dependence(x, y, criterion::Symbol, w::AbstractVector{<:Real})
    _check_tree_criterion(criterion)
    criterion === :tau && return abs(_kendall_tau_w(x, y, w))
    return abs(_spearman_rho_w(x, y, w))
end


# Implementation is split into three focused files to keep the fitting layer navigable.
include("fitting/pairs.jl")
include("fitting/cd_vines.jl")
include("fitting/rvines.jl")
