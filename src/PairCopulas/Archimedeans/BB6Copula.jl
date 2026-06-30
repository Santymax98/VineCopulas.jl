# ---------------------------------------------------------------------
# BB6Copula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.BB6Generator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

# =====================================================================
# BB6
# =====================================================================

# BB6 is represented in the transformed coordinate
#
#     x = log(s^(1/δ)) = log(r),
#
# where r = s^(1/δ). In this coordinate, log|ϕ′| is smooth and strictly
# decreasing for every genuine BB6 generator (θ > 1 and δ > 1).

@inline function _arch_coordinate(G::Copulas.BB6Generator, u::Real)
    θ, uu = promote(float(G.θ), float(u))

    # logw = log((1-u)^θ)
    logw = θ * log1p(-uu)

    # x = log(-log(1 - (1-u)^θ))
    return _log_neglog1mexp(logw)
end

@inline function _arch_probability(G::Copulas.BB6Generator, x::Real)
    θ, xx = promote(float(G.θ), float(x))

    # logH = log(1 - exp(-exp(x)))
    logH = _log1mexp_negexp(xx)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(G::Copulas.BB6Generator, x::Real,)
    θ, δ, xx = promote(float(G.θ), float(G.δ), float(x))
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

function _arch_inverse_logderivative(G::Copulas.BB6Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(G.θ), T(G.δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB6 generator requires θ > 1; θ = 1 reduces to Gumbel.",))
    δ > one(T) || throw(DomainError(δ, "A genuine BB6 generator requires δ > 1; δ = 1 reduces to Joe.",))

    a = inv(θ)

    f(x) = _arch_logderivative(G, x) - lm

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
@inline function _arch_combine(G::Copulas.BB6Generator, a::Real, b::Real,)
    δ, aa, bb = promote(float(G.δ), float(a), float(b))
    return LogExpFunctions.logaddexp(δ * aa, δ * bb) / δ
end

# Recover one summand from s_total - s_base in the same transformed
# coordinate. A microscopic order reversal is interpreted as a zero summand,
# analogously to the saturated conditional-probability handling for BB2.
@inline function _arch_difference(G::Copulas.BB6Generator, total::Real, base::Real,)
    δ, tt, bb = promote(float(G.δ), float(total), float(base))
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

@inline _arch_hfunc(G::Copulas.BB6Generator, target::Real, base::Real,) = _arch_hfunc_coordinate(G, target, base)

@inline _arch_hinv(G::Copulas.BB6Generator, q::Real, base::Real,) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB6Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB6")
    T = typeof(m)

    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    x = _arch_inverse_logderivative(G, log(m))
    δ, xx = promote(float(G.δ), x)

    # s = exp(δx)
    return exp(δ * xx)
end