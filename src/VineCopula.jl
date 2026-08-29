# Core interface shared by all vine copulas.

Base.length(::AbstractVineStructure{p}) where {p} = p
Base.length(::AbstractVineCopula{p}) where {p} = p

"""
    structure(vine)

Return the vine's structural description without the pair-copula array.
"""
function structure end

"""
    order(vine_or_structure)

Return the variable order used by a vine copula or vine structure.
"""
function order end

"""
    truncation(vine_or_structure)

Return the number of active trees in the vine. A full `p`-dimensional vine has
truncation level `p - 1`.
"""
function truncation end

function _check_truncate_level(level::Integer, p::Int, current::Int)
    q = Int(level)
    1 <= q <= min(current, p - 1) ||
        throw(ArgumentError("level must be in 1:$(min(current, p - 1))"))
    return q
end

"""
    truncate(vine_or_structure, level)

Return a copy of a vine or vine structure retaining only trees `1:level`.
Truncation cannot restore trees that are absent from the input object.
"""
truncate

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
