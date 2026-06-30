# ---------------------------------------------------------------------
# BB7Copula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.BB7Generator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

# =====================================================================
# BB7
# =====================================================================

# BB7 uses the shared coordinate
#
#     L = log(1+s).
#
# For a genuine BB7 generator θ > 1 because θ = 1 is reduced to Clayton
# by the Copulas.jl constructor.

@inline function _arch_coordinate(G::Copulas.BB7Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))

    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB7 probability must belong to (0, 1].",))
    isone(uu) && return zero(uu)

    # L = -δ log(1 - (1-u)^θ)
    return -δ * LogExpFunctions.log1mexp(θ * log1p(-uu),)
end

@inline function _arch_probability(G::Copulas.BB7Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return one(LL)
    isinf(LL) && return zero(LL)

    # H = 1 - exp(-L/δ)
    logH = LogExpFunctions.log1mexp(-LL / δ)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(G::Copulas.BB7Generator,L::Real,)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    T = typeof(LL)

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return T(Inf)
    isinf(LL) && return -T(Inf)

    a = inv(θ)
    x = log(LL) - log(δ)
    logH = _log1mexp_negexp(x)

    # log|ϕ′(s)| = -log θ - log δ + (1/θ - 1) log(1 - exp(-L/δ)) - (1 + 1/δ)L.
    return -log(θ) - log(δ) + (a - one(T)) * logH - (one(T) + inv(δ)) * LL
end

function _arch_inverse_logderivative(G::Copulas.BB7Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(G.θ), T(G.δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB7 generator requires θ > 1; θ = 1 reduces to Clayton.",))

    δ > zero(T) || throw(DomainError(δ, "The BB7 generator requires δ > 0.",))

    a = inv(θ)
    logprefactor = -log(θ) - log(δ)

    # Solve in x = log(L/δ). In this coordinate,
    #   L = δ exp(x)
    # and log|ϕ′| is smooth and strictly decreasing.
    function f(x)
        r = exp(x)
        logH = _log1mexp_negexp(x)

        return logprefactor + (a - one(T)) * logH - (δ + one(T)) * r - lm
    end

    function df(x)
        x == -T(Inf) && return a - one(T)
        x == T(Inf) && return -T(Inf)

        r = exp(x)
        isinf(r) && return -T(Inf)

        logH = _log1mexp_negexp(x)

        # d/dx log(1-exp(-exp(x)))
        ratio = exp(x - r - logH)

        return (a - one(T)) * ratio - (δ + one(T)) * r
    end

    x = _solve_decreasing_root(f, df, zero(T))

    # Return L, the coordinate expected by the shared protocol.
    return δ * exp(x)
end