# ---------------------------------------------------------------------
# Gumbel pair-copula fused fast path
# ---------------------------------------------------------------------

@inline function _gumbel_terms(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    θ >= one(θ) || throw(DomainError(θ, "A Gumbel generator requires θ ≥ 1."))
    uu, vv = _clp(uu), _clp(vv)
    x = -log(uu)
    y = -log(vv)
    lx = log(x)
    ly = log(y)
    logS = LogExpFunctions.logaddexp(θ * lx, θ * ly)
    A = exp(logS / θ)
    return θ, uu, vv, lx, ly, logS, A
end

@inline function _gumbel_logpdf(
    θ::Real, u::Real, v::Real, lx::Real, ly::Real, logS::Real, A::Real,
)
    return -A - log(u) - log(v) +
           (θ - one(θ)) * (lx + ly) +
           (inv(θ) - 2) * logS +
           log(A + θ - one(θ))
end

@inline function _gumbel_h1(
    θ::Real, v::Real, ly::Real, logS::Real, A::Real,
)
    logh = -A - log(v) + (θ - one(θ)) * ly + (inv(θ) - one(θ)) * logS
    return clamp(exp(logh), zero(θ), one(θ))
end

@inline function _gumbel_h2(
    θ::Real, u::Real, lx::Real, logS::Real, A::Real,
)
    logh = -A - log(u) + (θ - one(θ)) * lx + (inv(θ) - one(θ)) * logS
    return clamp(exp(logh), zero(θ), one(θ))
end

@inline function _arch_pair_logpdf(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(G, u, v)
    return _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
end

@inline function _arch_hfunc(G::Copulas.GumbelGenerator, target::Real, base::Real)
    θ, _, bb, _, lb, logS, A = _gumbel_terms(G, target, base)
    return _gumbel_h1(θ, bb, lb, logS, A)
end

@inline function _arch_hfuncs(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(G, u, v)
    return _gumbel_h1(θ, vv, ly, logS, A), _gumbel_h2(θ, uu, lx, logS, A)
end

@inline function _arch_pair_step(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(G, u, v)
    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    h1 = _gumbel_h1(θ, vv, ly, logS, A)
    h2 = _gumbel_h2(θ, uu, lx, logS, A)
    return logc, h1, h2
end

@inline function _arch_pair_logpdf_h1(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(G, u, v)
    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    return logc, _gumbel_h1(θ, vv, ly, logS, A)
end

@inline function _arch_pair_logpdf_h2(G::Copulas.GumbelGenerator, u::Real, v::Real)
    θ, uu, vv, lx, ly, logS, A = _gumbel_terms(G, u, v)
    logc = _gumbel_logpdf(θ, uu, vv, lx, ly, logS, A)
    return logc, _gumbel_h2(θ, uu, lx, logS, A)
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
