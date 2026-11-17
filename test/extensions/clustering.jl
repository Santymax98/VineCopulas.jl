# `dependence_groups`: the groups for `fit(RVineCopula, U; groups=g)` by
# hierarchical clustering of the tree-1 distances `1 - w`. The clustering step
# is `VineCopulasClusteringExt`; the checks, the distances and the rule for `k`
# are in the package. The fixtures come from the `Groups` snippet in
# `test/operations/tree_selection_groups.jl`.

@testitem "Clustering - the largest-gap rule for k" tags=[:Fit, :Vine, :RVine, :Structure, :Clustering] begin
    using Test
    using VineCopulas
    VC = VineCopulas
    # p = 5: the gap after merge i leaves p - i groups.
    @test VC._gap_k([0.125, 0.25, 0.75, 0.875]) == 3
    @test VC._gap_k([0.125, 0.75, 0.8125, 0.875]) == 4
    @test VC._gap_k([0.125, 0.25, 0.375, 0.875]) == 2
    # The heights are read in increasing order.
    @test VC._gap_k([0.875, 0.125, 0.75, 0.25]) == 3
    # A tie goes to the first largest gap, the larger k.
    @test VC._gap_k([0.25, 0.5, 0.75]) == 3
    # No gap, or no structure: one group.
    @test VC._gap_k([0.5, 0.5, 0.5]) == 1
    @test VC._gap_k([0.3]) == 1
    @test VC._gap_k(Float64[]) == 1
end

@testitem "Clustering - dependence_groups recovers the blocks and feeds groups=" tags=[:Fit, :Vine, :RVine, :Structure, :Clustering] setup=[Groups] begin
    using Clustering
    @test Base.get_extension(VineCopulas, :VineCopulasClusteringExt) !== nothing
    rng = StableRNG(4401)
    U = block_data(rng, 600; within=0.7, cross=0.1)
    g = dependence_groups(U)
    @test g isa Vector{Int}
    @test length(g) == 6
    @test length(unique(g)) == 2
    @test g[1] == g[2] == g[3]
    @test g[4] == g[5] == g[6]
    @test g[1] != g[4]
    # Only the equality of the ids matters, so the fit with `g` is the fit with
    # the true blocks, bit for bit.
    @test deq(fit(RVineCopula, U; family_set=fams, groups=g), fit(RVineCopula, U; family_set=fams, groups=[1, 1, 1, 2, 2, 2]))
end

@testitem "Clustering - dependence_groups is hclust and cutree on 1 - w" tags=[:Fit, :Vine, :RVine, :Structure, :Clustering] setup=[Groups] begin
    using Clustering
    rng = StableRNG(4402)
    n = 400
    U = block_data(rng, n; within=0.6, cross=0.2)
    function distances(W)
        D = 1 .- W
        for i in axes(D, 1)
            D[i, i] = 0.0
        end
        return D
    end
    # Every criterion on [0, 1], every linkage, every k, and the gap rule.
    for c in (:tau, :rho, :hoeffd, :mcor, :cxi)
        D = distances(weight_matrix(U, c))
        for linkage in (:single, :average, :complete, :ward, :ward_presquared)
            h = hclust(D; linkage=linkage)
            for k in 1:6
                @test dependence_groups(U; k=k, linkage=linkage, tree_criterion=c) == cutree(h; k=k)
            end
            @test dependence_groups(U; linkage=linkage, tree_criterion=c) == cutree(h; k=VineCopulas._gap_k(h.heights))
        end
    end
    # The default linkage is :average.
    @test dependence_groups(U) == dependence_groups(U; linkage=:average)
    @test dependence_groups(U; k=3) == cutree(hclust(distances(weight_matrix(U)); linkage=:average); k=3)
    # A function on [0, 1] gives the distances as is.
    f = (ua, ub, a, b, D) -> abs(VineCopulas._kendall_tau_b(ua, ub))
    @test dependence_groups(U; k=3, tree_criterion=f) == dependence_groups(U; k=3)
    # Unit weights are the unweighted path. Other weights reach the criterion
    # through the same weighted statistic as the fit.
    @test dependence_groups(U; k=3, weights=ones(n)) == dependence_groups(U; k=3)
    w = rand(rng, n)
    wn = VineCopulas._fit_weights(w, n)
    Ww = zeros(6, 6)
    for j in 2:6, i in 1:(j - 1)
        Ww[i, j] = Ww[j, i] = VineCopulas._tree_dependence(U[i, :], U[j, :], i, j, Int[], :rho, wn)
    end
    @test dependence_groups(U; k=3, tree_criterion=:rho, weights=w) == cutree(hclust(distances(Ww); linkage=:average); k=3)
end

@testitem "Clustering - dependence_groups refuses bad input" tags=[:Fit, :Vine, :RVine, :Structure, :Clustering] setup=[Groups] begin
    using Clustering
    rng = StableRNG(4403)
    U = block_data(rng, 200)
    @test_throws ArgumentError dependence_groups(U; linkage=:centroid)
    @test_throws ArgumentError dependence_groups(U; k=0)
    @test_throws ArgumentError dependence_groups(U; k=7)
    @test_throws ArgumentError dependence_groups(U; tree_criterion=:joe)
    @test_throws ArgumentError dependence_groups(U; tree_criterion=:nonesuch)
    @test_throws ArgumentError dependence_groups(U; tree_criterion=(ua, ub, a, b, D) -> 2.0)
    @test_throws ArgumentError dependence_groups(U; tree_criterion=(ua, ub, a, b, D) -> -0.5)
    @test_throws ArgumentError dependence_groups(U; tree_criterion=:hoeffd, weights=ones(200))
    @test_throws DimensionMismatch dependence_groups(U; weights=ones(3))
    V = copy(U)
    V[1, 1] = NaN
    @test_throws ArgumentError dependence_groups(V)
    # One and two variables.
    @test dependence_groups(U[1:1, :]) == [1]
    @test dependence_groups(U[1:2, :]) == [1, 1]
    @test dependence_groups(U[1:2, :]; k=2) == [1, 2]
end

@testitem "Clustering - the fallback says to load Clustering.jl" tags=[:Fit, :Vine, :RVine, :Structure, :Clustering] begin
    using Test
    using VineCopulas
    # The extension method takes a `Matrix{Float64}`, so this call reaches the
    # fallback whether or not Clustering.jl is loaded.
    err = try
        VineCopulas._hclust_groups(nothing, nothing, :average)
    catch e
        e
    end
    @test err isa ArgumentError
    @test occursin("using Clustering", err.msg)
end
