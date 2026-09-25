# ---------------------------------------------------------------------
# Frank pair-copula fast paths
#
# These kernels depend only on the public FrankCopula contract and
# _vine_params(C). They do not inspect the stored generator.
# ---------------------------------------------------------------------

@inline function _frank_terms(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv = promote(float(_vine_params(C).θ), float(u), float(v),)
    uu, vv = _clp(uu), _clp(vv)
    if abs(θ) <= sqrt(eps(typeof(θ)))
        return θ, uu, vv, zero(θ), zero(θ), zero(θ), one(θ)
    end
    A = -expm1(-θ)
    Bu = -expm1(-θ * uu)
    Bv = -expm1(-θ * vv)
    D = A - Bu * Bv
    return θ, uu, vv, A, Bu, Bv, D
end

@inline _frank_h1(θ::Real, Bu::Real, v::Real, D::Real,) = clamp(Bu * exp(-θ * v) / D, zero(θ), one(θ),)
@inline _frank_h2(θ::Real, Bv::Real, u::Real, D::Real,) = clamp(Bv * exp(-θ * u) / D, zero(θ), one(θ),)
@inline _frank_logpdf(θ::Real, u::Real, v::Real, A::Real, D::Real,) = log(abs(θ)) + log(abs(A)) - θ * (u + v) - 2 * log(abs(D))

@inline function _frank_pair_logpdf(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv, A, _, _, D = _frank_terms(C, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ)
    return _frank_logpdf(θ, uu, vv, A, D)
end

@inline _pair_logpdf(C::Copulas.FrankCopula{2}, u::Real, v::Real, ::Vector{Float64},) = _frank_pair_logpdf(C, _clp(u), _clp(v),)

@inline function _frank_hfunc(C::Copulas.FrankCopula{2}, target::Real, base::Real,)
    θ, tt, bb, _, Bt, _, D = _frank_terms(C, target, base)
    abs(θ) <= sqrt(eps(typeof(θ))) && return tt
    return _frank_h1(θ, Bt, bb, D)
end

@inline function _frank_hfuncs(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv, _, Bu, Bv, D = _frank_terms(C, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return uu, vv
    return _frank_h1(θ, Bu, vv, D), _frank_h2(θ, Bv, uu, D)
end

@inline hfunc1(C::Copulas.FrankCopula{2}, u::Real, v::Real,) = _clp(_frank_hfunc(C, _clp(u), _clp(v),),)
@inline hfunc2(C::Copulas.FrankCopula{2}, u::Real, v::Real,) = _clp(_frank_hfunc(C, _clp(v), _clp(u),),)

@inline function _pair_hfuncs(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    h1, h2 = _frank_hfuncs(C, _clp(u), _clp(v),)
    return _clp(h1), _clp(h2)
end

@inline function _frank_pair_step(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv, A, Bu, Bv, D = _frank_terms(C, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), uu, vv
    logc = _frank_logpdf(θ, uu, vv, A, D)
    h1 = _frank_h1(θ, Bu, vv, D)
    h2 = _frank_h2(θ, Bv, uu, D)
    return logc, h1, h2
end

@inline function _pair_step(C::Copulas.FrankCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1, h2 = _frank_pair_step(C, _clp(u), _clp(v),)
    return logc, _clp(h1), _clp(h2)
end

@inline function _frank_pair_logpdf_h1(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv, A, Bu, _, D = _frank_terms(C, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), uu
    return _frank_logpdf(θ, uu, vv, A, D), _frank_h1(θ, Bu, vv, D)
end

@inline function _frank_pair_logpdf_h2(C::Copulas.FrankCopula{2}, u::Real, v::Real,)
    θ, uu, vv, A, _, Bv, D = _frank_terms(C, u, v)
    abs(θ) <= sqrt(eps(typeof(θ))) && return zero(θ), vv
    return _frank_logpdf(θ, uu, vv, A, D), _frank_h2(θ, Bv, uu, D)
end

@inline function _pair_logpdf_h1(C::Copulas.FrankCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h1 = _frank_pair_logpdf_h1(C, _clp(u), _clp(v),)
    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.FrankCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    logc, h2 = _frank_pair_logpdf_h2(C, _clp(u), _clp(v),)
    return logc, _clp(h2)
end

# For
#   q = Bu * exp(-θv) / (A - Bu*Bv),
# with
#   A  = 1 - exp(-θ),
#   Bu = 1 - exp(-θu),
#   Bv = 1 - exp(-θv),
# solve directly:
#   Bu = qA / (exp(-θv) + qBv).

@inline function _frank_hinv(C::Copulas.FrankCopula{2}, q::Real, base::Real,)
    θ, qq, bb = promote(float(_vine_params(C).θ), float(q), float(base),)
    qq = clamp(qq, zero(qq), one(qq))
    bb = _clp(bb)
    abs(θ) <= sqrt(eps(typeof(θ))) && return qq
    A = -expm1(-θ)
    E = exp(-θ * bb)
    B = -expm1(-θ * bb)
    Bu = qq * A / (E + qq * B)
    u = -log1p(-Bu) / θ
    return clamp(u, zero(u), one(u),)
end

@inline hinv1(C::Copulas.FrankCopula{2}, q::Real, v::Real,) = _clp(_frank_hinv(C, _clp(q), _clp(v),),)
@inline hinv2(C::Copulas.FrankCopula{2}, q::Real, u::Real,) = _clp(_frank_hinv(C, _clp(q), _clp(u),),)
