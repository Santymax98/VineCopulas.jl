# ---------------------------------------------------------------------
# Generic bivariate pair-copula primitives
# ---------------------------------------------------------------------
#
# This file defines the common pair-copula interface used by the vine
# engines. Compatible bivariate Copulas.jl copulas can use these generic
# fallbacks without requiring a VineCopulas.jl-specific implementation.
#
# Generic conditionals are delegated to `Copulas.condition`:
#
#   hfunc1(C,u,v) = F₁|₂(u|v)
#   hfunc2(C,u,v) = F₂|₁(v|u)
#
# Family-specific files may provide specialized methods when closed-form
# expressions, numerical stability, singular behavior, or performance
# justify doing so. Such methods are optional fast paths, not requirements
# for generic pair-copula evaluation.

const _STD_NORMAL = Distributions.Normal()

@inline function _pair_logpdf(C::PairCopula, u::Real, v::Real, buf::Vector{Float64})
    buf[1], buf[2] = _clp(u), _clp(v)
    return Distributions.logpdf(C, buf)
end

# Fused internal protocols used by vine traversals.  Family-specific methods
# may override any subset to reuse transformed coordinates.  The generic
# implementations deliberately compose the public primitives so every
# compatible Copulas.jl bivariate copula remains usable.
@inline function _pair_hfuncs(C::PairCopula, u::Real, v::Real)
    return hfunc1(C, u, v), hfunc2(C, u, v)
end

@inline function _pair_step(
    C::PairCopula,
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    logc = _pair_logpdf(C, u, v, buf)
    h1, h2 = _pair_hfuncs(C, u, v)
    return logc, h1, h2
end

@inline function _pair_logpdf_h1(
    C::PairCopula,
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    return _pair_logpdf(C, u, v, buf), hfunc1(C, u, v)
end

@inline function _pair_logpdf_h2(
    C::PairCopula,
    u::Real,
    v::Real,
    buf::Vector{Float64},
)
    return _pair_logpdf(C, u, v, buf), hfunc2(C, u, v)
end

# Batched/in-place helpers keep scratch ownership local to the caller. The
# fused density helpers also serve as function barriers for heterogeneous pair
# containers: dispatch on `C` happens once per edge, while the observation loop
# runs with the concrete pair-copula type. Inputs may alias their corresponding
# outputs because both coordinates are loaded before any output is written.
function _pair_logpdf_add!(
    ll::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
    buf::Vector{Float64},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(ll) == n || throw(DimensionMismatch("ll has incompatible length"))
    @inbounds for i in eachindex(ll, u, v)
        ll[i] += _pair_logpdf(C, u[i], v[i], buf)
    end
    return ll
end

function _pair_logpdf_h2_add!(
    ll::AbstractVector{<:Real},
    out2::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
    buf::Vector{Float64},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(ll) == n || throw(DimensionMismatch("ll has incompatible length"))
    length(out2) == n || throw(DimensionMismatch("out2 has incompatible length"))
    @inbounds for i in eachindex(ll, out2, u, v)
        ui, vi = u[i], v[i]
        logc, h2 = _pair_logpdf_h2(C, ui, vi, buf)
        ll[i] += logc
        out2[i] = h2
    end
    return ll, out2
end

function _pair_step_add!(
    ll::AbstractVector{<:Real},
    out1::AbstractVector{<:Real},
    out2::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
    buf::Vector{Float64},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(ll) == n || throw(DimensionMismatch("ll has incompatible length"))
    length(out1) == n || throw(DimensionMismatch("out1 has incompatible length"))
    length(out2) == n || throw(DimensionMismatch("out2 has incompatible length"))
    @inbounds for i in eachindex(ll, out1, out2, u, v)
        ui, vi = u[i], v[i]
        logc, h1, h2 = _pair_step(C, ui, vi, buf)
        ll[i] += logc
        out1[i] = h1
        out2[i] = h2
    end
    return ll, out1, out2
end

function _pair_hfuncs!(
    out1::AbstractVector{<:Real},
    out2::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(out1) == n || throw(DimensionMismatch("out1 has incompatible length"))
    length(out2) == n || throw(DimensionMismatch("out2 has incompatible length"))
    @inbounds for i in eachindex(out1, out2, u, v)
        h1, h2 = _pair_hfuncs(C, u[i], v[i])
        out1[i] = h1
        out2[i] = h2
    end
    return out1, out2
end

function _pair_hfunc1!(
    out::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(out) == n || throw(DimensionMismatch("out has incompatible length"))
    @inbounds for i in eachindex(out, u, v)
        out[i] = hfunc1(C, u[i], v[i])
    end
    return out
end

function _pair_hfunc2!(
    out::AbstractVector{<:Real},
    C::CT,
    u::AbstractVector{<:Real},
    v::AbstractVector{<:Real},
) where {CT<:PairCopula}
    n = length(u)
    length(v) == n || throw(DimensionMismatch("pair inputs must have equal length"))
    length(out) == n || throw(DimensionMismatch("out has incompatible length"))
    @inbounds for i in eachindex(out, u, v)
        out[i] = hfunc2(C, u[i], v[i])
    end
    return out
end

# Conditional distribution primitives for bivariate copulas.
#
# Convention:
#   hfunc1(C,u,v) = F_{1|2}(u | v) = ∂C(u,v)/∂v
#   hfunc2(C,u,v) = F_{2|1}(v | u) = ∂C(u,v)/∂u
#
# Hence hinv1 inverts the first argument given v,
# and hinv2 inverts the second argument given u.

# -------------------- public ASCII API --------------------

"""
    hfunc1(C, u, v)
    hfunc1(C, U)

Compute ``F_{1|2}(u | v) = ∂C(u,v)/∂v`` for a bivariate pair-copula `C`.
For an `n × 2` matrix `U`, return one value per row.
"""
@inline hfunc1(C::PairCopula, u::Real, v::Real) = hfunc1(C, (u, v))
"""
    hfunc2(C, u, v)
    hfunc2(C, U)

Compute ``F_{2|1}(v | u) = ∂C(u,v)/∂u`` for a bivariate pair-copula `C`.
For an `n × 2` matrix `U`, return one value per row.
"""
@inline hfunc2(C::PairCopula, u::Real, v::Real) = hfunc2(C, (u, v))

# -------------------- generic fallback for arbitrary pair-copulas --------------------

function hfunc1(C::PairCopula, uv)
    length(uv) == 2 || throw(ArgumentError("hfunc1 espera dos coordenadas"))

    u, v = _clp(uv[1]), _clp(uv[2])
    D = Copulas.condition(C, 2, v)

    return _clp(Distributions.cdf(D, u))
end

function hfunc2(C::PairCopula, uv)
    length(uv) == 2 || throw(ArgumentError("hfunc2 espera dos coordenadas"))

    u, v = _clp(uv[1]), _clp(uv[2])
    D = Copulas.condition(C, 1, u)

    return _clp(Distributions.cdf(D, v))
end

"""
    hinv1(C, q, v)

Invert `hfunc1` in its first coordinate: return `u` such that
`hfunc1(C, u, v) ≈ q`. Singular copulas may use a generalized inverse.
"""
function hinv1(C::PairCopula, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    D = Copulas.condition(C, 2, v)

    return _clp(Distributions.quantile(D, q))
end

"""
    hinv2(C, q, u)

Invert `hfunc2` in its second coordinate: return `v` such that
`hfunc2(C, u, v) ≈ q`. Singular copulas may use a generalized inverse.
"""
function hinv2(C::PairCopula, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    D = Copulas.condition(C, 1, u)

    return _clp(Distributions.quantile(D, q))
end

# -------------------- matrix helpers --------------------

function _hfunc1!(out::AbstractVector{<:Real}, C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc1(C,U): U debe ser n×2"))
    length(out) == size(U, 1) || throw(DimensionMismatch("out has incompatible length"))
    @inbounds for i in axes(U, 1)
        out[i] = hfunc1(C, U[i, 1], U[i, 2])
    end
    return out
end

function _hfunc2!(out::AbstractVector{<:Real}, C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc2(C,U): U debe ser n×2"))
    length(out) == size(U, 1) || throw(DimensionMismatch("out has incompatible length"))
    @inbounds for i in axes(U, 1)
        out[i] = hfunc2(C, U[i, 1], U[i, 2])
    end
    return out
end

function hfunc1(C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc1(C,U): U debe ser n×2"))
    out = Vector{Float64}(undef, size(U, 1))
    return _hfunc1!(out, C, U)
end

function hfunc2(C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc2(C,U): U debe ser n×2"))
    out = Vector{Float64}(undef, size(U, 1))
    return _hfunc2!(out, C, U)
end

# -------------------- Unicode aliases, Copulas.jl style --------------------

"""Unicode alias for [`hfunc1`](@ref)."""
const h₁ = hfunc1
"""Unicode alias for [`hfunc2`](@ref)."""
const h₂ = hfunc2
"""Unicode alias for [`hinv1`](@ref)."""
const h₁⁻¹ = hinv1
"""Unicode alias for [`hinv2`](@ref)."""
const h₂⁻¹ = hinv2
