# Call-local snapshots use public parameters once, before observation loops.
struct _GaussianPairKernel{R<:Real} <: Copulas.Copula{2}
    rho::R
end
const _GaussianPair = Union{Copulas.GaussianCopula{2},_GaussianPairKernel}
@inline _prepare_pair(C::Copulas.GaussianCopula{2}) = _GaussianPairKernel(_vine_params(C).Σ[1, 2])
@inline _gaussian_rho(C::Copulas.GaussianCopula{2}) = _vine_params(C).Σ[1, 2]
@inline _gaussian_rho(C::_GaussianPairKernel) = C.rho

# ---------------------------------------------------------------------
# Gaussian pair-copula fast path
# ---------------------------------------------------------------------

@inline function _gaussian_pair_inputs(C::_GaussianPair, u::Real, v::Real)
    ρ = _gaussian_rho(C)
    z1 = Distributions.quantile(_STD_NORMAL, _clp(u))
    z2 = Distributions.quantile(_STD_NORMAL, _clp(v))
    ρ2 = ρ * ρ
    den = one(ρ2) - ρ2
    return ρ, z1, z2, den
end

@inline function _gaussian_logpdf_from_z(ρ::Real, z1::Real, z2::Real, den::Real)
    ρ2 = ρ * ρ
    return -0.5 * log(den) +
           (2 * ρ * z1 * z2 - ρ2 * (z1 * z1 + z2 * z2)) / (2 * den)
end

@inline _gaussian_h_from_z(ρ::Real, target_z::Real, base_z::Real, den::Real) =
    Distributions.cdf(_STD_NORMAL, (target_z - ρ * base_z) / sqrt(den))

@inline function _pair_logpdf(C::_GaussianPair, u::Real, v::Real, buf::Vector{Float64},)
    ρ, z1, z2, den = _gaussian_pair_inputs(C, u, v)
    return _gaussian_logpdf_from_z(ρ, z1, z2, den)
end

@inline function _pair_hfuncs(C::_GaussianPair, u::Real, v::Real)
    ρ, z1, z2, den = _gaussian_pair_inputs(C, u, v)
    h1 = _clp(_gaussian_h_from_z(ρ, z1, z2, den))
    h2 = _clp(_gaussian_h_from_z(ρ, z2, z1, den))
    return h1, h2
end

@inline function _pair_step(C::_GaussianPair, u::Real, v::Real, buf::Vector{Float64},)
    ρ, z1, z2, den = _gaussian_pair_inputs(C, u, v)
    logc = _gaussian_logpdf_from_z(ρ, z1, z2, den)
    h1 = _clp(_gaussian_h_from_z(ρ, z1, z2, den))
    h2 = _clp(_gaussian_h_from_z(ρ, z2, z1, den))
    return logc, h1, h2
end

@inline function _pair_logpdf_h1(C::_GaussianPair, u::Real, v::Real, buf::Vector{Float64},)
    ρ, z1, z2, den = _gaussian_pair_inputs(C, u, v)
    logc = _gaussian_logpdf_from_z(ρ, z1, z2, den)
    h1 = _clp(_gaussian_h_from_z(ρ, z1, z2, den))
    return logc, h1
end

@inline function _pair_logpdf_h2(C::_GaussianPair, u::Real, v::Real, buf::Vector{Float64},)
    ρ, z1, z2, den = _gaussian_pair_inputs(C, u, v)
    logc = _gaussian_logpdf_from_z(ρ, z1, z2, den)
    h2 = _clp(_gaussian_h_from_z(ρ, z2, z1, den))
    return logc, h2
end

@inline function _gaussian_hfunc(C::_GaussianPair, target::Real, base::Real)
    ρ = _gaussian_rho(C)
    zt = Distributions.quantile(_STD_NORMAL, _clp(target))
    zb = Distributions.quantile(_STD_NORMAL, _clp(base))
    den = one(ρ) - ρ * ρ
    return _gaussian_h_from_z(ρ, zt, zb, den)
end

@inline function _gaussian_hinv(C::_GaussianPair, q::Real, base::Real)
    ρ = _gaussian_rho(C)
    zb = Distributions.quantile(_STD_NORMAL, _clp(base))
    zq = Distributions.quantile(_STD_NORMAL, _clp(q))
    return Distributions.cdf(_STD_NORMAL, ρ * zb + sqrt(1 - ρ^2) * zq)
end

@inline hfunc1(C::_GaussianPair, u::Real, v::Real) = _clp(_gaussian_hfunc(C, u, v))
@inline hfunc2(C::_GaussianPair, u::Real, v::Real) = _clp(_gaussian_hfunc(C, v, u))

@inline hfunc1(C::_GaussianPair, uv::Tuple{<:Real,<:Real}) = hfunc1(C, uv[1], uv[2])

@inline hfunc2(C::_GaussianPair, uv::Tuple{<:Real,<:Real}) = hfunc2(C, uv[1], uv[2])

@inline hinv1(C::_GaussianPair, q::Real, v::Real) = _clp(_gaussian_hinv(C, q, v))
@inline hinv2(C::_GaussianPair, q::Real, u::Real) = _clp(_gaussian_hinv(C, q, u))
