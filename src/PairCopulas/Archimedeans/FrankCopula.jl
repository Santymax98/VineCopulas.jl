# ---------------------------------------------------------------------
# Frank pair-copula fused fast path
# ---------------------------------------------------------------------

@inline function _frank_terms(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    uu, vv = _clp(uu), _clp(vv)
    if abs(θ) <= sqrt(eps(typeof(θ)))
        return θ, uu, vv, zero(θ), zero(θ), zero(θ), one(θ)
    end
    A = -expm1(-θ)
    Bu = -expm1(-θ * uu)
    Bv = -expm1(-θ * vv)
    D = A - Bu * Bv
    return θ, uu, vv, A, Bu, Bv, D
end

@inline function _frank_h1(θ::Real, Bu::Real, v::Real, D::Real)
    return clamp(Bu * exp(-θ * v) / D, zero(θ), one(θ))
end

@inline function _frank_h2(θ::Real, Bv::Real, u::Real, D::Real)
    return clamp(Bv * exp(-θ * u) / D, zero(θ), one(θ))
end

@inline function _frank_logpdf(θ::Real, u::Real, v::Real, A::Real, D::Real)
    return log(abs(θ)) + log(abs(A)) - θ * (u + v) - 2 * log(abs(D))
end

@inline function _arch_pair_logpdf(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(G, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ)
    return _frank_logpdf(θ, uu, vv, A, D)
end

@inline function _arch_hfunc(G::Copulas.FrankGenerator, target::Real, base::Real)
    θ, tt, bb, _, Bt, _, D = _frank_terms(G, target, base)
    abs(θ) <= sqrt(eps(typeof(θ))) && return tt
    return _frank_h1(θ, Bt, bb, D)
end

@inline function _arch_hfuncs(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(G, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return uu, vv
    return _frank_h1(θ, Bu, vv, D), _frank_h2(θ, Bv, uu, D)
end

@inline function _arch_pair_step(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(G, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), uu, vv
    logc = _frank_logpdf(θ, uu, vv, A, D)
    return logc, _frank_h1(θ, Bu, vv, D), _frank_h2(θ, Bv, uu, D)
end

@inline function _arch_pair_logpdf_h1(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(G, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), uu
    return _frank_logpdf(θ, uu, vv, A, D), _frank_h1(θ, Bu, vv, D)
end

@inline function _arch_pair_logpdf_h2(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(G, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), vv
    return _frank_logpdf(θ, uu, vv, A, D), _frank_h2(θ, Bv, uu, D)
end

# =====================================================================
# Frank
# =====================================================================

function _inv_ϕ¹(G::Copulas.FrankGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Frank"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    iszero(θ) && throw(DomainError(θ, "A genuine Frank generator requires θ ≠ 0."))

    y0 = -expm1(θ) / θ
    if isinf(m)
        y0 == -Inf && return zero(T)
        throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    end

    tol = 64eps(T) * max(one(T), abs(y0))
    y < y0 - tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    y <= y0 + tol && return zero(T)

    denominator = one(T) - θ * y
    denominator > zero(T) || throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    logabs_expm1 = θ > zero(T) ? LogExpFunctions.log1mexp(-θ) : LogExpFunctions.logexpm1(-θ)
    logx = log(abs(θ)) + log(m) - logabs_expm1 - log(denominator)
    return max(-logx, zero(T))
end
