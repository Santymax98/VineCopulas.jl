# =====================================================================
# Gumbel-Barnett
# =====================================================================

function _inv_ϕ¹(G::Copulas.GumbelBarnettGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Gumbel-Barnett"))
    T = typeof(θ)
    θ > zero(T) || throw(DomainError(θ, "A Gumbel-Barnett generator requires θ > 0."))
    iszero(m) && return T(Inf)
    isinf(m) && throw(DomainError(y, "The target lies outside the range of the generator derivative."))

    mmax = inv(θ)
    tol = 64eps(T) * max(one(T), mmax)
    m > mmax + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    m >= mmax - tol && return zero(T)

    x = _neg_lambertwm1_expneg(inv(θ) - log(m))
    return max(log(θ * x), zero(T))
end