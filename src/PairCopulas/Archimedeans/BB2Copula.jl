# =====================================================================
# BB2
# =====================================================================

# BB2 is evaluated in L = log(1+s). It implements a small reusable protocol:
# probability ↔ stable coordinate and log|ϕ'| ↔ stable coordinate. Future BB
# families can add methods to the same protocol instead of introducing new
# family-named helper APIs.

@inline function _arch_coordinate(G::Copulas.BB2Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    return δ * expm1(-θ * log(uu))
end

@inline function _arch_probability(G::Copulas.BB2Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    return exp(-log1p(LL / δ) / θ)
end

@inline function _arch_logderivative(G::Copulas.BB2Generator, L::Real)
    θ, δ, LL = promote(float(G.θ), float(G.δ), float(L))
    return -log(θ) - log(δ) - LL - (one(LL) + inv(θ)) * log1p(LL / δ)
end

function _arch_inverse_logderivative(G::Copulas.BB2Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(G.θ), T(G.δ)
    a = one(T) + inv(θ)
    logv = -log(a) + (δ + (a - one(T)) * log(δ) - log(θ) - lm) / a
    return max(a * exp(_log_lambertw_exp(logv)) - δ, zero(T))
end
