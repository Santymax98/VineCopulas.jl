# ---------------------------------------------------------------------
# Joe pair-copula fast paths
#
# These kernels depend only on the public JoeCopula contract and
# _vine_params(C). They do not inspect the stored generator or
# call generator-level Copulas.jl internals.
# ---------------------------------------------------------------------

@inline function _joe_terms(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, uu, vv = promote(float(_vine_params(C).θ), float(u), float(v),)

    θ >= one(θ) || throw(DomainError(θ, "A Joe copula requires θ ≥ 1.",))

    uu, vv = _clp(uu), _clp(vv)

    x = -log1p(-uu)
    y = -log1p(-vv)

    logA = -θ * x
    logB = -θ * y
    log1mA = LogExpFunctions.log1mexp(logA)
    log1mB = LogExpFunctions.log1mexp(logB)

    # S = A + B - A*B = B + A*(1-B)
    logS = LogExpFunctions.logaddexp(logB, logA + log1mB)

    return θ, uu, vv, x, y, log1mA, log1mB, logS
end

@inline function _joe_logpdf_from_terms(θ::Real, x::Real, y::Real, log1mA::Real, log1mB::Real, logS::Real,)
    θ == one(θ) && return zero(θ)

    α = inv(θ)

    # c(u,v) =
    #
    # θ (1-u)^(θ-1) (1-v)^(θ-1) S^(1/θ-2)
    # × [S + (1-1/θ)(1-A)(1-B)].
    logR = LogExpFunctions.logaddexp(
        logS,
        log1p(-α) + log1mA + log1mB,
    )

    return log(θ) -
           (θ - one(θ)) * (x + y) +
           (α - 2) * logS +
           logR
end

@inline function _joe_logh1_from_terms(θ::Real, y::Real, log1mA::Real, logS::Real,)
    θ == one(θ) && return log1mA

    α = inv(θ)

    return log1mA -
           (θ - one(θ)) * y +
           (α - one(θ)) * logS
end

@inline function _joe_logh2_from_terms(θ::Real, x::Real, log1mB::Real, logS::Real,)
    θ == one(θ) && return log1mB

    α = inv(θ)

    return log1mB -
           (θ - one(θ)) * x +
           (α - one(θ)) * logS
end

@inline function _joe_pair_logpdf(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, _, _, x, y, log1mA, log1mB, logS = _joe_terms(C, u, v)

    return _joe_logpdf_from_terms(θ, x, y, log1mA, log1mB, logS)
end

@inline function _pair_logpdf(C::Copulas.JoeCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    return _joe_pair_logpdf(C, _clp(u), _clp(v),)
end

# ---------------------------------------------------------------------
# Stable Joe conditionals
# ---------------------------------------------------------------------
#
# Write
#
#   u = 1 - exp(-x),
#   v = 1 - exp(-y).
#
# In this coordinate the conditional CDF can be evaluated entirely in
# log scale, including the extreme upper tail.
# ---------------------------------------------------------------------

@inline function _joe_logh_x(C::Copulas.JoeCopula{2}, x::Real, base::Real,)
    θ, xx, bb = promote(float(_vine_params(C).θ), float(x), float(base),)

    θ >= one(θ) || throw(DomainError(θ, "A Joe copula requires θ ≥ 1.",))

    bb = _clp(bb)

    θ == one(θ) && return LogExpFunctions.log1mexp(-xx)

    α = inv(θ)
    y = -log1p(-bb)

    logA = -θ * xx
    logB = -θ * y
    log1mA = LogExpFunctions.log1mexp(logA)
    log1mB = LogExpFunctions.log1mexp(logB)
    logS = LogExpFunctions.logaddexp(logB, logA + log1mB)

    return log1mA -
           (θ - one(θ)) * y +
           (α - one(θ)) * logS
end

@inline function _joe_hfunc(C::Copulas.JoeCopula{2}, target::Real, base::Real,)
    θ, tt, bb = promote(float(_vine_params(C).θ), float(target), float(base),)

    θ >= one(θ) || throw(DomainError(θ, "A Joe copula requires θ ≥ 1.",))

    tt, bb = _clp(tt), _clp(bb)

    θ == one(θ) && return tt

    x = -log1p(-tt)
    h = exp(_joe_logh_x(C, x, bb))

    isnan(h) && throw(DomainError((target, base, θ), "Stable Joe h-function produced NaN.",))

    return clamp(h, zero(h), one(h),)
end

@inline function _joe_hfuncs(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, uu, vv, x, y, log1mA, log1mB, logS = _joe_terms(C, u, v)

    θ == one(θ) && return uu, vv

    logh1 = _joe_logh1_from_terms(θ, y, log1mA, logS)
    logh2 = _joe_logh2_from_terms(θ, x, log1mB, logS)

    h1 = clamp(exp(logh1), zero(θ), one(θ),)
    h2 = clamp(exp(logh2), zero(θ), one(θ),)

    return h1, h2
end

@inline function hfunc1(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    return _clp(_joe_hfunc(C, _clp(u), _clp(v),),)
end

@inline function hfunc2(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    return _clp(_joe_hfunc(C, _clp(v), _clp(u),),)
end

@inline function _pair_hfuncs(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    h1, h2 = _joe_hfuncs(C, _clp(u), _clp(v),)
    return _clp(h1), _clp(h2)
end

# ---------------------------------------------------------------------
# Fused traversal kernels
# ---------------------------------------------------------------------

@inline function _joe_pair_step(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, uu, vv, x, y, log1mA, log1mB, logS = _joe_terms(C, u, v)

    if θ == one(θ)
        return zero(θ), uu, vv
    end

    logc = _joe_logpdf_from_terms(θ, x, y, log1mA, log1mB, logS)
    h1 = clamp(exp(_joe_logh1_from_terms(θ, y, log1mA, logS)), zero(θ), one(θ),)
    h2 = clamp(exp(_joe_logh2_from_terms(θ, x, log1mB, logS)), zero(θ), one(θ),)

    return logc, h1, h2
end

@inline function _pair_step(C::Copulas.JoeCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1, h2 = _joe_pair_step(C, _clp(u), _clp(v),)
    return logc, _clp(h1), _clp(h2)
end

@inline function _joe_pair_logpdf_h1(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, uu, _, x, y, log1mA, log1mB, logS = _joe_terms(C, u, v)

    if θ == one(θ)
        return zero(θ), uu
    end

    logc = _joe_logpdf_from_terms(θ, x, y, log1mA, log1mB, logS)
    h1 = clamp(exp(_joe_logh1_from_terms(θ, y, log1mA, logS)), zero(θ), one(θ),)

    return logc, h1
end

@inline function _joe_pair_logpdf_h2(C::Copulas.JoeCopula{2}, u::Real, v::Real,)
    θ, _, vv, x, y, log1mA, log1mB, logS = _joe_terms(C, u, v)

    if θ == one(θ)
        return zero(θ), vv
    end

    logc = _joe_logpdf_from_terms(θ, x, y, log1mA, log1mB, logS)
    h2 = clamp(exp(_joe_logh2_from_terms(θ, x, log1mB, logS)), zero(θ), one(θ),)

    return logc, h2
end

@inline function _pair_logpdf_h1(C::Copulas.JoeCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1 = _joe_pair_logpdf_h1(C, _clp(u), _clp(v),)
    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.JoeCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h2 = _joe_pair_logpdf_h2(C, _clp(u), _clp(v),)
    return logc, _clp(h2)
end

# ---------------------------------------------------------------------
# Generalized conditional inverse
# ---------------------------------------------------------------------

@inline _joe_bits(x::Float16) = reinterpret(UInt16, x)
@inline _joe_bits(x::Float32) = reinterpret(UInt32, x)
@inline _joe_bits(x::Float64) = reinterpret(UInt64, x)

@inline _joe_from_bits(::Type{Float16}, x::UInt16) = reinterpret(Float16, x)
@inline _joe_from_bits(::Type{Float32}, x::UInt32) = reinterpret(Float32, x)
@inline _joe_from_bits(::Type{Float64}, x::UInt64) = reinterpret(Float64, x)

# The Joe conditional can become so steep near one that the exact real-valued
# quantile lies strictly between adjacent representable floating-point values.
# Return the smallest representable u such that h(u | base) ≥ q.
@inline function _joe_hinv_ieee(C::Copulas.JoeCopula{2}, logq::Real, base::Real, ::Type{T},) where {T<:Union{Float16,Float32,Float64}}
    ulo = nextfloat(zero(T))
    uhi = prevfloat(one(T))

    lob = _joe_bits(ulo)
    hib = _joe_bits(uhi)
    onebit = one(typeof(lob))

    while hib - lob > onebit
        midb = lob + ((hib - lob) >> 1)
        u = _joe_from_bits(T, midb)
        x = -log1p(-u)

        if _joe_logh_x(C, x, base) < logq
            lob = midb
        else
            hib = midb
        end
    end

    return _joe_from_bits(T, hib)
end

@inline function _joe_hinv(C::Copulas.JoeCopula{2}, q::Real, base::Real,)
    θ, qq, bb = promote(float(_vine_params(C).θ), float(q), float(base),)

    θ >= one(θ) || throw(DomainError(θ, "A Joe copula requires θ ≥ 1.",))

    qq, bb = _clp(qq), _clp(bb)

    θ == one(θ) && return qq

    T = typeof(qq)

    ulo = nextfloat(zero(T))
    uhi = prevfloat(one(T))
    xlo = -log1p(-ulo)
    xhi = -log1p(-uhi)

    logq = log(qq)
    logh_lo = _joe_logh_x(C, xlo, bb)
    logh_hi = _joe_logh_x(C, xhi, bb)

    logq <= logh_lo && return ulo
    logq > logh_hi && return uhi

    if T <: Union{Float16,Float32,Float64}
        return _joe_hinv_ieee(C, logq, bb, T)
    end

    # Generic high-precision fallback. Maintain
    #
    #     h(lo) < q ≤ h(hi),
    #
    # and return the upper bracket, matching the generalized-inverse
    # convention of the exact IEEE search.
    lo, hi = xlo, xhi

    for _ in 1:(precision(T) + 16)
        mid = lo + (hi - lo) / T(2)

        if _joe_logh_x(C, mid, bb) < logq
            lo = mid
        else
            hi = mid
        end

        lo == hi && break
    end

    return _clp(-expm1(-hi))
end

@inline function hinv1(C::Copulas.JoeCopula{2}, q::Real, v::Real,)
    return _clp(_joe_hinv(C, _clp(q), _clp(v),),)
end

@inline function hinv2(C::Copulas.JoeCopula{2}, q::Real, u::Real,)
    return _clp(_joe_hinv(C, _clp(q), _clp(u),),)
end
