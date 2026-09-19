# `groups =` on the R-vine first tree: the maximum spanning tree over the spanning
# trees in which every group induces a connected subtree, computed exactly by one
# Kruskal pass with the key (is cross, -weight, labels).

@testsnippet Groups begin
    using Test
    using Random
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    # Two blocks {1,2,3} and {4,5,6} of Gaussian dependence `within`, joined by
    # `cross` between every cross-block pair.
    function block_data(rng, n; within=0.7, cross=0.1)
        Σ = Matrix{Float64}(1.0 * (1:6 .== (1:6)'))
        for i in 1:6, j in 1:6
            i == j && continue
            same = (i <= 3) == (j <= 3)
            Σ[i, j] = same ? within : cross
        end
        return rand(rng, GaussianCopula(Σ), n)
    end

    # Structural equality of two fitted vines: structure, families and parameters.
    deq(a::Number, b::Number) = a == b
    deq(a::Symbol, b::Symbol) = a == b
    deq(a::AbstractArray, b::AbstractArray) = size(a) == size(b) && all(deq.(a, b))
    deq(a::Tuple, b::Tuple) = length(a) == length(b) && all(deq(x, y) for (x, y) in zip(a, b))
    function deq(a, b)
        typeof(a) == typeof(b) || return false
        isempty(fieldnames(typeof(a))) && return a == b
        return all(deq(getfield(a, f), getfield(b, f)) for f in fieldnames(typeof(a)))
    end

    # Tree-1 edges of a fitted R-vine as unordered pairs of variable labels.
    function tree1_edges(vc::RVineCopula)
        ord = collect(order(vc))
        S1 = vc.structure.struct_array[1]
        return Set(minmax(ord[e], S1[e]) for e in eachindex(S1))
    end

    # Tree-1 weight matrix of `U` under `criterion`.
    function weight_matrix(U, criterion=:tau)
        p = size(U, 1)
        W = zeros(p, p)
        for j in 2:p, i in 1:(j - 1)
            W[i, j] = W[j, i] = VineCopulas._tree_dependence(U[i, :], U[j, :], i, j, Int[], criterion)
        end
        return W
    end
    objective(W, E) = sum(W[i, j] for (i, j) in E; init=0.0)

    # Candidates of a complete graph with the weights `W`, as the engine builds them.
    function candidates(W)
        p = size(W, 1)
        return [VineCopulas._RVCandidate(i, j, i, j, Int[], Float64[], Float64[], W[i, j]) for j in 2:p for i in 1:(j - 1)]
    end
    selected_edges(sel) = Set(minmax(c.a, c.b) for c in sel)

    # Every spanning tree of K_p in which each group induces a connected
    # subtree, by enumeration of the (p - 1)-subsets of the edges.
    function connected(vs, E)
        isempty(vs) && return true
        seen = Set([first(vs)])
        frontier = [first(vs)]
        while !isempty(frontier)
            v = pop!(frontier)
            for (i, j) in E
                w = i == v ? j : (j == v ? i : 0)
                w == 0 && continue
                w in vs || continue
                w in seen && continue
                push!(seen, w)
                push!(frontier, w)
            end
        end
        return length(seen) == length(vs)
    end
    # Every k-subset of 1:m, as index vectors, in lexicographic order.
    function ksubsets(m, k)
        out = Vector{Vector{Int}}()
        idx = collect(1:k)
        k == 0 && return [Int[]]
        while true
            push!(out, copy(idx))
            i = k
            while i >= 1 && idx[i] == m - k + i
                i -= 1
            end
            i == 0 && return out
            idx[i] += 1
            for j in (i + 1):k
                idx[j] = idx[j - 1] + 1
            end
        end
    end
    function brute_force_optimum(W, g)
        p = size(W, 1)
        pairs = [(i, j) for j in 2:p for i in 1:(j - 1)]
        best = -Inf
        for idx in ksubsets(length(pairs), p - 1)
            E = pairs[idx]
            connected(1:p, E) || continue
            all(connected(findall(==(k), g), E) for k in unique(g)) || continue
            best = max(best, objective(W, E))
        end
        return best
    end

    # Kruskal's maximum spanning tree of `W` restricted to the vertex set `vars`.
    function mst_edges(W, vars)
        pairs = [(W[i, j], minmax(i, j)) for i in vars for j in vars if i < j]
        sort!(pairs; by=x -> (-x[1], x[2]))
        parent = Dict(v => v for v in vars)
        find(v) = parent[v] == v ? v : (parent[v] = find(parent[v]))
        out = Set{Tuple{Int,Int}}()
        for (_, (i, j)) in pairs
            ri, rj = find(i), find(j)
            ri == rj && continue
            parent[ri] = rj
            push!(out, (i, j))
        end
        return out
    end

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
end

@testitem "Groups – the sort key returns the constrained optimum exactly" tags=[:Fit, :Vine, :RVine, :Structure, :MST] setup=[Groups] begin
    VC = VineCopulas
    rng = StableRNG(4321)
    # Random weights and random partitions on 4 to 7 vertices, against the
    # enumeration of every admissible spanning tree. Ties included: weights
    # are drawn on a coarse grid on half of the instances.
    ninstances = Ref(0)
    for p in 4:7, trial in 1:(p <= 6 ? 12 : 4)
        W = zeros(p, p)
        coarse = isodd(trial)
        for j in 2:p, i in 1:(j - 1)
            W[i, j] = W[j, i] = coarse ? rand(rng, 1:4) / 4 : rand(rng)
        end
        K = rand(rng, 1:p)
        g = rand(rng, 1:K, p)
        sel = VC._maximum_spanning_tree(candidates(W), p; groups=g)
        E = selected_edges(sel)
        @test length(E) == p - 1
        @test connected(1:p, E)
        @test all(connected(findall(==(k), g), E) for k in unique(g))
        @test objective(W, E) ≈ brute_force_optimum(W, g) atol=1e-12
        # The structure of Lemma 1: each group's own maximum spanning tree,
        # and exactly K' - 1 cross edges for K' non-empty groups.
        for k in unique(g)
            vars = findall(==(k), g)
            @test Set(e for e in E if g[e[1]] == k && g[e[2]] == k) == mst_edges(W, vars)
        end
        @test count(e -> g[e[1]] != g[e[2]], E) == length(unique(g)) - 1
        ninstances[] += 1
    end
    @test ninstances[] == 40

    # One group, or every vertex its own group, is the unconstrained tree,
    # bit for bit: the key reduces to the old one.
    for p in 4:7
        W = zeros(p, p)
        for j in 2:p, i in 1:(j - 1)
            W[i, j] = W[j, i] = rand(rng)
        end
        free = selected_edges(VC._maximum_spanning_tree(candidates(W), p))
        @test selected_edges(VC._maximum_spanning_tree(candidates(W), p; groups=ones(Int, p))) == free
        @test selected_edges(VC._maximum_spanning_tree(candidates(W), p; groups=fill(-3, p))) == free
        @test selected_edges(VC._maximum_spanning_tree(candidates(W), p; groups=collect(1:p))) == free
        @test free == mst_edges(W, 1:p)
    end
end

@testitem "Groups – fit(RVineCopula, U; groups=g) constrains tree 1 only" tags=[:Fit, :Vine, :RVine, :Structure, :MST] setup=[Groups] begin
    rng = StableRNG(4322)
    g = [1, 1, 1, 2, 2, 2]

    # One group reproduces the unconstrained fit bit for bit.
    U = block_data(rng, 600; within=0.6, cross=0.3)
    R0 = fit(RVineCopula, U; family_set=fams)
    @test deq(R0, fit(RVineCopula, U; family_set=fams, groups=ones(Int, 6)))
    @test deq(R0, fit(RVineCopula, U; family_set=fams, groups=fill(7, 6)))
    @test deq(R0, fit(RVineCopula, U; family_set=fams, groups=1:6))
    @test deq(R0, fit(RVineCopula, U; family_set=fams, groups=Int8[1, 1, 1, 1, 1, 1]))

    # Cross-block dependence above the within-block one: unconstrained tree 1
    # crosses more than once; constrained tree 1 is the two blocks' own
    # maximum spanning trees joined by exactly one cross-group edge, the
    # heaviest one, and its objective is the constrained optimum, below the
    # unconstrained one.
    Ustrong = block_data(rng, 800; within=0.45, cross=0.5)
    W = weight_matrix(Ustrong)
    Rfree = fit(RVineCopula, Ustrong; family_set=fams)
    Rg = fit(RVineCopula, Ustrong; family_set=fams, groups=g)
    E = tree1_edges(Rg)
    crossing = [e for e in E if g[e[1]] != g[e[2]]]
    @test count(e -> g[e[1]] != g[e[2]], tree1_edges(Rfree)) > 1
    @test length(crossing) == 1
    @test setdiff(E, crossing) == union(mst_edges(W, 1:3), mst_edges(W, 4:6))
    @test W[crossing[1]...] == maximum(W[i, j] for i in 1:3 for j in 4:6)
    @test objective(W, E) ≈ brute_force_optimum(W, g) atol=1e-12
    @test objective(W, E) < objective(W, tree1_edges(Rfree))
    @test objective(W, tree1_edges(Rfree)) ≈ brute_force_optimum(W, ones(Int, 6)) atol=1e-12
    # Higher trees follow the proximity condition, and the model is usable.
    @test truncation(Rg) == 5
    @test VineCopulas._compile_standard_rvine(Rg) isa VineCopulas._RVineExecPlan
    @test all(isfinite, logpdf(Rg, Ustrong[:, 1:50]))
    @test all(isfinite, logpdf(Rg, rand(rng, Rg, 20)))

    # The constraint composes with every other selection control: the
    # criterion (tree 1 is the constrained optimum of that criterion's
    # weights), the threshold, the truncation, and the sampling tail.
    for c in (:rho, :hoeffd, :cxi)
        Wc = weight_matrix(Ustrong, c)
        Rc = fit(RVineCopula, Ustrong; family_set=fams, groups=g, tree_criterion=c)
        @test objective(Wc, tree1_edges(Rc)) ≈ brute_force_optimum(Wc, g) atol=1e-12
    end
    Rt = fit(RVineCopula, Ustrong; family_set=fams, groups=g, trunc=2, threshold=0.2)
    @test truncation(Rt) == 2
    @test tree1_edges(Rt) == E
    Rs = fit(RVineCopula, Ustrong; family_set=fams, groups=g, sampling_tail=[4])
    @test tree1_edges(Rs) == E
    @test order(Rs)[end] == 4 || !admits_conditioning(Rs, [4])

    # Validation.
    @test_throws DimensionMismatch fit(RVineCopula, U; family_set=fams, groups=[1, 1, 2])
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, groups=[1.0, 1, 1, 2, 2, 2])
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, groups=:cluster)
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, groups="112233")
    st = VineCopulas.structure(R0)
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, structure=st, groups=g)
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, structure=st, groups=ones(Int, 6))
end
