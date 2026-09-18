# =====================================================================
# BB6
# =====================================================================

# BB6 is represented in the transformed coordinate
#
#     x = log(s^(1/δ)) = log(r),
#
# where r = s^(1/δ). In this coordinate, log|ϕ′| is smooth and strictly
# decreasing for every genuine BB6 copula (θ > 1 and δ > 1).

@inline function _arch_coordinate(C::Copulas.BB6Copula{2}, u::Real)
    θ, uu = promote(float(Distributions.params(C).θ), float(u))

    # logw = log((1-u)^θ)
    logw = θ * log1p(-uu)

    # x = log(-log(1 - (1-u)^θ))
    return _log_neglog1mexp(logw)
end

@inline function _arch_probability(C::Copulas.BB6Copula{2}, x::Real)
    θ, xx = promote(float(Distributions.params(C).θ), float(x))

    # logH = log(1 - exp(-exp(x)))
    logH = _log1mexp_negexp(xx)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(C::Copulas.BB6Copula{2}, x::Real,)
    θ, δ, xx = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(x))
    T = typeof(xx)

    xx == -T(Inf) && return T(Inf)
    xx == T(Inf) && return -T(Inf)

    r = exp(xx)
    isinf(r) && return -T(Inf)

    a = inv(θ)
    logH = _log1mexp_negexp(xx)

    # log|ϕ′(s)| =
    #   -log θ - log δ
    #   + (1-δ)x
    #   - exp(x)
    #   + (1/θ-1)log(1-exp(-exp(x))).
    return -log(θ) -
           log(δ) +
           (one(T) - δ) * xx -
           r +
           (a - one(T)) * logH
end

function _arch_inverse_logderivative(C::Copulas.BB6Copula{2}, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(Distributions.params(C).θ), T(Distributions.params(C).δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB6 copula requires θ > 1; θ = 1 reduces to Gumbel.",))
    δ > one(T) || throw(DomainError(δ, "A genuine BB6 copula requires δ > 1; δ = 1 reduces to Joe.",))

    a = inv(θ)

    f(x) = _arch_logderivative(C, x) - lm

    function df(x)
        x == -T(Inf) && return a - δ
        x == T(Inf) && return -T(Inf)

        r = exp(x)
        isinf(r) && return -T(Inf)

        logH = _log1mexp_negexp(x)

        # d/dx log(1-exp(-exp(x)))
        ratio = exp(x - r - logH)

        return one(T) - δ - r + (a - one(T)) * ratio
    end

    return _solve_decreasing_root(f, df, zero(T))
end

# In x = log(s^(1/δ)), the Archimedean sum s₁+s₂ becomes a scaled
# log-sum-exp operation.
@inline function _arch_combine(C::Copulas.BB6Copula{2}, a::Real, b::Real,)
    δ, aa, bb = promote(float(Distributions.params(C).δ), float(a), float(b))
    return LogExpFunctions.logaddexp(δ * aa, δ * bb) / δ
end

# Recover one summand from s_total - s_base in the same transformed
# coordinate. A microscopic order reversal is interpreted as a zero summand,
# analogously to the saturated conditional-probability handling for BB2.
@inline function _arch_difference(C::Copulas.BB6Copula{2}, total::Real, base::Real,)
    δ, tt, bb = promote(float(Distributions.params(C).δ), float(total), float(base))
    T = typeof(tt)

    stotal = δ * tt
    sbase = δ * bb

    if stotal < sbase
        tol = T(8) * eps(T) * max(abs(stotal), abs(sbase), one(T))

        sbase - stotal <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB6 coordinate.",))

        return -T(Inf)
    end

    stotal == sbase && return -T(Inf)

    return LogExpFunctions.logsubexp(stotal, sbase) / δ
end

@inline _arch_hfunc(C::Copulas.BB6Copula{2}, target::Real, base::Real,) = _arch_hfunc_coordinate(C, target, base)

@inline _arch_hinv(C::Copulas.BB6Copula{2}, q::Real, base::Real,) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB6Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB6")
    T = typeof(m)

    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    x = _arch_inverse_logderivative(C, log(m))
    δ, xx = promote(float(Distributions.params(C).δ), x)

    # s = exp(δx)
    return exp(δ * xx)
end

# x = log(s^(1/δ)): log(ϕ''(s)) = log|ϕ'(s)| + log(-dL/dx) - log(δ) - δx.
@inline function _arch_pair_logpdf(C::Copulas.BB6Copula{2}, u::Real, v::Real)
    p = Distributions.params(C)
    θ, δ = float(p.θ), float(p.δ)
    xu, xv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    x = _arch_combine(C, xu, xv)
    r = exp(x)
    ratio = exp(x - r - _log1mexp_negexp(x))
    slope = δ - one(δ) + r + (one(θ) - inv(θ)) * ratio
    return _arch_logderivative(C, x) + log(slope) - log(δ) - δ * x -
           _arch_logderivative(C, xu) - _arch_logderivative(C, xv)
end

@inline _pair_logpdf(C::Copulas.BB6Copula{2}, u::Real, v::Real, ::Vector{Float64}) =
    _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB6Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB6Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB6Copula{2}, q::Real, v::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB6Copula{2}, q::Real, u::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB6Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB6Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB6Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB6Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
