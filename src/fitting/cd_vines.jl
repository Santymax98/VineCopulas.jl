# -----------------------------------------------------------------------------
# Common vine parameter metadata
# -----------------------------------------------------------------------------

function _vine_parameter_metadata(vc::AbstractVineCopula)
    vals = Float64[]
    names = String[]

    for ve in vine_edges(vc)
        C = ve.copula
        p = _vine_params(C)
        nt = _vine_named_params(p)
        pnames, pvals = _flatten_fit_params(nt)
        fam = _short_family_name(C)
        for (nm, val) in zip(pnames, pvals)
            push!(names, "T$(ve.tree):E$(ve.index):$(fam):$(nm)")
            push!(vals, val)
        end
    end
    return names, vals
end

# -----------------------------------------------------------------------------
# C-vine sequential fitting
# -----------------------------------------------------------------------------

function _cvine_choose_root(labels::Vector{Int}, cond::Vector{Vector{Float64}}, D, criterion, weights=nothing)
    length(labels) == 1 && return labels[1]
    # Every unordered pair contributes to the score of both endpoints. Compute
    # it once rather than twice. `D` is the set of roots already chosen: every
    # candidate pair at this tree is conditioned on it.
    scores = zeros(Float64, length(labels))
    @inbounds for j in 2:length(labels), i in 1:j-1
        w = _tree_dependence(cond[labels[i]], cond[labels[j]], labels[i], labels[j], D, criterion, weights,)
        scores[i] += w
        scores[j] += w
    end
    return labels[argmax(scores)]
end

function _fit_cvine_sequential(U0; order=nothing, trunc=nothing, weights=nothing, family_set=:default, pair_method::Symbol=:default,
    selection_criterion::Symbol=:bic, tree_criterion=:tau, allow_rotations::Bool=true, preselect::Bool=true, include_independence::Bool=true,
    independence_test::Symbol=:none, independence_level::Real=0.05, threshold::Real=0.0, pair_kwargs::NamedTuple=NamedTuple(),
    strict::Bool=false, trace::Bool=false,)
    p = size(U0, 1)
    X = _fit_data(U0, p)
    w = _fit_weights(weights, size(X, 2))
    _check_selection_criterion(selection_criterion)
    _check_tree_criterion(tree_criterion)
    _check_independence_test(independence_test)
    _check_independence_level(independence_level)
    threshold = _check_threshold(threshold, tree_criterion)
    q = isnothing(trunc) ? p - 1 : Int(trunc)
    1 <= q <= p - 1 || throw(ArgumentError("trunc must be in 1:$(p-1)"))

    explicit_order = order !== nothing
    ord = explicit_order ? collect(Int, order) : Int[]
    explicit_order && (_check_order(ord) == p || throw(ArgumentError("order dimension does not match data")))
    cond = [copy(@view X[j, :]) for j in 1:p]
    remaining = collect(1:p)
    # Store each fitted edge by child label. Automatic root selection is
    # sequential, so the final order is not known when early trees are fit.
    # Keying by label lets us reorder every level exactly once at the end.
    levels = Vector{Dict{Int,_PairSelection}}(undef, q)
    for t in 1:q
        D = ord[1:(t - 1)]
        root = explicit_order ? ord[t] : _cvine_choose_root(remaining, cond, D, tree_criterion, w)

        if !explicit_order
            push!(ord, root)
        end
        deleteat!(remaining, findfirst(==(root), remaining))

        children = explicit_order ? collect(ord[(t+1):p]) : copy(remaining)
        level = Dict{Int,_PairSelection}()

        @inbounds for child in children
            dep = _tree_dependence(cond[root], cond[child], root, child, D, tree_criterion, w,)
            pdata = Matrix{Float64}(undef, 2, size(X, 2))
            pdata[1, :] .= cond[root]
            pdata[2, :] .= cond[child]
            fit = _select_pair(pdata; family_set=family_set, pair_method=pair_method, selection_criterion=selection_criterion, allow_rotations=allow_rotations,
                preselect=preselect, include_independence=include_independence, independence_test=independence_test, independence_level=independence_level,
                pair_kwargs=pair_kwargs, strict=strict, trace=trace, force_independence=dep < threshold, weights=w,)
            level[child] = fit
        end
        # Update U_child | root only when another fitted tree will consume
        # those pseudo-observations.
        if t < q
            @inbounds for child in children
                C = level[child].copula
                uroot = cond[root]
                uchild = cond[child]
                _pair_hfunc2!(uchild, C, uroot, uchild)
            end
        end
        levels[t] = level
    end
    if !explicit_order
        # The inactive tail of a truncated C-vine does not affect the fitted
        # density. Keep it deterministic.
        append!(ord, sort(remaining))
    end
    edgelevels = [
        tuple((levels[t][ord[j]].copula for j in (t+1):p)...)
        for t in 1:q
    ]
    vc = CVineCopula(ord, edgelevels; trunc=q)
    return vc
end

function Distributions.fit(::Type{<:CVineCopula}, U; method::Symbol=:default, kwargs...)
    _check_vine_fit_method(method)
    return _fit_cvine_sequential(U; kwargs...)
end

# -----------------------------------------------------------------------------
# D-vine order selection and sequential fitting
# -----------------------------------------------------------------------------

function _dependence_matrix(X::Matrix{Float64}, criterion, weights=nothing)
    p = size(X, 1)
    W = zeros(Float64, p, p)
    @inbounds for j in 2:p, i in 1:j-1
        w = _tree_dependence(view(X, i, :), view(X, j, :), i, j, Int[], criterion, weights,)
        W[i, j] = w
        W[j, i] = w
    end
    return W
end

"""
    _max_weight_hamiltonian_path(W)

Held-Karp dynamic programming for the maximum-weight Hamiltonian path.
This is exact and is used only below `exact_order_max`.
"""
function _max_weight_hamiltonian_path(W::AbstractMatrix{<:Real})
    p = size(W, 1)
    size(W, 2) == p || throw(DimensionMismatch("W must be square"))
    p <= 20 || throw(ArgumentError("exact D-vine ordering is exponential; use order_method=:greedy above dimension 20"))
    nmask = 1 << p
    dp = fill(-Inf, nmask, p)
    parent = fill(0, nmask, p)
    @inbounds for j in 1:p
        dp[(1 << (j - 1)) + 1, j] = 0.0
    end
    # Julia arrays are 1-based, mask m is stored at row m+1.
    @inbounds for mask in 1:(nmask - 1)
        row = mask + 1
        for j in 1:p
            ((mask >> (j - 1)) & 1) == 1 || continue
            prev = mask & ~(1 << (j - 1))
            prev == 0 && continue
            prow = prev + 1
            best = -Inf
            bestk = 0
            for k in 1:p
                ((prev >> (k - 1)) & 1) == 1 || continue
                cand = dp[prow, k] + W[k, j]
                if cand > best
                    best = cand
                    bestk = k
                end
            end
            dp[row, j] = best
            parent[row, j] = bestk
        end
    end
    full = nmask - 1
    row = full + 1
    last = argmax(view(dp, row, :))
    path = Vector{Int}(undef, p)
    mask = full
    j = last
    @inbounds for pos in p:-1:1
        path[pos] = j
        pj = parent[mask + 1, j]
        mask &= ~(1 << (j - 1))
        j = pj
        pos == 1 && break
    end
    return path
end

function _greedy_path(W::AbstractMatrix{<:Real})
    p = size(W, 1)
    p == 2 && return [1, 2]

    bestw = -Inf
    a, b = 1, 2
    @inbounds for j in 2:p, i in 1:j-1
        if W[i, j] > bestw
            bestw = W[i, j]
            a, b = i, j
        end
    end

    path = [a, b]
    used = falses(p)
    used[a] = true
    used[b] = true

    while length(path) < p
        best = -Inf
        bestv = 0
        side = :right
        @inbounds for v in 1:p
            used[v] && continue
            wl = W[v, first(path)]
            wr = W[last(path), v]
            if wl > best
                best = wl; bestv = v; side = :left
            end
            if wr > best
                best = wr; bestv = v; side = :right
            end
        end
        if side === :left
            pushfirst!(path, bestv)
        else
            push!(path, bestv)
        end
        used[bestv] = true
    end
    return path
end

function _select_dvine_order(X::Matrix{Float64}, criterion, weights=nothing; order_method::Symbol=:auto, exact_order_max::Int=12,)
    p = size(X, 1)
    exact_order_max >= 2 || throw(ArgumentError("exact_order_max must be at least 2"))
    W = _dependence_matrix(X, criterion, weights)

    method = order_method
    if method === :auto
        method = p <= min(exact_order_max, 20) ? :exact : :greedy
    end
    method === :exact && return _max_weight_hamiltonian_path(W), :exact
    method === :greedy && return _greedy_path(W), :greedy
    method === :natural && return collect(1:p), :natural
    throw(ArgumentError("order_method must be :auto, :exact, :greedy, or :natural"))
end

function _fit_dvine_sequential(U0; order=nothing, trunc=nothing, weights=nothing, order_method::Symbol=:auto, exact_order_max::Int=12,
    family_set=:default, pair_method::Symbol=:default, selection_criterion::Symbol=:bic, tree_criterion=:tau, allow_rotations::Bool=true,
    preselect::Bool=true, include_independence::Bool=true, independence_test::Symbol=:none, independence_level::Real=0.05,
    threshold::Real=0.0, pair_kwargs::NamedTuple=NamedTuple(), strict::Bool=false, trace::Bool=false,)
    p = size(U0, 1)
    X = _fit_data(U0, p)
    w = _fit_weights(weights, size(X, 2))
    _check_selection_criterion(selection_criterion)
    _check_tree_criterion(tree_criterion)
    _check_independence_test(independence_test)
    _check_independence_level(independence_level)
    threshold = _check_threshold(threshold, tree_criterion)
    q = isnothing(trunc) ? p - 1 : Int(trunc)
    1 <= q <= p - 1 || throw(ArgumentError("trunc must be in 1:$(p-1)"))

    if order === nothing
        ord, _ = _select_dvine_order(X, tree_criterion, w; order_method=order_method, exact_order_max=exact_order_max,)
    else
        ord = collect(Int, order)
        _check_order(ord) == p || throw(ArgumentError("order dimension does not match data"))
    end

    n = size(X, 2)
    L = [copy(@view X[ord[j], :]) for j in 1:p]
    R = [copy(v) for v in L]
    levels = Vector{Vector{_PairSelection}}(undef, q)
    for t in 1:q
        m = p - t
        level = Vector{_PairSelection}(undef, m)

        @inbounds for i in 1:m
            # Edge (ord[i], ord[i+t] | ord[i+1], …, ord[i+t-1]).
            dep = _tree_dependence(L[i], R[i + t], ord[i], ord[i + t], ord[(i + 1):(i + t - 1)], tree_criterion, w,)
            pdata = Matrix{Float64}(undef, 2, n)
            pdata[1, :] .= L[i]
            pdata[2, :] .= R[i + t]
            level[i] = _select_pair(pdata; family_set=family_set, pair_method=pair_method, selection_criterion=selection_criterion,
                allow_rotations=allow_rotations, preselect=preselect, include_independence=include_independence, independence_test=independence_test,
                independence_level=independence_level, pair_kwargs=pair_kwargs, strict=strict, trace=trace, force_independence=dep < threshold, weights=w,)
        end

        levels[t] = level

        if t < q
            # Within a D-vine tree these state vectors are disjoint across
            # edges, so both conditionals can overwrite the consumed vectors.
            @inbounds for i in 1:m
                C = level[i].copula
                _pair_hfuncs!(L[i], R[i + t], C, L[i], R[i + t])
            end
        end
    end

    edgelevels = [
        tuple((levels[t][i].copula for i in eachindex(levels[t]))...)
        for t in 1:q
    ]
    vc = DVineCopula(ord, edgelevels; trunc=q)

    return vc
end

function Distributions.fit(::Type{<:DVineCopula}, U; method::Symbol=:default, kwargs...)
    _check_vine_fit_method(method)
    return _fit_dvine_sequential(U; kwargs...)
end
