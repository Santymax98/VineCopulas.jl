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
# - optional 0/90/180/270 rotations through SurvivalCopula
# - fixed or automatic C-/D-vine order
# - fixed or Dissmann-style automatic R-vine structure
# - Kendall tau-b or Spearman rho tree weights
# - user-specified truncation and dependence threshold
#
# Intentionally deferred
# ----------------------
# - nonparametric TLL pair copulas
# - discrete margins
# - observation weights / missing-value pairwise logic
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

@inline function _tree_dependence(x, y, criterion::Symbol)
    _check_tree_criterion(criterion)
    criterion === :tau && return abs(_kendall_tau_b(x, y))
    return abs(_spearman_rho(x, y))
end


# Implementation is split into three focused files to keep the fitting layer navigable.
include("fitting/pairs.jl")
include("fitting/cd_vines.jl")
include("fitting/rvines.jl")
