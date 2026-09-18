# ---------------------------------------------------------------------
# Clayton pair-copula fused fast path
# ---------------------------------------------------------------------

# Returns s = u^(-θ) + v^(-θ) - 1 and log(s). For θ > 0 the powers overflow
# once u or v is below floatmax()^(-1/θ), so log(s) is formed without them:
# log(exp(-θ lu) + exp(-θ lv) - 1) = logsubexp(logaddexp(-θ lu, -θ lv), 0),
# which is finite for every representable u and v. For θ < 0 the powers are
# bounded by one and s can be non-positive outside the finite support, where
# log(s) is NaN and the callers test s first.
@inline function _clayton_terms(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(Distributions.params(G).θ), float(u), float(v))
    θ < -one(θ) && throw(DomainError(θ, "A bivariate Clayton generator requires θ ≥ -1."))
    uu, vv = _clp(uu), _clp(vv)
    lu = log(uu)
    lv = log(vv)
    if θ > zero(θ)
        logs = LogExpFunctions.logsubexp(LogExpFunctions.logaddexp(-θ * lu, -θ * lv), zero(θ))
        return θ, uu, vv, lu, lv, exp(logs), logs
    end
    s = iszero(θ) ? one(θ) : exp(-θ * lu) + exp(-θ * lv) - one(θ)
    logs = s > zero(s) ? log(s) : oftype(s, NaN)
    return θ, uu, vv, lu, lv, s, logs
end

@inline function _clayton_h_from_terms(θ::Real, lbase::Real, logs::Real)
    iszero(θ) && throw(ArgumentError("independence must be handled before the Clayton interior formula"))
    logh = (-θ - one(θ)) * lbase + (-inv(θ) - one(θ)) * logs
    return clamp(exp(logh), zero(θ), one(θ))
end

@inline function _arch_pair_logpdf(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, _, _, lu, lv, s, logs = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ)

    # For -1 ≤ θ < 0, Clayton has finite support. Outside the absolutely
    # continuous support the density is exactly zero.
    s <= zero(s) && return oftype(s, -Inf)
    return log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
end

# Closed-form conditional CDF with the same finite-support convention.
# For C(u,v)=s^(-1/θ), s=u^(-θ)+v^(-θ)-1,
# h(u|v)=v^(-θ-1)s^(-1/θ-1) on the interior support.
@inline function _arch_hfunc(G::Copulas.ClaytonGenerator, target::Real, base::Real)
    θ, tt, _, lt, lb, s, logs = _clayton_terms(G, target, base)
    iszero(θ) && return tt
    s <= zero(s) && return zero(s)
    return _clayton_h_from_terms(θ, lb, logs)
end

@inline function _arch_hfuncs(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv, lu, lv, s, logs = _clayton_terms(G, u, v)
    iszero(θ) && return uu, vv
    s <= zero(s) && return zero(s), zero(s)
    return _clayton_h_from_terms(θ, lv, logs), _clayton_h_from_terms(θ, lu, logs)
end

@inline function _arch_pair_step(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, vv, lu, lv, s, logs = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), uu, vv
    s <= zero(s) && return oftype(s, -Inf), zero(s), zero(s)

    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    h1 = _clayton_h_from_terms(θ, lv, logs)
    h2 = _clayton_h_from_terms(θ, lu, logs)
    return logc, h1, h2
end

@inline function _arch_pair_logpdf_h1(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, uu, _, lu, lv, s, logs = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), uu
    s <= zero(s) && return oftype(s, -Inf), zero(s)

    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lv, logs)
end

@inline function _arch_pair_logpdf_h2(G::Copulas.ClaytonGenerator, u::Real, v::Real)
    θ, _, vv, lu, lv, s, logs = _clayton_terms(G, u, v)
    iszero(θ) && return zero(θ), vv
    s <= zero(s) && return oftype(s, -Inf), zero(s)

    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lu, logs)
end

# =====================================================================
# Clayton
# =====================================================================

# Both signs of θ invert the conditional directly. The generic path goes
# through ϕ⁻¹(base) = (base^(-θ) - 1)/θ, and for θ > 0 that overflows once
# base^(-θ) does, while q·ϕ⁽¹⁾(ϕ⁻¹(base)) ~ q·base^(θ+1) underflows well
# before: the first collapses the result to NaN, the second to the clamp
# floor. For θ < 0 the direct inversion avoids underflow in q*ϕ'(sbase) at the
# support boundary.
@inline function _arch_hinv(G::Copulas.ClaytonGenerator, q::Real, base::Real)
    θ, qq, bb = promote(float(Distributions.params(G).θ), float(q), float(base))
    iszero(θ) && return _arch_hinv_generic(G, qq, bb)
    θ > zero(θ) && return _clayton_hinv_positive(θ, clamp(qq, zero(qq), one(qq)), _clp(bb))
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

# For θ > 0, q = h(u | v) = v^(-θ-1) (u^(-θ) + v^(-θ) - 1)^(-1/θ-1) inverts to
#     u = [1 + v^(-θ) (q^(-θ/(1+θ)) - 1)]^(-1/θ),
# and log(1 + v^(-θ) (q^a - 1)) with a = -θ/(1+θ) < 0 is logaddexp(0, -θ log v
# + log(expm1(a log q))), which is finite for every representable v and q.
# q = 0 gives log z = Inf and u = 0; q = 1 gives log z = 0 and u = 1.
@inline function _clayton_hinv_positive(θ::Real, q::Real, v::Real)
    a = -θ / (one(θ) + θ)
    logz = LogExpFunctions.logaddexp(zero(θ), -θ * log(v) + log(expm1(a * log(q))))
    return clamp(exp(-logz / θ), zero(θ), one(θ))
end

@inline function _inv_ϕ¹(G::Copulas.ClaytonGenerator, y::Real)
    θ, m = promote(float(Distributions.params(G).θ), _negative_derivative_magnitude(y, "Clayton"))
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
