# Regular vines.
# The primary v0.1 constructor is RVineCopula(order, struct_array, edges).
# Matrix support is included as an exchange format, but the operational core uses
# structure arrays plus pair-copula arrays.

struct VineEdge{C<:PairCopula,K}
    conditioned::NTuple{2,Int}
    conditioning::K
    copula::C
    tree::Int
    index::Int
end

struct RVineStructure{p,q}
    order::NTuple{p,Int}
    struct_array::NTuple{q,Vector{Int}}
    matrix::Union{Nothing,Matrix{Int}}
    trunc::Int
end

struct RVineCopula{p,q} <: AbstractVineCopula{p}
    structure::RVineStructure{p,q}
    edges::NTuple{q,Vector{PairCopula}}
    trunc::Int
end

function RVineStructure(order::AbstractVector{<:Integer}, struct_array::AbstractVector; trunc::Int=length(order)-1, matrix=nothing)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    S = _normalize_struct_array(struct_array, p, trunc)
    M = matrix === nothing ? nothing : Matrix{Int}(matrix)
    return RVineStructure{p,trunc}(Tuple(Int.(order)), S, M, trunc)
end

function RVineCopula(order::AbstractVector{<:Integer}, struct_array::AbstractVector, edges::AbstractVector; trunc::Int=length(order)-1)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    S = _normalize_struct_array(struct_array, p, trunc)
    E = _normalize_edges(edges, p, trunc)
    st = RVineStructure{p,trunc}(Tuple(Int.(order)), S, nothing, trunc)
    return RVineCopula{p,trunc}(st, E, trunc)
end

# Lightweight matrix parser compatible with the package's natural-order triangular array.
function _rvine_from_matrix(M0::AbstractMatrix{<:Integer}, trunc::Int)
    size(M0, 1) == size(M0, 2) || throw(ArgumentError("R-vine matrix must be square"))
    M = Matrix{Int}(M0)
    p = size(M, 1)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    # Prefer non-zero anti-diagonal; otherwise fall back to diagonal.
    anti = [M[p-j+1,j] for j in 1:p]
    if all(x -> 1 <= x <= p, anti) && length(unique(anti)) == p
        order = anti
    else
        diagv = [M[j,j] for j in 1:p]
        all(x -> 1 <= x <= p, diagv) && length(unique(diagv)) == p ||
            throw(ArgumentError("cannot infer a valid order from matrix anti-diagonal or diagonal"))
        order = diagv
    end
    S = Vector{Vector{Int}}(undef, trunc)
    @inbounds for k in 1:trunc
        S[k] = Int[M[i, k] for i in 1:(p-k)]
    end
    return order, S, M
end

function RVineCopula(matrix::AbstractMatrix{<:Integer}, edges::AbstractVector)
    trunc = length(edges)
    order, S, M = _rvine_from_matrix(matrix, trunc)
    p = _check_order(order)
    E = _normalize_edges(edges, p, trunc)
    st = RVineStructure{p,trunc}(Tuple(order), Tuple(S), M, trunc)
    return RVineCopula{p,trunc}(st, E, trunc)
end

order(vc::RVineCopula) = vc.structure.order
struct_array(vc::RVineCopula) = vc.structure.struct_array
edges(vc::RVineCopula) = vc.edges
truncation(vc::RVineCopula) = vc.trunc

Base.show(io::IO, vc::RVineCopula{p}) where {p} = print(io, "RVineCopula(p=$p, trunc=$(vc.trunc))")

function rvine_matrix(vc::RVineCopula{p}) where {p}
    vc.structure.matrix !== nothing && return copy(vc.structure.matrix)
    M = zeros(Int, p, p)
    S = struct_array(vc)
    @inbounds for k in 1:vc.trunc
        for i in 1:(p-k)
            M[i,k] = S[k][i]
        end
    end
    # The anti-diagonal is disjoint from the triangular structure entries,
    # so matrix -> structure -> matrix is lossless. The parser still accepts
    # the legacy diagonal convention as a fallback.
    @inbounds for j in 1:p
        M[p-j+1, j] = order(vc)[j]
    end
    return M
end


@inline function _max_label(S, tree0::Int, edge::Int)
    m = typemin(Int)
    @inbounds for r in 1:(tree0+1)
        v = S[r][edge]
        v > m && (m = v)
    end
    return m
end

@inline _max_pos(S, invord, tree0::Int, edge::Int) = invord[_max_label(S, tree0, edge)]
@inline _is_direct(S, tree0::Int, edge::Int) = _max_label(S, tree0, edge) == S[tree0+1][edge]

function _looks_like_dvine(vc::RVineCopula{p}) where {p}
    S = struct_array(vc)
    ord = order(vc)
    @inbounds for k in 1:vc.trunc
        for i in 1:(p-k)
            S[k][i] == ord[i+1] || return false
        end
    end
    return true
end

_as_dvine(vc::RVineCopula) = DVineCopula(collect(order(vc)), [edges(vc)[k] for k in 1:vc.trunc]; trunc=vc.trunc)

function _logpdf_internal(vc::RVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return _logpdf_internal(vc, reshape(u, p, 1))[1]
end

function _logpdf_internal(vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    _looks_like_dvine(vc) && return Distributions.logpdf(_as_dvine(vc), U)
    return _rvine_logpdf_internal(vc, U)
end

function _rvine_logpdf_internal(vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    n = size(X,2)
    q = vc.trunc
    S = struct_array(vc)
    invord = _invperm_tuple(order(vc))
    W = Matrix{Float64}(undef, p, n)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(X[order(vc)[j],:])
    end
    H1 = [zeros(Float64, n) for _ in 1:p]
    H2 = [copy(@view W[j,:]) for j in 1:p]
    ll = zeros(Float64, n)
    buf = Vector{Float64}(undef, 2)
    @inbounds for tree0 in 0:(q-1)
        for edge in 1:(p-tree0-1)
            C = vc.edges[tree0+1][edge]
            left = H2[edge]
            mpos = _max_pos(S, invord, tree0, edge)
            right = _is_direct(S, tree0, edge) ? H2[mpos] : H1[mpos]
            for col in 1:n
                ll[col] += _pair_logpdf(C, left[col], right[col], buf)
            end
            out1 = H1[edge]
            out2 = H2[edge]
            for col in 1:n
                out1[col] = hfunc1(C, left[col], right[col])
                out2[col] = hfunc2(C, left[col], right[col])
            end
        end
    end
    return ll
end

function _rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    _looks_like_dvine(vc) && return rosenblatt!(out, _as_dvine(vc), U)
    vc.trunc == p-1 || throw(ArgumentError("general truncated R-vine Rosenblatt transforms are not implemented yet"))
    return _rvine_rosenblatt_internal!(out, vc, U)
end

function _inverse_rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::RVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    _looks_like_dvine(vc) && return inverse_rosenblatt!(out, _as_dvine(vc), Z)
    vc.trunc == p-1 || throw(ArgumentError("general truncated R-vine inverse Rosenblatt transforms are not implemented yet"))
    return _rvine_inverse_rosenblatt_internal!(out, vc, Z)
end

function _fetch_v(V::Matrix{Float64}, i::Int, j::Int, name::Symbol)
    x = V[i,j]
    isfinite(x) || throw(ArgumentError("invalid R-vine traversal: missing $name[$i,$j]. Check matrix/struct_array convention."))
    return x
end

function _rvine_inverse_rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::RVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    # Experimental general R-vine inverse following the matrix/struct-array traversal.
    Zx = _as_pxn(p, Z)
    nobs = size(Zx,2)
    q = vc.trunc
    S = struct_array(vc)
    ord = order(vc)
    invord_nat = _invperm_tuple(ord)
    W = Matrix{Float64}(undef, p, nobs)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(Zx[ord[j],:])
    end
    X = Matrix{Float64}(undef, p, nobs)
    @inbounds for col in 1:nobs
        Vd = fill(NaN, p, p)
        Vi = fill(NaN, p, p)
        for k in 1:p
            Vd[p,k] = W[k,col]
            Vi[p,k] = W[k,col]
        end
        X[p,col] = Vd[p,p]
        kstart = max(1, p-q)
        for k in (p-1):-1:kstart
            for i in (k+1):p
                tree0 = i-k-1
                tree0+1 <= length(vc.edges) && k <= length(vc.edges[tree0+1]) || continue
                m = _max_label(S, tree0, k)
                mpos = invord_nat[m]
                z2 = _is_direct(S, tree0, k) ? _fetch_v(Vi, i, mpos, :Vi) : _fetch_v(Vd, i, mpos, :Vd)
                C = vc.edges[tree0+1][k]
                current = _fetch_v(Vd, p, k, :Vd)
                Vd[p,k] = hinv1(C, current, z2)
            end
            X[k,col] = Vd[p,k]
            for i in p:-1:(k+1)
                tree0 = i-k-1
                tree0+1 <= length(vc.edges) && k <= length(vc.edges[tree0+1]) || continue
                z1 = _fetch_v(Vd, i, k, :Vd)
                m = _max_label(S, tree0, k)
                mpos = invord_nat[m]
                z2 = _is_direct(S, tree0, k) ? _fetch_v(Vi, i, mpos, :Vi) : _fetch_v(Vd, i, mpos, :Vd)
                C = vc.edges[tree0+1][k]
                Vd[i-1,k] = hfunc1(C, z1, z2)
                Vi[i-1,k] = hfunc2(C, z1, z2)
            end
        end
    end
    invord_user = _invperm_tuple(ord)
    @inbounds for label in 1:p
        @views out[label,:] .= X[invord_user[label],:]
    end
    return out
end

function _rvine_rosenblatt_internal!(out::AbstractMatrix{<:Real}, vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    Ux = _as_pxn(p, U)
    nobs = size(Ux,2)
    q = vc.trunc
    S = struct_array(vc)
    ord = order(vc)
    invord_nat = _invperm_tuple(ord)
    W = Matrix{Float64}(undef, p, nobs)
    @inbounds for j in 1:p
        @views W[j,:] .= _clp.(Ux[ord[j],:])
    end
    Z = Matrix{Float64}(undef, p, nobs)
    @inbounds for col in 1:nobs
        Vd = fill(NaN, p, p)
        Vi = fill(NaN, p, p)
        for k in 1:p
            Vd[p,k] = W[k,col]
            Vi[p,k] = W[k,col]
        end
        kstart = max(1, p-q)
        for k in (p-1):-1:kstart
            for i in p:-1:(k+1)
                tree0 = i-k-1
                tree0+1 <= length(vc.edges) && k <= length(vc.edges[tree0+1]) || continue
                z1 = _fetch_v(Vi, i, k, :Vi)
                m = _max_label(S, tree0, k)
                mpos = invord_nat[m]
                z2 = _is_direct(S, tree0, k) ? _fetch_v(Vi, i, mpos, :Vi) : _fetch_v(Vd, i, mpos, :Vd)
                C = vc.edges[tree0+1][k]
                Vd[i-1,k] = hfunc1(C, z1, z2)
                Vi[i-1,k] = hfunc2(C, z1, z2)
            end
            Z[k,col] = _fetch_v(Vd, k, k, :Vd)
        end
        Z[p,col] = W[p,col]
    end
    invord_user = _invperm_tuple(ord)
    @inbounds for label in 1:p
        @views out[label,:] .= Z[invord_user[label],:]
    end
    return out
end

function _rvine_edge_description(vc::RVineCopula{p}, k::Int, i::Int) where {p}
    # Best-effort human-readable edge from structure array.
    a = order(vc)[i]
    b = struct_array(vc)[k][i]
    D = Tuple(Int[x for r in 1:k-1 for x in (struct_array(vc)[r][i],)])
    return VineEdge((a,b), D, vc.edges[k][i], k, i)
end

function vine_edges(vc::RVineCopula)
    out = VineEdge[]
    for k in 1:vc.trunc, i in 1:length(vc.edges[k])
        push!(out, _rvine_edge_description(vc, k, i))
    end
    return out
end
