# BB1 pair kernels use public family parameters and local log coordinates.
# =====================================================================
# BB1
# =====================================================================

# BB1 has no useful closed-form inverse of ϕ'. It is solved numerically in
# z = log(s), where log|ϕ'| is smooth and strictly decreasing. The same stable
# coordinate protocol is shared with BB2 and future BB implementations.
@inline function _arch_coordinate(C::Copulas.BB1Copula{2}, u::Real)
    θ, δ, uu = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(u))
    return δ * LogExpFunctions.logexpm1(-θ * log(uu))
end

@inline function _arch_probability(C::Copulas.BB1Copula{2}, z::Real)
    θ, δ, zz = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(z))
    return exp(-LogExpFunctions.log1pexp(zz / δ) / θ)
end

@inline function _arch_logderivative(C::Copulas.BB1Copula{2}, z::Real)
    θ, δ, zz = promote(float(_vine_params(C).θ), float(_vine_params(C).δ), float(z))
    a, b = inv(δ), inv(θ)
    return log(a) + log(b) + (a - one(zz)) * zz - (b + one(zz)) * LogExpFunctions.log1pexp(a * zz)
end

function _arch_inverse_logderivative(C::Copulas.BB1Copula{2}, logm::Real)
    lm = float(logm)
    T = typeof(lm)
    isnan(lm) && throw(DomainError(logm, "log|ϕ'| cannot be NaN."))
    lm == -T(Inf) && return T(Inf)
    lm == T(Inf) && return -T(Inf)

    θ, δ = T(_vine_params(C).θ), T(_vine_params(C).δ)
    θ > zero(T) || throw(DomainError(θ, "The BB1 copula requires θ > 0."))
    δ > one(T) || throw(DomainError(δ, "A genuine BB1 copula requires δ > 1; δ = 1 reduces to Clayton."))

    a, b = inv(δ), inv(θ)
    logab = log(a) + log(b)
    f(z) = logab + (a - one(T)) * z - (b + one(T)) * LogExpFunctions.log1pexp(a * z) - lm
    df(z) = (a - one(T)) - a * (b + one(T)) * LogExpFunctions.logistic(a * z)
    return _solve_decreasing_root(f, df, zero(T))
end

@inline _arch_combine(::Copulas.BB1Copula{2}, a::Real, b::Real) = LogExpFunctions.logaddexp(a, b)
@inline function _arch_difference(::Copulas.BB1Copula{2}, total::Real, base::Real)
    total >= base || throw(DomainError((total, base), "Expected total ≥ base."))
    total == base && return oftype(total - base, -Inf)
    return LogExpFunctions.logsubexp(total, base)
end
@inline _arch_hfunc(C::Copulas.BB1Copula{2}, target::Real, base::Real) = _arch_hfunc_coordinate(C, target, base)
@inline _arch_hinv(C::Copulas.BB1Copula{2}, q::Real, base::Real) = _arch_hinv_coordinate(C, q, base)

function _inv_ϕ¹(C::Copulas.BB1Copula{2}, y::Real)
    m = _negative_derivative_magnitude(y, "BB1")
    T = typeof(m)
    iszero(m) && return T(Inf)
    isinf(m) && return zero(T)
    return exp(_arch_inverse_logderivative(C, log(m)))
end

# If L(z) = log|ϕ'(exp(z))|, then log(ϕ''(s)) = L(z) + log(-L'(z)) - z.
@inline function _arch_pair_logpdf(C::Copulas.BB1Copula{2}, u::Real, v::Real)
    p = _vine_params(C)
    a, b = inv(float(p.δ)), inv(float(p.θ))
    zu, zv = _arch_coordinate(C, u), _arch_coordinate(C, v)
    z = _arch_combine(C, zu, zv)
    slope = (one(a) - a) + a * (b + one(b)) * LogExpFunctions.logistic(a * z)
    return _arch_logderivative(C, z) + log(slope) - z -
           _arch_logderivative(C, zu) - _arch_logderivative(C, zv)
end

@inline _pair_logpdf(C::Copulas.BB1Copula{2}, u::Real, v::Real, ::Vector{Float64}) = _arch_pair_logpdf(C, _clp(u), _clp(v))
@inline hfunc1(C::Copulas.BB1Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(u), _clp(v)))
@inline hfunc2(C::Copulas.BB1Copula{2}, u::Real, v::Real) = _clp(_arch_hfunc(C, _clp(v), _clp(u)))
@inline hinv1(C::Copulas.BB1Copula{2}, q::Real, v::Real) = _clp(_arch_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.BB1Copula{2}, q::Real, u::Real) = _clp(_arch_hinv(C, _clp(q), _clp(u)))

@inline function _pair_hfuncs(C::Copulas.BB1Copula{2}, u::Real, v::Real)
    h1, h2 = _arch_hfuncs(C, _clp(u), _clp(v))
    return _clp(h1), _clp(h2)
end
@inline function _pair_step(C::Copulas.BB1Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1, h2 = _arch_pair_step(C, _clp(u), _clp(v))
    return logc, _clp(h1), _clp(h2)
end
@inline function _pair_logpdf_h1(C::Copulas.BB1Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h1 = _arch_pair_logpdf_h1(C, _clp(u), _clp(v))
    return logc, _clp(h1)
end
@inline function _pair_logpdf_h2(C::Copulas.BB1Copula{2}, u::Real, v::Real, ::Vector{Float64})
    logc, h2 = _arch_pair_logpdf_h2(C, _clp(u), _clp(v))
    return logc, _clp(h2)
end
