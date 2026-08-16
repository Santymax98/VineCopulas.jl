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

function hfunc1(C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc1(C,U): U debe ser n×2"))

    out = Vector{Float64}(undef, size(U, 1))

    @inbounds for i in axes(U, 1)
        out[i] = hfunc1(C, U[i, 1], U[i, 2])
    end

    return out
end

function hfunc2(C::PairCopula, U::AbstractMatrix{<:Real})
    size(U, 2) == 2 || throw(ArgumentError("hfunc2(C,U): U debe ser n×2"))

    out = Vector{Float64}(undef, size(U, 1))

    @inbounds for i in axes(U, 1)
        out[i] = hfunc2(C, U[i, 1], U[i, 2])
    end

    return out
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
