# ---------------------------------------------------------------------
# Bivariate Student-t pair-copula primitives.
#
# Float32/Float64 Student-t scalar kernels use direct Rmath calls; generic Real
# wrappers retain StatsFuns. Fused pair steps then make sure a vine edge computes
# the two base t_ν quantiles only once and reuses them for density and both
# conditional distributions.
# ---------------------------------------------------------------------

# Rmath exposes the same Student-t CDF/quantile definitions through direct
# scalar C calls. On ordinary hardware-float hot paths this avoids the
# allocation-heavy incomplete-beta inversion used by StatsFuns.tdistinvcdf.
# BigFloat and number wrappers retain the generic StatsFuns route so the
# previous nonstandard-Real behavior is not narrowed.
@inline _t_quantile(::Val{ν}, p::Union{Float32,Float64}) where {ν} =
    Rmath.qt(Float64(_clp(p)), Float64(ν))

@inline _t_quantile(::Val{ν}, p::Real) where {ν} =
    StatsFuns.tdistinvcdf(Float64(ν), _clp(p))

@inline _t_cdf(::Val{ν}, x::Union{Float32,Float64}) where {ν} =
    Rmath.pt(Float64(x), Float64(ν))

@inline _t_cdf(::Val{ν}, x::Real) where {ν} =
    StatsFuns.tdistcdf(Float64(ν), x)

@inline _t_quantile(ν::Real, p::Union{Float32,Float64}) =
    Rmath.qt(Float64(_clp(p)), Float64(ν))

@inline _t_quantile(ν::Real, p::Real) =
    StatsFuns.tdistinvcdf(Float64(ν), _clp(p))

@inline _t_cdf(ν::Real, x::Union{Float32,Float64}) =
    Rmath.pt(Float64(x), Float64(ν))

@inline _t_cdf(ν::Real, x::Real) =
    StatsFuns.tdistcdf(Float64(ν), x)

@generated function _t_pair_K(::Val{ν}) where {ν}
    νf = Float64(ν)
    univ_const =
        SpecialFunctions.loggamma((νf + 1) / 2) -
        SpecialFunctions.loggamma(νf / 2) -
        0.5 * log(νf * π)

    val = -log(2π) - 2 * univ_const
    return :($val)
end

@inline function _t_pair_K(ν::Real)
    νf = Float64(ν)
    univ_const =
        SpecialFunctions.loggamma((νf + 1) / 2) -
        SpecialFunctions.loggamma(νf / 2) -
        0.5 * log(νf * π)

    return -log(2π) - 2 * univ_const
end

@inline _t_float(ν::Real) = Float64(ν)
@inline _t_float(::Val{ν}) where {ν} = Float64(ν)

@inline _t_plus_one(ν::Real) = ν + 1
@inline _t_plus_one(::Val{ν}) where {ν} = Val(ν + 1)

@inline _tcopula_df(C::CT) where {ν,S,CT<:Copulas.TCopula{2,ν,S}} =
    _tcopula_df(C, Val(:df in fieldnames(CT)), Val(ν))

@inline _tcopula_df(C, ::Val{true}, ::Val) = C.df
@inline _tcopula_df(C, ::Val{false}, ::Val{ν}) where {ν} = Val(ν)

@inline function _t_pair_inputs(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
) where {ν,S}
    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ
    den = one(ρ2) - ρ2
    df = _tcopula_df(C)
    t1 = _t_quantile(df, u)
    t2 = _t_quantile(df, v)
    return df, ρ, den, t1, t2
end

@inline function _t_logpdf_from_quantiles(
    df,
    ρ::Real,
    den::Real,
    t1::Real,
    t2::Real,
)
    νf = _t_float(df)
    Q = t1 * t1 - 2 * ρ * t1 * t2 + t2 * t2
    return _t_pair_K(df) -
           0.5 * log(den) -
           ((νf + 2) / 2) * log1p(Q / (νf * den)) +
           ((νf + 1) / 2) * (
               log1p((t1 * t1) / νf) +
               log1p((t2 * t2) / νf)
           )
end

@inline function _t_h_from_quantiles(
    df,
    ρ::Real,
    den::Real,
    target_t::Real,
    base_t::Real,
)
    νf = _t_float(df)
    scale = sqrt((νf + base_t * base_t) * den / (νf + 1))
    return _t_cdf(_t_plus_one(df), (target_t - ρ * base_t) / scale)
end

@inline function _pair_logpdf(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {ν,S}
    df, ρ, den, t1, t2 = _t_pair_inputs(C, u, v)
    return _t_logpdf_from_quantiles(df, ρ, den, t1, t2)
end

@inline function _pair_hfuncs(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
) where {ν,S}
    df, ρ, den, t1, t2 = _t_pair_inputs(C, u, v)
    h1 = _clp(_t_h_from_quantiles(df, ρ, den, t1, t2))
    h2 = _clp(_t_h_from_quantiles(df, ρ, den, t2, t1))
    return h1, h2
end

@inline function _pair_step(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {ν,S}
    df, ρ, den, t1, t2 = _t_pair_inputs(C, u, v)
    logc = _t_logpdf_from_quantiles(df, ρ, den, t1, t2)
    h1 = _clp(_t_h_from_quantiles(df, ρ, den, t1, t2))
    h2 = _clp(_t_h_from_quantiles(df, ρ, den, t2, t1))
    return logc, h1, h2
end

@inline function _pair_logpdf_h1(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {ν,S}
    df, ρ, den, t1, t2 = _t_pair_inputs(C, u, v)
    logc = _t_logpdf_from_quantiles(df, ρ, den, t1, t2)
    h1 = _clp(_t_h_from_quantiles(df, ρ, den, t1, t2))
    return logc, h1
end

@inline function _pair_logpdf_h2(
    C::Copulas.TCopula{2,ν,S},
    u::Real,
    v::Real,
    buf::Vector{Float64},
) where {ν,S}
    df, ρ, den, t1, t2 = _t_pair_inputs(C, u, v)
    logc = _t_logpdf_from_quantiles(df, ρ, den, t1, t2)
    h2 = _clp(_t_h_from_quantiles(df, ρ, den, t2, t1))
    return logc, h2
end

@inline function _t_hfunc(
    C::Copulas.TCopula{2,ν,S},
    target::Real,
    base::Real,
) where {ν,S}
    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ
    den = one(ρ2) - ρ2
    df = _tcopula_df(C)
    target_t = _t_quantile(df, target)
    base_t = _t_quantile(df, base)
    return _t_h_from_quantiles(df, ρ, den, target_t, base_t)
end

@inline function _t_hinv(
    C::Copulas.TCopula{2,ν,S},
    q::Real,
    base::Real,
) where {ν,S}
    df = _tcopula_df(C)
    νf = _t_float(df)

    ρ = C.Σ[1, 2]
    ρ2 = ρ * ρ

    t2 = _t_quantile(df, base)
    tq = _t_quantile(_t_plus_one(df), q)

    scale = sqrt((νf + t2 * t2) * (one(ρ2) - ρ2) / (νf + 1))

    return _t_cdf(df, ρ * t2 + tq * scale)
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
