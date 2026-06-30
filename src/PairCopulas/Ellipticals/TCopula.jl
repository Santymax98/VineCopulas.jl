# ---------------------------------------------------------------------
# Bivariate Student-t pair-copula primitives.
#
# This implementation is correctness-oriented and intentionally uses the
# standard scalar Student-t CDF/quantile routines from StatsFuns.
#
# Notes:
#   - logpdf is implemented directly from the bivariate t copula density.
#   - h-functions use the conditional Student-t distribution.
#   - The main performance cost comes from Student-t CDF/quantile calls.
# ---------------------------------------------------------------------

@inline _t_quantile(::Val{ν}, p::Real) where {ν} =
    StatsFuns.tdistinvcdf(Float64(ν), _clp(p))

@inline _t_cdf(::Val{ν}, x::Real) where {ν} =
    StatsFuns.tdistcdf(Float64(ν), Float64(x))

@generated function _t_pair_K(::Val{ν}) where {ν}
    νf = Float64(ν)
    univ_const =
        SpecialFunctions.loggamma((νf + 1) / 2) -
        SpecialFunctions.loggamma(νf / 2) -
        0.5 * log(νf * π)

    val = -log(2π) - 2 * univ_const
    return :($val)
end

@inline function _pair_logpdf(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {ν,S}
    νf = Float64(ν)
    vν = Val(ν)

    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ
    den = one(ρ2) - ρ2

    t1 = _t_quantile(vν, u)
    t2 = _t_quantile(vν, v)

    Q = t1 * t1 - 2 * ρ * t1 * t2 + t2 * t2

    return _t_pair_K(vν) -
           0.5 * log(den) -
           ((νf + 2) / 2) * log1p(Q / (νf * den)) +
           ((νf + 1) / 2) * (
               log1p((t1 * t1) / νf) +
               log1p((t2 * t2) / νf)
           )
end

@inline function _t_hfunc(
    C::Copulas.TCopula{2,ν,S},
    target::Real,
    base::Real,
) where {ν,S}
    νf = Float64(ν)
    vν = Val(ν)
    vν1 = Val(ν + 1)

    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ

    t1 = _t_quantile(vν, target)
    t2 = _t_quantile(vν, base)

    scale = sqrt((νf + t2 * t2) * (one(ρ2) - ρ2) / (νf + 1))

    return _t_cdf(vν1, (t1 - ρ * t2) / scale)
end

@inline function _t_hinv(
    C::Copulas.TCopula{2,ν,S},
    q::Real,
    base::Real,
) where {ν,S}
    νf = Float64(ν)
    vν = Val(ν)
    vν1 = Val(ν + 1)

    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ

    t2 = _t_quantile(vν, base)
    tq = _t_quantile(vν1, q)

    scale = sqrt((νf + t2 * t2) * (one(ρ2) - ρ2) / (νf + 1))

    return _t_cdf(vν, ρ * t2 + tq * scale)
end

# hfunc1(C,u,v) = C_{1|2}(u | v)
@inline hfunc1(C::Copulas.TCopula{2,ν,S}, u::Real, v::Real) where {ν,S} =
    _clp(_t_hfunc(C, u, v))

# hfunc2(C,u,v) = C_{2|1}(v | u)
@inline hfunc2(C::Copulas.TCopula{2,ν,S}, u::Real, v::Real) where {ν,S} =
    _clp(_t_hfunc(C, v, u))

@inline hfunc1(C::Copulas.TCopula{2,ν,S}, uv::Tuple{<:Real,<:Real}) where {ν,S} =
    hfunc1(C, uv[1], uv[2])

@inline hfunc2(C::Copulas.TCopula{2,ν,S}, uv::Tuple{<:Real,<:Real}) where {ν,S} =
    hfunc2(C, uv[1], uv[2])

# Inverse of hfunc1: given q = C_{1|2}(u | v), recover u.
@inline hinv1(C::Copulas.TCopula{2,ν,S}, q::Real, v::Real) where {ν,S} =
    _clp(_t_hinv(C, q, v))

# Inverse of hfunc2: given q = C_{2|1}(v | u), recover v.
@inline hinv2(C::Copulas.TCopula{2,ν,S}, q::Real, u::Real) where {ν,S} =
    _clp(_t_hinv(C, q, u))
