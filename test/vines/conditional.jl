@testitem "Conditional sampling – predicate" tags=[:Sampling, :Conditional, :Vine, :RVine, :DVine, :CVine] setup=[M] begin
    using Test, Random, Distributions, Copulas, VineCopulas
    # A standard R-vine heads a sampling order with the tail of `order`.
    rv = M.rvine5_general()               # order (1, 3, 2, 4, 5)
    @test admits_conditioning(rv, [5])
    @test admits_conditioning(rv, [4, 5])
    @test admits_conditioning(rv, (5, 4))
    @test admits_conditioning(rv, [2, 4, 5])
    @test admits_conditioning(rv, [3, 2, 4, 5])
    @test !admits_conditioning(rv, [1])
    @test !admits_conditioning(rv, [2, 5])
    @test !admits_conditioning(rv, Int[])
    @test !admits_conditioning(rv, [1, 2, 3, 4, 5])
    @test admits_conditioning(M.rvine5_general(trunc=2), [4, 5])
    @test admits_conditioning(M.rvine5_general(trunc=1), [2, 4, 5])

    # A D-vine path can be read from either end.
    dv = DVineCopula([2, 1, 3, 4], M.vine_edges(4))
    @test admits_conditioning(dv, [2])
    @test admits_conditioning(dv, [1, 2])
    @test admits_conditioning(dv, [4])
    @test admits_conditioning(dv, [3, 4])
    @test admits_conditioning(dv, [4, 3, 1])
    @test !admits_conditioning(dv, [1])
    @test !admits_conditioning(dv, [2, 4])

    # A legacy D-vine-like R-vine samples through the D-vine engine.
    rd = M.rvine4_dvine_like()            # order (1, 2, 3, 4)
    @test admits_conditioning(rd, [1])
    @test admits_conditioning(rd, [4, 3])

    # A C-vine generates its roots in order.
    cv = CVineCopula([3, 1, 2, 4], M.vine_edges(4))
    @test admits_conditioning(cv, [3])
    @test admits_conditioning(cv, [1, 3])
    @test !admits_conditioning(cv, [4])
    @test !admits_conditioning(cv, [1])
end

@testitem "Conditional sampling – exactness on three-variable vines" tags=[:Sampling, :Conditional, :Vine, :RVine, :DVine, :CVine] setup=[M] begin
    using Test, Random, Distributions, Copulas, VineCopulas
    # Order (1, 2, 3) with tree-1 edges 1-3 and 2-3: a star, so neither the
    # D-vine nor the legacy-D-vine engine handles it.
    rv3 = RVineCopula([1, 2, 3], [[3, 3], [2]],
                      [[M.gaussian_pair(0.6), M.clayton_pair(2.0)], [M.frank_pair(3.0)]])
    M.check_conditional_sampling(rv3, [3], (0.3,); seed=701)

    # The fixtures' pair copulas are exchangeable, so the reversed path is
    # the same vine with `order` and each tree's edge list reversed.
    reverse_path(dv) = DVineCopula(reverse(collect(order(dv))),
                                   [reverse(collect(edges(dv)[k])) for k in 1:truncation(dv)];
                                   trunc=truncation(dv))

    dv3 = M.dvine3()                      # path (1, 2, 3)
    M.check_conditional_sampling(dv3, [1], (0.3,); seed=702)
    M.check_conditional_sampling(dv3, [3], (0.7,); inverting=reverse_path(dv3), seed=703)

    cv3 = CVineCopula([2, 1, 3], [[M.gaussian_pair(0.5), M.clayton_pair(2.0)], [M.frank_pair(3.0)]])
    M.check_conditional_sampling(cv3, [2], (0.3,); seed=704)
end

@testitem "Conditional sampling – blocks on truncated vines" tags=[:Sampling, :Conditional, :Vine, :RVine, :DVine, :CVine, :Truncation] setup=[M] begin
    using Test, Random, Distributions, Copulas, VineCopulas
    # Three fixed coordinates form a joint conditioning block; the plan handles
    # every truncation level with the same code path.
    for trunc in (4, 2, 1)
        M.check_conditional_sampling(M.rvine5_general(trunc=trunc), [2, 4, 5], (0.35, 0.6, 0.8); seed=710 + trunc)
    end

    dv4 = DVineCopula([2, 1, 3, 4], M.vine_edges(4, 2); trunc=2)
    rdv4 = DVineCopula([4, 3, 1, 2], [reverse(collect(edges(dv4)[k])) for k in 1:2]; trunc=2)
    M.check_conditional_sampling(dv4, [4, 3], (0.2, 0.7); inverting=rdv4, seed=721)
    M.check_conditional_sampling(dv4, [1, 2], (0.2, 0.7); seed=722)

    cv4 = CVineCopula([3, 1, 2, 4], M.vine_edges(4, 2); trunc=2)
    M.check_conditional_sampling(cv4, [1, 3], (0.25, 0.65); seed=723)
end

@testitem "Conditional sampling – input forms and refusals" tags=[:Sampling, :Conditional, :Vine, :RVine, :Validation] setup=[M] begin
    using Test, Random, Distributions, Copulas, VineCopulas
    rv = M.rvine5_general()
    rng = M.stable_rng(730)
    n = 8

    # Per-column values, broadcast scalars as a tuple or a vector, and a pair.
    Ujs = rand(rng, 2, n)
    U = rand(M.stable_rng(1), rv, n; fixed=([4, 5], Ujs))
    @test U[[4, 5], :] == Ujs
    @test rand(M.stable_rng(1), rv, n; fixed=([4, 5] => Ujs)) == U
    Ut = rand(M.stable_rng(1), rv, n; fixed=([4, 5], (0.3, 0.8)))
    Uv = rand(M.stable_rng(1), rv, n; fixed=([4, 5], [0.3, 0.8]))
    @test Ut == Uv
    @test all(Ut[4, :] .== 0.3) && all(Ut[5, :] .== 0.8)

    # The label order inside `js` only relabels the rows of `Ujs`.
    Us = rand(M.stable_rng(1), rv, n; fixed=([5, 4], (0.8, 0.3)))
    @test Us == Ut

    # Every sampling entry point accepts the keyword.
    @test rand(rv; fixed=([5], (0.5,)))[5] == 0.5
    @test all(rand(rv, 3; fixed=([5], (0.5,)))[5, :] .== 0.5)
    @test all(rand(rv, Int8(3); fixed=([5], (0.5,)))[5, :] .== 0.5)
    @test all(rand(rng, rv, Int8(3); fixed=([5], (0.5,)))[5, :] .== 0.5)
    A = Matrix{Float64}(undef, 5, n)
    rand!(rng, A, rv; fixed=([5], (0.5,)))
    @test all(A[5, :] .== 0.5)
    rand!(A, rv; fixed=([5], (0.25,)))
    @test all(A[5, :] .== 0.25)
    @test all(simulate_qmc(rv, 16; fixed=([5], (0.5,)))[5, :] .== 0.5)
    Z = rand(rng, 5, n)
    @test inverse_rosenblatt(rv, Z[:, 1]; fixed=([5], (0.5,)))[5] == 0.5
    @test inverse_rosenblatt!(similar(Z), rv, Z; fixed=([5], (0.5,)))[5, :] == fill(0.5, n)

    # The fixed rows of Z are ignored, so an unconditional Z passes unchanged.
    Z2 = copy(Z)
    Z2[5, :] .= 0.123
    @test inverse_rosenblatt(rv, Z; fixed=([5], (0.5,))) == inverse_rosenblatt(rv, Z2; fixed=([5], (0.5,)))

    # Refusals name the fix and never return an approximate draw.
    err = try
        rand(rng, rv, n; fixed=([1], (0.5,)))
        nothing
    catch e
        e
    end
    @test err isa ArgumentError
    @test occursin("sampling_tail = [1]", sprint(showerror, err))
    @test occursin("ends with [5]", sprint(showerror, err))

    dv = DVineCopula([2, 1, 3, 4], M.vine_edges(4))
    @test_throws ArgumentError rand(rng, dv, n; fixed=([1], (0.5,)))
    cv = CVineCopula([3, 1, 2, 4], M.vine_edges(4))
    @test_throws ArgumentError rand(rng, cv, n; fixed=([4], (0.5,)))

    # Malformed `fixed`.
    @test_throws ArgumentError rand(rng, rv, n; fixed=[5])
    @test_throws ArgumentError rand(rng, rv, n; fixed=(Int[], zeros(0, n)))
    @test_throws ArgumentError rand(rng, rv, n; fixed=([1, 2, 3, 4, 5], (0.1, 0.2, 0.3, 0.4, 0.5)))
    @test_throws ArgumentError rand(rng, rv, n; fixed=([5, 5], (0.1, 0.2)))
    @test_throws ArgumentError rand(rng, rv, n; fixed=([6], (0.1,)))
    @test_throws DimensionMismatch rand(rng, rv, n; fixed=([4, 5], rand(rng, 2, n + 1)))
    @test_throws DimensionMismatch rand(rng, rv, n; fixed=([4, 5], (0.5,)))
    @test_throws ArgumentError rand(rng, rv, n; fixed=([5], (NaN,)))
end

@testitem "Conditional sampling – sampling_tail at fit time" tags=[:Sampling, :Conditional, :Fit, :Vine, :RVine, :Structure] setup=[M] begin
    using Test, Random, Distributions, Copulas, VineCopulas
    truth = M.rvine5_general()
    U = rand(M.stable_rng(740), truth, 3000)
    families = [GaussianCopula, ClaytonCopula, FrankCopula, GumbelCopula]

    for trunc in (4, 2)
        plain = fit(RVineCopula, U; trunc=trunc, family_set=families)
        ll = sum(logpdf(plain, U))
        @test !admits_conditioning(plain, [1])

        # The tail only changes how the selected trees are peeled into an
        # order, never the trees themselves, so the model is unchanged.
        for tail in ([1], [3], [2], [2, 5])
            vc = fit(RVineCopula, U; trunc=trunc, sampling_tail=tail, family_set=families)
            @test admits_conditioning(vc, tail)
            @test truncation(vc) == trunc
            @test sum(logpdf(vc, U)) ≈ ll rtol=1e-12
            X = rand(M.stable_rng(741), vc, 4; fixed=(tail, fill(0.5, length(tail))))
            @test all(X[tail, :] .== 0.5)
        end

        # A tail the trees cannot place last is not honoured, and the draw
        # then refuses instead of approximating.
        vc = fit(RVineCopula, U; trunc=trunc, sampling_tail=[1, 3], family_set=families)
        @test !admits_conditioning(vc, [1, 3])
        @test sum(logpdf(vc, U)) ≈ ll rtol=1e-12
        @test_throws ArgumentError rand(M.stable_rng(742), vc, 4; fixed=([1, 3], (0.5, 0.5)))
    end

    # A fixed structure already fixes the order.
    @test_throws ArgumentError fit(RVineCopula, U; structure=structure(truth), sampling_tail=[5])
    @test_throws ArgumentError fit(RVineCopula, U; sampling_tail=[9])
    @test_throws ArgumentError fit(RVineCopula, U; sampling_tail=[5, 5])

    # A D-vine reaches the predicate through its `order` keyword.
    dv = fit(DVineCopula, U; order=[2, 3, 1, 4, 5], family_set=families)
    @test admits_conditioning(dv, [2])
    @test admits_conditioning(dv, [5, 4])
    @test !admits_conditioning(dv, [1])
end
