# ---------------------------------------------------------------------
# Clayton pair-copula density fast path
# ---------------------------------------------------------------------

@inline function _arch_pair_logpdf(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    lu = log(uu)
    lv = log(vv)
    s = exp(-θ * lu) + exp(-θ * lv) - one(θ)
    return log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * log(s)
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