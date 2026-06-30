# D-vine pair-copula constructions.
# Convention for edges[k][i]: C_{left, right | inner chain}, with
# left = order[i], right = order[i+k] and conditioning set order[i+1:i+k-1].
# Copula coordinates are (left, right).

"""
    DVineCopula(order, edges; trunc=length(order)-1)

Construct a drawable/path vine copula from a variable `order` and a triangular
collection of bivariate pair-copulas. The entry `edges[k][i]` represents the
pair-copula between `order[i]` and `order[i+k]`, conditional on the variables
between them in the D-vine path.

# Example

```julia
C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)
dv = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
```
"""
struct DVineCopula{p,q,E} <: AbstractVineCopula{p}
    order::NTuple{p,Int}
    edges::E
    trunc::Int
end

function DVineCopula(; order, paircopulas, trunc = length(order) - 1)
    ord = collect(Int, order)
    pcs = [collect(level) for level in paircopulas]
    return DVineCopula(ord, pcs; trunc = trunc)
end

function DVineCopula(order::AbstractVector{<:Integer}, edges; trunc::Int=length(order)-1)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    E = _normalize_edges(edges, p, trunc)
    return DVineCopula{p,trunc,typeof(E)}(Tuple(Int.(order)), E, trunc)
end

function DVineCopula(edges; order=nothing, trunc::Int=length(edges))
    p = length(edges) + 1
    order === nothing && (order = collect(1:p))
    return DVineCopula(order, edges; trunc=trunc)
end

"""
    order(vine)

Return the variable order used by a vine copula.
"""
order(vc::DVineCopula) = vc.order

"""
    edges(vine)

Return the triangular array of bivariate pair-copulas used by a vine copula.
Tree `k` is stored in `edges(vine)[k]`.
"""
edges(vc::DVineCopula) = vc.edges

"""
    truncation(vine)

Return the number of active trees in the vine. A full `p`-dimensional vine has
truncation level `p - 1`.
"""
truncation(vc::DVineCopula) = vc.trunc

Base.show(io::IO, vc::DVineCopula{p}) where {p} = print(io, "DVineCopula(p=$p, trunc=$(vc.trunc))")

function _logpdf_internal(vc::DVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return _logpdf_internal(vc, reshape(u, p, 1))[1]
end

function _logpdf_internal(vc::DVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    n = size(X,2)
    L = Matrix{Float64}(undef, p, n)
    R = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views L[j,:] .= _clp.(X[vc.order[j],:])
        @views R[j,:] .= L[j,:]
    end
    ll = zeros(Float64, n)
    buf = Vector{Float64}(undef, 2)
    @inbounds for k in 1:vc.trunc
        # Pair (i, i+k | i+1:i+k-1) uses L[i] and R[i+k].
        for i in 1:(p-k)
            C = vc.edges[k][i]
            for col in 1:n
                ll[col] += _pair_logpdf(C, L[i,col], R[i+k,col], buf)
            end
        end
        if k < vc.trunc
            Lnext = copy(L)
            Rnext = copy(R)
            for i in 1:(p-k)
                C = vc.edges[k][i]
                for col in 1:n
                    uL = L[i,col]
                    uR = R[i+k,col]
                    Lnext[i,col] = hfunc1(C, uL, uR)
                    Rnext[i+k,col] = hfunc2(C, uL, uR)
                end
            end
            L, R = Lnext, Rnext
        end
    end
    return ll
end

function _dvine_left_conditionals(vc::DVineCopula{p}, X::AbstractMatrix{<:Real}, i::Int) where {p}
    # L[m] = u_{m | m+1:(i-1)} is only needed when i-m <= trunc. Restricting
    # the recurrence to that window avoids accessing absent tree levels in a
    # truncated D-vine.
    n = size(X, 2)
    first = max(1, i - vc.trunc)
    L = [copy(@view X[m, :]) for m in 1:(i-1)]

    for t in (first+1):(i-1)
        R = Vector{Vector{Float64}}(undef, t)
        R[t] = copy(@view X[t, :])
        for m in (t-1):-1:first
            C = vc.edges[t-m][m]
            newL, newR = similar(L[m]), similar(R[m+1])
            @inbounds for col in 1:n
                uL, uR = _clp(L[m][col]), _clp(R[m+1][col])
                newL[col] = hfunc1(C, uL, uR)
                newR[col] = hfunc2(C, uL, uR)
            end
            L[m], R[m] = newL, newR
        end
    end
    return L
end

function _rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::DVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    Ux = _as_pxn(p, U)
    n = size(Ux,2)
    X = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views X[j,:] .= _clp.(Ux[vc.order[j],:])
    end
    Z = Matrix{Float64}(undef, p, n)
    @inbounds Z[1,:] .= X[1,:]
    @inbounds for i in 2:p
        L = _dvine_left_conditionals(vc, X, i)
        @views Z[i,:] .= X[i,:]
        # z_i = F_{i | 1:(i-1)}. Apply hfunc2 from nearest to farthest left.
        for m in (i-1):-1:1
            i-m <= vc.trunc || continue
            C = vc.edges[i-m][m]
            cond = L[m]
            for col in 1:n
                Z[i,col] = hfunc2(C, cond[col], Z[i,col])
            end
        end
    end
    invord = _invperm_tuple(vc.order)
    @inbounds for label in 1:p
        @views out[label,:] .= Z[invord[label],:]
    end
    return out
end

function _inverse_rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::DVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    Zx = _as_pxn(p, Z)
    n = size(Zx,2)
    W = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(Zx[vc.order[j],:])
    end
    X = Matrix{Float64}(undef, p, n)
    @inbounds X[1,:] .= W[1,:]
    @inbounds for i in 2:p
        L = _dvine_left_conditionals(vc, X, i)
        @views X[i,:] .= W[i,:]
        # Invert from farthest conditioned pair to nearest.
        for m in 1:(i-1)
            i-m <= vc.trunc || continue
            C = vc.edges[i-m][m]
            cond = L[m]
            for col in 1:n
                X[i,col] = hinv2(C, X[i,col], cond[col])
            end
        end
    end
    invord = _invperm_tuple(vc.order)
    @inbounds for label in 1:p
        @views out[label,:] .= X[invord[label],:]
    end
    return out
end

function _dvine_edge_description(vc::DVineCopula{p}, k::Int, i::Int) where {p}
    left = vc.order[i]
    right = vc.order[i+k]
    D = Tuple(vc.order[i+1:i+k-1])
    return VineEdge((left, right), D, vc.edges[k][i], k, i)
end

function vine_edges(vc::DVineCopula)
    out = VineEdge[]
    for k in 1:vc.trunc, i in 1:length(vc.edges[k])
        push!(out, _dvine_edge_description(vc, k, i))
    end
    return out
end
