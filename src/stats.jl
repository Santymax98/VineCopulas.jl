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
