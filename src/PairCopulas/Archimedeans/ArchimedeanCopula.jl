# =====================================================================
# Generic bivariate Archimedean pair-copula support
# =====================================================================
#
# VineCopulas owns pair-copula composition and traversal, while Copulas.jl
# owns the mathematical definitions of individual copula families.
#
# Known Archimedean families provide specialized C-level kernels in their
# family files.  The generic fallback below depends only on public Copulas.jl
# APIs:
#
#     Distributions.logpdf
#     Copulas.condition
#     Distributions.cdf
#     Distributions.quantile
#
# In particular, VineCopulas does not inspect the generator stored inside an
# ArchimedeanCopula and does not call generator-level Copulas.jl internals.
# =====================================================================


# ---------------------------------------------------------------------
# Public generic fallback
# ---------------------------------------------------------------------

@inline function _pair_logpdf(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    uu, vv = _clp(u), _clp(v)

    buf[1] = uu
    buf[2] = vv

    return Distributions.logpdf(C, buf)
end

@inline function hfunc1(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
)
    uu, vv = _clp(u), _clp(v)
    D = Copulas.condition(C, 2, vv)

    return _clp(Distributions.cdf(D, uu))
end

@inline function hfunc2(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
)
    uu, vv = _clp(u), _clp(v)
    D = Copulas.condition(C, 1, uu)

    return _clp(Distributions.cdf(D, vv))
end

@inline hfunc1(
    C::Copulas.ArchimedeanCopula{2},
    uv::Tuple{<:Real,<:Real},
) = hfunc1(C, uv[1], uv[2])

@inline hfunc2(
    C::Copulas.ArchimedeanCopula{2},
    uv::Tuple{<:Real,<:Real},
) = hfunc2(C, uv[1], uv[2])

@inline function hinv1(
    C::Copulas.ArchimedeanCopula{2},
    q::Real,
    v::Real,
)
    qq, vv = _clp(q), _clp(v)
    D = Copulas.condition(C, 2, vv)

    return _clp(Distributions.quantile(D, qq))
end

@inline function hinv2(
    C::Copulas.ArchimedeanCopula{2},
    q::Real,
    u::Real,
)
    qq, uu = _clp(q), _clp(u)
    D = Copulas.condition(C, 1, uu)

    return _clp(Distributions.quantile(D, qq))
end

@inline function _pair_hfuncs(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
)
    uu, vv = _clp(u), _clp(v)

    return hfunc1(C, uu, vv), hfunc2(C, uu, vv)
end

@inline function _pair_step(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    uu, vv = _clp(u), _clp(v)

    logc = _pair_logpdf(C, uu, vv, buf)
    h1, h2 = _pair_hfuncs(C, uu, vv)

    return logc, _clp(h1), _clp(h2)
end

@inline function _pair_logpdf_h1(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    uu, vv = _clp(u), _clp(v)

    logc = _pair_logpdf(C, uu, vv, buf)
    h1 = hfunc1(C, uu, vv)

    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(
    C::Copulas.ArchimedeanCopula{2},
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    uu, vv = _clp(u), _clp(v)

    logc = _pair_logpdf(C, uu, vv, buf)
    h2 = hfunc2(C, uu, vv)

    return logc, _clp(h2)
end


# =====================================================================
# Shared C-level coordinate protocol
# =====================================================================
#
# Several BB families use transformed coordinates in which the conditional
# CDF and its inverse can be evaluated stably:
#
#     c(u)                  = _arch_coordinate(C, u)
#     u(c)                  = _arch_probability(C, c)
#     log|ϕ'(c)|            = _arch_logderivative(C, c)
#     c(log|ϕ'|)            = _arch_inverse_logderivative(C, logm)
#     c(u ⊕ v)              = _arch_combine(C, cu, cv)
#     c(total ⊖ base)       = _arch_difference(C, total, base)
#
# These are VineCopulas-owned numerical coordinates.  They operate on the
# public copula object itself and do not expose or depend on Copulas.jl
# generator internals.
# =====================================================================

@inline function _arch_hfunc_coordinate(
    C,
    target::Real,
    base::Real,
)
    ct = _arch_coordinate(C, target)
    cb = _arch_coordinate(C, base)
    ctotal = _arch_combine(C, ct, cb)

    return exp(
        _arch_logderivative(C, ctotal) -
        _arch_logderivative(C, cb),
    )
end

@inline function _arch_hinv_coordinate(
    C,
    q::Real,
    base::Real,
)
    cb = _arch_coordinate(C, base)

    ctotal = _arch_inverse_logderivative(
        C,
        log(float(q)) + _arch_logderivative(C, cb),
    )

    return _arch_probability(
        C,
        _arch_difference(C, ctotal, cb),
    )
end


# ---------------------------------------------------------------------
# Shared fused hooks for C-level family kernels
# ---------------------------------------------------------------------

@inline function _arch_hfuncs(C, u::Real, v::Real)
    return _arch_hfunc(C, u, v), _arch_hfunc(C, v, u)
end

@inline function _arch_pair_step(C, u::Real, v::Real)
    logc = _arch_pair_logpdf(C, u, v)
    h1, h2 = _arch_hfuncs(C, u, v)

    return logc, h1, h2
end

@inline function _arch_pair_logpdf_h1(C, u::Real, v::Real)
    return _arch_pair_logpdf(C, u, v), _arch_hfunc(C, u, v)
end

@inline function _arch_pair_logpdf_h2(C, u::Real, v::Real)
    return _arch_pair_logpdf(C, u, v), _arch_hfunc(C, v, u)
end


# =====================================================================
# Shared monotone scalar solver
# =====================================================================

# Safeguarded Newton solver for strictly decreasing scalar equations.
#
# This is a VineCopulas numerical primitive used by BB-family C-level
# derivative inversions.  It is intentionally independent of any Copulas.jl
# generator representation.
function _solve_decreasing_root(f, df, x0::T) where {T<:AbstractFloat}
    lo, hi = x0 - one(T), x0 + one(T)
    flo, fhi = f(lo), f(hi)

    for _ in 1:128
        flo >= zero(T) && break

        hi, fhi = lo, flo
        lo = 2lo - one(T)
        flo = f(lo)
    end

    for _ in 1:128
        fhi <= zero(T) && break

        lo, flo = hi, fhi
        hi = 2hi + one(T)
        fhi = f(hi)
    end

    flo >= zero(T) >= fhi ||
        throw(DomainError(
            x0,
            "Could not bracket the monotone inverse.",
        ))

    x = clamp(x0, lo, hi)

    for _ in 1:64
        fx = f(x)
        candidate = x - fx / df(x)

        abs(candidate - x) <=
            T(16) * eps(T) * max(one(T), abs(candidate)) &&
            return candidate

        if !isfinite(candidate) || !(lo < candidate < hi)
            candidate = lo + (hi - lo) / 2
        end

        fc = f(candidate)

        if fc > zero(T)
            lo = candidate
        else
            hi = candidate
        end

        abs(hi - lo) <=
            T(16) * eps(T) * max(one(T), abs(candidate)) &&
            return candidate

        x = candidate
    end

    return x
end
