# -----------------------------------------------------------------------------
# R-vine graph primitives and structure selection
# -----------------------------------------------------------------------------

struct _RVFitEdge
    a::Int
    b::Int
    D::Vector{Int}
    all::Vector{Int}
    copula::PairCopula
    h_a::Vector{Float64}
    h_b::Vector{Float64}
    fit::_PairSelection
end

struct _RVCandidate
    v1::Int
    v2::Int
    a::Int
    b::Int
    D::Vector{Int}
    u_a::AbstractVector{Float64}
    u_b::AbstractVector{Float64}
    weight::Float64
end

@inline function _edge_conditional(E::_RVFitEdge, v::Int)
    v == E.a && return E.h_a
    v == E.b && return E.h_b
    throw(ArgumentError(
        "proximity candidate requires a conditioned endpoint, but variable $v is not one"
    ))
end

mutable struct _DSU
    parent::Vector{Int}
    rank::Vector{UInt8}
end
_DSU(n::Int) = _DSU(collect(1:n), zeros(UInt8, n))

function _dsu_find!(D::_DSU, x::Int)
    p = D.parent[x]
    if p != x
        D.parent[x] = _dsu_find!(D, p)
    end
    return D.parent[x]
end

function _dsu_union!(D::_DSU, a::Int, b::Int)
    ra = _dsu_find!(D, a)
    rb = _dsu_find!(D, b)
    ra == rb && return false
    if D.rank[ra] < D.rank[rb]
        D.parent[ra] = rb
    elseif D.rank[ra] > D.rank[rb]
        D.parent[rb] = ra
    else
        D.parent[rb] = ra
        D.rank[ra] += 1
    end
    return true
end

function _maximum_spanning_tree(candidates::Vector{_RVCandidate}, nvertices::Int)
    nvertices <= 1 && return _RVCandidate[]
    idx = sortperm(
        eachindex(candidates);
        by=i -> (-candidates[i].weight,
                 min(candidates[i].a, candidates[i].b),
                 max(candidates[i].a, candidates[i].b),
                 candidates[i].v1, candidates[i].v2,
                 Tuple(candidates[i].D))
    )
    dsu = _DSU(nvertices)
    selected = _RVCandidate[]
    sizehint!(selected, nvertices - 1)

    @inbounds for ii in idx
        c = candidates[ii]
        if _dsu_union!(dsu, c.v1, c.v2)
            push!(selected, c)
            length(selected) == nvertices - 1 && break
        end
    end

    length(selected) == nvertices - 1 || throw(ArgumentError(
        "candidate graph is disconnected; proximity condition cannot produce the next R-vine tree"
    ))
    return selected
end

function _rvine_tree1_candidates(X::Matrix{Float64}, criterion::Symbol)
    p, _ = size(X)
    out = _RVCandidate[]
    sizehint!(out, _choose2(p))
    @inbounds for j in 2:p, i in 1:j-1
        ui = @view X[i, :]
        uj = @view X[j, :]
        push!(out, _RVCandidate(
            i, j, i, j, Int[], ui, uj,
            _tree_dependence(ui, uj, criterion)
        ))
    end
    return out
end

function _rvine_next_candidates(prev::Vector{_RVFitEdge}, criterion::Symbol)
    m = length(prev)
    level = isempty(prev) ? 0 : length(prev[1].D) + 2
    out = _RVCandidate[]

    @inbounds for j in 2:m, i in 1:j-1
        e1 = prev[i]
        e2 = prev[j]
        D = _set_intersection_sorted(e1.all, e2.all)
        length(D) == level - 1 || continue

        a = _setdiff_one(e1.all, D)
        b = _setdiff_one(e2.all, D)
        (a == 0 || b == 0 || a == b) && continue
        (a == e1.a || a == e1.b) || continue
        (b == e2.a || b == e2.b) || continue

        ua = _edge_conditional(e1, a)
        ub = _edge_conditional(e2, b)
        push!(out, _RVCandidate(
            i, j, a, b, D, ua, ub,
            _tree_dependence(ua, ub, criterion)
        ))
    end
    return out
end

function _fit_rvine_candidates(
    selected::Vector{_RVCandidate},
    nobs::Int;
    family_set,
    pair_method,
    selection_criterion,
    allow_rotations,
    preselect,
    include_independence,
    threshold,
    pair_kwargs,
    strict,
    trace,
    need_h::Bool,
)
    out = Vector{_RVFitEdge}(undef, length(selected))

    @inbounds for i in eachindex(selected)
        c = selected[i]
        pdata = Matrix{Float64}(undef, 2, nobs)
        pdata[1, :] .= c.u_a
        pdata[2, :] .= c.u_b

        fit = _select_pair(
            pdata;
            family_set=family_set,
            pair_method=pair_method,
            selection_criterion=selection_criterion,
            allow_rotations=allow_rotations,
            preselect=preselect,
            include_independence=include_independence,
            pair_kwargs=pair_kwargs,
            strict=strict,
            trace=trace,
            force_independence=c.weight < threshold,
        )

        C = fit.copula
        if need_h
            h_a = Vector{Float64}(undef, nobs)
            h_b = Vector{Float64}(undef, nobs)
            _pair_hfuncs!(h_a, h_b, C, c.u_a, c.u_b)
        else
            h_a = Float64[]
            h_b = Float64[]
        end

        out[i] = _RVFitEdge(
            c.a, c.b, copy(c.D),
            _sorted_complete(c.a, c.b, c.D),
            C, h_a, h_b, fit,
        )
    end
    return out
end

function _select_rvine_trees(
    X::Matrix{Float64},
    q::Int;
    family_set,
    pair_method,
    selection_criterion,
    tree_criterion,
    allow_rotations,
    preselect,
    include_independence,
    threshold,
    pair_kwargs,
    strict,
    trace,
)
    p, n = size(X)
    trees = Vector{Vector{_RVFitEdge}}(undef, q)

    candidates = _rvine_tree1_candidates(X, tree_criterion)
    selected = _maximum_spanning_tree(candidates, p)
    trees[1] = _fit_rvine_candidates(
        selected, n;
        family_set=family_set,
        pair_method=pair_method,
        selection_criterion=selection_criterion,
        allow_rotations=allow_rotations,
        preselect=preselect,
        include_independence=include_independence,
        threshold=threshold,
        pair_kwargs=pair_kwargs,
        strict=strict,
        trace=trace,
        need_h=(q > 1),
    )

    for t in 2:q
        candidates = _rvine_next_candidates(trees[t - 1], tree_criterion)
        selected = _maximum_spanning_tree(candidates, length(trees[t - 1]))
        trees[t] = _fit_rvine_candidates(
            selected, n;
            family_set=family_set,
            pair_method=pair_method,
            selection_criterion=selection_criterion,
            allow_rotations=allow_rotations,
            preselect=preselect,
            include_independence=include_independence,
            threshold=threshold,
            pair_kwargs=pair_kwargs,
            strict=strict,
            trace=trace,
            need_h=(t < q),
        )
    end
    return trees
end

# -----------------------------------------------------------------------------
# R-vine tree-list -> standard triangular structure (deterministic leaf peeling)
# -----------------------------------------------------------------------------

@inline _side_key(E::_RVFitEdge, side::Symbol) =
    Tuple(sort!(vcat(E.D, side === :a ? E.a : E.b)))

function _rvine_peel(trees::Vector{Vector{_RVFitEdge}}, p::Int, q::Int)
    consumed = [falses(length(trees[t])) for t in 1:q]
    S = [zeros(Int, p - t) for t in 1:q]
    Eout = [Vector{PairCopula}(undef, p - t) for t in 1:q]
    ord = zeros(Int, p)

    for col in 1:(p - 1)
        top = max(min(q, p - col), 1)
        tree = trees[top]

        # Degree of previous-tree nodes represented by their complete sets.
        degree = Dict{Any, Int}()
        @inbounds for i in eachindex(tree)
            consumed[top][i] && continue
            ed = tree[i]
            ka = _side_key(ed, :a)
            kb = _side_key(ed, :b)
            degree[ka] = get(degree, ka, 0) + 1
            degree[kb] = get(degree, kb, 0) + 1
        end

        # Collect available leaf endpoints and choose the smallest original
        # label for deterministic output.
        leaves = Tuple{Int,Int,Symbol}[]
        @inbounds for i in eachindex(tree)
            consumed[top][i] && continue
            ed = tree[i]
            get(degree, _side_key(ed, :a), 0) == 1 && push!(leaves, (ed.a, i, :a))
            get(degree, _side_key(ed, :b), 0) == 1 && push!(leaves, (ed.b, i, :b))
        end
        isempty(leaves) && throw(ArgumentError(
            "could not peel R-vine tree $top; no leaf satisfies the proximity representation"
        ))
        sort!(leaves; by=x -> (x[1], x[2], x[3] === :a ? 0 : 1))
        diag, idx, side = first(leaves)
        ord[col] = diag

        ed = tree[idx]
        partner = side === :a ? ed.b : ed.a
        S[top][col] = partner
        Eout[top][col] = side === :a ? ed.copula : _swap_pair(ed.copula)
        consumed[top][idx] = true
        checkset = copy(ed.D)

        # Descend the same matrix column. At each lower tree, find the unique
        # edge whose complete variable set is {diag} ∪ checkset.
        for level in (top - 1):-1:1
            push!(checkset, diag)
            sort!(checkset)
            unique!(checkset)

            found = 0
            @inbounds for j in eachindex(trees[level])
                consumed[level][j] && continue
                trees[level][j].all == checkset || continue
                found = j
                break
            end
            found == 0 && throw(ArgumentError(
                "R-vine proximity condition violated while peeling column $col at tree $level"
            ))

            low = trees[level][found]
            if diag == low.a
                S[level][col] = low.b
                Eout[level][col] = low.copula
            elseif diag == low.b
                S[level][col] = low.a
                Eout[level][col] = _swap_pair(low.copula)
            else
                throw(ArgumentError(
                    "peeled diagonal $diag is not a conditioned endpoint in tree $level"
                ))
            end
            consumed[level][found] = true
            checkset = copy(low.D)
        end
    end

    ord[p] = S[1][p - 1]
    sort(ord) == collect(1:p) || throw(ArgumentError(
        "tree decomposition did not peel to a valid permutation: $ord"
    ))

    # Every fitted edge must have been consumed exactly once.
    @inbounds for t in 1:q
        all(consumed[t]) || throw(ArgumentError(
            "R-vine peeling left unused edges in tree $t"
        ))
    end

    edges = [tuple(Eout[t]...) for t in 1:q]
    return ord, S, edges
end

# -----------------------------------------------------------------------------
# Fixed standard R-vine fitting
# -----------------------------------------------------------------------------
# Legacy v0.1 D-vine-like R-vines repeated `order[i+1]` on every tree level.
# That convention remains an explicit compatibility case in the core and is
# delegated to the D-vine engine for evaluation.  It is not a standard R-vine
# conditional-state array, so normalize it before fixed-structure fitting.
function _standardize_fixed_rvine_structure(st::RVineStructure)
    _is_legacy_dvine_structure(st) || return st, false
    p = length(st.order)
    q = truncation(st)
    S = [
        Int[st.order[i + t] for i in 1:(p - t)]
        for t in 1:q
    ]
    return RVineStructure(collect(st.order), S; trunc=q), true
end


function _fit_fixed_rvine(
    X::Matrix{Float64},
    st::RVineStructure;
    family_set,
    pair_method,
    selection_criterion,
    allow_rotations,
    preselect,
    include_independence,
    threshold,
    tree_criterion,
    pair_kwargs,
    strict,
    trace,
)
    p, n = size(X)
    ord = collect(st.order)
    q = truncation(st)
    S = [collect(st.struct_array[t]) for t in 1:q]
    length(ord) == p || throw(DimensionMismatch("structure dimension does not match data"))

    states = Dict{Any, Vector{Float64}}()
    @inbounds for v in 1:p
        states[_state_key(v, Int[])] = copy(@view X[v, :])
    end

    levels = Vector{Vector{_PairSelection}}(undef, q)
    total_iterations = 0
    all_converged = true

    for t in 1:q
        level = Vector{_PairSelection}(undef, p - t)
        @inbounds for e in 1:(p - t)
            a = ord[e]
            b = S[t][e]
            D = Int[S[r][e] for r in 1:(t - 1)]
            ka = _state_key(a, D)
            kb = _state_key(b, D)
            haskey(states, ka) || throw(ArgumentError(
                "invalid standard R-vine structure: missing conditional state $ka"
            ))
            haskey(states, kb) || throw(ArgumentError(
                "invalid standard R-vine structure/proximity condition: missing conditional state $kb"
            ))
            ua = states[ka]
            ub = states[kb]
            dep = _tree_dependence(ua, ub, tree_criterion)

            pdata = Matrix{Float64}(undef, 2, n)
            pdata[1, :] .= ua
            pdata[2, :] .= ub
            fit = _select_pair(
                pdata;
                family_set=family_set,
                pair_method=pair_method,
                selection_criterion=selection_criterion,
                allow_rotations=allow_rotations,
                preselect=preselect,
                include_independence=include_independence,
                pair_kwargs=pair_kwargs,
                strict=strict,
                trace=trace,
                force_independence=dep < threshold,
            )
            level[e] = fit
            total_iterations += fit.iterations
            all_converged &= fit.converged

            if t < q
                oa = _state_key(a, vcat(D, b))
                ob = _state_key(b, vcat(D, a))
                ha = Vector{Float64}(undef, n)
                hb = Vector{Float64}(undef, n)
                C = fit.copula
                _pair_hfuncs!(ha, hb, C, ua, ub)
                states[oa] = ha
                states[ob] = hb
            end
        end
        levels[t] = level
    end

    edgelevels = [
        tuple((levels[t][i].copula for i in eachindex(levels[t]))...)
        for t in 1:q
    ]
    vc = RVineCopula(ord, S, edgelevels; trunc=q)

    return vc, total_iterations, all_converged
end

# -----------------------------------------------------------------------------
# R-vine fitting entry point
# -----------------------------------------------------------------------------

Copulas._available_fitting_methods(::Type{<:RVineCopula}, d) =
    d >= 2 ? (:sequential,) : Tuple{}()

function Copulas._fit(
    ::Type{<:RVineCopula},
    U0,
    ::Val{:sequential};
    structure=nothing,
    trunc=nothing,
    family_set=:default,
    pair_method::Symbol=:default,
    selection_criterion::Symbol=:bic,
    tree_criterion::Symbol=:tau,
    tree_algorithm::Symbol=:mst,
    allow_rotations::Bool=true,
    preselect::Bool=true,
    include_independence::Bool=true,
    threshold::Real=0.0,
    pair_kwargs::NamedTuple=NamedTuple(),
    strict::Bool=false,
    trace::Bool=false,
    full_metadata::Bool=true,
)
    p = size(U0, 1)
    X = _fit_data(U0, p)
    _check_selection_criterion(selection_criterion)
    _check_tree_criterion(tree_criterion)
    threshold = _check_threshold(threshold)
    tree_algorithm in (:mst, :kruskal) || throw(ArgumentError(
        "tree_algorithm currently supports :mst or :kruskal (same deterministic Kruskal engine)"
    ))

    if structure !== nothing
        structure isa RVineStructure || throw(ArgumentError(
            "structure must be an RVineStructure or nothing"
        ))
        q = truncation(structure)
        trunc !== nothing && Int(trunc) != q && throw(ArgumentError(
            "when structure is supplied, trunc must match truncation(structure)"
        ))
        st_fit, was_legacy = _standardize_fixed_rvine_structure(structure)
        vc, total_iterations, all_converged = _fit_fixed_rvine(
            X, st_fit;
            family_set=family_set,
            pair_method=pair_method,
            selection_criterion=selection_criterion,
            allow_rotations=allow_rotations,
            preselect=preselect,
            include_independence=include_independence,
            threshold=threshold,
            tree_criterion=tree_criterion,
            pair_kwargs=pair_kwargs,
            strict=strict,
            trace=trace,
        )
        structure_method = was_legacy ? :fixed_legacy_dvine_normalized : :fixed
    else
        q = isnothing(trunc) ? p - 1 : Int(trunc)
        1 <= q <= p - 1 || throw(ArgumentError("trunc must be in 1:$(p-1)"))

        trees = _select_rvine_trees(
            X, q;
            family_set=family_set,
            pair_method=pair_method,
            selection_criterion=selection_criterion,
            tree_criterion=tree_criterion,
            allow_rotations=allow_rotations,
            preselect=preselect,
            include_independence=include_independence,
            threshold=threshold,
            pair_kwargs=pair_kwargs,
            strict=strict,
            trace=trace,
        )
        ord, S, edgelevels = _rvine_peel(trees, p, q)
        vc = RVineCopula(ord, S, edgelevels; trunc=q)

        total_iterations = sum(e.fit.iterations for tree in trees for e in tree)
        all_converged = all(e.fit.converged for tree in trees for e in tree)
        structure_method = :dissmann_mst
    end

    # Compile once here as a structural validation. Runtime methods below
    # compile the same lightweight plan on demand until it becomes worth
    # storing/caching plans in the core type.
    _compile_standard_rvine(vc)

    full_metadata || return vc, (;)
    meta = _vine_meta(
        vc;
        selection_criterion=selection_criterion,
        pair_method=pair_method,
        family_set=family_set,
        allow_rotations=allow_rotations,
        preselect=preselect,
        include_independence=include_independence,
        threshold=threshold,
        tree_criterion=tree_criterion,
        order_method=nothing,
        structure_method=structure_method,
        tree_algorithm=tree_algorithm,
        converged=all_converged,
        iterations=total_iterations,
    )
    return vc, meta
end

# -----------------------------------------------------------------------------
# Standard R-vine computational graph / execution plan
# -----------------------------------------------------------------------------

struct _RVineExecOp
    tree::Int
    edge::Int
    left::Int
    right::Int
    out_left::Int
    out_right::Int
    copula::PairCopula
    need_out_left::Bool       # required by Rosenblatt/inverse or a later pair
    need_out_right::Bool
    need_pair_left::Bool      # required by a later pair (log-density traversal)
    need_pair_right::Bool
end

struct _RVineExecPlan
    p::Int
    q::Int
    nslots::Int
    order::Vector{Int}
    rawslots::Vector{Int}       # indexed by original variable label
    finalslots::Vector{Int}     # indexed by original variable label
    ops::Vector{_RVineExecOp}
    column_ops::Vector{Vector{Int}}  # op indices, tree order, indexed by diagonal column
end

function _new_slot!(states::Dict{Any,Int}, key, nextslot::Base.RefValue{Int})
    haskey(states, key) && throw(ArgumentError(
        "invalid standard R-vine: conditional state $key is generated more than once"
    ))
    nextslot[] += 1
    states[key] = nextslot[]
    return nextslot[]
end

"""
    _compile_standard_rvine(vc)

Compile a standard (order, struct_array) R-vine into a DAG of conditional
states. An edge `(a,b | D)` consumes states `(a|D)` and `(b|D)` and produces
`(a|D∪{b})` and `(b|D∪{a})`.

This representation is label-invariant and therefore remains correct for
non-identity variable orders.
"""
function _compile_standard_rvine(vc::RVineCopula{p}) where {p}
    q = truncation(vc)
    ord = collect(order(vc))
    S = struct_array(vc)
    E = edges(vc)

    # The public constructors already validate standard structures.  Repeat the
    # pure structural check here defensively so execution plans built from an
    # object created through low-level parametric constructors cannot bypass the
    # proximity contract.
    _validate_standard_rvine_structure(ord, S, p, q)

    sort(ord) == collect(1:p) || throw(ArgumentError("R-vine order is not a permutation"))
    length(S) == q || throw(ArgumentError("invalid struct_array truncation"))
    length(E) == q || throw(ArgumentError("invalid edge truncation"))

    pos = zeros(Int, p)
    @inbounds for e in 1:p
        pos[ord[e]] = e
    end

    states = Dict{Any,Int}()
    rawslots = zeros(Int, p)
    nextslot = Ref(0)
    @inbounds for v in 1:p
        nextslot[] += 1
        states[_state_key(v, Int[])] = nextslot[]
        rawslots[v] = nextslot[]
    end

    ops = _RVineExecOp[]
    column_ops = [Int[] for _ in 1:p]

    # Global tree order is topological: every tree-t conditional input must
    # have been produced by a lower tree.
    @inbounds for t in 1:q
        length(S[t]) == p - t || throw(ArgumentError("struct_array[$t] has wrong length"))
        length(E[t]) == p - t || throw(ArgumentError("edges[$t] has wrong length"))

        for e in 1:(p - t)
            a = ord[e]
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

            ka = _state_key(a, D)
            kb = _state_key(b, D)
            haskey(states, ka) || throw(ArgumentError(
                "proximity condition failed: missing conditional state $ka at tree $t edge $e"
            ))
            haskey(states, kb) || throw(ArgumentError(
                "proximity condition failed: missing conditional state $kb at tree $t edge $e"
            ))

            oa = _state_key(a, vcat(D, b))
            ob = _state_key(b, vcat(D, a))
            sa = _new_slot!(states, oa, nextslot)
            sb = _new_slot!(states, ob, nextslot)

            push!(ops, _RVineExecOp(
                t, e, states[ka], states[kb], sa, sb, E[t][e],
                true, true, true, true,
            ))
            push!(column_ops[e], length(ops))
        end
    end

    finalslots = copy(rawslots)
    @inbounds for e in 1:(p - 1)
        tmax = min(q, p - e)
        if tmax > 0
            a = ord[e]
            D = Int[S[r][e] for r in 1:tmax]
            key = _state_key(a, D)
            haskey(states, key) || throw(ArgumentError(
                "could not identify final Rosenblatt state for variable $a"
            ))
            finalslots[a] = states[key]
        end
    end

    # Liveness analysis: compute an h-output only if a later pair consumes it
    # or if it is a final Rosenblatt coordinate. This is especially useful for
    # asymmetric general R-vines where many reverse h-functions are never used.
    pair_needed = falses(nextslot[])
    @inbounds for op in ops
        pair_needed[op.left] = true
        pair_needed[op.right] = true
    end
    needed = copy(pair_needed)
    @inbounds for s in finalslots
        needed[s] = true
    end

    liveops = Vector{_RVineExecOp}(undef, length(ops))
    @inbounds for i in eachindex(ops)
        op = ops[i]
        liveops[i] = _RVineExecOp(
            op.tree, op.edge, op.left, op.right, op.out_left, op.out_right,
            op.copula,
            needed[op.out_left], needed[op.out_right],
            pair_needed[op.out_left], pair_needed[op.out_right],
        )
    end
    ops = liveops

    return _RVineExecPlan(
        p, q, nextslot[], ord, rawslots, finalslots, ops, column_ops
    )
end

# Function barriers: `_RVineExecOp` stores heterogeneous pair-copulas behind
# the abstract PairCopula type, but dispatch occurs once per edge. The inner
# observation loop is then compiled for the concrete family type.
function _rvine_forward_op!(
    V::Matrix{Float64},
    ll::Vector{Float64},
    op::_RVineExecOp,
    C::CT,
    buf::Vector{Float64},
    ::Val{LOGPDF},
) where {CT<:PairCopula,LOGPDF}
    need_left = LOGPDF ? op.need_pair_left : op.need_out_left
    need_right = LOGPDF ? op.need_pair_right : op.need_out_right

    # Liveness is constant for the whole edge. Log-density needs only outputs
    # consumed by later pairs; Rosenblatt additionally keeps final coordinates.
    # Branch once outside the hot observation loop and request exactly the
    # fused subset that is consumed.
    if LOGPDF
        if need_left && need_right
            @inbounds for col in axes(V, 2)
                u = V[op.left, col]
                v = V[op.right, col]
                logc, h1, h2 = _pair_step(C, u, v, buf)
                ll[col] += logc
                V[op.out_left, col] = h1
                V[op.out_right, col] = h2
            end
        elseif need_left
            @inbounds for col in axes(V, 2)
                u = V[op.left, col]
                v = V[op.right, col]
                logc, h1 = _pair_logpdf_h1(C, u, v, buf)
                ll[col] += logc
                V[op.out_left, col] = h1
            end
        elseif need_right
            @inbounds for col in axes(V, 2)
                u = V[op.left, col]
                v = V[op.right, col]
                logc, h2 = _pair_logpdf_h2(C, u, v, buf)
                ll[col] += logc
                V[op.out_right, col] = h2
            end
        else
            @inbounds for col in axes(V, 2)
                ll[col] += _pair_logpdf(C, V[op.left,col], V[op.right,col], buf)
            end
        end
    elseif need_left && need_right
        @inbounds for col in axes(V, 2)
            u = V[op.left, col]
            v = V[op.right, col]
            h1, h2 = _pair_hfuncs(C, u, v)
            V[op.out_left, col] = h1
            V[op.out_right, col] = h2
        end
    elseif need_left
        @inbounds for col in axes(V, 2)
            V[op.out_left, col] = hfunc1(C, V[op.left,col], V[op.right,col])
        end
    elseif need_right
        @inbounds for col in axes(V, 2)
            V[op.out_right, col] = hfunc2(C, V[op.left,col], V[op.right,col])
        end
    end
    return nothing
end

function _rvine_hinv1_column!(
    current::Vector{Float64},
    V::Matrix{Float64},
    partner_slot::Int,
    C::CT,
) where {CT<:PairCopula}
    @inbounds for col in eachindex(current)
        partner = V[partner_slot, col]
        isfinite(partner) || throw(ArgumentError(
            "R-vine inverse plan encountered an unavailable partner state"
        ))
        current[col] = hinv1(C, current[col], partner)
    end
    return nothing
end

function _rvine_propagate_op!(
    V::Matrix{Float64},
    op::_RVineExecOp,
    C::CT,
) where {CT<:PairCopula}
    need_left = op.need_out_left
    need_right = op.need_out_right
    !(need_left || need_right) && return nothing

    if need_left && need_right
        @inbounds for col in axes(V, 2)
            u = V[op.left, col]
            v = V[op.right, col]
            (isfinite(u) && isfinite(v)) || throw(ArgumentError(
                "R-vine inverse plan encountered an unavailable conditional state"
            ))
            h1, h2 = _pair_hfuncs(C, u, v)
            V[op.out_left, col] = h1
            V[op.out_right, col] = h2
        end
    elseif need_left
        @inbounds for col in axes(V, 2)
            u = V[op.left, col]
            v = V[op.right, col]
            (isfinite(u) && isfinite(v)) || throw(ArgumentError(
                "R-vine inverse plan encountered an unavailable conditional state"
            ))
            V[op.out_left, col] = hfunc1(C, u, v)
        end
    else
        @inbounds for col in axes(V, 2)
            u = V[op.left, col]
            v = V[op.right, col]
            (isfinite(u) && isfinite(v)) || throw(ArgumentError(
                "R-vine inverse plan encountered an unavailable conditional state"
            ))
            V[op.out_right, col] = hfunc2(C, u, v)
        end
    end
    return nothing
end

function _rvine_forward_workspace(
    vc::RVineCopula{p},
    U::AbstractMatrix{<:Real},
    plan::_RVineExecPlan;
    need_logpdf::Bool,
) where {p}
    X = _as_pxn(p, U)
    n = size(X, 2)
    V = Matrix{Float64}(undef, plan.nslots, n)

    @inbounds for v in 1:p
        @views V[plan.rawslots[v], :] .= X[v, :]
    end

    ll = need_logpdf ? zeros(Float64, n) : Float64[]
    buf = Vector{Float64}(undef, 2)

    logflag = Val(need_logpdf)
    @inbounds for op in plan.ops
        _rvine_forward_op!(V, ll, op, op.copula, buf, logflag)
    end
    return plan, V, ll
end

# More-specific R-vine public methods. Legacy D-vine-like R-vines keep their
# mature fast path; standard general R-vines use the graph plan.
function Distributions.logpdf(vc::RVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return Distributions.logpdf(vc, reshape(u, p, 1))[1]
end

function Distributions.logpdf(vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    _looks_like_dvine(vc) && return Distributions.logpdf(_as_dvine(vc), U)
    plan = _compile_standard_rvine(vc)
    _, _, ll = _rvine_forward_workspace(vc, U, plan; need_logpdf=true)
    return ll
end

function rosenblatt(vc::RVineCopula{p}, U::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, U)
    out = Matrix{Float64}(undef, p, size(X, 2))
    return rosenblatt!(out, vc, X)
end

function rosenblatt(vc::RVineCopula{p}, u::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, u)
    return vec(rosenblatt(vc, reshape(u, p, 1)))
end

function rosenblatt!(
    out::AbstractMatrix{<:Real},
    vc::RVineCopula{p},
    U::AbstractMatrix{<:Real},
) where {p}
    X = _as_pxn(p, U)
    size(out) == size(X) || throw(DimensionMismatch("out must have size $(size(X))"))

    _looks_like_dvine(vc) && return rosenblatt!(out, _as_dvine(vc), X)

    plan = _compile_standard_rvine(vc)
    _, V, _ = _rvine_forward_workspace(vc, X, plan; need_logpdf=false)
    @inbounds for v in 1:p
        @views out[v, :] .= V[plan.finalslots[v], :]
    end
    return out
end

function inverse_rosenblatt(vc::RVineCopula{p}, Z::AbstractMatrix{<:Real}) where {p}
    X = _as_pxn(p, Z)
    out = Matrix{Float64}(undef, p, size(X, 2))
    return inverse_rosenblatt!(out, vc, X)
end

function inverse_rosenblatt(vc::RVineCopula{p}, z::AbstractVector{<:Real}) where {p}
    _check_vector_dim(p, z)
    return vec(inverse_rosenblatt(vc, reshape(z, p, 1)))
end

function inverse_rosenblatt!(
    out::AbstractMatrix{<:Real},
    vc::RVineCopula{p},
    Z::AbstractMatrix{<:Real},
) where {p}
    Zx0 = _as_pxn(p, Z)
    size(out) == size(Zx0) || throw(DimensionMismatch("out must have size $(size(Zx0))"))
    _looks_like_dvine(vc) && return inverse_rosenblatt!(out, _as_dvine(vc), Zx0)

    plan = _compile_standard_rvine(vc)

    Zx = Zx0
    n = size(Zx, 2)
    V = fill(NaN, plan.nslots, n)
    current = Vector{Float64}(undef, n)

    # Generate variables in reverse diagonal order. At the moment diagonal
    # variable a is generated, all partner conditional states in its column
    # involve only variables to the right and are already available.
    @inbounds for e in p:-1:1
        a = plan.order[e]
        @views current .= Zx[a, :]

        # Undo the conditional chain from the most conditioned edge to the
        # unconditional edge. Each helper dispatches once on the concrete
        # pair-copula family and then runs a specialized n-observation loop.
        if e < p
            for opidx in Iterators.reverse(plan.column_ops[e])
                op = plan.ops[opidx]
                _rvine_hinv1_column!(current, V, op.right, op.copula)
            end
        end
        @views V[plan.rawslots[a], :] .= current

        # Forward-propagate every conditional state whose earliest variable
        # is the newly generated diagonal variable.
        for opidx in plan.column_ops[e]
            op = plan.ops[opidx]
            _rvine_propagate_op!(V, op, op.copula)
        end
    end

    @inbounds for v in 1:p
        @views out[v, :] .= V[plan.rawslots[v], :]
    end
    return out
end

# Distributions.jl's generic multivariate loglikelihood iterates one sample at
# a time. Vines already provide batched p×n logpdf methods, so use them
# directly. This matters especially for a standard R-vine because it compiles
# the conditional-state plan once per matrix rather than once per observation.
Distributions.loglikelihood(
    vc::AbstractVineCopula,
    u::AbstractVector{<:Real},
) = Distributions.logpdf(vc, u)

Distributions.loglikelihood(
    vc::AbstractVineCopula,
    U::AbstractMatrix{<:Real},
) = sum(Distributions.logpdf(vc, U))

# -----------------------------------------------------------------------------
# Ecosystem-native quick fit
# -----------------------------------------------------------------------------
#
# Copulas.jl's generic quick route already avoids the final likelihood/vcov
# work, but its generic implementation still asks `_fit` for metadata. These
# more-specific methods preserve the same public API while skipping O(p²)
# edge-summary construction for quick vine fits.

function Distributions.fit(
    ::Type{PairCopula},
    U;
    method::Symbol=:default,
    kwargs...
)
    d = size(U, 1)
    m = Copulas._find_method(PairCopula, d, method)
    C, _ = Copulas._fit(
        PairCopula, U, Val{m}();
        full_metadata=false,
        kwargs...
    )
    return C
end

function Distributions.fit(
    VT::Type{<:AbstractVineCopula},
    U;
    method::Symbol=:default,
    kwargs...
)
    d = size(U, 1)
    m = Copulas._find_method(VT, d, method)
    C, _ = Copulas._fit(
        VT, U, Val{m}();
        full_metadata=false,
        kwargs...
    )
    return C
end

# -----------------------------------------------------------------------------
# CopulaModel integration
# -----------------------------------------------------------------------------

# Sequential vine estimation and post-selection pair fitting do not currently
# expose a statistically valid covariance matrix. Returning `nothing` is more
# honest than reporting a block-diagonal covariance that ignores selection and
# pseudo-observation uncertainty.
function Copulas._vcov(
    ::Type{PairCopula},
    U::AbstractMatrix,
    θ::NamedTuple;
    method::Symbol,
    override=nothing,
)
    return nothing, (; vcov_method=:post_selection_unavailable)
end

function Copulas._vcov(
    ::Type{<:AbstractVineCopula},
    U::AbstractMatrix,
    θ::NamedTuple;
    method::Symbol,
    override=nothing,
)
    return nothing, (; vcov_method=:sequential_unavailable)
end

# Vine models keep θ̂ compact as one parameter vector to avoid enormous
# NamedTuple types in high dimensions. Supply human-readable edge-wise names
# through one targeted StatsBase interface specialization.
function Copulas.StatsBase.coefnames(
    M::Copulas.CopulaModel{<:AbstractVineCopula}
)
    return get(M.method_details, :coefnames, String[])
end

# A vine-specific summary while keeping the public model type CopulaModel.
function Base.show(io::IO, M::Copulas.CopulaModel{<:AbstractVineCopula})
    vc = M.result
    println(io, "CopulaModel: ", nameof(typeof(vc)))
    println(io, "  dimension:            ", length(vc))
    println(io, "  method:               ", M.method)
    println(io, "  observations:         ", M.n)
    println(io, "  truncation:           ", truncation(vc))
    println(io, "  order:                ", collect(order(vc)))
    println(io, "  pair copulas:         ", sum(length, edges(vc)))
    println(io, "  parameters:           ", Copulas.StatsBase.dof(M))
    println(io, "  loglikelihood:        ", M.ll)
    println(io, "  AIC:                  ", Copulas.StatsBase.aic(M))
    println(io, "  BIC:                  ", Copulas.StatsBase.bic(M))
    println(io, "  converged:            ", M.converged)
    println(io, "  iterations:           ", M.iterations)
    sm = get(M.method_details, :structure_method, nothing)
    sm === nothing || println(io, "  structure method:     ", sm)
    tc = get(M.method_details, :tree_criterion, nothing)
    tc === nothing || println(io, "  tree criterion:       ", tc)
    sc = get(M.method_details, :selection_criterion, nothing)
    sc === nothing || println(io, "  family criterion:     ", sc)
    ta = get(M.method_details, :tree_algorithm, nothing)
    ta === nothing || println(io, "  tree algorithm:       ", ta)
    th = get(M.method_details, :threshold, 0.0)
    iszero(th) || println(io, "  threshold:            ", th)

    es = get(M.method_details, :edges, nothing)
    if es !== nothing
        println(io, "  edges:")
        for e in es
            cond = isempty(e.conditioning) ? "" : " | " * join(e.conditioning, ",")
            println(
                io,
                "    T", e.tree, ":E", e.edge, "  ",
                e.conditioned[1], "-", e.conditioned[2], cond,
                "  ", e.family,
                e.rotation == 0 ? "" : " rot=$(e.rotation)°",
                "  k=", e.npars,
            )
        end
    end
end
