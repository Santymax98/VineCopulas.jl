# =====================================================================
# BB10
# =====================================================================

# BB10 uses the original generator coordinate
#
#     s = ϕ⁻¹(u).
#
# Hence Archimedean composition is ordinary addition. The proper
# absolutely continuous parameter domain used here is
#
#     θ > 0,    0 ≤ δ < 1.
#
# The boundary δ = 0 is independence and δ = 1 is singular.

@inline function _arch_coordinate(C::Copulas.BB10Copula{2}, u::Real,)
    p = _vine_params(C)
    θ, δ, uu = promote(float(p.θ), float(p.δ), float(u),)
    T = typeof(uu)

    zero(T) < uu <= one(T) ||
        throw(DomainError(u, "The BB10 probability must belong to (0, 1].",))
    θ > zero(T) ||
        throw(DomainError(θ, "A BB10 copula requires θ > 0.",))
    zero(T) <= δ < one(T) ||
        throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))

    isone(uu) && return zero(T)

    # s = log(δ + (1-δ)u^(-θ)), evaluated without constructing u^(-θ).
    logδ = iszero(δ) ? -T(Inf) : log(δ)
    logtail = log1p(-δ) - θ * log(uu)

    return LogExpFunctions.logaddexp(logδ, logtail)
end

@inline function _arch_probability(C::Copulas.BB10Copula{2}, s::Real,)
    p = _vine_params(C)
    θ, δ, ss = promote(float(p.θ), float(p.δ), float(s),)
    T = typeof(ss)

    θ > zero(T) ||
        throw(DomainError(θ, "A BB10 copula requires θ > 0.",))
    zero(T) <= δ < one(T) ||
        throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    ss >= zero(T) ||
        throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))

    iszero(ss) && return one(T)
    isinf(ss) && return zero(T)

    # log(exp(s)-δ) = s + log(1-δ exp(-s)).
    q = δ * exp(-ss)
    logden = ss + log1p(-q)

    return exp((log1p(-δ) - logden) / θ)
end

@inline function _arch_logderivative(C::Copulas.BB10Copula{2}, s::Real,)
    p = _vine_params(C)
    θ, δ, ss = promote(float(p.θ), float(p.δ), float(s),)
    T = typeof(ss)

    θ > zero(T) || throw(DomainError(θ, "A BB10 copula requires θ > 0.",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    ss >= zero(T) || throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))

    isinf(ss) && return -T(Inf)

    a = inv(θ)
    q = δ * exp(-ss)

    # log|ϕ′(s)| =
    #
    #   -log θ
    #   + (1/θ)log(1-δ)
    #   - s/θ
    #   - (1+1/θ)log(1-δ exp(-s)).
    return -log(θ) + a * log1p(-δ) - a * ss - (one(T) + a) * log1p(-q)
end

function _arch_inverse_logderivative(C::Copulas.BB10Copula{2}, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN.",))

    p = _vine_params(C)
    θ, δ = T(p.θ), T(p.δ)

    θ > zero(T) || throw(DomainError(θ, "A BB10 copula requires θ > 0.",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))

    # At s = 0:
    #
    #     |ϕ′(0)| = 1 / [θ(1-δ)].
    maxlm = -log(θ) - log1p(-δ)
    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    lm == T(Inf) &&
        throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm > maxlm + tol &&
        throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)

    # δ = 0 is independence up to a positive scaling of the generator:
    #
    #     ϕ(s) = exp(-s/θ),
    #     log|ϕ′(s)| = -log θ - s/θ.
    if iszero(δ)
        return max(-θ * (lm + log(θ)), zero(T))
    end

    # Solve in z = log(s), mapping s ≥ 0 to the full real line.
    function f(z)
        s = exp(z)
        return _arch_logderivative(C, s) - lm
    end

    function df(z)
        z == -T(Inf) && return zero(T)
        z == T(Inf) && return -T(Inf)

        s = exp(z)
        isinf(s) && return -T(Inf)

        a = inv(θ)
        q = δ * exp(-s)

        # d/ds log|ϕ′(s)| =
        #
        #   -1/θ - (1+1/θ)q/(1-q).
        dlogm_ds = -a - (one(T) + a) * q / (one(T) - q)
        return s * dlogm_ds
    end

    z = _solve_decreasing_root(f, df, zero(T))
    return exp(z)
end

# BB10 uses the original generator argument as its coordinate.
@inline _arch_combine(::Copulas.BB10Copula{2}, a::Real, b::Real,) = a + b

@inline function _arch_difference(::Copulas.BB10Copula{2}, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB10 coordinate.",))
        return zero(T)
    end

    return tt - bb
end

@inline _arch_hfunc(C::Copulas.BB10Copula{2}, target::Real, base::Real,) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB10Copula{2}, q::Real, base::Real,) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB10Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB10")
    T = typeof(m)

    iszero(m) && return T(Inf)

    # BB10 has finite |ϕ′(0)|, so m = Inf is not automatically mapped
    # to s = 0. Let the range-aware inverse handle that case.
    return _arch_inverse_logderivative(C, log(m))
end

# ---------------------------------------------------------------------
# Public density + specialized conditional primitives
#
# Copulas.jl already provides a closed-form BB10 log-density through the
# public Distributions.logpdf API. Benchmarks show that implementation is
# substantially faster than duplicating the formula locally while remaining
# allocation-free, so VineCopulas only specializes the conditional machinery.
# ---------------------------------------------------------------------

@inline function _pair_logpdf(C::Copulas.BB10Copula{2}, u::Real, v::Real, buf::Vector{Float64},)
    buf[1] = _clp(u)
    buf[2] = _clp(v)
    return Distributions.logpdf(C, buf)
end

@inline hfunc1(C::Copulas.BB10Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB10Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB10Copula{2}, q::Real, v::Real) = _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB10Copula{2}, q::Real, u::Real) = _clp(_arch_hinv(C, _clp(q), _clp(u)))
@inline function _pair_hfuncs(C::Copulas.BB10Copula{2}, u::Real, v::Real)
    uu, vv = _clp(u), _clp(v)
    h1, h2 = _arch_hfuncs(C, uu, vv)
    return _clp(h1), _clp(h2)
end

@inline function _pair_step(C::Copulas.BB10Copula{2}, u::Real, v::Real, buf::Vector{Float64},)
    uu, vv = _clp(u), _clp(v)

    buf[1] = uu
    buf[2] = vv
    logc = Distributions.logpdf(C, buf)

    h1, h2 = _arch_hfuncs(C, uu, vv)

    return logc, _clp(h1), _clp(h2)
end

@inline function _pair_logpdf_h1(C::Copulas.BB10Copula{2}, u::Real, v::Real, buf::Vector{Float64},)
    uu, vv = _clp(u), _clp(v)

    buf[1] = uu
    buf[2] = vv
    logc = Distributions.logpdf(C, buf)
    h1 = _arch_hfunc(C, uu, vv)

    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.BB10Copula{2}, u::Real, v::Real, buf::Vector{Float64},)
    uu, vv = _clp(u), _clp(v)

    buf[1] = uu
    buf[2] = vv
    logc = Distributions.logpdf(C, buf)
    h2 = _arch_hfunc(C, vv, uu)

    return logc, _clp(h2)
end