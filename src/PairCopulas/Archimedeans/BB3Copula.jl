# =====================================================================
# BB3
# =====================================================================

# BB3 is evaluated in the shared coordinate L = log(1+s). Its derivative
# inversion has no useful general closed form, but log|ϕ′| is strictly
# decreasing in z = log(L/δ), so the common safeguarded Newton solver applies.
@inline function _arch_coordinate(G::Copulas.BB3Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    x = -log(uu)
    iszero(x) && return zero(x)
    return δ * exp(θ * log(x))
end

@inline function _arch_probability(G::Copulas.BB3Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    iszero(LL) && return one(LL)
    return exp(-exp((log(LL) - log(δ)) / θ))
end

@inline function _arch_logderivative(G::Copulas.BB3Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    isinf(LL) && return -oftype(LL, Inf)

    if iszero(LL)
        return θ == one(θ) ? -log(δ) : oftype(LL, Inf)
    end

    p = inv(θ)
    z = log(LL) - log(δ)
    return -log(θ) - log(δ) + (p - one(p)) * z - LL - exp(p * z)
end

function _arch_inverse_logderivative(G::Copulas.BB3Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)

    θ, δ = T(G.θ), T(G.δ)
    θ >= one(T) || throw(DomainError(θ, "The BB3 generator requires θ ≥ 1."))
    δ > zero(T) || throw(DomainError(δ, "The BB3 generator requires δ > 0."))

    # When θ = 1, |ϕ′(0)| = 1/δ is finite and the equation is linear in L.
    if θ == one(T)
        maxlm = -log(δ)
        lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB3 derivative."))

        tol = T(64) * eps(T) * max(one(T), abs(maxlm))
        lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB3 derivative."))
        lm >= maxlm - tol && return zero(T)
        return δ * (maxlm - lm) / (δ + one(T))
    end

    lm == T(Inf) && return zero(T)

    p = inv(θ)
    logprefactor = -log(θ) - log(δ)
    f(z) = logprefactor + (p - one(T)) * z - δ * exp(z) - exp(p * z) - lm
    df(z) = (p - one(T)) - δ * exp(z) - p * exp(p * z)

    z = _solve_decreasing_root(f, df, zero(T))
    return δ * exp(z)
end