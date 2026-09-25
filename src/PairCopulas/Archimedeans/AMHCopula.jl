# =====================================================================
# AMH
# =====================================================================

# The bivariate AMH copula admits the explicit representation
#
#     C(u,v) = uv / [1 - θ(1-u)(1-v)],
#
# for θ ∈ [-1,1].  VineCopulas therefore evaluates the pair primitives
# directly from the public copula parameters, without depending on the
# generator representation used internally by Copulas.jl.

@inline function _amh_terms(C::Copulas.AMHCopula{2}, u::Real, v::Real,)
    p = _vine_params(C)
    θ, uu, vv = promote(float(p.θ), float(u), float(v),)
    T = typeof(uu)

    -one(T) <= θ <= one(T) || throw(DomainError(θ, "An AMH copula requires θ ∈ [-1, 1].",))

    uu, vv = _clp(uu), _clp(vv)
    omu, omv = one(T) - uu, one(T) - vv

    # Stable forms of
    #
    #   Aᵤ = 1 - θ(1-u),
    #   Aᵥ = 1 - θ(1-v),
    #   D  = 1 - θ(1-u)(1-v).
    #
    # For θ ≥ 0, expressing the quantities as sums of non-negative
    # terms avoids cancellation near θ = 1 and the lower corner.
    if θ >= zero(T)
        omθ = one(T) - θ
        Au = omθ + θ * uu
        Av = omθ + θ * vv
        lo, hi = minmax(uu, vv)
        D = omθ + θ * (lo + hi * (one(T) - lo))
    else
        a = -θ
        Au = one(T) + a * omu
        Av = one(T) + a * omv
        D = one(T) + a * omu * omv
    end

    return θ, uu, vv, omu, omv, D, Au, Av
end

@inline function _amh_logpdf_from_terms(θ, uu, vv, omu, omv, D,)
    T = typeof(uu)

    iszero(θ) && return zero(T)

    # The density numerator is
    #
    #   N = 1 + θ(u+v+uv-2) + θ²(1-u)(1-v).
    #
    # Use sign-specific positive decompositions to avoid cancellation
    # both near θ = 1 in the lower tail and near θ = -1 in the upper tail.
    if θ >= zero(T)
        omθ = one(T) - θ
        N = omθ * omθ + θ * omθ * (uu + vv) + θ * (one(T) + θ) * uu * vv
    else
        a = -θ
        oma = one(T) - a
        N = oma + a * (2 * omu + 2 * omv - oma * omu * omv)
    end

    N > zero(T) || return -T(Inf)
    return log(N) - 3 * log(D)
end

@inline function _amh_hfuncs_from_terms(uu, vv, D, Au, Av,)
    D2 = D * D
    return uu * Au / D2, vv * Av / D2
end

@inline function _amh_pair_logpdf(C::Copulas.AMHCopula{2}, u::Real, v::Real,)
    θ, uu, vv, omu, omv, D, _, _ = _amh_terms(C, u, v)
    return _amh_logpdf_from_terms(θ, uu, vv, omu, omv, D)
end

@inline function _amh_hfunc(C::Copulas.AMHCopula{2}, target::Real, base::Real,)
    _, uu, _, _, _, D, Au, _ = _amh_terms(C, target, base)
    return uu * Au / (D * D)
end

# Invert
#
#     q = u[1 - θ(1-u)] / [1 - θ(1-u)(1-v)]².
#
# Instead of solving directly in u, use
#
#     w = (1-u)/u ≥ 0.
#
# Then
#
#     q(1 + d w)² = 1 + a w,
#
# with
#
#     a = 1-θ,
#     d = 1-θ(1-v).
#
# This gives a quadratic with exactly one non-negative root.  The
# q-form of the quadratic formula avoids cancellation.
@inline function _amh_hinv(C::Copulas.AMHCopula{2}, q::Real, base::Real,)
    p = _vine_params(C)
    θ, qq, vv = promote(float(p.θ), float(q), float(base),)
    T = typeof(qq)

    -one(T) <= θ <= one(T) ||
        throw(DomainError(θ, "An AMH copula requires θ ∈ [-1, 1].",))

    qq, vv = _clp(qq), _clp(vv)

    # Independence.
    iszero(θ) && return qq

    # θ = 1 is the Clayton(θ=1) copula:
    #
    #   q = [u / (u + v - uv)]².
    #
    # Solve this limit directly because the AMH generator representation
    # itself becomes degenerate at θ = 1.
    if isone(θ)
        r = sqrt(qq)
        den = one(T) - r * (one(T) - vv)
        return clamp(r * vv / den, zero(T), one(T))
    end

    a = one(T) - θ
    d = one(T) - θ * (one(T) - vv)

    A = qq * d * d
    B = 2 * qq * d - a
    C0 = qq - one(T)

    # In the extreme lower tail A can underflow.  If B < 0 the positive
    # quadratic root diverges and therefore u tends to zero; otherwise the
    # surviving linear root is well defined.
    if iszero(A)
        B > zero(T) || return zero(T)
        w = -C0 / B
        return clamp(inv(one(T) + w), zero(T), one(T))
    end

    disc = max(B * B - 4 * A * C0, zero(T))
    sqrtdisc = sqrt(disc)

    # Stable quadratic q-form. Since C0 < 0, the two roots have opposite
    # signs and exactly one is the admissible w ≥ 0 root.
    qroot = -T(0.5) * (B + copysign(sqrtdisc, B))
    w = B < zero(T) ? qroot / A : C0 / qroot
    u = inv(one(T) + w)

    return clamp(u, zero(T), one(T))
end

@inline _pair_logpdf(C::Copulas.AMHCopula{2}, u::Real, v::Real, ::Vector{Float64}) = _amh_pair_logpdf(C, u, v)
@inline hfunc1(C::Copulas.AMHCopula{2}, u::Real, v::Real) = _clp(_amh_hfunc(C, u, v))
@inline hfunc2(C::Copulas.AMHCopula{2}, u::Real, v::Real) = _clp(_amh_hfunc(C, v, u))
@inline hinv1(C::Copulas.AMHCopula{2}, q::Real, v::Real) = _clp(_amh_hinv(C, q, v))
@inline hinv2(C::Copulas.AMHCopula{2}, q::Real, u::Real) = _clp(_amh_hinv(C, q, u))

@inline function _pair_hfuncs(C::Copulas.AMHCopula{2}, u::Real, v::Real)
    _, uu, vv, _, _, D, Au, Av = _amh_terms(C, u, v)
    h1, h2 = _amh_hfuncs_from_terms(uu, vv, D, Au, Av)

    return _clp(h1), _clp(h2)
end

@inline function _pair_step(C::Copulas.AMHCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, vv, omu, omv, D, Au, Av = _amh_terms(C, u, v)

    logc = _amh_logpdf_from_terms(θ, uu, vv, omu, omv, D)
    h1, h2 = _amh_hfuncs_from_terms(uu, vv, D, Au, Av)

    return logc, _clp(h1), _clp(h2)
end

@inline function _pair_logpdf_h1(C::Copulas.AMHCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, vv, omu, omv, D, Au, _ = _amh_terms(C, u, v)

    logc = _amh_logpdf_from_terms(θ, uu, vv, omu, omv, D)
    h1 = uu * Au / (D * D)

    return logc, _clp(h1)
end

@inline function _pair_logpdf_h2(C::Copulas.AMHCopula{2}, u::Real, v::Real, ::Vector{Float64},)
    θ, uu, vv, omu, omv, D, _, Av = _amh_terms(C, u, v)

    logc = _amh_logpdf_from_terms(θ, uu, vv, omu, omv, D)
    h2 = vv * Av / (D * D)

    return logc, _clp(h2)
end
