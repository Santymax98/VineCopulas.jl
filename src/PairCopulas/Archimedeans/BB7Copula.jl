# =====================================================================
# BB7
# =====================================================================

# BB7 uses the shared coordinate
#
#     L = log(1+s).
#
# For a genuine BB7 copula θ > 1 because θ = 1 is reduced to Clayton
# by the Copulas.jl constructor.

@inline function _arch_coordinate(C::Copulas.BB7Copula{2}, u::Real)
    θ, δ, uu = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(u))

    zero(uu) < uu <= one(uu) || throw(DomainError(u, "The BB7 probability must belong to (0, 1].",))
    isone(uu) && return zero(uu)

    # L = -δ log(1 - (1-u)^θ)
    return -δ * LogExpFunctions.log1mexp(θ * log1p(-uu),)
end

@inline function _arch_probability(C::Copulas.BB7Copula{2}, L::Real)
    θ, δ, LL = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(L))

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return one(LL)
    isinf(LL) && return zero(LL)

    # H = 1 - exp(-L/δ)
    logH = LogExpFunctions.log1mexp(-LL / δ)

    # u = 1 - H^(1/θ)
    return -expm1(logH / θ)
end

@inline function _arch_logderivative(C::Copulas.BB7Copula{2},L::Real,)
    θ, δ, LL = promote(float(Distributions.params(C).θ), float(Distributions.params(C).δ), float(L))
    T = typeof(LL)

    LL >= zero(LL) || throw(DomainError(L, "The BB7 log1p coordinate must be non-negative.",))

    iszero(LL) && return T(Inf)
    isinf(LL) && return -T(Inf)

    a = inv(θ)
    x = log(LL) - log(δ)
    logH = _log1mexp_negexp(x)

    # log|ϕ′(s)| = -log θ - log δ + (1/θ - 1) log(1 - exp(-L/δ)) - (1 + 1/δ)L.
    return -log(θ) - log(δ) + (a - one(T)) * logH - (one(T) + inv(δ)) * LL
end

function _arch_inverse_logderivative(C::Copulas.BB7Copula{2}, logm::Real,)
    lm = float(logm)
    T = typeof(lm)

    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))

    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(Distributions.params(C).θ), T(Distributions.params(C).δ)

    θ > one(T) || throw(DomainError(θ, "A genuine BB7 copula requires θ > 1; θ = 1 reduces to Clayton.",))

    δ > zero(T) || throw(DomainError(δ, "The BB7 copula requires δ > 0.",))

    a = inv(θ)
    logprefactor = -log(θ) - log(δ)

    # Solve in x = log(L/δ). In this coordinate,
    #   L = δ exp(x)
    # and log|ϕ′| is smooth and strictly decreasing.
    function f(x)
        r = exp(x)
        logH = _log1mexp_negexp(x)

        return logprefactor + (a - one(T)) * logH - (δ + one(T)) * r - lm
    end

    function df(x)
        x == -T(Inf) && return a - one(T)
        x == T(Inf) && return -T(Inf)

        r = exp(x)
        isinf(r) && return -T(Inf)

        logH = _log1mexp_negexp(x)

        # d/dx log(1-exp(-exp(x)))
        ratio = exp(x - r - logH)

        return (a - one(T)) * ratio - (δ + one(T)) * r
    end

    x = _solve_decreasing_root(f, df, zero(T))

    # Return L, the coordinate expected by the shared protocol.
    return δ * exp(x)
end

@inline _arch_combine(::Copulas.BB7Copula{2}, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::Copulas.BB7Copula{2}, total::Real, base::Real) = _logsubexp_plus_one(total, base)
@inline _arch_hfunc(C::Copulas.BB7Copula{2}, target::Real, base::Real) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB7Copula{2}, q::Real, base::Real) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB7Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB7")
    iszero(m) && return typeof(m)(Inf)
    L = _arch_inverse_logderivative(C, log(m))
    return isinf(L) ? L : expm1(L)
end

# L = log(1+s): log(ϕ''(s)) = log|ϕ'(s)| + log(-dM/dL) - L.
@inline function _arch_pair_logpdf(C::Copulas.BB7Copula{2}, u::Real, v::Real)
    p = Distributions.params(C)
    θ, δ = float(p.θ), float(p.δ)
    Lu, Lv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    L = _arch_combine(C, Lu, Lv)
    t = L / δ
    ratio = exp(-t) / (-expm1(-t))
    slope = one(δ) + inv(δ) + (one(θ) - inv(θ)) * ratio / δ
    return _arch_logderivative(C, L) + log(slope) - L -
           _arch_logderivative(C, Lu) - _arch_logderivative(C, Lv)
end

@inline _pair_logpdf(C::Copulas.BB7Copula{2}, u::Real, v::Real, ::Vector{Float64}) =
    _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB7Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB7Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB7Copula{2}, q::Real, v::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB7Copula{2}, q::Real, u::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB7Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB7Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB7Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB7Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
