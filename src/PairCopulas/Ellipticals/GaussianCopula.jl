# ---------------------------------------------------------------------
# Gaussian pair-copula fast path
# ---------------------------------------------------------------------

@inline function _pair_logpdf(C::Copulas.GaussianCopula{2}, u::Real, v::Real, buf::Vector{Float64},)
    ρ = C.Σ[1, 2]
    uu = _clp(u)
    vv = _clp(v)
    z1 = Distributions.quantile(_STD_NORMAL, uu)
    z2 = Distributions.quantile(_STD_NORMAL, vv)
    ρ2 = ρ * ρ
    den = one(ρ2) - ρ2
    return -0.5 * log(den) + (2 * ρ * z1 * z2 - ρ2 * (z1 * z1 + z2 * z2)) / (2 * den)
end

@inline function _gaussian_hfunc(C::Copulas.GaussianCopula{2}, target::Real, base::Real)
    ρ = C.Σ[1, 2]
    zt = Distributions.quantile(_STD_NORMAL, _clp(target))
    zb = Distributions.quantile(_STD_NORMAL, _clp(base))
    return Distributions.cdf(_STD_NORMAL, (zt - ρ * zb) / sqrt(1 - ρ^2))
end

@inline function _gaussian_hinv(C::Copulas.GaussianCopula{2}, q::Real, base::Real)
    ρ = C.Σ[1, 2]
    zb = Distributions.quantile(_STD_NORMAL, _clp(base))
    zq = Distributions.quantile(_STD_NORMAL, _clp(q))
    return Distributions.cdf(_STD_NORMAL, ρ * zb + sqrt(1 - ρ^2) * zq)
end

@inline hfunc1(C::Copulas.GaussianCopula{2}, u::Real, v::Real) = _clp(_gaussian_hfunc(C, u, v))
@inline hfunc2(C::Copulas.GaussianCopula{2}, u::Real, v::Real) = _clp(_gaussian_hfunc(C, v, u))

@inline hfunc1(C::Copulas.GaussianCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc1(C, uv[1], uv[2])

@inline hfunc2(C::Copulas.GaussianCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc2(C, uv[1], uv[2])

@inline hinv1(C::Copulas.GaussianCopula{2}, q::Real, v::Real) = _clp(_gaussian_hinv(C, q, v))
@inline hinv2(C::Copulas.GaussianCopula{2}, q::Real, u::Real) = _clp(_gaussian_hinv(C, q, u))
