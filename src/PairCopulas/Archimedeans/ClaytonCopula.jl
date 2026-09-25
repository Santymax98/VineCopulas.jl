# ---------------------------------------------------------------------
# Clayton pair-copula fast paths
#
# These kernels deliberately depend only on the public ClaytonCopula
# contract and _vine_params(C).  They do not inspect the stored
# Archimedean generator or call generator-level Copulas.jl internals.
# ---------------------------------------------------------------------

@inline function _clayton_terms(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, uu, vv = promote(float(_vine_params(C).θ), float(u), float(v),)
    θ < -one(θ) && throw(DomainError(θ, "A bivariate Clayton copula requires θ ≥ -1."))
    uu, vv = _clp(uu), _clp(vv)
    lu = log(uu)
    lv = log(vv)
    # For θ > 0, avoid forming u^(-θ) and v^(-θ) separately:
    # log(u^(-θ) + v^(-θ) - 1) = logsubexp(logaddexp(-θ log u, -θ log v), 0).
    # This stays finite much deeper in the tails.
    if θ > zero(θ)
        logs = LogExpFunctions.logsubexp(LogExpFunctions.logaddexp(-θ * lu, -θ * lv), zero(θ),)
        return θ, uu, vv, lu, lv, exp(logs), logs
    end
    # For θ ≤ 0 the powers are bounded.  Negative Clayton has finite
    # support, so s may become non-positive outside that support.
    s = iszero(θ) ? one(θ) : exp(-θ * lu) + exp(-θ * lv) - one(θ)
    logs = s > zero(s) ? log(s) : oftype(s, NaN)
    return θ, uu, vv, lu, lv, s, logs
end

@inline function _clayton_h_from_terms(θ::Real, lbase::Real, logs::Real,)
    iszero(θ) && throw(ArgumentError("independence must be handled before the Clayton interior formula",))
    logh = (-θ - one(θ)) * lbase + (-inv(θ) - one(θ)) * logs
    return clamp(exp(logh), zero(θ), one(θ))
end

# ---------------------------------------------------------------------
# Density
# ---------------------------------------------------------------------

@inline function _clayton_pair_logpdf(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, _, _, lu, lv, s, logs = _clayton_terms(C, u, v)
    iszero(θ) && return zero(θ)
    # For -1 ≤ θ < 0, Clayton has finite support.
    s <= zero(s) && return oftype(s, -Inf)
    return log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
end

@inline function _pair_logpdf(C::Copulas.ClaytonCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    return _clayton_pair_logpdf(C, _clp(u), _clp(v))
end

# ---------------------------------------------------------------------
# Conditional CDFs
# ---------------------------------------------------------------------

# For
#
#   C(u,v) = s^(-1/θ),
#   s = u^(-θ) + v^(-θ) - 1,
#
# the conditional CDF is
#
#   h(u|v)
#     = v^(-θ-1) s^(-1/θ-1)
#
# on the interior support.
@inline function _clayton_hfunc(C::Copulas.ClaytonCopula{2}, target::Real, base::Real,)
    θ, tt, _, _, lb, s, logs = _clayton_terms(C, target, base)
    iszero(θ) && return tt
    s <= zero(s) && return zero(s)
    return _clayton_h_from_terms(θ, lb, logs)
end

@inline function _clayton_hfuncs(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lu, lv, s, logs = _clayton_terms(C, u, v)
    iszero(θ) && return uu, vv
    s <= zero(s) && return zero(s), zero(s)
    return (_clayton_h_from_terms(θ, lv, logs), _clayton_h_from_terms(θ, lu, logs),)
end

@inline hfunc1(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,) = _clp(_clayton_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,) = _clp(_clayton_hfunc(C, _clp(v), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    uu, vv = _clp(u), _clp(v)
    h1, h2 = _clayton_hfuncs(C, uu, vv)
    return _clp(h1), _clp(h2)
end

# ---------------------------------------------------------------------
# Fused traversal kernels
# ---------------------------------------------------------------------

@inline function _clayton_pair_step(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, uu, vv, lu, lv, s, logs = _clayton_terms(C, u, v)
    iszero(θ) && return zero(θ), uu, vv
    s <= zero(s) && return oftype(s, -Inf), zero(s), zero(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    h1 = _clayton_h_from_terms(θ, lv, logs)
    h2 = _clayton_h_from_terms(θ, lu, logs)
    return logc, h1, h2
end

@inline function _pair_step(C::Copulas.ClaytonCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    uu, vv = _clp(u), _clp(v)
    logc, h1, h2 = _clayton_pair_step(C, uu, vv)
    return logc, _clp(h1), _clp(h2)
end

@inline function _clayton_pair_logpdf_h1(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, uu, _, lu, lv, s, logs = _clayton_terms(C, u, v)
    iszero(θ) && return zero(θ), uu
    s <= zero(s) && return oftype(s, -Inf), zero(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lv, logs)
end

@inline function _clayton_pair_logpdf_h2(C::Copulas.ClaytonCopula{2}, u::Real, v::Real,)
    θ, _, vv, lu, lv, s, logs = _clayton_terms(C, u, v)
    iszero(θ) && return zero(θ), vv
    s <= zero(s) && return oftype(s, -Inf), zero(s)
    logc = log1p(θ) - (θ + one(θ)) * (lu + lv) - (2 + inv(θ)) * logs
    return logc, _clayton_h_from_terms(θ, lu, logs)
end

@inline function _pair_logpdf_h1(C::Copulas.ClaytonCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1 = _clayton_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.ClaytonCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h2 = _clayton_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end

# ---------------------------------------------------------------------
# Conditional inverse
# ---------------------------------------------------------------------

# For θ > 0,
#
#   q = h(u|v)
#
# gives
#
#   u =
#   [1 + v^(-θ)
#        (q^(-θ/(1+θ)) - 1)]^(-1/θ).
#
# The logarithmic form below avoids overflow deep in the lower tail.
@inline function _clayton_hinv_positive(θ::Real, q::Real, v::Real,)
    a = -θ / (one(θ) + θ)
    logz = LogExpFunctions.logaddexp(zero(θ), -θ * log(v) + log(expm1(a * log(q))),)
    return clamp(exp(-logz / θ), zero(θ), one(θ),)
end

@inline function _clayton_hinv(C::Copulas.ClaytonCopula{2}, q::Real, base::Real,)
    θ, qq, bb = promote(float(_vine_params(C).θ), float(q), float(base),)
    qq = clamp(qq, zero(qq), one(qq))
    bb = _clp(bb)
    # Continuous independence limit.
    iszero(θ) && return qq
    if θ > zero(θ)
        return _clayton_hinv_positive(θ, qq, bb)
    end
    -one(θ) <= θ || throw(DomainError(θ, "A bivariate Clayton copula requires θ ≥ -1.",))
    # Lower Fréchet boundary.
    θ == -one(θ) && return clamp(one(θ) - bb, zero(θ), one(θ),)
    a = -θ / (one(θ) + θ)
    logb = -θ * log(bb)
    b = exp(logb)
    qa = iszero(qq) ? zero(qq) : exp(a * log(qq))
    z = max(-expm1(logb) + b * qa, zero(θ),)
    iszero(z) && return zero(θ)
    return clamp(exp((-inv(θ)) * log(z)), zero(θ),one(θ),)
end

@inline hinv1(C::Copulas.ClaytonCopula{2}, q::Real, v::Real,) = _clp(_clayton_hinv(C, _clp(q), _clp(v),),)
@inline hinv2(C::Copulas.ClaytonCopula{2}, q::Real, u::Real,) = _clp(_clayton_hinv(C, _clp(q), _clp(u),),)
