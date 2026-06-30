# ---------------------------------------------------------------------
# Frank pair-copula density fast path
# ---------------------------------------------------------------------

@inline function _arch_pair_logpdf(G::Copulas.FrankGenerator, u::Real, v::Real)
    θ, uu, vv = promote(float(G.θ), float(u), float(v))
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ)
    A = -expm1(-θ)
    Bu = -expm1(-θ * uu)
    Bv = -expm1(-θ * vv)
    D = A - Bu * Bv
    return log(abs(θ)) + log(abs(A)) - θ * (uu + vv) - 2 * log(abs(D))
end

# =====================================================================
# Frank
# =====================================================================

function _inv_ϕ¹(G::Copulas.FrankGenerator, y::Real)
    θ, m = promote(float(G.θ), _negative_derivative_magnitude(y, "Frank"))
    T = typeof(θ)
    iszero(m) && return T(Inf)
    iszero(θ) && throw(DomainError(θ, "A genuine Frank generator requires θ ≠ 0."))

    y0 = -expm1(θ) / θ
    if isinf(m)
        y0 == -Inf && return zero(T)
        throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    end

    tol = 64eps(T) * max(one(T), abs(y0))
    y < y0 - tol && throw(DomainError(y, "The target lies outside the range [ϕ'(0), 0)."))
    y <= y0 + tol && return zero(T)

    denominator = one(T) - θ * y
    denominator > zero(T) || throw(DomainError(y, "The target lies outside the range of the Frank derivative."))
    logabs_expm1 = θ > zero(T) ? LogExpFunctions.log1mexp(-θ) : LogExpFunctions.logexpm1(-θ)
    logx = log(abs(θ)) + log(m) - logabs_expm1 - log(denominator)
    return max(-logx, zero(T))
end
