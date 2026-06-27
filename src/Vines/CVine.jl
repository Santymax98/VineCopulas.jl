# C-vine pair-copula constructions.
# Convention for edges[k][i]: pair-copula C_{root, child | previous roots},
# where root = order[k] and child = order[k+i]. The copula coordinates are (root, child).

"""
    CVineCopula(order, edges; trunc=length(order)-1)

Construct a canonical vine copula from a variable `order` and a triangular
collection of bivariate pair-copulas. The entry `edges[k][i]` represents the
pair-copula between the root `order[k]` and the child `order[k+i]`, conditional
on the previous roots `order[1:k-1]`.

Matrices of observations follow the package convention `p × n`: rows are
dimensions and columns are observations.

# Example

```julia
C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C13 = ClaytonCopula(2, 2.0)
C23_1 = FrankCopula(2, 3.0)
cv = CVineCopula([1, 2, 3], [[C12, C13], [C23_1]])
```
"""
struct CVineCopula{p,q} <: AbstractVineCopula{p}
    order::NTuple{p,Int}
    edges::NTuple{q,Vector{PairCopula}}
    trunc::Int
end

function CVineCopula(; order, paircopulas, trunc = length(order) - 1)
    ord = collect(Int, order)
    pcs = [Copulas.Copula{2}[pc for pc in level] for level in paircopulas]
    return CVineCopula(ord, pcs; trunc = trunc)
end

function CVineCopula(order::AbstractVector{<:Integer}, edges::AbstractVector; trunc::Int=length(order)-1)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    E = _normalize_edges(edges, p, trunc)
    return CVineCopula{p,trunc}(Tuple(Int.(order)), E, trunc)
end

function CVineCopula(edges::AbstractVector; order=nothing, trunc::Int=length(edges))
    p = length(edges) + 1
    order === nothing && (order = collect(1:p))
    return CVineCopula(order, edges; trunc=trunc)
end

"""
    order(vine)

Return the variable order used by a vine copula.
"""
order(vc::CVineCopula) = vc.order

"""
    edges(vine)

Return the triangular array of bivariate pair-copulas used by a vine copula.
Tree `k` is stored in `edges(vine)[k]`.
"""
edges(vc::CVineCopula) = vc.edges

"""
    truncation(vine)

Return the number of active trees in the vine. A full `p`-dimensional vine has
truncation level `p - 1`.
"""
truncation(vc::CVineCopula) = vc.trunc

Base.show(io::IO, vc::CVineCopula{p}) where {p} = print(io, "CVineCopula(p=$p, trunc=$(vc.trunc))")

function _logpdf_internal(vc::CVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return _logpdf_internal(vc, reshape(u, p, 1))[1]
end

function _logpdf_internal(vc::CVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    n = size(X,2)
    W = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(X[vc.order[j],:])
    end
    ll = zeros(Float64, n)
    buf = Vector{Float64}(undef, 2)
    @inbounds for k in 1:vc.trunc
        root = k
        for i in 1:(p-k)
            child = k + i
            C = vc.edges[k][i]
            for col in 1:n
                ll[col] += _pair_logpdf(C, W[root,col], W[child,col], buf)
            end
        end
        # Update children: child | root, conditioned on previous roots.
        for i in 1:(p-k)
            child = k + i
            C = vc.edges[k][i]
            for col in 1:n
                W[child,col] = hfunc2(C, W[root,col], W[child,col])
            end
        end
    end
    return ll
end

function _rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::CVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    n = size(X,2)
    W = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(X[vc.order[j],:])
    end
    @inbounds for k in 1:vc.trunc
        root = k
        for i in 1:(p-k)
            child = k + i
            C = vc.edges[k][i]
            for col in 1:n
                W[child,col] = hfunc2(C, W[root,col], W[child,col])
            end
        end
    end
    invord = _invperm_tuple(vc.order)
    @inbounds for label in 1:p
        @views out[label,:] .= W[invord[label],:]
    end
    return out
end

function _inverse_rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::CVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    Zx = _as_pxn(p, Z)
    n = size(Zx,2)
    W = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(Zx[vc.order[j],:])
    end
    X = Matrix{Float64}(undef, p, n)
    @inbounds X[1,:] .= W[1,:]
    @inbounds for i in 2:p
        @views X[i,:] .= W[i,:]
        # Invert from most conditioned edge down to the unconditional edge.
        for k in min(i-1, vc.trunc):-1:1
            C = vc.edges[k][i-k]
            for col in 1:n
                # W[k,col] is the Rosenblatt coordinate z_k = u_{k | 1:(k-1)}.
                X[i,col] = hinv2(C, X[i,col], W[k,col])
            end
        end
    end
    invord = _invperm_tuple(vc.order)
    @inbounds for label in 1:p
        @views out[label,:] .= X[invord[label],:]
    end
    return out
end

function _cvine_edge_description(vc::CVineCopula{p}, k::Int, i::Int) where {p}
    root = vc.order[k]
    child = vc.order[k+i]
    D = Tuple(vc.order[1:k-1])
    return VineEdge((root, child), D, vc.edges[k][i], k, i)
end

function vine_edges(vc::CVineCopula)
    out = VineEdge[]
    for k in 1:vc.trunc, i in 1:length(vc.edges[k])
        push!(out, _cvine_edge_description(vc, k, i))
    end
    return out
end
