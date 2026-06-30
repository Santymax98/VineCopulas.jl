# ---------------------------------------------------------------------
# BB1Copula pair-copula density hook
# ---------------------------------------------------------------------
# This family currently uses the Archimedean generator formula implemented in
# _arch_pair_logpdf_generic. The separate method is intentional: it gives this
# rvinecopulib-compatible family a stable place for a closed-form density
# implementation without touching the vine engines.

@inline _arch_pair_logpdf(G::Copulas.BB1Generator, u::Real, v::Real) = _arch_pair_logpdf_generic(G, u, v)

# =====================================================================
# BB1
# =====================================================================

# BB1 has no useful closed-form inverse of ϕ'. It is solved numerically in
# z = log(s), where log|ϕ'| is smooth and strictly decreasing. The same stable
# coordinate protocol is shared with BB2 and future BB implementations.
@inline function _arch_coordinate(G::Copulas.BB1Generator, u::Real)
    θ, δ, uu = promote(float(G.θ), float(G.δ), float(u))
    return δ * LogExpFunctions.logexpm1(-θ * log(uu))
end

@inline function _arch_probability(G::Copulas.BB1Generator, z::Real)
    θ, δ, zz = promote(float(G.θ), float(G.δ), float(z))
    return exp(-LogExpFunctions.log1pexp(zz / δ) / θ)
end

@inline function _arch_logderivative(G::Copulas.BB1Generator, z::Real)
    θ, δ, zz = promote(float(G.θ), float(G.δ), float(z))
    a, b = inv(δ), inv(θ)
    return log(a) + log(b) + (a - one(zz)) * zz - (b + one(zz)) * LogExpFunctions.log1pexp(a * zz)
end

function _arch_inverse_logderivative(G::Copulas.BB1Generator, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(G.θ), T(G.δ)
    θ > zero(T) || throw(DomainError(θ, "The BB1 generator requires θ > 0."))
    δ > one(T) || throw(DomainError(δ, "A genuine BB1 generator requires δ > 1; δ = 1 reduces to Clayton."))

    a, b = inv(δ), inv(θ)
    logab = log(a) + log(b)
    f(z) = logab + (a - one(T)) * z - (b + one(T)) * LogExpFunctions.log1pexp(a * z) - lm
    df(z) = (a - one(T)) - a * (b + one(T)) * LogExpFunctions.logistic(a * z)
    return _solve_decreasing_root(f, df, zero(T))
end

@inline _arch_combine(::Copulas.BB1Generator, a::Real, b::Real) = LogExpFunctions.logaddexp(a, b)
@inline function _arch_difference(::Copulas.BB1Generator, total::Real, base::Real)
    total >= base || throw(DomainError((total, base), "Expected total ≥ base."))
    total == base && return oftype(total - base, -Inf)
    return LogExpFunctions.logsubexp(total, base)
end
@inline _arch_hfunc(G::Copulas.BB1Generator, target::Real, base::Real) = _arch_hfunc_coordinate(G, target, base)
@inline _arch_hinv(G::Copulas.BB1Generator, q::Real, base::Real) = _arch_hinv_coordinate(G, q, base)

function _inv_ϕ¹(G::Copulas.BB1Generator, y::Real)
    m = _negative_derivative_magnitude(y, "BB1")
    T = typeof(m)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)
    return exp(_arch_inverse_logderivative(G, log(m)))
end