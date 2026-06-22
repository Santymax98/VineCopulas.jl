# Internal numerical and structural utilities.

const EPSU = 1.0e-12
const TOLX = 1.0e-12
const TOLF = 1.0e-12
const MAXE = 1_000

# Machine epsilon measures spacing around one; it is not the smallest positive
# floating-point number. Conditional probabilities can be much smaller than
# eps(T), so preserve every representable interior value.
@inline function _clp(x::T) where {T<:AbstractFloat}
    isnan(x) && return x
    return clamp(x, nextfloat(zero(T)), prevfloat(one(T)))
end

@inline _clp(x::Integer) = _clp(float(x))
@inline _clp(x::Rational) = _clp(float(x))

# Number wrappers such as ForwardDiff.Dual are not AbstractFloat, but they can
# represent floating bounds through convert/oftype.
@inline function _clp(x::Real)
    isnan(x) && return x
    return clamp(x, oftype(x, nextfloat(0.0)), oftype(x, prevfloat(1.0)))
end

@inline _isunit(x::Real) = zero(x) <= x <= one(x)

@inline function _softplus(x::T) where {T<:Real}
    x > zero(T) && return x + log1p(exp(-x))
    return log1p(exp(x))
end

@inline function _logistic(x::T) where {T<:Real}
    if x >= zero(T)
        e = exp(-x)
        return inv(one(T) + e)
    end
    e = exp(x)
    return e / (one(T) + e)
end

# log|exp(-x)-1| without overflow.
@inline function _logabsexpm1_minus(x::T) where {T<:Real}
    x > zero(T) && return log(-expm1(-x))
    c = -x
    return c + log(-expm1(-c))
end

# log(W₀(exp(logz))) without necessarily constructing exp(logz).
@inline function _log_lambertw_exp(logz::T) where {T<:AbstractFloat}
    log_min, log_max = log(floatmin(T)), log(floatmax(T))
    logz < log_min && return logz
    logz < log_max - T(2) && return log(T(real(LambertW.lambertw(exp(logz), 0))))

    w = max(logz - log(logz), one(T))
    for _ in 1:6
        w -= (w + log(w) - logz) / (one(T) + inv(w))
    end
    return log(w)
end

# Stable evaluation of -W₋₁(-exp(-L)), equivalently the solution x ≥ 1 of
# x - log(x) = L. This is a reusable Lambert-W primitive, not a generator
# inversion routine.
@inline function _neg_lambertwm1_expneg(L::T) where {T<:AbstractFloat}
    L >= one(T) || throw(DomainError(L, "The W₋₁ argument lies outside its real branch."))
    L <= T(16) && return -T(real(LambertW.lambertw(-exp(-L), -1)))

    x = L + log(L)
    for _ in 1:32
        xnew = x - (x - log(x) - L) / (one(T) - inv(x))
        xnew > one(T) || (xnew = (x + one(T)) / T(2))
        abs(xnew - x) <= T(8) * eps(T) * max(one(T), abs(xnew)) && return xnew
        x = xnew
    end
    return x
end

# log(exp(a)+exp(b)-1), stable when a and b are very different.
@inline function _logaddexp_minus_one(a::Real, b::Real)
    x, y = promote(float(a), float(b))
    m = max(x, y)
    isinf(m) && return m
    lse = m + log(exp(x - m) + exp(y - m))
    return max(lse + log1p(-exp(-lse)), zero(lse))
end

# log(exp(total)-exp(base)+1), assuming total ≥ base ≥ 0.
@inline function _logsubexp_plus_one(total::Real, base::Real)
    t, b = promote(float(total), float(base))
    d = t - b
    d <= zero(d) && return zero(d)
    isinf(t) && return isinf(b) ? zero(t) : t
    inside = -expm1(-d) + exp(-t)
    return max(t + log(inside), zero(t))
end

@inline function _negative_derivative_magnitude(y::Real, family::AbstractString)
    yy = float(y)
    isnan(yy) && throw(DomainError(y, "The target value for the inverse of ϕ' cannot be NaN."))
    yy > zero(yy) && throw(DomainError(y, "The first derivative of a $family generator is non-positive."))
    return -yy
end

function _check_order(order::AbstractVector{<:Integer})
    p = length(order)
    p >= 2 || throw(ArgumentError("order debe tener longitud al menos 2"))
    seen = falses(p)
    @inbounds for v0 in order
        v = Int(v0)
        1 <= v <= p || throw(ArgumentError("order debe ser una permutación de 1:$p"))
        seen[v] && throw(ArgumentError("order contiene índices repetidos"))
        seen[v] = true
    end
    return p
end

function _check_edges(edges::AbstractVector, p::Int, trunc::Int)
    length(edges) == trunc || throw(ArgumentError("edges debe tener $trunc niveles"))
    @inbounds for k in 1:trunc
        length(edges[k]) == p-k || throw(ArgumentError("edges[$k] debe tener $(p-k) pair-copulas; recibió $(length(edges[k]))"))
        for C in edges[k]
            C isa PairCopula || throw(ArgumentError("cada elemento de edges debe ser una cópula bivariada de Copulas.jl"))
        end
    end
    return nothing
end

function _normalize_edges(edges::AbstractVector, p::Int, trunc::Int)
    _check_edges(edges, p, trunc)
    out = Vector{Vector{PairCopula}}(undef, trunc)
    @inbounds for k in 1:trunc
        out[k] = PairCopula[C for C in edges[k]]
    end
    return Tuple(out)
end

function _normalize_struct_array(S::AbstractVector, p::Int, trunc::Int)
    length(S) == trunc || throw(ArgumentError("struct_array debe tener $trunc niveles"))
    out = Vector{Vector{Int}}(undef, trunc)
    @inbounds for k in 1:trunc
        length(S[k]) == p-k || throw(ArgumentError("struct_array[$k] debe tener $(p-k) entradas"))
        out[k] = Int[x for x in S[k]]
        all(v -> 1 <= v <= p, out[k]) || throw(ArgumentError("struct_array[$k] contiene índices fuera de 1:$p"))
    end
    return Tuple(out)
end

@inline function _as_pxn(p::Int, U::AbstractMatrix{<:Real})
    size(U, 1) == p && return U
    size(U, 2) == p && return permutedims(U)
    throw(ArgumentError("la matriz debe ser p×n o n×p con p=$p; recibió $(size(U))"))
end

@inline function _check_vector_dim(p::Int, u::AbstractVector)
    length(u) == p || throw(ArgumentError("u debe tener longitud $p; recibió $(length(u))"))
end

@inline function _pair_logpdf(C::PairCopula, u::Real, v::Real, buf::Vector{Float64})
    buf[1], buf[2] = _clp(u), _clp(v)
    return Distributions.logpdf(C, buf)
end

@inline function _invperm_tuple(order::NTuple{p,Int}) where {p}
    inv = Vector{Int}(undef, p)
    @inbounds for i in 1:p
        inv[order[i]] = i
    end
    return inv
end
