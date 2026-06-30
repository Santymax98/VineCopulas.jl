# ---------------------------------------------------------------------
# BB8Copula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.BB8Generator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

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

@inline function _arch_coordinate(G::Copulas.BB8Generator, u::Real)
    ϑ, δ, uu = promote(float(G.ϑ), float(G.δ), float(u))

    zero(uu) < uu <= one(uu) ||
        throw(DomainError(u, "The BB8 probability must belong to (0, 1].",))

    isone(uu) && return zero(uu)

    # η = 1 - (1-δ)^ϑ
    logη = log(-expm1(ϑ * log1p(-δ)))

    # numerator = 1 - (1-δu)^ϑ
    lognumerator = log(-expm1(ϑ * log1p(-δ * uu)),)

    # s = -log(numerator / η)
    return logη - lognumerator
end

@inline function _arch_probability(G::Copulas.BB8Generator, s::Real)
    ϑ, δ, ss = promote(float(G.ϑ), float(G.δ), float(s))

    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))

    iszero(ss) && return one(ss)
    isinf(ss) && return zero(ss)

    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)

    # ϕ(s) = [1 - (1-q)^(1/ϑ)] / δ
    return -expm1(log1p(-q) / ϑ) / δ
end

@inline function _arch_logderivative(G::Copulas.BB8Generator, s::Real,)
    ϑ, δ, ss = promote(float(G.ϑ), float(G.δ), float(s))
    T = typeof(ss)

    ss >= zero(ss) || throw(DomainError(s, "The BB8 generator coordinate must be non-negative.",))
    isinf(ss) && return -T(Inf)

    η = -expm1(ϑ * log1p(-δ))
    q = η * exp(-ss)
    a = inv(ϑ)

    # log|ϕ′(s)| =
    #   log η - log δ - log ϑ
    #   - s
    #   + (1/ϑ - 1)log(1 - ηe^(-s)).
    return log(η) - log(δ) - log(ϑ) - ss + (a - one(T)) * log1p(-q)
end

function _arch_inverse_logderivative(G::Copulas.BB8Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    ϑ, δ = T(G.ϑ), T(G.δ)

    ϑ >= one(T) || throw(DomainError(ϑ, "The BB8 generator requires ϑ ≥ 1.",))

    zero(T) < δ < one(T) || throw(DomainError(δ, "A genuine BB8 generator requires 0 < δ < 1; δ = 1 reduces to Joe.",))

    maxlm = _arch_logderivative(G, zero(T))
    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    # Unlike BB1, BB3, BB6 and BB7, BB8 has a finite derivative
    # magnitude at s = 0.
    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))

    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB8 derivative.",))

    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)

    # For ϑ = 1, BB8 reduces to the independence generator:
    #
    #     ϕ(s) = exp(-s),  log|ϕ′(s)| = -s.
    if ϑ == one(T)
        return -lm
    end

    # Solve in z = log(s), so the constrained coordinate s ≥ 0
    # becomes an unconstrained real variable.
    function f(z)
        s = exp(z)
        return _arch_logderivative(G, s) - lm
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
@inline _arch_combine(::Copulas.BB8Generator, a::Real, b::Real,) = a + b

@inline function _arch_difference(::Copulas.BB8Generator, total::Real, base::Real,)
    tt, bb = promote(float(total), float(base))
    T = typeof(tt)

    if tt < bb
        tol = T(8) * eps(T) * max(abs(tt), abs(bb), one(T))
        bb - tt <= tol || throw(DomainError((total, base), "Expected total ≥ base in the BB8 coordinate.",))
        return zero(T)
    end

    return tt - bb
end

@inline _arch_hfunc(G::Copulas.BB8Generator, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base)

@inline _arch_hinv(G::Copulas.BB8Generator, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB8Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB8")
    T = typeof(m)

    iszero(m) && return T(Inf)

    # Do not map m = Inf to zero automatically: BB8 has a finite
    # derivative magnitude at s = 0, so Inf is outside its range.
    return _arch_inverse_logderivative(G, log(m))
end
