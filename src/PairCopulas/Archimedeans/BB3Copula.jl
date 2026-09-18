# =====================================================================
# BB3
# =====================================================================

# BB3 is evaluated in the shared coordinate L = log(1+s). Its derivative
# inversion has no useful general closed form, but log|ϕ′| is strictly
# decreasing in z = log(L/δ), so the common safeguarded Newton solver applies.
@inline function _arch_coordinate(C::Copulas.BB3Copula{2}, u::Real)
    θ, δ, uu = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(u))
    x = -log(uu)
    iszero(x) && return zero(x)
    return δ * exp(θ * log(x))
end

@inline function _arch_probability(C::Copulas.BB3Copula{2}, L::Real)
    θ, δ, LL = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    iszero(LL) && return one(LL)
    return exp(-exp((log(LL) - log(δ)) / θ))
end

@inline function _arch_logderivative(C::Copulas.BB3Copula{2}, L::Real)
    θ, δ, LL = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(L))
    LL >= zero(LL) || throw(DomainError(L, "The BB3 coordinate must be non-negative."))
    isinf(LL) && return -oftype(LL, Inf)

    if iszero(LL)
        return θ == one(θ) ? -log(δ) : oftype(LL, Inf)
    end

    p = inv(θ)
    z = log(LL) - log(δ)
    return -log(θ) - log(δ) + (p - one(p)) * z - LL - exp(p * z)
end

function _arch_inverse_logderivative(C::Copulas.BB3Copula{2}, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)

    θ, δ = T(Distributions.params(C).θ), T(Distributions.params(C).δ)
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
@inline _arch_combine(::Copulas.BB3Copula{2}, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::Copulas.BB3Copula{2}, a::Real, b::Real) = _logsubexp_plus_one(a, b)
@inline _arch_hfunc(C::Copulas.BB3Copula{2}, u::Real, v::Real) = _arch_hfunc_coordinate(C, u, v)
@inline _arch_hinv(C::Copulas.BB3Copula{2}, q::Real, v::Real) = _arch_hinv_coordinate(C, q, v)
function _inv_ϕ¹(C::Copulas.BB3Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB3")
    iszero(m) && return typeof(m)(Inf)
    L = _arch_inverse_logderivative(C, log(m))
    return isinf(L) ? L : expm1(L)
end

# log(ϕ''(s)) = M(L) + log(-M'(L)) - L, with L = log(1+s).
@inline function _arch_pair_logpdf(C::Copulas.BB3Copula{2}, u::Real, v::Real)
    params = Distributions.params(C)
    p, δ = inv(float(params.θ)), float(params.δ)
    Lu, Lv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    L = _arch_combine(C, Lu, Lv)
    z = log(L) - log(δ)
    logslope = log1p((one(p) - p + p * exp(p * z)) / L)
    return _arch_logderivative(C, L) + logslope - L -
           _arch_logderivative(C, Lu) - _arch_logderivative(C, Lv)
end
@inline _pair_logpdf(C::Copulas.BB3Copula{2}, u::Real, v::Real, ::Vector{Float64}) =
    _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB3Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB3Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB3Copula{2}, q::Real, v::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB3Copula{2}, q::Real, u::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB3Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB3Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB3Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB3Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
