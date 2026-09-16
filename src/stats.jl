# Lightweight statistical utilities for fitted/manual vine copulas.

"""
    loglikelihood(vine, u)
    loglikelihood(vine, U)

Return the log-density at a single point or the summed log-likelihood over a
`p × n` matrix of observations.
"""
loglikelihood(vc::AbstractVineCopula, u::AbstractVector{<:Real}) = Distributions.logpdf(vc, u)
loglikelihood(vc::AbstractVineCopula, U::AbstractMatrix{<:Real}) = sum(Distributions.logpdf(vc, U))

# This is a structural count based on Distributions.params. It is suitable for
# the currently supported bivariate families, but fitted wrappers may later
# specialize npars to report their number of free parameters exactly.
"""
    npars(C)
    npars(vine)

Return a lightweight structural parameter count. For pair-copulas this uses
`Distributions.params` when available. For vines it sums over all active edges.
"""
npars(C::PairCopula) = applicable(Distributions.params, C) ? length(Distributions.params(C)) : 0
npars(vc::AbstractVineCopula) = sum(npars, Iterators.flatten(edges(vc)))

"""
    aic(vine, U)

Compute Akaike's information criterion for an explicit vine and a `p × n` data
matrix on the copula scale.
"""
aic(vc::AbstractVineCopula, U::AbstractMatrix{<:Real}) = -2.0 * loglikelihood(vc, U) + 2.0 * npars(vc)

"""
    bic(vine, U)

Compute the classical Bayesian information criterion for an explicit vine and a
`p × n` data matrix on the copula scale.
"""
function bic(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    return -2.0 * loglikelihood(vc, X) + npars(vc) * log(size(X, 2))
end

# -----------------------------------------------------------------------------
# Modified BIC for vines (Nagler, Bumann and Czado, 2019)
# -----------------------------------------------------------------------------

@inline function _check_psi0(psi0::Real)
    ψ0 = Float64(psi0)
    0.0 < ψ0 < 1.0 || throw(ArgumentError("psi0 must lie in the open interval (0, 1)"))
    return ψ0
end

@inline _is_independence_pair(C) = C isa Copulas.IndependentCopula
@inline _is_independence_pair(S::_SwappedPairCopula) = _is_independence_pair(S.C)

# Log prior of the sparsity pattern. `ψ_t = ψ0^t` is the prior probability that
# a tree-`t` pair copula is not independence, `q[t]` counts the non-independence
# pair copulas fitted in tree `t`, and every tree beyond `length(q)` is
# independence, so it contributes its `p - t` independence factors.
function _mbicv_log_prior(q::AbstractVector{<:Integer}, p::Int, ψ0::Float64)
    lp = 0.0
    @inbounds for t in 1:(p - 1)
        ψt = ψ0^t
        qt = t <= length(q) ? Int(q[t]) : 0
        lp += qt * log(ψt) + (p - t - qt) * log1p(-ψt)
    end
    return lp
end

@inline function _mbicv_score(ll::Real, k::Integer, n::Integer, q::AbstractVector{<:Integer}, p::Int, ψ0::Float64)
    return -2.0 * ll + k * log(n) - 2.0 * _mbicv_log_prior(q, p, ψ0)
end

"""
    mbicv(vine, U; psi0=0.9)

Compute the modified Bayesian information criterion for vines of Nagler, Bumann
and Czado (2019) for an explicit vine and a `p × n` data matrix on the copula
scale:

    mBICV = -2ℓ + ν log n - 2 Σₜ [ qₜ log ψₜ + (p - t - qₜ) log(1 - ψₜ) ],   ψₜ = psi0^t

where `ℓ` is the log-likelihood, `ν` the parameter count, and `qₜ` the number of
non-independence pair copulas in tree `t`. The sum runs over all `p - 1` trees;
a tree beyond the truncation level of `vine` is independence, so it contributes
`(p - t) log(1 - ψₜ)`. `psi0 ∈ (0, 1)` is the prior probability that a tree-1
pair copula is not independence; the prior decays geometrically with the tree
level, so deeper trees must earn their parameters.

`fit(...; trunc=:mbicv)` selects the truncation level with this criterion.
"""
function mbicv(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}; psi0::Real=0.9) where {p}
    ψ0 = _check_psi0(psi0)
    X = _as_pxn(p, U)
    q = Int[count(C -> !_is_independence_pair(C), tree) for tree in edges(vc)]
    return _mbicv_score(loglikelihood(vc, X), npars(vc), size(X, 2), q, p, ψ0)
end
