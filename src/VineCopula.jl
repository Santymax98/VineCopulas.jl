# Core interface shared by all vine copulas.

Base.length(::AbstractVineCopula{p}) where {p} = p

# -------------------- CDF controls --------------------

const _CDF_NSAMPLES = Ref(10_000)
const _CDF_QMC_SEED = Ref(0x7A1E5EED)

"""
    set_cdf_nsamples!(N::Integer)

Set the global number of Monte Carlo or quasi-Monte Carlo samples used by the
numerical `cdf` approximation for vine copulas. This does not affect `pdf`,
`logpdf`, `rand`, or Rosenblatt transforms.
"""
set_cdf_nsamples!(N::Integer) = (_CDF_NSAMPLES[] = max(1, Int(N)); nothing)

"""
    enable_deterministic_cdf!(Npow::Integer=15)

Use `2^Npow` quasi-Monte Carlo points for the numerical `cdf` approximation.
This helper is intended for reproducible examples and tests.
"""
enable_deterministic_cdf!(Npow::Integer=15) = (set_cdf_nsamples!(1 << Npow); nothing)

function _qmc_points(p::Int, N::Int; randomized::Bool=true)
    N >= 1 || throw(ArgumentError("N debe ser positivo"))
    M = randomized ? (1 << ceil(Int, log2(N))) : N
    X = QuasiMonteCarlo.sample(M, p, QuasiMonteCarlo.SobolSample())
    if randomized
        rng = Random.MersenneTwister(_CDF_QMC_SEED[])
        X = QuasiMonteCarlo.randomize(X, QuasiMonteCarlo.OwenScramble(base=2, rng=rng))
    end
    if size(X,1) == M && size(X,2) == p
        return Matrix(permutedims(@view X[1:N, :]))
    elseif size(X,1) == p && size(X,2) == M
        return Matrix(@view X[:, 1:N])
    else
        throw(ErrorException("QuasiMonteCarlo devolvió dimensiones inesperadas $(size(X))"))
    end
end

"""
    simulate_qmc(vine, N; randomized=true)

Generate `N` quasi-Monte Carlo observations from a vine copula using Sobol
points followed by the inverse Rosenblatt transform. The returned matrix has
size `p × N`, with rows corresponding to variables and columns to observations.
"""
function simulate_qmc(vc::AbstractVineCopula{p}, N::Integer; randomized::Bool=true) where {p}
    Z = _qmc_points(p, Int(N); randomized=randomized)
    return inverse_rosenblatt(vc, Z)
end

# -------------------- Distributions.jl interface --------------------

function Distributions.insupport(vc::AbstractVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    length(u) == p || return false
    return all(_isunit, u)
end

function Distributions.logpdf(vc::AbstractVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return _logpdf_internal(vc, u)
end

function Distributions.logpdf(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    return _logpdf_internal(vc, U)
end

Distributions.pdf(vc::AbstractVineCopula{p}, u::AbstractVector{<:Real}) where {p} = exp(Distributions.logpdf(vc, u))
Distributions.pdf(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p} = exp.(Distributions.logpdf(vc, U))

function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}) where {p}
    return vec(Distributions.rand(rng, vc, 1))
end

function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}, n::Int) where {p}
    n >= 0 || throw(ArgumentError("n debe ser no negativo"))
    Z = rand(rng, p, n)
    return inverse_rosenblatt!(similar(Z), vc, Z)
end

function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}, n::Integer) where {p}
    return Distributions.rand(rng, vc, Int(n))
end

function Distributions.rand!(rng::Distributions.AbstractRNG, A::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}) where {p}
    size(A,1) == p || throw(ArgumentError("A debe ser p×n con p=$p"))
    Z = rand(rng, p, size(A,2))
    inverse_rosenblatt!(A, vc, Z)
    return A
end

function Distributions.cdf(vc::AbstractVineCopula{p}, u::AbstractVector{<:Real};
                           method::Symbol=:qmc,
                           N::Integer=_CDF_NSAMPLES[],
                           randomized::Bool=true,
                           rng::Distributions.AbstractRNG=Distributions.default_rng()) where {p}
    _check_vector_dim(p, u)
    method in (:qmc, :mc) || throw(ArgumentError("method debe ser :qmc o :mc"))
    U = method === :qmc ? simulate_qmc(vc, N; randomized=randomized) : Distributions.rand(rng, vc, Int(N))
    return _box_probability(U, u)
end

function Distributions.cdf(vc::AbstractVineCopula{p}, Ueval::AbstractMatrix{<:Real};
                           method::Symbol=:qmc,
                           N::Integer=_CDF_NSAMPLES[],
                           randomized::Bool=true,
                           rng::Distributions.AbstractRNG=Distributions.default_rng()) where {p}
    method in (:qmc, :mc) || throw(ArgumentError("method debe ser :qmc o :mc"))
    X = _as_pxn(p, Ueval)
    Usim = method === :qmc ? simulate_qmc(vc, N; randomized=randomized) : Distributions.rand(rng, vc, Int(N))
    out = Vector{Float64}(undef, size(X,2))
    @inbounds for j in axes(X,2)
        out[j] = _box_probability(Usim, view(X, :, j))
    end
    return out
end

function _box_probability(U::AbstractMatrix{<:Real}, u::AbstractVector{<:Real})
    p, n = size(U)
    length(u) == p || throw(ArgumentError("dimensión incompatible en CDF"))
    uc = Vector{Float64}(undef, p)
    @inbounds for j in 1:p
        uc[j] = _clp(u[j])
    end
    count = 0
    @inbounds for col in 1:n
        inside = true
        for j in 1:p
            if U[j,col] > uc[j]
                inside = false
                break
            end
        end
        count += inside
    end
    return count / n
end

# -------------------- Rosenblatt transforms --------------------

"""
    rosenblatt(vine, u)
    rosenblatt(vine, U)

Compute the Rosenblatt transform of a point or matrix under a vine copula. A
matrix input is interpreted as `p × n`: rows are dimensions and columns are
observations. The output has the same shape as the input.
"""
function rosenblatt(vc::AbstractVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return vec(rosenblatt(vc, reshape(u, p, 1)))
end

function rosenblatt(vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    out = similar(Matrix{Float64}(X), p, size(X,2))
    return rosenblatt!(out, vc, X)
end

"""
    rosenblatt!(out, vine, U)

In-place Rosenblatt transform. `out` and `U` must have the same `p × n` shape.
"""
function rosenblatt!(out::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    size(out) == size(X) || throw(ArgumentError("out debe tener tamaño $(size(X)); recibió $(size(out))"))
    return _rosenblatt_internal!(out, vc, X)
end

"""
    inverse_rosenblatt(vine, z)
    inverse_rosenblatt(vine, Z)

Apply the inverse Rosenblatt transform. This maps independent uniforms on the
unit hypercube into observations from the vine copula. Matrix inputs and outputs
use the `p × n` convention.
"""
function inverse_rosenblatt(vc::AbstractVineCopula{p}, z::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, z)
    return vec(inverse_rosenblatt(vc, reshape(z, p, 1)))
end

function inverse_rosenblatt(vc::AbstractVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, Z)
    out = similar(Matrix{Float64}(X), p, size(X,2))
    return inverse_rosenblatt!(out, vc, X)
end

"""
    inverse_rosenblatt!(out, vine, Z)

In-place inverse Rosenblatt transform. `out` and `Z` must have the same `p × n`
shape.
"""
function inverse_rosenblatt!(out::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, Z)
    size(out) == size(X) || throw(ArgumentError("out debe tener tamaño $(size(X)); recibió $(size(out))"))
    return _inverse_rosenblatt_internal!(out, vc, X)
end

# Clear fallbacks.
_logpdf_internal(::AbstractVineCopula, ::Any) = throw(ArgumentError("logpdf no implementado para este tipo de vine"))
_rosenblatt_internal!(::AbstractMatrix, ::AbstractVineCopula, ::AbstractMatrix) = throw(ArgumentError("rosenblatt no implementado para este tipo de vine"))
_inverse_rosenblatt_internal!(::AbstractMatrix, ::AbstractVineCopula, ::AbstractMatrix) = throw(ArgumentError("inverse_rosenblatt no implementado para este tipo de vine"))

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

# -------------------- generic numerical helpers --------------------

@inline function _unit_root(f)
    a, b = EPSU, 1.0 - EPSU
    fa, fb = f(a), f(b)

    if (fa <= 0 <= fb) || (fb <= 0 <= fa)
        return Roots.find_zero(f, (a, b), Roots.Brent(); xatol = TOLX, ftol = TOLF, maxevals = MAXE)
    else
        return abs(fa) <= abs(fb) ? a : b
    end
end

# Generic fallback for arbitrary pair-copulas.
#
# The inverse of the first derivative of an Archimedean generator is
# intentionally defined in Conditionals/Archimedeans.jl, because it belongs
# to the Archimedean conditional formula and must not be defined twice during
# precompilation.

# -------------------- generic fallback for arbitrary pair-copulas --------------------

function hfunc1(C::PairCopula, uv)
    length(uv) == 2 || throw(ArgumentError("hfunc1 espera dos coordenadas"))

    u, v = _clp(uv[1]), _clp(uv[2])
    f(t) = Distributions.cdf(C, [u, _clp(t)])

    return _clp(ForwardDiff.derivative(f, v))
end

function hfunc2(C::PairCopula, uv)
    length(uv) == 2 || throw(ArgumentError("hfunc2 espera dos coordenadas"))

    u, v = _clp(uv[1]), _clp(uv[2])
    f(t) = Distributions.cdf(C, [_clp(t), v])

    return _clp(ForwardDiff.derivative(f, u))
end

"""
    hinv1(C, q, v)

Invert `hfunc1` in its first coordinate: return `u` such that
`hfunc1(C, u, v) ≈ q`. Singular copulas may use a generalized inverse.
"""
function hinv1(C::PairCopula, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    return _clp(_unit_root(u -> hfunc1(C, u, v) - q))
end

"""
    hinv2(C, q, u)

Invert `hfunc2` in its second coordinate: return `v` such that
`hfunc2(C, u, v) ≈ q`. Singular copulas may use a generalized inverse.
"""
function hinv2(C::PairCopula, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    return _clp(_unit_root(v -> hfunc2(C, u, v) - q))
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