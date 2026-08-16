# ---------------------------------------------------------------------
# JoeCopula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.JoeGenerator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

# ---------------------------------------------------------------------
# Stable Joe conditionals
# ---------------------------------------------------------------------
# Write u = 1-exp(-x), v = 1-exp(-y). In this coordinate the Joe
# conditional CDF can be evaluated entirely in log scale, avoiding the
# q*ϕ'(s_base) product that over/underflows in extreme tails.
@inline function _joe_logh_x(G::Copulas.JoeGenerator, x::Real, base::Real)
    θ, xx, bb = promote(float(G.θ), float(x), float(base))
    θ >= one(θ) || throw(DomainError(θ, "A Joe generator requires θ ≥ 1."))
    bb = _clp(bb)

    θ == one(θ) && return LogExpFunctions.log1mexp(-xx)

    α = inv(θ)
    y = -log1p(-bb)
    logA = -θ * xx
    logB = -θ * y
    log1mA = LogExpFunctions.log1mexp(logA)
    log1mB = LogExpFunctions.log1mexp(logB)
    logS = LogExpFunctions.logaddexp(logB, logA + log1mB)

    return log1mA - (θ - one(θ)) * y + (α - one(θ)) * logS
end

@inline function _arch_hfunc(G::Copulas.JoeGenerator, target::Real, base::Real)
    θ, tt, bb = promote(float(G.θ), float(target), float(base))
    θ >= one(θ) || throw(DomainError(θ, "A Joe generator requires θ ≥ 1."))
    tt, bb = _clp(tt), _clp(bb)
    θ == one(θ) && return tt

    x = -log1p(-tt)
    h = exp(_joe_logh_x(G, x, bb))
    isnan(h) && throw(DomainError((target, base, θ), "Stable Joe h-function produced NaN."))
    return clamp(h, zero(h), one(h))
end

@inline _joe_bits(x::Float16) = reinterpret(UInt16, x)
@inline _joe_bits(x::Float32) = reinterpret(UInt32, x)
@inline _joe_bits(x::Float64) = reinterpret(UInt64, x)
@inline _joe_from_bits(::Type{Float16}, x::UInt16) = reinterpret(Float16, x)
@inline _joe_from_bits(::Type{Float32}, x::UInt32) = reinterpret(Float32, x)
@inline _joe_from_bits(::Type{Float64}, x::UInt64) = reinterpret(Float64, x)

# Generalized inverse on the IEEE positive floating-point lattice.  The Joe
# conditional can become so steep near one that the exact real-valued quantile
# lies strictly between adjacent representable values.  Returning the smallest
# representable u with h(u | base) >= q gives deterministic quantile semantics
# instead of pretending that an impossible round-trip can be achieved.
@inline function _joe_hinv_ieee(
    G::Copulas.JoeGenerator,
    logq::Real,
    base::Real,
    ::Type{T},
) where {T<:Union{Float16,Float32,Float64}}
    ulo = nextfloat(zero(T))
    uhi = prevfloat(one(T))
    lob = _joe_bits(ulo)
    hib = _joe_bits(uhi)
    onebit = one(typeof(lob))

    while hib - lob > onebit
        midb = lob + ((hib - lob) >> 1)
        u = _joe_from_bits(T, midb)
        x = -log1p(-u)
        if _joe_logh_x(G, x, base) < logq
            lob = midb
        else
            hib = midb
        end
    end
    return _joe_from_bits(T, hib)
end

@inline function _arch_hinv(G::Copulas.JoeGenerator, q::Real, base::Real)
    θ, qq, bb = promote(float(G.θ), float(q), float(base))
    θ >= one(θ) || throw(DomainError(θ, "A Joe generator requires θ ≥ 1."))
    qq, bb = _clp(qq), _clp(bb)
    θ == one(θ) && return qq

    T = typeof(qq)
    ulo = nextfloat(zero(T))
    uhi = prevfloat(one(T))
    xlo = -log1p(-ulo)
    xhi = -log1p(-uhi)

    logq = log(qq)
    logh_lo = _joe_logh_x(G, xlo, bb)
    logh_hi = _joe_logh_x(G, xhi, bb)

    # The exact inverse may lie outside the representable interior of T.
    logq <= logh_lo && return ulo
    logq > logh_hi && return uhi

    if T <: Union{Float16,Float32,Float64}
        return _joe_hinv_ieee(G, logq, bb, T)
    end

    # Generic high-precision fallback (e.g. BigFloat): maintain the invariant
    # h(lo) < q <= h(hi), and return the upper bracket.  This is the same
    # generalized-inverse convention as the exact IEEE search above.
    lo, hi = xlo, xhi
    for _ in 1:(precision(T) + 16)
        mid = lo + (hi - lo) / T(2)
        if _joe_logh_x(G, mid, bb) < logq
            lo = mid
        else
            hi = mid
        end
        lo == hi && break
    end
    return _clp(-expm1(-hi))
end

# =====================================================================
# Joe
# =====================================================================

function _inv_ϕ¹(G::Copulas.JoeGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Joe"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    α, logm = inv(θ), log(m)
    logα = log(α)
    equation(z) = logα - LogExpFunctions.log1pexp(z) - (α - one(T)) * LogExpFunctions.log1pexp(-z) - logm

    z = logm >= logα ? (logm - logα) / (α - one(T)) : logα - logm
    isfinite(z) || return z < zero(T) ? zero(T) : T(Inf)

    lo, hi = min(z, -one(T)), max(z, one(T))
    flo, fhi = equation(lo), equation(hi)
    for _ in 1:64
        flo >= zero(T) && break
        lo = 2lo - one(T)
        flo = equation(lo)
    end
    for _ in 1:64
        fhi <= zero(T) && break
        hi = 2hi + one(T)
        fhi = equation(hi)
    end

    z = clamp(z, lo, hi)
    for _ in 1:20
        fz = equation(z)
        abs(fz) <= 16eps(T) * (one(T) + abs(logm)) && break
        candidate = z - fz / (α - one(T) - α * LogExpFunctions.logistic(z))
        (!isfinite(candidate) || !(lo < candidate < hi)) && (candidate = lo + (hi - lo) / 2)
        if equation(candidate) > zero(T)
            lo = candidate
        else
            hi = candidate
        end
        z = candidate
    end
    return LogExpFunctions.log1pexp(z)
end
