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
# Copulas.jl reduces θ = 1 to AMH. The boundary δ = 1 is singular.

@inline function _arch_coordinate(G::Copulas.BB10Generator, u::Real,)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u),)
    T = typeof(uu)

    zero(T) < uu <= one(T) || throw(DomainError(u, "The BB10 probability must belong to (0, 1].",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    isone(uu) && return zero(T)

    # s = log(δ + (1-δ)u^(-θ))
    # evaluated as a log-sum-exp to avoid constructing u^(-θ).
    logδ = iszero(δ) ? -T(Inf) : log(δ)
    logtail = log1p(-δ) - θ * log(uu)

    return LogExpFunctions.logaddexp(logδ, logtail,)
end

@inline function _arch_probability(G::Copulas.BB10Generator, s::Real,)
    θ, δ, ss = promote(float(G.θ), float(G.δ), float(s),)
    T = typeof(ss)

    ss >= zero(T) || throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))

    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    iszero(ss) && return one(T)
    isinf(ss) && return zero(T)

    # log(exp(s)-δ) = s + log(1-δ exp(-s)).
    q = δ * exp(-ss)
    logden = ss + log1p(-q)

    return exp((log1p(-δ) - logden) / θ,)
end

@inline function _arch_logderivative(G::Copulas.BB10Generator, s::Real,)
    θ, δ, ss = promote(float(G.θ), float(G.δ), float(s),)
    T = typeof(ss)

    ss >= zero(T) || throw(DomainError(s, "The BB10 generator coordinate must be non-negative.",))
    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))
    isinf(ss) && return -T(Inf)

    a = inv(θ)
    q = δ * exp(-ss)

    # log|ϕ′(s)| = -log θ + (1/θ)log(1-δ) - s/θ - (1+1/θ)log(1-δ exp(-s)).
    return -log(θ) + a * log1p(-δ) - a * ss - (one(T) + a) * log1p(-q)
end

function _arch_inverse_logderivative(G::Copulas.BB10Generator, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN.",))
    θ, δ = T(G.θ), T(G.δ)
    θ > zero(T) || throw(DomainError(θ, "The BB10 generator requires θ > 0.",))

    zero(T) <= δ < one(T) || throw(DomainError(δ, "The proper BB10 domain requires 0 ≤ δ < 1.",))

    # At s = 0:
    #     |ϕ′(0)| = 1 / [θ(1-δ)].
    maxlm = -log(θ) - log1p(-δ)

    tol = T(64) * eps(T) * max(one(T), abs(maxlm))

    lm == T(Inf) && throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm > maxlm + tol && throw(DomainError(logm, "The target lies outside the range of the BB10 derivative.",))
    lm >= maxlm - tol && return zero(T)
    lm == -T(Inf) && return T(Inf)

    # When δ = 0:
    #     ϕ(s) = exp(-s/θ),
    #     log|ϕ′(s)| = -log θ - s/θ.
    if iszero(δ) return max(-θ * (lm + log(θ)), zero(T),) end

    # Solve in z = log(s), converting the constrained domain s ≥ 0
    # into an unconstrained real coordinate.
    function f(z)
        s = exp(z)
        return _arch_logderivative(G, s) - lm
    end

    function df(z)
        z == -T(Inf) && return zero(T)
        z == T(Inf) && return -T(Inf)

        s = exp(z)
        isinf(s) && return -T(Inf)

        a = inv(θ)
        q = δ * exp(-s)

        # d/ds log|ϕ′(s)| =
        #   -1/θ - (1+1/θ) q/(1-q).
        dlogm_ds = -a - (one(T) + a) * q / (one(T) - q)
        return s * dlogm_ds
    end
    z = _solve_decreasing_root(f, df, zero(T),)
    return exp(z)
end