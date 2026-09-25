# =====================================================================
# Gumbel-Barnett
# =====================================================================

# For the bivariate Gumbel-Barnett copula,
#
#     C(u,v) = uv exp(-θ log(u) log(v)),
#
# with 0 ≤ θ ≤ 1.
#
# Therefore the pair density and conditional distributions admit direct
# closed forms and do not require access to the generator representation
# used internally by Copulas.jl.

@inline function _gb_terms(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real,)
    p = _vine_params(C)
    θ, uu, vv = promote(float(p.θ), float(u), float(v),)
    T = typeof(uu)

    zero(T) <= θ <= one(T) || throw(DomainError(θ, "A Gumbel-Barnett copula requires θ ∈ [0, 1].",))

    uu, vv = _clp(uu), _clp(vv)

    x = -log(uu)
    y = -log(vv)

    A = one(T) + θ * x
    B = one(T) + θ * y

    logE = -θ * (x * y)

    return θ, uu, vv, x, y, A, B, logE
end

@inline function _gb_logpdf_from_terms(θ, x, y, logE,)
    T = typeof(x)

    # Since x,y ≥ 0 and 0 ≤ θ ≤ 1,
    #
    #   (1+θx)(1+θy)-θ
    #
    # can be evaluated without cancellation as
    #
    #   (1-θ) + θ(x+y) + θ²xy.
    N = (one(T) - θ) + θ * (x + y) + θ * θ * x * y
    N > zero(T) || return -T(Inf)
    return logE + log(N)
end

@inline function _gb_hfunc_from_terms(θ, target, x, A, logE,)
    iszero(θ) && return target

    # h = u(1+θx)exp(-θxy), with u = exp(-x).
    return exp(-x + log(A) + logE)
end

@inline function _gb_pair_logpdf(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real,)
    θ, _, _, x, y, _, _, logE = _gb_terms(C, u, v)
    return _gb_logpdf_from_terms(θ, x, y, logE)
end

@inline function _gb_hfunc(C::Copulas.GumbelBarnettCopula{2}, target::Real, base::Real,)
    θ, tt, _, x, _, A, _, logE = _gb_terms(C, target, base)
    return _gb_hfunc_from_terms(θ, tt, x, A, logE)
end

# ---------------------------------------------------------------------
# Conditional inverse
#
# Put
#
#     x = -log(u),    y = -log(v).
#
# Then
#
#     q = (1 + θx) exp[-(1 + θy)x].
#
# For θ > 0 define
#
#     a = 1 + θy,
#     b = a/θ = 1/θ + y,
#     t = b(1 + θx).
#
# The equation becomes
#
#     t exp(-t) = b q exp(-b),
#
# hence
#
#     t = -W₋₁(-b q exp(-b)).
#
# Our helper _neg_lambertwm1_expneg evaluates this branch stably from
#
#     L = b - log(b) - log(q),
#
# because t - log(t) = L.
# ---------------------------------------------------------------------

@inline function _gb_hinv(C::Copulas.GumbelBarnettCopula{2}, q::Real, base::Real,)
    p = _vine_params(C)
    θ, qq, vv = promote(float(p.θ), float(q), float(base),)
    T = typeof(qq)

    zero(T) <= θ <= one(T) || throw(DomainError(θ, "A Gumbel-Barnett copula requires θ ∈ [0, 1].",))
    qq, vv = _clp(qq), _clp(vv)

    # θ = 0 is independence.
    iszero(θ) && return qq

    y = -log(vv)
    a = one(T) + θ * y

    # For extremely small θ the Lambert representation contains numbers of
    # order 1/θ whose subtraction can lose precision. Solve the same monotone
    # equation directly in x in that regime.
    if θ <= sqrt(eps(T))
        logq = log(qq)
        # θ ≈ 0 gives x ≈ -log(q).
        x = -logq / max(a - θ, eps(T))

        for _ in 1:6
            f = log1p(θ * x) - a * x - logq
            df = θ / (one(T) + θ * x) - a

            xnew = max(x - f / df, zero(T))

            abs(xnew - x) <=
                T(8) * eps(T) * max(one(T), abs(xnew)) && return exp(-xnew)
            x = xnew
        end

        return exp(-x)
    end

    b = inv(θ) + y

    # b*q*exp(-b) = exp(-L).
    L = b - log(b) - log(qq)

    t = _neg_lambertwm1_expneg(L)

    # Since t = b(1+θx) = b + a*x,
    #
    #     x = (t-b)/a.
    #
    # This reconstruction is more stable than
    #
    #     (t/b - 1)/θ.
    x = max((t - b) / a, zero(T))

    return exp(-x)
end

@inline _pair_logpdf(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real, ::Vector{Float64},) = _gb_pair_logpdf(C, u, v)
@inline hfunc1(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real,) = _clp(_gb_hfunc(C, u, v))
@inline hfunc2(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real,) = _clp(_gb_hfunc(C, v, u))
@inline hinv1(C::Copulas.GumbelBarnettCopula{2}, q::Real, v::Real,) = _clp(_gb_hinv(C, q, v))

@inline hinv2(C::Copulas.GumbelBarnettCopula{2}, q::Real, u::Real,) = _clp(_gb_hinv(C, q, u))

@inline function _pair_hfuncs(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real,)
    θ, uu, vv, x, y, A, B, logE = _gb_terms(C, u, v)

    h1 = _gb_hfunc_from_terms(θ, uu, x, A, logE)
    h2 = _gb_hfunc_from_terms(θ, vv, y, B, logE)

    return _clp(h1), _clp(h2)
end

@inline function _pair_step(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, vv, x, y, A, B, logE = _gb_terms(C, u, v)

    logc = _gb_logpdf_from_terms(θ, x, y, logE)
    h1 = _gb_hfunc_from_terms(θ, uu, x, A, logE)
    h2 = _gb_hfunc_from_terms(θ, vv, y, B, logE)

    return logc, _clp(h1), _clp(h2)
end

@inline function _pair_logpdf_h1(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, _, x, y, A, _, logE = _gb_terms(C, u, v)

    logc = _gb_logpdf_from_terms(θ, x, y, logE)
    h1 = _gb_hfunc_from_terms(θ, uu, x, A, logE)

    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.GumbelBarnettCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, _, vv, x, y, _, B, logE = _gb_terms(C, u, v)

    logc = _gb_logpdf_from_terms(θ, x, y, logE)
    h2 = _gb_hfunc_from_terms(θ, vv, y, B, logE)

    return logc, _clp(h2)
end
