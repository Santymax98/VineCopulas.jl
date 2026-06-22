# Lightweight statistical utilities for fitted/manual vine copulas.

loglikelihood(vc::AbstractVineCopula, u::AbstractVector{<:Real}) = Distributions.logpdf(vc, u)
loglikelihood(vc::AbstractVineCopula, U::AbstractMatrix{<:Real}) = sum(Distributions.logpdf(vc, U))

# This is a structural count based on Distributions.params. It is suitable for
# the currently supported bivariate families, but fitted wrappers may later
# specialize npars to report their number of free parameters exactly.
npars(C::PairCopula) = applicable(Distributions.params, C) ? length(Distributions.params(C)) : 0
npars(vc::AbstractVineCopula) = sum(npars, Iterators.flatten(edges(vc)))

aic(vc::AbstractVineCopula, U::AbstractMatrix{<:Real}) = -2.0 * loglikelihood(vc, U) + 2.0 * npars(vc)

function bic(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    return -2.0 * loglikelihood(vc, X) + npars(vc) * log(size(X, 2))
end
