# =====================================================================
# BB8
# =====================================================================

# BB8 uses the original generator coordinate
#
#     s = ϕ⁻¹(u).
#
# Therefore, Archimedean composition is ordinary addition in this
# coordinate. A genuine BB8 generator has 0 < δ < 1 because δ = 1 is
# reduced to Joe by the Copulas.jl constructor.

@inline function _arch_coordinate(C::Copulas.BB8Copula{2}, u::Real)
    ϑ, δ, uu = promote(float(_vine_params(C).ϑ), float(_vine_params(C).δ), float(u))
    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB8 probability must belong to (0, 1].",))
    isone(uu) && return zero(uu)
    # η = 1 - (1-δ)^ϑ
    logη = log(-expm1(ϑ * log1p(-δ)))
    # numerator = 1 - (1-δu)^ϑ
    lognumerator = log(-expm1(ϑ * log1p(-δ * uu)),)
    # s = -log(numerator / η)
    return logη - lognumerator
end

@inline function _arch_probability(C::Copulas.BB8Copula{2}, s::Real)
    ϑ, δ, ss = promote(float(_vine_params(C).ϑ), float(_vine_params(C).δ), float(s))
    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))
    iszero(ss) && return one(ss)
    isinf(ss) && return zero(ss)
    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)
    # ϕ(s) = [1 - (1-q)^(1/ϑ)] / δ
    return -expm1(log1p(-q) / ϑ) / δ
end

@inline function _arch_logderivative(C::Copulas.BB8Copula{2}, s::Real,)
    ϑ, δ, ss = promote(float(_vine_params(C).ϑ), float(_vine_params(C).δ), float(s))
    T = typeof(ss)
    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))
    isinf(ss) && return -T(Inf)
    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)
    a = inv(ϑ)
    # log|ϕ′(s)| = log η - log δ - log ϑ - s + (1/ϑ - 1)log(1 - ηe^(-s)).
    return log(η) - log(δ) - log(ϑ) - ss + (a - one(T)) * log1p(-q)
end

function _arch_inverse_logderivative(C::Copulas.BB8Copula{2}, logm::Real,)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    ϑ, δ = T(_vine_params(C).ϑ), T(_vine_params(C).δ)
    ϑ >= one(T) || throw(DomainError(ϑ, "The BB8 copula requires ϑ ≥ 1.",))
    zero(T) < δ < one(T) || throw(DomainError(δ, "A genuine BB8 copula requires 0 < δ < 1; δ = 1 reduces to Joe.",))
    maxlm = _arch_logderivative(C, zero(T))
    tol = T(64) * eps(T) * max(one(T), abs(maxlm))
    # Unlike BB1, BB3, BB6 and BB7, BB8 has a finite derivative
    # magnitude at s = 0.
    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))
    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))
    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)
    # For ϑ = 1, BB8 reduces to the independence generator:
    #     ϕ(s) = exp(-s),  log|ϕ′(s)| = -s.
    if ϑ == one(T)
        return -lm
    end
    # Solve in z = log(s), so the constrained coordinate s ≥ 0
    # becomes an unconstrained real variable.
    function f(z)
        s = exp(z)
        return _arch_logderivative(C, s) - lm
    end

    function df(z)
        z == -T(Inf) && return zero(T)
        z == T(Inf) && return -T(Inf)

        s = exp(z)
        isinf(s) && return -T(Inf)

        η = -expm1(ϑ * log1p(-δ))
        q = η * exp(-s)
        a = inv(ϑ)

        # d/ds log|ϕ′(s)| = -1 + (1/ϑ - 1) q/(1-q).
        dlogm_ds = -one(T) + (a - one(T)) * q / (one(T) - q)
        return s * dlogm_ds
    end

    z = _solve_decreasing_root(f, df, zero(T))
    return exp(z)
end

# BB8 uses s itself as coordinate.
@inline _arch_combine(::Copulas.BB8Copula{2}, a::Real, b::Real,) = a + b

@inline function _arch_difference(::Copulas.BB8Copula{2}, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB8 coordinate.",))
        return zero(T)
    end

    return tt - bb
end

@inline _arch_hfunc(C::Copulas.BB8Copula{2}, target::Real, base::Real,) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB8Copula{2}, q::Real, base::Real,) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB8Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB8")
    T = typeof(m)
    iszero(m) && return T(Inf)
    # Do not map m = Inf to zero automatically: BB8 has a finite
    # derivative magnitude at s = 0, so Inf is outside its range.
    return _arch_inverse_logderivative(C, log(m))
end


# Direct bivariate density avoids cancellation when reconstructing derivatives.
@inline function _bb8_pair_logpdf(C::Copulas.BB8Copula{2}, u::Real, v::Real)
    p = _vine_params(C)
    ϑ, δ, uu, vv = promote(float(p.ϑ), float(p.δ), float(u), float(v))
    ϑ >= one(ϑ) || throw(DomainError(ϑ, "A BB8 copula requires ϑ ≥ 1."))
    zero(δ) < δ <= one(δ) || throw(DomainError(δ, "A BB8 copula requires 0 < δ ≤ 1."))
    uu, vv = _clp(uu), _clp(vv)
    isone(ϑ) && return zero(ϑ)
    log1mδu = log1p(-δ * uu)
    log1mδv = log1p(-δ * vv)
    logη = log(-expm1(ϑ * log1p(-δ)))
    logx = log(-expm1(ϑ * log1mδu))
    logy = log(-expm1(ϑ * log1mδv))
    logz = logx + logy - logη
    log1mz = LogExpFunctions.log1mexp(logz)
    logϑmz = LogExpFunctions.logsubexp(log(ϑ), logz)
    return log(δ) - logη + (inv(ϑ) - 2) * log1mz + logϑmz + (ϑ - one(ϑ)) * (log1mδu + log1mδv)
end

@inline _arch_pair_logpdf(C::Copulas.BB8Copula{2}, u::Real, v::Real) = _bb8_pair_logpdf(C, u, v)

@inline _pair_logpdf(C::Copulas.BB8Copula{2}, u::Real, v::Real, ::Vector{Float64}) = _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB8Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB8Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB8Copula{2}, q::Real, v::Real) = _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB8Copula{2}, q::Real, u::Real) = _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB8Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB8Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB8Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB8Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
