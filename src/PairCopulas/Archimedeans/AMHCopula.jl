# =====================================================================
# AMH
# =====================================================================

@inline function _inv_ϕ¹(G::Copulas.AMHGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "AMH"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    isinf(m) && throw(DomainError(y, "The target lies outside the range of the AMH derivative."))
    θ < one(T) || throw(DomainError(θ, "The AMH generator requires θ < 1."))

    mmax = inv(one(T) - θ)
    tol = 64eps(T) * max(one(T), mmax)
    m > mmax + tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    m >= mmax - tol && return zero(T)

    B = 2m * θ + one(T) - θ
    D = max(B * B - 4m * m * θ * θ, zero(T))
    return max(log((B + sqrt(D)) / (2m)), zero(T))
end