# ---------------------------------------------------------------------
# Gumbel pair-copula density fast path
# ---------------------------------------------------------------------

@inline function _arch_pair_logpdf(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    x = -log(uu)
    y = -log(vv)
    lx = log(x)
    ly = log(y)
    S = exp(θ * lx) + exp(θ * ly)
    A = exp(log(S) / θ)
    return -A - log(uu) - log(vv) +
           (θ - one(θ)) * (lx + ly) +
           (inv(θ) - 2) * log(S) +
           log(A + θ - one(θ))
end

# =====================================================================
# Gumbel
# =====================================================================

@inline function _inv_ϕ¹(G::Copulas.GumbelGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Gumbel"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)

    b = θ - one(T)
    b > zero(T) || throw(DomainError(θ, "A genuine Gumbel generator requires θ > 1."))
    logz = -log(θ * m) / b - log(b)
    return exp(θ * (log(b) + _log_lambertw_exp(logz)))
end