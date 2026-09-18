# ---------------------------------------------------------------------
# Gumbel pair-copula fast paths
#
# These kernels depend only on the public GumbelCopula contract and
# Distributions.params(C). They do not inspect the stored generator or
# call generator-level Copulas.jl internals.
# ---------------------------------------------------------------------

@inline function _gumbel_terms(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv = promote(float(Distributions.params(C).θ), float(u), float(v),)
    θ >= one(θ) || throw(DomainError(θ, "A Gumbel copula requires θ ≥ 1.",))
    uu, vv = _clp(uu), _clp(vv)

    x = -log(uu)
    y = -log(vv)
    lx = log(x)
    ly = log(y)

    logS = LogExpFunctions.logaddexp(θ * lx, θ * ly)
    A = exp(logS / θ)

    return θ, uu, vv, lx, ly, logS, A
end

@inline function _gumbel_logpdf(θ::Real, u::Real, v::Real, lx::Real, ly::Real, logS::Real, A::Real,)
    return -A - log(u) - log(v) + (θ - one(θ)) * (lx + ly) + (inv(θ) - 2) * logS + log(A + θ - one(θ))
end

@inline function _gumbel_h1(θ::Real, v::Real, ly::Real, logS::Real, A::Real,)
    logh = -A - log(v) + (θ - one(θ)) * ly + (inv(θ) - one(θ)) * logS
    return clamp(exp(logh), zero(θ), one(θ),)
end

@inline function _gumbel_h2(θ::Real, u::Real, lx::Real, logS::Real, A::Real,)
    logh = -A - log(u) + (θ - one(θ)) * lx + (inv(θ) - one(θ)) * logS
    return clamp(exp(logh), zero(θ), one(θ),)
end

@inline function _gumbel_pair_logpdf(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(C, u, v)
    return _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
end

@inline function _pair_logpdf(C::Copulas.GumbelCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    return _gumbel_pair_logpdf(C, _clp(u), _clp(v),)
end

@inline function _gumbel_hfunc(C::Copulas.GumbelCopula{2}, target::Real, base::Real,)
    θ, _, bb, _, lb, logS, A = _gumbel_terms(C, target, base)
    return _gumbel_h1(θ, bb, lb, logS, A)
end

@inline function _gumbel_hfuncs(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(C, u, v)

    h1 = _gumbel_h1(θ, vv, ly, logS, A)
    h2 = _gumbel_h2(θ, uu, lx, logS, A)

    return h1, h2
end

@inline function hfunc1(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    return _clp(_gumbel_hfunc(C, _clp(u), _clp(v),),)
end

@inline function hfunc2(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    return _clp(_gumbel_hfunc(C, _clp(v), _clp(u),),)
end

@inline function _pair_hfuncs(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    h1, h2 = _gumbel_hfuncs(C, _clp(u), _clp(v),)
    return _clp(h1), _clp(h2)
end

@inline function _gumbel_pair_step(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(C, u, v)

    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    h1 = _gumbel_h1(θ, vv, ly, logS, A)
    h2 = _gumbel_h2(θ, uu, lx, logS, A)

    return logc, h1, h2
end

@inline function _pair_step(C::Copulas.GumbelCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1, h2 = _gumbel_pair_step(C, _clp(u), _clp(v),)
    return logc, _clp(h1), _clp(h2)
end

@inline function _gumbel_pair_logpdf_h1(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(C, u, v)

    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    h1 = _gumbel_h1(θ, vv, ly, logS, A)

    return logc, h1
end

@inline function _gumbel_pair_logpdf_h2(C::Copulas.GumbelCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(C, u, v)

    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    h2 = _gumbel_h2(θ, uu, lx, logS, A)

    return logc, h2
end

@inline function _pair_logpdf_h1(C::Copulas.GumbelCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1 = _gumbel_pair_logpdf_h1(C, _clp(u), _clp(v),)
    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.GumbelCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h2 = _gumbel_pair_logpdf_h2(C, _clp(u), _clp(v),)
    return logc, _clp(h2)
end

# For y = -log(base) and
#
#   A = ((-log u)^θ + y^θ)^(1/θ),
#
# the conditional CDF satisfies
#
#   q = exp(y - A) * (y / A)^(θ - 1).
#
# With b = θ - 1,
#
#   A + b log(A) = y + b log(y) - log(q),
#
# which can be inverted with Lambert W without referring to the
# Archimedean generator representation.
@inline function _gumbel_hinv_from_theta(θ::Real, q::Real, base::Real,)
    θ, qq, bb = promote(float(θ), float(q), float(base),)

    θ >= one(θ) || throw(DomainError(θ, "A Gumbel copula requires θ ≥ 1.",))

    qq = clamp(qq, zero(qq), one(qq))
    bb = _clp(bb)

    iszero(qq) && return zero(qq)
    isone(qq) && return one(qq)
    isone(θ) && return qq

    b = θ - one(θ)
    y = -log(bb)
    logy = log(y)

    K = y + b * logy - log(qq)
    logarg = K / b - log(b)
    logA = log(b) + _log_lambertw_exp(logarg)

    # q ≤ 1 implies A ≥ y mathematically. Protect the subtraction from
    # a microscopic order reversal caused only by floating-point rounding.
    logA = max(logA, logy)

    logA == logy && return one(qq)

    logxθ = LogExpFunctions.logsubexp(θ * logA, θ * logy)
    x = exp(logxθ / θ)

    return clamp(exp(-x), zero(qq), one(qq),)
end

@inline function _gumbel_hinv(C::Copulas.GumbelCopula{2}, q::Real, base::Real,)
    return _gumbel_hinv_from_theta(Distributions.params(C).θ, q, base)
end

@inline function hinv1(C::Copulas.GumbelCopula{2}, q::Real, v::Real,)
    return _clp(_gumbel_hinv(C, _clp(q), _clp(v),),)
end

@inline function hinv2(C::Copulas.GumbelCopula{2}, q::Real, u::Real,)
    return _clp(_gumbel_hinv(C, _clp(q), _clp(u),),)
end
