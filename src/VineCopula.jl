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

The `fixed` keyword has the same meaning as in [`inverse_rosenblatt`](@ref): the fixed
coordinates are held at their given values and the rest are drawn conditionally.
"""
function simulate_qmc(vc::AbstractVineCopula{p}, N::Integer; randomized::Bool=true, fixed=nothing) where {p}
    Z = _qmc_points(p, Int(N); randomized=randomized)
    return inverse_rosenblatt(vc, Z; fixed=fixed)
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

"""
    rand([rng], vine, n; fixed=nothing)
    rand!([rng], A, vine; fixed=nothing)

Draw `n` observations from a vine copula as a `p × n` matrix.

With `fixed = (js, Ujs)` the coordinates `js` are held at the uniforms `Ujs` and the
remaining coordinates are drawn from their conditional law given those values, so the
result is an exact sample from ``C(u_{-js} \\mid u_{js})``. `Ujs` is a
`length(js) × n` matrix, or a tuple or vector of `length(js)` scalars broadcast over
every column. The draw is exact only when [`admits_conditioning`](@ref)`(vine, js)` is
`true`; otherwise an `ArgumentError` names the fix. See [`inverse_rosenblatt`](@ref) for
the mechanism.
"""
function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}; fixed=nothing) where {p}
    return vec(Distributions.rand(rng, vc, 1; fixed=fixed))
end

function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}, n::Int; fixed=nothing) where {p}
    n >= 0 || throw(ArgumentError("n debe ser no negativo"))
    Z = rand(rng, p, n)
    return inverse_rosenblatt!(similar(Z), vc, Z; fixed=fixed)
end

function Distributions.rand(rng::Distributions.AbstractRNG, vc::AbstractVineCopula{p}, n::Integer; fixed=nothing) where {p}
    return Distributions.rand(rng, vc, Int(n); fixed=fixed)
end

# Distributions.jl's rng-less methods do not forward keywords, so the `fixed`
# keyword needs its own rng-less entry points. They use the same default
# generator Distributions.jl uses.
function Distributions.rand(vc::AbstractVineCopula{p}; fixed=nothing) where {p}
    return Distributions.rand(Distributions.default_rng(), vc; fixed=fixed)
end

function Distributions.rand(vc::AbstractVineCopula{p}, n::Int; fixed=nothing) where {p}
    return Distributions.rand(Distributions.default_rng(), vc, n; fixed=fixed)
end

function Distributions.rand(vc::AbstractVineCopula{p}, n::Integer; fixed=nothing) where {p}
    return Distributions.rand(Distributions.default_rng(), vc, Int(n); fixed=fixed)
end

function Distributions.rand!(rng::Distributions.AbstractRNG, A::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}; fixed=nothing) where {p}
    size(A,1) == p || throw(ArgumentError("A debe ser p×n con p=$p"))
    Z = rand(rng, p, size(A,2))
    inverse_rosenblatt!(A, vc, Z; fixed=fixed)
    return A
end

function Distributions.rand!(A::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}; fixed=nothing) where {p}
    return Distributions.rand!(Distributions.default_rng(), A, vc; fixed=fixed)
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
    inverse_rosenblatt(vine, z; fixed=nothing)
    inverse_rosenblatt(vine, Z; fixed=nothing)

Apply the inverse Rosenblatt transform. This maps independent uniforms on the
unit hypercube into observations from the vine copula. Matrix inputs and outputs
use the `p × n` convention.

With `fixed = (js, Ujs)` the coordinates `js` are not generated from `Z`: their
raw uniforms are taken from `Ujs` (a `length(js) × n` matrix, or a tuple or
vector of `length(js)` scalars broadcast over every column) and only the
remaining coordinates are generated, each conditionally on the fixed block and
on the coordinates generated before it. The rows `Z[js, :]` are ignored, so an
unconditional `Z` can be passed unchanged. The result is an exact draw from the
conditional copula ``C(u_{-js} \\mid u_{js})`` whenever
[`admits_conditioning`](@ref)`(vine, js)` is `true`, which is the case when
`js` heads a sampling order of the vine. Otherwise an `ArgumentError` names the
fit-side option that makes the predicate true. A `js => Ujs` pair is accepted
in place of the tuple.
"""
function inverse_rosenblatt(vc::AbstractVineCopula{p}, z::AbstractVector{<:Real}; fixed=nothing) where {p}
    _check_vector_dim(p, z)
    return vec(inverse_rosenblatt(vc, reshape(z, p, 1); fixed=fixed))
end

function inverse_rosenblatt(vc::AbstractVineCopula{p}, Z::AbstractMatrix{<:Real}; fixed=nothing) where {p}
    X = _as_pxn(p, Z)
    out = similar(Matrix{Float64}(X), p, size(X,2))
    return inverse_rosenblatt!(out, vc, X; fixed=fixed)
end

"""
    inverse_rosenblatt!(out, vine, Z; fixed=nothing)

In-place inverse Rosenblatt transform. `out` and `Z` must have the same `p × n`
shape. `fixed` has the same meaning as in [`inverse_rosenblatt`](@ref).
"""
function inverse_rosenblatt!(out::AbstractMatrix{<:Real}, vc::AbstractVineCopula{p}, Z::AbstractMatrix{<:Real}; fixed=nothing) where {p}
    X = _as_pxn(p, Z)
    size(out) == size(X) || throw(ArgumentError("out debe tener tamaño $(size(X)); recibió $(size(out))"))
    fixed === nothing && return _inverse_rosenblatt_internal!(out, vc, X)
    return _inverse_rosenblatt_internal!(out, vc, X, _conditioning_block(vc, fixed, size(X, 2), eltype(out)))
end

"""
    admits_conditioning(vine, js) -> Bool

Whether fixing the coordinates `js` admits an exact conditional draw of the
remaining coordinates through the vine's own sampling recursion, that is,
whether `js` heads a sampling order of `vine`.

The inverse Rosenblatt transform generates the coordinates one at a time, each
conditionally on the ones generated before it. When the fixed set is exactly the
first `length(js)` coordinates that recursion generates, seeding them with known
values and generating the rest gives an exact sample from
``C(u_{-js} \\mid u_{js})`` at the cost of an unconditional `rand`. For a
[`DVineCopula`](@ref) this holds when `js` sits at either end of the path
`order(vine)`; for a [`CVineCopula`](@ref) when `js` is the first
`length(js)` roots of `order(vine)`; for a standard [`RVineCopula`](@ref) when
`js` is the tail of `order(vine)`, which `fit(RVineCopula, U; sampling_tail=js)`
arranges whenever the selected trees allow it. The order of the labels inside
`js` does not matter.

When the predicate is `false`, `rand(vine, n; fixed=(js, Ujs))` refuses with an
`ArgumentError` rather than returning an approximate draw.
"""
function admits_conditioning end

# Validate the `fixed` keyword against the vine and the batch size, and return
# the labels together with a `length(js) × n` block of the supplied uniforms.
# Public input is validated against [0, 1] before numerical kernels may
# interiorize probabilities as needed. The block takes the element type of the
# destination so no number type is forced on a caller.
@inline function _validate_fixed_uniform(u)
    if !(u isa Real && isfinite(u) && zero(u) <= u <= one(u))
        throw(ArgumentError(
            "fixed values must be finite uniforms in [0, 1]; got $u"
        ))
    end
    return u
end

function _conditioning_block(vc::AbstractVineCopula{p}, fixed, n::Int, ::Type{T}) where {p,T}
    fixed isa Union{Tuple,Pair} && length(fixed) == 2 || throw(ArgumentError(
        "fixed must be a `(js, Ujs)` tuple or a `js => Ujs` pair"
    ))
    js0, Ujs = fixed
    js = collect(Int, js0)
    k = length(js)
    1 <= k <= p - 1 || throw(ArgumentError(
        "fixed must name between 1 and $(p - 1) of the $p coordinates; got $k"
    ))
    allunique(js) && all(j -> 1 <= j <= p, js) || throw(ArgumentError(
        "fixed labels must be distinct and in 1:$p; got $js"
    ))
    admits_conditioning(vc, js) || throw(ArgumentError(_conditioning_refusal(vc, js)))

    U = Matrix{T}(undef, k, n)
    if Ujs isa AbstractMatrix
        size(Ujs) == (k, n) || throw(DimensionMismatch(
            "fixed values must be $(k)×$(n) to match the fixed labels and the batch; got $(size(Ujs))"
        ))
        @inbounds for col in 1:n, r in 1:k
            u = _validate_fixed_uniform(Ujs[r, col])
            U[r, col] = u
        end
    else
        length(Ujs) == k || throw(DimensionMismatch(
            "fixed values must hold one scalar per fixed label ($k); got $(length(Ujs))"
        ))
        @inbounds for (r, u0) in enumerate(Ujs)
            u = _validate_fixed_uniform(u0)
            @views U[r, :] .= u
        end
    end
    return js, U
end

# Whether `js` is, as a set, the first `length(js)` entries of `ord`.
function _heads_order(ord, js)
    k = length(js)
    1 <= k <= length(ord) - 1 || return false
    return Set{Int}(js) == Set{Int}(ord[i] for i in 1:k)
end

# Whether `js` is, as a set, the last `length(js)` entries of `ord`.
function _tails_order(ord, js)
    k = length(js)
    p = length(ord)
    1 <= k <= p - 1 || return false
    return Set{Int}(js) == Set{Int}(ord[i] for i in (p - k + 1):p)
end

# Clear fallbacks.
_logpdf_internal(::AbstractVineCopula, ::Any) = throw(ArgumentError("logpdf no implementado para este tipo de vine"))
_rosenblatt_internal!(::AbstractMatrix, ::AbstractVineCopula, ::AbstractMatrix) = throw(ArgumentError("rosenblatt no implementado para este tipo de vine"))
_inverse_rosenblatt_internal!(::AbstractMatrix, ::AbstractVineCopula, ::AbstractMatrix) = throw(ArgumentError("inverse_rosenblatt no implementado para este tipo de vine"))
_inverse_rosenblatt_internal!(::AbstractMatrix, ::AbstractVineCopula, ::AbstractMatrix, ::Any) = throw(ArgumentError("conditional inverse_rosenblatt is not implemented for this vine type"))
