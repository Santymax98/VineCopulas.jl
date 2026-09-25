# mBICV: the public read and the `trunc=:mbicv` truncation-level selection.

@testitem "Fit API – mbicv formula" tags=[:Fit, :Vine, :Truncation, :MBICV] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    U = rand(StableRNG(4401), M.dvine3(), 300)
    p = 3
    n = size(U, 2)

    # Hand-built three-variable vine: q = (2, 1), every pair non-independence.
    vine = M.dvine3()
    ll = VineCopulas.loglikelihood(vine, U)
    ν = npars(vine)
    for psi0 in (0.5, 0.9, 0.99)
        prior = 2 * log(psi0) + (p - 1 - 2) * log1p(-psi0) +
                1 * log(psi0^2) + (p - 2 - 1) * log1p(-psi0^2)
        @test mbicv(vine, U; psi0=psi0) ≈ -2ll + ν * log(n) - 2prior atol=1e-12 * abs(ll)
        # With every pair non-independence the criterion is BIC plus the constant
        # -2 Σₜ qₜ log ψ₀ᵗ, which vanishes as ψ₀ → 1.
        @test mbicv(vine, U; psi0=psi0) - bic(vine, U) ≈ -2 * (2 * log(psi0) + 1 * 2 * log(psi0)) atol=1e-10
    end
    @test mbicv(vine, U) == mbicv(vine, U; psi0=0.9)

    # Truncated at 1: tree 2 is independence and contributes (p - 2) log(1 - ψ₂).
    v1 = truncate(vine, 1)
    prior1 = 2 * log(0.9) + 0 + (p - 2) * log1p(-0.9^2)
    @test mbicv(v1, U) ≈ -2 * VineCopulas.loglikelihood(v1, U) + npars(v1) * log(n) - 2prior1 atol=1e-10

    # An explicit independence pair counts as independence, not as a fitted pair.
    vind = DVineCopula([1, 2, 3], [[M.gaussian_pair(0.5), IndependentCopula(2)], [M.frank_pair(3.0)]])
    priorind = 1 * log(0.9) + (p - 1 - 1) * log1p(-0.9) + 1 * log(0.9^2) + 0
    @test mbicv(vind, U) ≈ -2 * VineCopulas.loglikelihood(vind, U) + npars(vind) * log(n) - 2priorind atol=1e-10

    # Observations may come as n × p as well.
    @test mbicv(vine, permutedims(U)) == mbicv(vine, U)

    @test_throws ArgumentError mbicv(vine, U; psi0=0.0)
    @test_throws ArgumentError mbicv(vine, U; psi0=1.0)
    @test_throws ArgumentError mbicv(vine, U; psi0=-0.2)
end

@testitem "Fit API – trunc=:mbicv selects the greedy mBICV minimiser" tags=[:Fit, :Vine, :Truncation, :MBICV] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
    U = rand(StableRNG(4402), M.rvine5_general(trunc=2), 800)

    for VT in (RVineCopula, CVineCopula, DVineCopula)
        sel = fit(VT, U; trunc=:mbicv, family_set=fams)
        q = truncation(sel)
        @test 1 <= q <= 4

        # The returned vine is the one a fixed `trunc=q` returns.
        fixed = fit(VT, U; trunc=q, family_set=fams)
        @test order(sel) == order(fixed)
        @test edges(sel) == edges(fixed)
        VT === RVineCopula && @test struct_array(sel) == struct_array(fixed)

        # Greedy stopping rule: the score improves up to q and does not at q + 1.
        scores = [mbicv(fit(VT, U; trunc=t, family_set=fams), U) for t in 1:min(q + 1, 4)]
        @test all(scores[t] < scores[t - 1] for t in 2:q)
        q < 4 && @test scores[q + 1] >= scores[q]
        @test mbicv(sel, U) ≈ scores[q]

        # `psi0` moves the selection towards sparser models as it shrinks.
        sparse = fit(VT, U; trunc=:mbicv, psi0=0.05, family_set=fams)
        @test truncation(sparse) <= q
    end
end

@testitem "Fit API – trunc=:mbicv recovers the truncation level" tags=[:Fit, :Vine, :Truncation, :MBICV, :Slow] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    # A general five-variable R-vine (the rvine5_general structure) whose first
    # tree dominates the induced dependence between non-neighbours, so the
    # Dissmann search recovers the structure and the truncation level is the
    # criterion's to find.
    ord = [1, 3, 2, 4, 5]
    S = [[2, 2, 4, 5], [3, 4, 5], [4, 5], [5]]
    E = [
        (M.gaussian_pair(0.92), ClaytonCopula(2, 6.0), FrankCopula(2, 14.0), GumbelCopula(2, 4.0)),
        (FrankCopula(2, 2.0), M.gaussian_pair(-0.3), ClaytonCopula(2, 0.5)),
        (GumbelCopula(2, 1.6), M.gaussian_pair(0.35)),
        (ClaytonCopula(2, 1.2),),
    ]
    fams = (GaussianCopula, ClaytonCopula, GumbelCopula, FrankCopula)

    # Depth 2: measured 96 of 100 seeds at n = 2000 (the misses select 3 or 4).
    depth2 = RVineCopula(ord, S[1:2], E[1:2]; trunc=2)
    hits = count(1:40) do seed
        U = rand(StableRNG(seed), depth2, 2000)
        truncation(fit(RVineCopula, U; trunc=:mbicv, family_set=fams)) == 2
    end
    @test hits >= 36

    # Full depth with dependence at every level: measured 93 of 100 at n = 1000.
    full = RVineCopula(ord, S, E; trunc=4)
    hits = count(1:20) do seed
        U = rand(StableRNG(100 + seed), full, 1000)
        truncation(fit(RVineCopula, U; trunc=:mbicv, family_set=fams)) == 4
    end
    @test hits >= 18
end

@testitem "Fit API – trunc=:mbicv on a fixed structure" tags=[:Fit, :Vine, :Truncation, :MBICV] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    fams = (GaussianCopula, ClaytonCopula, FrankCopula, GumbelCopula)
    source = M.rvine5_general(trunc=2)
    U = rand(StableRNG(4403), source, 1500)
    st = structure(M.rvine5_general(trunc=4))

    sel = fit(RVineCopula, U; structure=st, trunc=:mbicv, family_set=fams)
    q = truncation(sel)
    @test 1 <= q <= 4
    @test order(sel) == order(source)
    @test struct_array(sel) == struct_array(st)[1:q]
    fixed = fit(RVineCopula, U; structure=truncate(st, q), family_set=fams)
    @test edges(sel) == edges(fixed)

    # The ceiling is the structure's depth, or `max_trunc` below it.
    @test truncation(fit(RVineCopula, U; structure=st, trunc=:mbicv, max_trunc=1, family_set=fams)) == 1
    @test_throws ArgumentError fit(RVineCopula, U; structure=st, trunc=:mbicv, max_trunc=5, family_set=fams)
    # An integer `trunc` must still match the structure.
    @test_throws ArgumentError fit(RVineCopula, U; structure=st, trunc=2, family_set=fams)

    # Legacy D-vine-like structures take the same path.
    legacy = RVineStructure([1, 2, 3, 4], ([2, 3, 4], [3, 4], [4]); trunc=3)
    Ul = rand(StableRNG(4404), M.dvine4_truncated(), 1000)
    sell = fit(RVineCopula, Ul; structure=legacy, trunc=:mbicv, family_set=fams)
    @test 1 <= truncation(sell) <= 3
end

@testitem "Fit API – trunc=:mbicv keywords, ceiling, ties and trace" tags=[:Fit, :Vine, :Truncation, :MBICV] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    fams = (GaussianCopula, ClaytonCopula)
    U = rand(StableRNG(4405), M.rvine5_general(trunc=2), 600)

    for VT in (RVineCopula, CVineCopula, DVineCopula)
        # `max_trunc` caps the search; at 1 the result is the depth-1 fit.
        v1 = fit(VT, U; trunc=:mbicv, max_trunc=1, family_set=fams)
        @test truncation(v1) == 1
        @test edges(v1) == edges(fit(VT, U; trunc=1, family_set=fams))
        v2 = fit(VT, U; trunc=:mbicv, max_trunc=2, family_set=fams)
        @test truncation(v2) <= 2

        # `psi0` is read only under selection, and must lie in (0, 1).
        @test_throws ArgumentError fit(VT, U; trunc=:mbicv, psi0=0.0, family_set=fams)
        @test_throws ArgumentError fit(VT, U; trunc=:mbicv, psi0=1.0, family_set=fams)
        @test_throws ArgumentError fit(VT, U; trunc=:mbicv, psi0=1.5, family_set=fams)
        @test truncation(fit(VT, U; trunc=1, psi0=7.0, family_set=fams)) == 1
        # Integer truncation is unchanged and refuses `max_trunc`.
        @test_throws ArgumentError fit(VT, U; trunc=2, max_trunc=3, family_set=fams)
        @test_throws ArgumentError fit(VT, U; trunc=:vuong, family_set=fams)
        @test_throws ArgumentError fit(VT, U; trunc=:mbicv, max_trunc=0, family_set=fams)
        @test_throws ArgumentError fit(VT, U; trunc=:mbicv, max_trunc=5, family_set=fams)

        # A tree of independence pairs ties the score exactly, and a tie stops
        # at the previous level: forcing independence everywhere selects depth 1.
        tie = fit(VT, U; trunc=:mbicv, threshold=1.0, family_set=fams)
        @test truncation(tie) == 1
        @test all(C isa IndependentCopula for C in edges(tie)[1])
    end

    # `trace=true` reports the score of each level tried and the selected level.
    out = mktemp() do path, io
        redirect_stdout(io) do
            fit(DVineCopula, U; trunc=:mbicv, threshold=1.0, family_set=fams, trace=true)
        end
        flush(io)
        read(path, String)
    end
    @test occursin("truncation level 1: mbicv=", out)
    @test occursin("truncation level 2: mbicv=", out)
    @test occursin("truncation level 1 selected", out)
end

@testitem "Fit API – trunc=:mbicv through VineModel" tags=[:Fit, :Vine, :Truncation, :MBICV, :VineModel] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs
    using StatsBase

    fams = (GaussianCopula, ClaytonCopula)
    U = rand(StableRNG(4406), M.rvine5_general(trunc=2), 600)

    for VT in (RVineCopula, CVineCopula, DVineCopula)
        # The model wraps the vine the quick fit returns, and the recipe keeps
        # the selection keywords.
        model = fit(VineModel, VT, U; trunc=:mbicv, psi0=0.8, family_set=fams)
        sel = fit(VT, U; trunc=:mbicv, psi0=0.8, family_set=fams)
        C = fitted_distribution(model)
        @test C isa VT
        @test truncation(model) == truncation(sel)
        @test edges(C) == edges(sel)
        @test model.recipe.kwargs.trunc === :mbicv
        @test model.recipe.kwargs.psi0 == 0.8

        # `mbicv(M)` is the score of the fitted vine on the fitted data, at the
        # `psi0` the fit was called with, so it is the score the level was
        # selected on; an explicit `psi0` overrides it.
        @test mbicv(model) == mbicv(C, U; psi0=0.8)
        @test mbicv(model; psi0=0.9) == mbicv(C, U; psi0=0.9)
        @test mbicv(model) <= mbicv(truncate(C, 1), U; psi0=0.8) || truncation(C) == 1
        @test_throws ArgumentError mbicv(model; psi0=1.0)
        plain = fit(VineModel, VT, U; family_set=fams)
        @test mbicv(plain) == mbicv(fitted_distribution(plain), U)

        # The refit walks the selected structure at the selected level, so the
        # bootstrap resamples a model of the same depth and coefficient length.
        replay = VineCopulas._refit(model, U)
        @test truncation(replay) == truncation(model)
        @test dof(replay) == dof(model)
        I = infer(model; method=:bootstrap, nresamples=2, rng=StableRNG(1))
        @test size(vcov(I)) == (dof(model), dof(model))
    end
end
