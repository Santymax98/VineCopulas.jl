# Regular vines.
# The primary v0.1 constructor is RVineCopula(order, struct_array, edges).
# Matrix support is included as an exchange format, but the operational core uses
# structure arrays plus pair-copula arrays.

"""
    VineEdge

Description of a pair-copula edge in a vine tree, including the conditioned
variables, conditioning set, pair-copula, tree level, and within-tree index.
"""
struct VineEdge{C<:PairCopula,K}
    conditioned::NTuple{2,Int}
    conditioning::K
    copula::C
    tree::Int
    index::Int
end

"""
    RVineStructure(order, struct_array; trunc=length(order)-1)

Structure representation for a regular vine. It stores the variable order,
triangular structure array, optional exchange matrix, and truncation level.
"""
struct RVineStructure{p,q} <: AbstractVineStructure{p}
    order::NTuple{p,Int}
    struct_array::NTuple{q,Vector{Int}}
    matrix::Union{Nothing,Matrix{Int}}
    trunc::Int
end

"""
    RVineCopula(order, struct_array, edges; trunc=length(order)-1)
    RVineCopula(matrix, edges)

Construct a regular-vine copula from an explicit structure array or from an
R-vine matrix exchange representation. Standard general R-vine structures are
validated against the proximity condition at construction time. General R-vine
evaluation is covered by the external `rvinecopulib` correctness campaign.
"""
struct RVineCopula{p,q,E} <: AbstractVineCopula{p}
    structure::RVineStructure{p,q}
    edges::E
    trunc::Int
end

# -----------------------------------------------------------------------------
# R-vine structure validation
# -----------------------------------------------------------------------------

@inline _rvine_state_key(v::Int, D) = (v, Tuple(sort!(Int[x for x in D])))

function _is_legacy_dvine_structure(order, S, p::Int, trunc::Int)
    @inbounds for t in 1:trunc, i in 1:(p - t)
        S[t][i] == order[i + 1] || return false
    end
    return true
end

_is_legacy_dvine_structure(st::RVineStructure) =
    _is_legacy_dvine_structure(st.order, st.struct_array, length(st.order), st.trunc)

function _validate_standard_rvine_structure(order, S, p::Int, trunc::Int)
    sort!(Int[x for x in order]) == collect(1:p) ||
        throw(ArgumentError("R-vine order must be a permutation of 1:$p"))

    pos = zeros(Int, p)
    @inbounds for e in 1:p
        pos[order[e]] = e
    end

    # A state (v | D) exists iff it can be obtained recursively from a
    # lower-tree edge.  Tracking these states is a direct validation of the
    # proximity condition and is independent of the numerical pair-copulas.
    states = Set{Any}(_rvine_state_key(v, Int[]) for v in 1:p)

    @inbounds for t in 1:trunc
        length(S[t]) == p - t ||
            throw(ArgumentError("struct_array[$t] must have $(p-t) entries"))

        for e in 1:(p - t)
            a = order[e]
            b = S[t][e]
            1 <= b <= p || throw(ArgumentError("invalid R-vine label $b"))
            pos[b] > e || throw(ArgumentError(
                "R-vine is not in the standard column convention: label $b in tree $t edge $e " *
                "must occur to the right of diagonal variable $a"
            ))

            D = Int[S[r][e] for r in 1:(t - 1)]
            length(unique(D)) == length(D) || throw(ArgumentError(
                "conditioning set has duplicate labels at tree $t edge $e"
            ))
            (a in D || b in D) && throw(ArgumentError(
                "conditioned variable appears in its own conditioning set at tree $t edge $e"
            ))

            ka = _rvine_state_key(a, D)
            kb = _rvine_state_key(b, D)
            ka in states || throw(ArgumentError(
                "R-vine proximity condition failed: missing conditional state $ka at tree $t edge $e"
            ))
            kb in states || throw(ArgumentError(
                "R-vine proximity condition failed: missing conditional state $kb at tree $t edge $e"
            ))

            oa = _rvine_state_key(a, vcat(D, b))
            ob = _rvine_state_key(b, vcat(D, a))
            oa in states && throw(ArgumentError(
                "invalid R-vine: conditional state $oa is generated more than once"
            ))
            ob in states && throw(ArgumentError(
                "invalid R-vine: conditional state $ob is generated more than once"
            ))
            push!(states, oa)
            push!(states, ob)
        end
    end
    return nothing
end

function _validate_rvine_structure(order, S, p::Int, trunc::Int)
    # v0.1 exposed a D-vine-like triangular convention.  Keep that format as
    # an explicit compatibility case; every other structure must satisfy the
    # standard conditional-state/proximity convention.
    _is_legacy_dvine_structure(order, S, p, trunc) && return :legacy_dvine
    _validate_standard_rvine_structure(order, S, p, trunc)
    return :standard
end

function RVineStructure(order::AbstractVector{<:Integer}, struct_array; trunc::Int=length(order)-1, matrix=nothing)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    ord = Tuple(Int.(order))
    S = _normalize_struct_array(struct_array, p, trunc)
    _validate_rvine_structure(ord, S, p, trunc)
    M = matrix === nothing ? nothing : Matrix{Int}(matrix)
    M === nothing || size(M) == (p, p) ||
        throw(ArgumentError("R-vine exchange matrix must have size ($p, $p)"))
    return RVineStructure{p,trunc}(ord, S, M, trunc)
end

function RVineCopula(order::AbstractVector{<:Integer}, struct_array, edges; trunc::Int=length(order)-1)
    p = _check_order(order)
    1 <= trunc <= p-1 || throw(ArgumentError("trunc debe estar en 1:$(p-1)"))
    ord = Tuple(Int.(order))
    S = _normalize_struct_array(struct_array, p, trunc)
    _validate_rvine_structure(ord, S, p, trunc)
    E = _normalize_edges(edges, p, trunc)
    st = RVineStructure{p,trunc}(ord, S, nothing, trunc)
    return RVineCopula{p,trunc,typeof(E)}(st, E, trunc)
end

function RVineCopula(structure::RVineStructure{p,q}, edges) where {p,q}
    E = _normalize_edges(edges, p, q)
    return RVineCopula{p,q,typeof(E)}(structure, E, q)
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

function RVineCopula(matrix::AbstractMatrix{<:Integer}, edges)
    trunc = length(edges)
    order, S, M = _rvine_from_matrix(matrix, trunc)
    p = _check_order(order)
    ord = Tuple(Int.(order))
    St = Tuple(S)
    _validate_rvine_structure(ord, St, p, trunc)
    E = _normalize_edges(edges, p, trunc)
    st = RVineStructure{p,trunc}(ord, St, M, trunc)
    return RVineCopula{p,trunc,typeof(E)}(st, E, trunc)
end

"""Return the variable order used by an `RVineCopula`."""
order(vc::RVineCopula) = vc.structure.order
order(st::RVineStructure) = st.order

"""Return the `RVineStructure` describing an `RVineCopula`."""
structure(vc::RVineCopula) = vc.structure

"""
    struct_array(vine)

Return the triangular structure array used by an `RVineCopula`.
"""
struct_array(vc::RVineCopula) = vc.structure.struct_array
struct_array(st::RVineStructure) = st.struct_array

"""Return the triangular array of pair-copulas used by an `RVineCopula`."""
edges(vc::RVineCopula) = vc.edges

"""Return the number of active trees in an `RVineCopula`."""
truncation(vc::RVineCopula) = vc.trunc
truncation(st::RVineStructure) = st.trunc

function truncate(st::RVineStructure{p}, level::Integer) where {p}
    q = _check_truncate_level(level, p, st.trunc)
    S = st.struct_array[1:q]
    return RVineStructure(collect(st.order), S; trunc=q, matrix=st.matrix)
end

function truncate(vc::RVineCopula{p}, level::Integer) where {p}
    st = truncate(structure(vc), level)
    return RVineCopula(st, vc.edges[1:truncation(st)])
end

Base.show(io::IO, vc::RVineCopula{p}) where {p} = print(io, "RVineCopula(p=$p, trunc=$(vc.trunc))")
Base.show(io::IO, st::RVineStructure{p}) where {p} = print(io, "RVineStructure(p=$p, trunc=$(st.trunc))")

"""
    rvine_matrix(vc::RVineCopula)

Return an integer matrix representation of an `RVineCopula`. If the object was
constructed from a matrix, a copy of that original matrix is returned; otherwise
one is built from the stored structure array and order.
"""
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

_looks_like_dvine(vc::RVineCopula) = _is_legacy_dvine_structure(vc.structure)

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
    H1 = zeros(Float64, p, n)
    H2 = copy(W)
    ll = zeros(Float64, n)
    buf = Vector{Float64}(undef, 2)
    @inbounds for tree0 in 0:(q-1)
        propagate = tree0 < q - 1
        for edge in 1:(p-tree0-1)
            C = vc.edges[tree0+1][edge]
            mpos = _max_pos(S, invord, tree0, edge)
            direct = _is_direct(S, tree0, edge)
            if propagate
                for col in 1:n
                    u = H2[edge,col]
                    v = direct ? H2[mpos,col] : H1[mpos,col]
                    logc, h1, h2 = _pair_step(C, u, v, buf)
                    ll[col] += logc
                    H1[edge,col] = h1
                    H2[edge,col] = h2
                end
            else
                for col in 1:n
                    v = direct ? H2[mpos,col] : H1[mpos,col]
                    ll[col] += _pair_logpdf(C, H2[edge,col], v, buf)
                end
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
                Vd[i-1,k], Vi[i-1,k] = _pair_hfuncs(C, z1, z2)
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
                Vd[i-1,k], Vi[i-1,k] = _pair_hfuncs(C, z1, z2)
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
    # The historical compatibility representation repeats `order[i+1]` at
    # higher tree levels and therefore does not itself encode standard
    # conditioned/conditioning sets.  Delegate its metadata to the equivalent
    # mature D-vine representation instead of reporting misleading edges.
    _looks_like_dvine(vc) && return vine_edges(_as_dvine(vc))

    out = VineEdge[]
    for k in 1:vc.trunc, i in 1:length(vc.edges[k])
        push!(out, _rvine_edge_description(vc, k, i))
    end
    return out
end
