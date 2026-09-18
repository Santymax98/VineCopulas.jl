# =====================================================================
# BB9
# =====================================================================

# BB9 is represented in the shifted logarithmic coordinate
#
#     x = log(s + c),    c = δ^(-θ).
#
# Since s ≥ 0, the coordinate domain is
#
#     x ≥ log(c) = -θ log(δ).
#
# In this coordinate, log|ϕ′| is smooth and strictly decreasing.

@inline function _bb9_logc(C::Copulas.BB9Copula{2})
    θ, δ = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ))
    return -θ * log(δ)
end

@inline function _arch_coordinate(C::Copulas.BB9Copula{2}, u::Real)
    θ, δ, uu = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(u))

    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB9 probability must belong to (0, 1].",))

    # s + c = (1/δ - log(u))^θ
    # Therefore:
    # x = log(s+c) = θ log(1/δ - log(u)).
    return θ * log(inv(δ) - log(uu))
end

@inline function _arch_probability(C::Copulas.BB9Copula{2}, x::Real,)
    θ, δ, xx = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(x))
    T = typeof(xx)

    logc = -θ * log(δ)
    tol = T(8) * eps(T) * max(abs(xx), abs(logc), one(T))

    xx >= logc - tol || throw(DomainError(x, "The BB9 shifted-log coordinate is below log(c).",))

    isinf(xx) && return zero(T)

    # ϕ(s) = exp(1/δ - (s+c)^(1/θ))
    # Since x = log(s+c):
    # (s+c)^(1/θ) = exp(x/θ).
    return exp(inv(δ) - exp(xx / θ))
end

@inline function _arch_logderivative(C::Copulas.BB9Copula{2}, x::Real,)
    θ, δ, xx = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(x))
    T = typeof(xx)

    logc = -θ * log(δ)
    tol = T(8) * eps(T) * max(abs(xx), abs(logc), one(T))

    xx >= logc - tol || throw(DomainError(x, "The BB9 shifted-log coordinate is below log(c).",))
    isinf(xx) && return -T(Inf)
    a = inv(θ)

    # log|ϕ′(s)| = -log θ + (1/θ - 1)x + 1/δ - exp(x/θ).
    return -log(θ) + (a - one(T)) * xx + inv(δ) - exp(a * xx)
end

function _arch_inverse_logderivative(C::Copulas.BB9Copula{2}, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    θ, δ = T(Distributions.params(C).θ), T(Distributions.params(C).δ)
    θ >= one(T) || throw(DomainError(θ, "The BB9 generator requires θ ≥ 1.",))

    δ > zero(T) || throw(DomainError(δ, "The BB9 generator requires δ > 0.",))

    logc = -θ * log(δ)
    maxlm = _arch_logderivative(C, logc)

    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    # BB9 has a finite derivative magnitude at s = 0.
    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
    lm >= maxlm - tol && return logc
    lm == -T(Inf) && return T(Inf)

    # Let
    #     y = (s+c)^(1/θ) = exp(x/θ).
    # Then:
    #     logm = -log θ + (1-θ)log(y) + 1/δ - y.
    # For θ = 1 this becomes linear in y.
    if θ == one(T)
        y = inv(δ) - lm
        y > zero(T) || throw(DomainError(logm, "The target lies outside the range of the BB9 derivative.",))
        return log(y)
    end

    # For k = θ-1 > 0:
    #     y + k log(y) = 1/δ - log θ - logm.
    # Hence:
    #     y = k W(exp(B/k)/k),
    # evaluated through the existing log-domain Lambert-W helper.
    k = θ - one(T)
    B = inv(δ) - log(θ) - lm
    logv = B / k - log(k)

    logy = log(k) + _log_lambertw_exp(logv)

    # x = θ log(y).
    return θ * logy
end

# In the coordinate x = log(s+c),
#
#     s = exp(x) - c.
#
# Therefore:
#
#     s₁ + s₂ + c = exp(x₁) + exp(x₂) - c.
@inline function _arch_combine(C::Copulas.BB9Copula{2}, a::Real, b::Real,)
    aa, bb = promote(float(a), float(b))
    logc = oftype(aa, _bb9_logc(C))

    total = LogExpFunctions.logaddexp(aa, bb)
    total >= logc || throw(DomainError((a, b), "Invalid BB9 coordinates.",))

    return LogExpFunctions.logsubexp(total, logc)
end

# Recover the target coordinate from
#
#     s_target = s_total - s_base.
#
# In shifted-log coordinates:
#
#     exp(x_target)
#       = exp(x_total) - exp(x_base) + c.
@inline function _arch_difference(C::Copulas.BB9Copula{2}, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)
    logc = T(_bb9_logc(C))

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB9 coordinate.",))
        return logc
    end

    tt == bb && return logc
    # log(exp(tt) - exp(bb) + exp(logc))
    d = tt - bb

    return tt + log(-expm1(-d) + exp(logc - tt),)
end

@inline _arch_hfunc(C::Copulas.BB9Copula{2}, target::Real, base::Real,) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB9Copula{2}, q::Real, base::Real,) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB9Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB9")
    T = typeof(m)

    iszero(m) && return T(Inf)

    # BB9 has finite |ϕ′(0)|, so m = Inf is outside its range
    # and must be handled by _arch_inverse_logderivative.
    x = _arch_inverse_logderivative(C, log(m))

    isinf(x) && return x

    θ, δ, xx = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), x)
    logc = -θ * log(δ)

    # Stable reconstruction: s = exp(x) - exp(logc) = exp(logc) * expm1(x-logc).
    return exp(logc) * expm1(xx - logc)
end


# x = log(s+c): log(ϕ''(s)) = M(x) + log(-M'(x)) - x.
@inline function _arch_pair_logpdf(C::Copulas.BB9Copula{2}, u::Real, v::Real)
    p = inv(float(Distributions.params(C).θ))
    xu, xv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    x = _arch_combine(C, xu, xv)
    logslope = LogExpFunctions.logaddexp(log1p(-p), log(p) + p * x)
    return _arch_logderivative(C, x) + logslope - x -
           _arch_logderivative(C, xu) - _arch_logderivative(C, xv)
end

@inline _pair_logpdf(C::Copulas.BB9Copula{2}, u::Real, v::Real, ::Vector{Float64}) =
    _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB9Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB9Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB9Copula{2}, q::Real, v::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB9Copula{2}, q::Real, u::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB9Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB9Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB9Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB9Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
