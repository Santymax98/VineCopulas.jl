# =====================================================================
# BB2
# =====================================================================

# BB2 is evaluated in L = log(1+s). It implements a small reusable protocol:
# probability ↔ stable coordinate and log|ϕ'| ↔ stable coordinate. Future BB
# families can add methods to the same protocol instead of introducing new
# family-named helper APIs.

@inline function _arch_coordinate(C::Copulas.BB2Copula{2}, u::Real)
    θ, δ, uu = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(u))
    return δ * expm1(-θ * log(uu))
end

@inline function _arch_probability(C::Copulas.BB2Copula{2}, L::Real)
    θ, δ, LL = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(L))
    return exp(-log1p(LL / δ) / θ)
end

@inline function _arch_logderivative(C::Copulas.BB2Copula{2}, L::Real)
    θ, δ, LL = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(L))
    return -log(θ) - log(δ) - LL - (one(LL) + inv(θ)) * log1p(LL / δ)
end

function _arch_inverse_logderivative(C::Copulas.BB2Copula{2}, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return zero(T)

    θ, δ = T(_vine_params(C).θ), T(_vine_params(C).δ)
    a = one(T) + inv(θ)
    logv = -log(a) + (δ + (a - one(T)) * log(δ) - log(θ) - lm) / a
    return max(a * exp(_log_lambertw_exp(logv)) - δ, zero(T))
end


@inline _arch_combine(::Copulas.BB2Copula{2}, a::Real, b::Real) = _logaddexp_minus_one(a, b)
@inline _arch_difference(::Copulas.BB2Copula{2}, total::Real, base::Real) = _logsubexp_plus_one(total, base)
@inline _arch_hfunc(C::Copulas.BB2Copula{2}, target::Real, base::Real) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB2Copula{2}, q::Real, base::Real) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB2Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB2")
    iszero(m) && return typeof(m)(Inf)
    L = _arch_inverse_logderivative(C, log(m))
    return isinf(L) ? L : expm1(L)
end

# L = log(1+s): the density stays in log coordinates, even when s overflows.
@inline function _arch_pair_logpdf(C::Copulas.BB2Copula{2}, u::Real, v::Real)
    p = _vine_params(C)
    θ, δ = float(p.θ), float(p.δ)
    Lu, Lv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    L = _arch_combine(C, Lu, Lv)
    slope = (one(θ) + inv(θ)) / (δ + L)
    return _arch_logderivative(C, L) + log1p(slope) - L -
           _arch_logderivative(C, Lu) - _arch_logderivative(C, Lv)
end

@inline _pair_logpdf(C::Copulas.BB2Copula{2}, u::Real, v::Real, ::Vector{Float64}) =
    _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB2Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB2Copula{2}, u::Real, v::Real) =
    _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB2Copula{2}, q::Real, v::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB2Copula{2}, q::Real, u::Real) =
    _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB2Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB2Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB2Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB2Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
