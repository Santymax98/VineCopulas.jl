# ---------------------------------------------------------------------
# Elliptical pair-copula conditional primitives
# ---------------------------------------------------------------------

@inline function _gaussian_hfunc(C::Copulas.GaussianCopula{2}, target::Real, base::Real)
    ρ, N = C.Σ[1, 2], Distributions.Normal()
    zt, zb = Distributions.quantile(N, target), Distributions.quantile(N, base)
    return Distributions.cdf(N, (zt - ρ * zb) / sqrt(1 - ρ^2))
end

@inline function _gaussian_hinv(C::Copulas.GaussianCopula{2}, q::Real, base::Real)
    ρ, N = C.Σ[1, 2], Distributions.Normal()
    zb, zq = Distributions.quantile(N, base), Distributions.quantile(N, q)
    return Distributions.cdf(N, ρ * zb + sqrt(1 - ρ^2) * zq)
end

@inline function hfunc1(C::Copulas.GaussianCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_gaussian_hfunc(C, u, v))
end

@inline function hfunc2(C::Copulas.GaussianCopula{2}, uv::Tuple{<:Real,<:Real})
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_gaussian_hfunc(C, v, u))
end

@inline hinv1(C::Copulas.GaussianCopula{2}, q::Real, v::Real) = _clp(_gaussian_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.GaussianCopula{2}, q::Real, u::Real) = _clp(_gaussian_hinv(C, _clp(q), _clp(u)))

@inline function _t_hfunc(C::Copulas.TCopula{2,ν}, target::Real, base::Real) where {ν}
    ρ = C.Σ[1, 2]
    tν, tν1 = Distributions.TDist(ν), Distributions.TDist(ν + 1)
    zt, zb = Distributions.quantile(tν, target), Distributions.quantile(tν, base)
    scale = sqrt((1 - ρ^2) * (ν + zb^2) / (ν + 1))
    return Distributions.cdf(tν1, (zt - ρ * zb) / scale)
end

@inline function _t_hinv(C::Copulas.TCopula{2,ν}, q::Real, base::Real) where {ν}
    ρ = C.Σ[1, 2]
    tν, tν1 = Distributions.TDist(ν), Distributions.TDist(ν + 1)
    zb, zq = Distributions.quantile(tν, base), Distributions.quantile(tν1, q)
    scale = sqrt((1 - ρ^2) * (ν + zb^2) / (ν + 1))
    return Distributions.cdf(tν, ρ * zb + scale * zq)
end

@inline function hfunc1(C::Copulas.TCopula{2,ν}, uv::Tuple{<:Real,<:Real}) where {ν}
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_t_hfunc(C, u, v))
end

@inline function hfunc2(C::Copulas.TCopula{2,ν}, uv::Tuple{<:Real,<:Real}) where {ν}
    u, v = _clp(uv[1]), _clp(uv[2])
    return _clp(_t_hfunc(C, v, u))
end

@inline hinv1(C::Copulas.TCopula{2,ν}, q::Real, v::Real) where {ν} = _clp(_t_hinv(C, _clp(q), _clp(v)))
@inline hinv2(C::Copulas.TCopula{2,ν}, q::Real, u::Real) where {ν} = _clp(_t_hinv(C, _clp(q), _clp(u)))
