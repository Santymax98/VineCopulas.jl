# Issue #43: the tree criterion. Built-in dependence statistics beyond |τ| and |ρ|,
# a weight function `(u_a, u_b, a, b, D) -> Real` on every vine engine, and the
# `threshold` rule that follows the criterion's scale.

@testsnippet TreeCriterion begin
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

    # Tree-1 weight matrix of `U` under `criterion`, and its maximum spanning
    # tree by Kruskal (the engine's tie-break: heaviest first, then labels).
    function weight_matrix(U, criterion)
        p = size(U, 1)
        W = zeros(p, p)
        for j in 2:p, i in 1:(j - 1)
            W[i, j] = W[j, i] = VineCopulas._tree_dependence(U[i, :], U[j, :], i, j, Int[], criterion)
        end
        return W
    end
    function mst_edges(W)
        p = size(W, 1)
        pairs = [(W[i, j], (i, j)) for j in 2:p for i in 1:(j - 1)]
        sort!(pairs; by=x -> (-x[1], x[2]))
        parent = collect(1:p)
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

    tau_criterion(ua, ub, a, b, D) = abs(VineCopulas._kendall_tau_b(ua, ub))

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
end

@testitem "Tree criteria – built-in statistics match their references" tags=[:Fit, :Vine, :Structure, :MST, :Regression] setup=[TreeCriterion] begin
    VC = VineCopulas

    # Two exact fixtures (every value is a ratio of small integers, no ties):
    # a permutation-power pair with almost no dependence, and a tilted parabola
    # with τ ≈ 0 but a near-functional relation. The reference values are
    # wdm 0.3 (Hoeffding's D, Kendall's τ, Spearman's ρ, Chatterjee's ξ) and
    # vinecopulib 1.0's `ace` (maximum correlation) on the same data.
    x = [i / 61 for i in 1:60]
    y_perm = [powermod(i, 7, 61) / 61 for i in 1:60]
    y_para = [((2i - 61)^2 + i) / 3600 for i in 1:60]

    @test VC._hoeffding_d(x, y_perm) ≈ -0.005757746206544734 atol=1e-12
    @test VC._kendall_tau_b(x, y_perm) ≈ 0.09943502824858758 atol=1e-12
    @test VC._spearman_rho(x, y_perm) ≈ 0.14915254237288136 atol=1e-12
    @test VC._chatterjee_xi(x, y_perm) ≈ 0.08391219783272863 atol=1e-12
    @test VC._chatterjee_xi(y_perm, x) ≈ -0.0794665184773582 atol=1e-12
    @test VC._maximum_correlation(x, y_perm) ≈ 0.062791721750353996 atol=1e-12

    @test VC._hoeffding_d(x, y_para) ≈ 0.2288135593220353 atol=1e-12
    @test VC._kendall_tau_b(x, y_para) ≈ 0.01694915254237288 atol=1e-12
    @test VC._spearman_rho(x, y_para) ≈ 0.025006946373992776 atol=1e-12
    @test VC._chatterjee_xi(x, y_para) ≈ 0.9024729091414279 atol=1e-12
    @test VC._chatterjee_xi(y_para, x) ≈ -0.4754098360655785 atol=1e-12
    @test VC._maximum_correlation(x, y_para) ≈ 0.98619280764035 atol=1e-12

    # The symmetrised ξ is the larger direction; every measure is symmetric
    # otherwise.
    @test VC._symmetric_chatterjee_xi(x, y_para) == VC._chatterjee_xi(x, y_para)
    @test VC._symmetric_chatterjee_xi(y_para, x) == VC._chatterjee_xi(x, y_para)
    @test VC._hoeffding_d(y_para, x) == VC._hoeffding_d(x, y_para)
    @test VC._maximum_correlation(y_para, x) ≈ VC._maximum_correlation(x, y_para) atol=1e-12

    # Hoeffding's D against its O(n²) definition on a random pair, and its
    # range: 1 on any monotone relation, either direction.
    rng = StableRNG(4311)
    u = rand(rng, 200)
    v = 0.6 .* u .+ 0.4 .* rand(rng, 200)
    let n = 200
        R = [count(<(u[i]), u) for i in 1:n] .+ 1
        S = [count(<(v[i]), v) for i in 1:n] .+ 1
        Q = [count(k -> u[k] < u[i] && v[k] < v[i], 1:n) for i in 1:n] .+ 1
        D1 = sum((Q .- 1) .* (Q .- 2))
        D2 = sum((R .- 1) .* (R .- 2) .* (S .- 1) .* (S .- 2))
        D3 = sum((R .- 2) .* (S .- 2) .* (Q .- 1))
        Dn = 30 * ((n - 2) * (n - 3) * D1 + D2 - 2 * (n - 2) * D3) / (n * (n - 1) * (n - 2) * (n - 3) * (n - 4))
        @test VC._hoeffding_d(u, v) ≈ Dn atol=1e-12
    end
    @test VC._hoeffding_d(u, u) ≈ 1 atol=1e-12
    @test VC._hoeffding_d(u, -u) ≈ 1 atol=1e-12
    @test VC._hoeffding_d(u, u .^ 3) ≈ 1 atol=1e-12

    # Joe's Gaussian mutual information is the closed form on normal scores.
    r = VC._pearson(quantile.(Normal(), u), quantile.(Normal(), v))
    @test VC._gaussian_mutual_information(u, v) ≈ -0.5 * log(1 - r^2)
    @test VC._gaussian_mutual_information(u, u) == Inf
    @test VC._gaussian_mutual_information(u, 1 .- u) == Inf

    # Population values on a Gaussian pair: ρ_max = |ρ|, and ξ, D, MI at their
    # known levels; ACE with a running-mean smoother is biased down a little.
    ρ = 0.6
    G = rand(StableRNG(4312), GaussianCopula([1.0 ρ; ρ 1.0]), 2000)
    @test abs(VC._maximum_correlation(G[1, :], G[2, :]) - ρ) < 0.06
    @test abs(VC._gaussian_mutual_information(G[1, :], G[2, :]) - (-0.5 * log(1 - ρ^2))) < 0.03
    @test abs(VC._kendall_tau_b(G[1, :], G[2, :]) - 2 / π * asin(ρ)) < 0.03

    # Chatterjee's ξ with ties in the response follows the general formula, and
    # a constant response gives 0 instead of 0/0.
    @test VC._chatterjee_xi([1, 2, 3, 4, 5, 6], [1, 1, 2, 2, 3, 3]) ≈ 0.625
    @test VC._chatterjee_xi([1, 2, 3], [1, 1, 1]) == 0
    @test VC._chatterjee_xi(1:10, 1:10) ≈ 1 - 3 * 9 / 99
    @test VC._chatterjee_xi(1:10, 10:-1:1) ≈ 1 - 3 * 9 / 99

    # Sample-size floors.
    @test_throws ArgumentError VC._hoeffding_d(rand(4), rand(4))
    @test_throws ArgumentError VC._maximum_correlation(rand(2), rand(2))
    @test_throws DimensionMismatch VC._hoeffding_d(rand(6), rand(5))
    @test_throws DimensionMismatch VC._maximum_correlation(rand(6), rand(5))
    @test_throws DimensionMismatch VC._chatterjee_xi(rand(6), rand(5))
end

@testitem "Tree criteria – every built-in drives structure selection" tags=[:Fit, :Vine, :Structure, :MST] setup=[TreeCriterion] begin
    VC = VineCopulas
    rng = StableRNG(4313)
    n = 600
    # Variable 1 uniform; 2 a noisy monotone image of 1 (τ ≈ 0.5); 3 a
    # noise-free parabola in 1 (τ ≈ 0, ξ ≈ 1); 4 a noisy monotone image of 3.
    u1 = rand(rng, n)
    u2 = 0.7 .* u1 .+ 0.3 .* rand(rng, n)
    u3 = (u1 .- 0.5) .^ 2 .* 4
    u4 = 0.7 .* u3 .+ 0.3 .* rand(rng, n)
    U = permutedims(hcat(u1, u2, u3, u4))

    W = Dict(c => weight_matrix(U, c) for c in VC._TREE_CRITERIA)

    # The rank correlations and the Gaussian mutual information do not see
    # the parabola; Hoeffding's D, the maximum correlation and ξ do. D is 1
    # only on a monotone relation, so it ranks the parabola below the τ ≈ 0.5
    # pair; the maximum correlation and ξ rank a functional relation first.
    for c in (:tau, :rho, :joe)
        @test W[c][1, 3] < 0.1
    end
    @test W[:hoeffd][1, 3] > 0.2
    for c in (:mcor, :cxi)
        @test W[c][1, 3] > 0.9
        @test W[c][1, 3] > W[c][1, 2]
    end

    # On every engine the first tree is the maximum spanning tree of the
    # criterion's own weights, and the parabola edge joins tree 1 exactly for
    # the criteria that see it.
    for c in VC._TREE_CRITERIA
        R = fit(RVineCopula, U; family_set=fams, tree_criterion=c)
        @test tree1_edges(R) == mst_edges(W[c])
        @test ((1, 3) in tree1_edges(R)) == (c in (:hoeffd, :mcor, :cxi))
        @test all(isfinite, logpdf(R, U[:, 1:20]))
        # C- and D-vines run the same criterion: their fits are the sequential
        # ones over their own structure class, and they agree with the R-vine
        # fit whenever they can (a D-vine order is a path, so a star at 1 is
        # not reachable).
        C = fit(CVineCopula, U; family_set=fams, tree_criterion=c)
        @test all(isfinite, logpdf(C, U[:, 1:20]))
        D = fit(DVineCopula, U; family_set=fams, tree_criterion=c)
        @test all(isfinite, logpdf(D, U[:, 1:20]))
    end

    # The C-vine root is the variable with the largest weight sum under the
    # criterion, so it moves from 1 or 2 (:tau) to 1 (:cxi, the hub of both
    # monotone and functional relations).
    root(c) = argmax(vec(sum(W[c]; dims=2)))
    @test order(fit(CVineCopula, U; family_set=fams, tree_criterion=:cxi))[1] == root(:cxi) == 1
    @test order(fit(CVineCopula, U; family_set=fams, tree_criterion=:tau))[1] == root(:tau)
end

@testitem "Tree criteria – tree_criterion as a function" tags=[:Fit, :Vine, :Structure, :MST] setup=[TreeCriterion] begin
    rng = StableRNG(4301)
    U = block_data(rng, 600; within=0.6, cross=0.3)

    # The function form of :tau reproduces :tau bit for bit on every engine.
    for VT in (RVineCopula, CVineCopula, DVineCopula)
        R_sym = fit(VT, U; family_set=fams, tree_criterion=:tau)
        R_fun = fit(VT, U; family_set=fams, tree_criterion=tau_criterion)
        @test deq(R_sym, R_fun)
    end

    # Every call sees the labels of its candidate edge: `a`, `b` are variables
    # of 1:p, `D` is the conditioning set, and the conditioned variables never
    # sit in it.
    seen = Set{Tuple{Int,Int,Vector{Int}}}()
    spy = function (ua, ub, a, b, D)
        @test 1 <= a <= 6 && 1 <= b <= 6 && a != b
        @test a ∉ D && b ∉ D
        @test length(ua) == length(ub) == size(U, 2)
        push!(seen, (minmax(a, b)..., collect(Int, D)))
        return abs(VineCopulas._kendall_tau_b(ua, ub))
    end
    fit(RVineCopula, U; family_set=fams, tree_criterion=spy)
    @test any(isempty(last(s)) for s in seen)
    @test any(length(last(s)) == 4 for s in seen)
    for VT in (CVineCopula, DVineCopula)
        empty!(seen)
        fit(VT, U; family_set=fams, tree_criterion=spy)
        @test any(isempty(last(s)) for s in seen)
        @test any(length(last(s)) == 4 for s in seen)
    end

    # The value is used as is: a boost on every edge touching variable 3
    # makes tree 1 a star at 3.
    U5 = U[1:5, :]
    boost = (ua, ub, a, b, D) -> abs(VineCopulas._kendall_tau_b(ua, ub)) + (3 in (a, b) ? 2.0 : 0.0)
    R = fit(RVineCopula, U5; family_set=fams, tree_criterion=boost)
    @test tree1_edges(R) == Set(minmax(3, v) for v in (1, 2, 4, 5))
    @test VineCopulas._compile_standard_rvine(R) isa VineCopulas._RVineExecPlan

    # A precomputed tree-1 weight matrix is the same mechanism.
    W = zeros(6, 6)
    for i in 1:6, j in 1:6
        i != j && (W[i, j] = 1 / abs(i - j))
    end
    chain = (ua, ub, a, b, D) -> isempty(D) ? W[a, b] : abs(VineCopulas._kendall_tau_b(ua, ub))
    Rchain = fit(RVineCopula, U; family_set=fams, tree_criterion=chain)
    @test tree1_edges(Rchain) == Set((i, i + 1) for i in 1:5)

    # No absolute value is taken: a negative criterion is minimised.
    neg = (ua, ub, a, b, D) -> -abs(VineCopulas._kendall_tau_b(ua, ub))
    Rneg = fit(RVineCopula, U; family_set=fams, tree_criterion=neg)
    Wt = weight_matrix(U, :tau)
    @test tree1_edges(Rneg) == mst_edges(-Wt)

    # The contract: a finite Real, or an ArgumentError naming the edge and the value.
    for (bad, shown) in (((ua, ub, a, b, D) -> NaN, "NaN"),
                         ((ua, ub, a, b, D) -> Inf, "Inf"),
                         ((ua, ub, a, b, D) -> missing, "missing"),
                         ((ua, ub, a, b, D) -> "0.5", "\"0.5\""),
                         ((ua, ub, a, b, D) -> 1 + 0im, "1 + 0im"))
        for VT in (RVineCopula, CVineCopula, DVineCopula)
            err = try
                fit(VT, U; family_set=fams, tree_criterion=bad)
            catch e
                e
            end
            @test err isa ArgumentError
            @test occursin(shown, err.msg)
            @test occursin("finite Real", err.msg)
            @test occursin(r"edge \(\d, \d \| \)", err.msg)
        end
    end
    # The edge is named with its conditioning set from tree 2 on.
    late = (ua, ub, a, b, D) -> isempty(D) ? abs(VineCopulas._kendall_tau_b(ua, ub)) : NaN
    err = try
        fit(RVineCopula, U; family_set=fams, tree_criterion=late)
    catch e
        e
    end
    @test err isa ArgumentError
    @test occursin(r"edge \(\d, \d \| \d\)", err.msg)

    # Any other integer or Bool is a Real and passes.
    @test fit(RVineCopula, U5; family_set=fams, tree_criterion=(ua, ub, a, b, D) -> 3 in (a, b)) isa RVineCopula
    @test tree1_edges(fit(RVineCopula, U5; family_set=fams, tree_criterion=(ua, ub, a, b, D) -> 3 in (a, b))) ==
          Set(minmax(3, v) for v in (1, 2, 4, 5))

    # Validation of the keyword itself.
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, tree_criterion=:unknown)
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, tree_criterion=1)
    @test_throws ArgumentError fit(CVineCopula, U; family_set=fams, tree_criterion="tau")
end

@testitem "Tree criteria – threshold is a cut on the criterion's own scale" tags=[:Fit, :Vine, :Structure, :MST] setup=[TreeCriterion] begin
    rng = StableRNG(4314)
    U = block_data(rng, 600; within=0.6, cross=0.2)
    nindep(R) = count(c -> c isa Copulas.IndependentCopula, edges(R)[1])

    # A criterion that leaves [0, 1] moves the cut with it: |τ| + 2 under
    # threshold 2.3 is |τ| under threshold 0.3, bit for bit, on every engine.
    shifted = (ua, ub, a, b, D) -> abs(VineCopulas._kendall_tau_b(ua, ub)) + 2
    for VT in (RVineCopula, CVineCopula, DVineCopula)
        R_tau = fit(VT, U; family_set=fams, tree_criterion=:tau, threshold=0.3)
        R_shift = fit(VT, U; family_set=fams, tree_criterion=shifted, threshold=2.3)
        @test deq(R_tau, R_shift)
        # The cut bit: the tree keeps the same edges and the weak ones become
        # independence copulas.
        R_free = fit(VT, U; family_set=fams, tree_criterion=:tau)
        @test !deq(R_tau, R_free)
    end
    R_tau = fit(RVineCopula, U; family_set=fams, tree_criterion=:tau, threshold=0.3)
    @test nindep(R_tau) > 0
    @test nindep(fit(RVineCopula, U; family_set=fams, tree_criterion=:tau)) == 0

    # The same on :joe, whose values are unbounded: a threshold above every
    # tree-1 weight makes tree 1 all independence, and the tree itself is the
    # one |r| on normal scores selects (the map is monotone).
    Wj = weight_matrix(U, :joe)
    R_joe = fit(RVineCopula, U; family_set=fams, tree_criterion=:joe, threshold=maximum(Wj) + 1)
    @test nindep(R_joe) == 5
    @test tree1_edges(R_joe) == mst_edges(Wj)
    normal_r = (ua, ub, a, b, D) -> abs(VineCopulas._pearson(quantile.(Normal(), ua), quantile.(Normal(), ub)))
    @test tree1_edges(fit(RVineCopula, U; family_set=fams, tree_criterion=normal_r)) == mst_edges(Wj)

    # Validation follows the criterion: [0, 1] for the bounded statistics,
    # [0, ∞) for :joe, any finite value for a function.
    for c in (:tau, :rho, :hoeffd, :mcor, :cxi)
        @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, tree_criterion=c, threshold=1.1)
        @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, tree_criterion=c, threshold=-0.1)
        @test fit(RVineCopula, U; family_set=fams, tree_criterion=c, threshold=1.0) isa RVineCopula
    end
    @test_throws ArgumentError fit(RVineCopula, U; family_set=fams, tree_criterion=:joe, threshold=-0.1)
    @test fit(RVineCopula, U; family_set=fams, tree_criterion=:joe, threshold=5.0) isa RVineCopula
    @test fit(RVineCopula, U; family_set=fams, tree_criterion=shifted, threshold=-4.0) isa RVineCopula
    @test fit(RVineCopula, U; family_set=fams, tree_criterion=shifted, threshold=100.0) isa RVineCopula
    for VT in (RVineCopula, CVineCopula, DVineCopula)
        @test_throws ArgumentError fit(VT, U; family_set=fams, tree_criterion=shifted, threshold=Inf)
        @test_throws ArgumentError fit(VT, U; family_set=fams, tree_criterion=shifted, threshold=NaN)
        @test_throws ArgumentError fit(VT, U; family_set=fams, tree_criterion=:joe, threshold=-1)
        @test_throws ArgumentError fit(VT, U; family_set=fams, tree_criterion=:mcor, threshold=2)
    end
end
