# ---------------------------------------------------------------------
# Clayton pair-copula fused fast path
# ---------------------------------------------------------------------

@inline function _clayton_terms(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    θ < -one(θ) && throw(DomainError(θ, "A bivariate Clayton generator requires θ ≥ -1."))
    uu, vv = _clp(uu), _clp(vv)
    lu = log(uu)
    lv = log(vv)
    s = iszero(θ) ? one(θ) : exp(-θ * lu) + exp(-θ * lv) - one(θ)
    return θ, uu, vv, lu, lv, s
end

@inline function _clayton_h_from_terms(θ::Real, lbase::Real, logs::Real)
    iszero(θ) && throw(ArgumentError("independence must be handled before the Clayton interior formula"))
    logh = (-θ - one(θ)) * lbase + (-inv(θ) - one(θ)) * logs
    return clamp(exp(logh), zero(θ), one(θ))
end

@inline function _arch_pair_logpdf(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, _, _, lu, lv, s = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ)

    # For -1 ≤ θ < 0, Clayton has finite support. Outside the absolutely
    # continuous support the density is exactly zero.
    s <= zero(s) && return oftype(s, -Inf)
    return log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * log(s)
end

# Closed-form conditional CDF with the same finite-support convention.
# For C(u,v)=s^(-1/θ), s=u^(-θ)+v^(-θ)-1,
# h(u|v)=v^(-θ-1)s^(-1/θ-1) on the interior support.
@inline function _arch_hfunc(G::Copulas.ClaytonGenerator, target::Real, base::Real)
    θ, tt, _, lt, lb, s = _clayton_terms(G, target, base)
    iszero(θ) && return tt
    s <= zero(s) && return zero(s)
    return _clayton_h_from_terms(θ, lb, log(s))
end

@inline function _arch_hfuncs(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv, lu, lv, s = _clayton_terms(G, u, v)
    iszero(θ) && return uu, vv
    s <= zero(s) && return zero(s), zero(s)
    logs = log(s)
    return _clayton_h_from_terms(θ, lv, logs), _clayton_h_from_terms(θ, lu, logs)
end

@inline function _arch_pair_step(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv, lu, lv, s = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), uu, vv
    s <= zero(s) && return oftype(s, -Inf), zero(s), zero(s)

    logs = log(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    h1 = _clayton_h_from_terms(θ, lv, logs)
    h2 = _clayton_h_from_terms(θ, lu, logs)
    return logc, h1, h2
end

@inline function _arch_pair_logpdf_h1(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, _, lu, lv, s = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), uu
    s <= zero(s) && return oftype(s, -Inf), zero(s)

    logs = log(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lv, logs)
end

@inline function _arch_pair_logpdf_h2(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, _, vv, lu, lv, s = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), vv
    s <= zero(s) && return oftype(s, -Inf), zero(s)

    logs = log(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lu, logs)
end

# =====================================================================
# Clayton
# =====================================================================

# Clayton with θ < 0 has finite support. Direct conditional inversion avoids
# underflow in q*ϕ'(sbase) at the support boundary.
@inline function _arch_hinv(G::Copulas.ClaytonGenerator, q::Real, base::Real)
    θ, qq, bb = promote(float(G.θ), float(q), float(base))
    θ >= zero(θ) && return _arch_hinv_generic(G, qq, bb)
    -one(θ) <= θ || throw(DomainError(θ, "A bivariate Clayton generator requires θ ≥ -1."))

    qq, bb = clamp(qq, zero(qq), one(qq)), _clp(bb)
    θ == -one(θ) && return clamp(one(θ) - bb, zero(θ), one(θ))

    a = -θ / (one(θ) + θ)
    logb = -θ * log(bb)
    b = exp(logb)
    qa = iszero(qq) ? zero(qq) : exp(a * log(qq))
    z = max(-expm1(logb) + b * qa, zero(θ))
    iszero(z) && return zero(θ)
    return clamp(exp((-inv(θ)) * log(z)), zero(θ), one(θ))
end

@inline function _inv_ϕ¹(G::Copulas.ClaytonGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Clayton"))
    iszero(θ) && throw(DomainError(θ, "A genuine Clayton generator requires θ ≠ 0."))

    if iszero(m)
        return θ < zero(θ) ? -inv(θ) : oftype(θ, Inf)
    end

    tol = 64eps(typeof(θ))
    m > one(m) + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0]."))
    m >= one(m) - tol && return zero(θ)
    θ == -one(θ) && throw(DomainError(y, "For θ = -1, ϕ' has no interior inverse."))

    s = expm1((-θ / (one(θ) + θ)) * log(m)) / θ
    return max(s, zero(s))
end
