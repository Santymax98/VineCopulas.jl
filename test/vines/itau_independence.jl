# `pair_method=:itau` and the Kendall independence test.  The estimator is
# Copulas.jl's: each candidate that advertises `:itau` is fitted by
# `fit(FT, U; method=:itau)` exactly, and the vine owns only the policy around
# it (rotations, scoring, the BB fallback to `:mle`, the independence gate).
# The regression is that `:itau` runs on the default family set instead of
# dropping the BB families.

@testitem "Fit API – :itau delegates to Copulas.jl" tags=[:Fit, :PairCopula, :Itau] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    U = rand(StableRNG(4201), ClaytonCopula(2, 2.0), 800)
    function itau(FT, X)
        select_paircopula(X; family_set=(FT,), pair_method=:itau, allow_rotations=false,
            include_independence=false, strict=true)
    end
    # The selected copula is the Copulas.jl estimate, parameter for parameter.
    for FT in (GaussianCopula, TCopula, ClaytonCopula, GumbelCopula, FrankCopula, JoeCopula)
        C = itau(FT, U)
        R = fit(FT, U; method=:itau)
        @test typeof(C) == typeof(R)
        @test Distributions.params(C) == Distributions.params(R)
        sel = VineCopulas._fit_one_pair_family(FT, U, (); pair_method=:itau, selection_criterion=:bic, pair_kwargs=NamedTuple())
        @test sel.method == :itau
        @test sel.loglik == Distributions.loglikelihood(R, U)
    end
    τc = Copulas.τ(itau(ClaytonCopula, U))
    @test VineCopulas._vine_params(itau(ClaytonCopula, U)).θ ≈ 2τc / (1 - τc) atol=1e-10

    # A rotated candidate is the Copulas.jl estimate on the reflected sample.
    Ur = rand(StableRNG(4202), SurvivalCopula(ClaytonCopula(2, 3.0), (1,)), 1600)
    sel = VineCopulas._select_pair(Ur; family_set=(ClaytonCopula,), pair_method=:itau, strict=true)
    @test sel.method == :itau
    @test sel.rotation in (90, 270)
    flips = sel.rotation == 90 ? (1,) : (2,)
    R = fit(ClaytonCopula, VineCopulas._flip_pair_data(Ur, flips); method=:itau)
    @test Distributions.params(Copulas.basecopula(sel.copula)) == Distributions.params(R)
    mle = VineCopulas._select_pair(Ur; family_set=(ClaytonCopula,), pair_method=:mle, strict=true)
    @test abs(sel.theta.θ - mle.theta.θ) < 0.2

    # Without `preselect` the unrotated Clayton candidate on a negative tau is
    # the negative-theta Copulas.jl estimate.  Its support excludes part of
    # the sample, so it scores `Inf` and loses; it is not an error under
    # `strict=true`, because nothing failed.
    Cneg = fit(ClaytonCopula, Ur; method=:itau)
    @test VineCopulas._vine_params(Cneg).θ < 0
    selneg = VineCopulas._fit_one_pair_family(ClaytonCopula, Ur, (); pair_method=:itau, selection_criterion=:bic, pair_kwargs=NamedTuple())
    @test Distributions.params(selneg.copula) == Distributions.params(Cneg)
    @test selneg.loglik == -Inf
    @test selneg.score == Inf
    @test VineCopulas.hfunc1(Cneg, 0.3, 0.7) ≈ VineCopulas.hfunc1(DVineCopula([1, 2], [(Cneg,)]).edges[1][1], 0.3, 0.7)
    @test Distributions.logpdf(Cneg, [0.3, 0.7]) ≈ Distributions.logpdf(DVineCopula([1, 2], [(Cneg,)]), [0.3, 0.7]) atol=1e-12
    all4 = VineCopulas._select_pair(Ur; family_set=(ClaytonCopula,), pair_method=:itau, preselect=false, strict=true)
    @test all4.rotation in (90, 270)
    @test all4.theta == sel.theta
    @test select_paircopula(Ur; family_set=(ClaytonCopula,), pair_method=:itau, allow_rotations=false, strict=true) isa IndependentCopula
    @test_throws ErrorException select_paircopula(Ur; family_set=(ClaytonCopula,), pair_method=:itau, allow_rotations=false,
        include_independence=false, strict=true)
end

@testitem "Fit API – :itau runs on the default family set" tags=[:Fit, :PairCopula, :Vine, :RVine, :Itau, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    # Regression: BB1/BB6/BB7/BB8 advertise no `:itau`, so the default-set
    # fit used to drop them silently (and throw under `strict=true`).
    U = rand(StableRNG(4205), 3, 500)
    vc = fit(RVineCopula, U; pair_method=:itau, strict=true)
    @test vc isa RVineCopula
    @test isfinite(Distributions.loglikelihood(vc, U))
    @test fit(CVineCopula, U; pair_method=:itau, strict=true) isa CVineCopula
    @test fit(DVineCopula, U; pair_method=:itau, strict=true) isa DVineCopula
    M = fit(VineModel, RVineCopula, U; pair_method=:itau, strict=true)
    @test M.recipe.kwargs.pair_method == :itau
    @test isfinite(Distributions.loglikelihood(M))

    Up = rand(StableRNG(4206), ClaytonCopula(2, 2.0), 800)
    kw = (; selection_criterion=:bic, pair_kwargs=NamedTuple())
    for FT in VineCopulas.ALL_PARAMETRIC_PAIR_FAMILIES
        @test VineCopulas._resolve_pair_method(FT, :mle) == :mle
        @test VineCopulas._resolve_pair_method(FT, :default) == :mle
        bb = VineCopulas._itau_falls_back_to_mle(FT)
        # The fallback list is exactly the set of shipped families whose
        # public Copulas.jl `:itau` fit is unavailable.
        advertised = try
            fit(FT, Up; method=:itau)
            true
        catch err
            err isa ArgumentError && occursin("not available", sprint(showerror, err)) || rethrow()
            false
        end
        @test bb == !advertised
        @test VineCopulas._resolve_pair_method(FT, :itau) == (bb ? :mle : :itau)
    end
    for FT in VineCopulas.DEFAULT_PAIR_FAMILIES
        sel = VineCopulas._fit_one_pair_family(FT, Up, (); pair_method=:itau, kw...)
        @test isfinite(sel.loglik)
        if VineCopulas._itau_falls_back_to_mle(FT)
            # The fallback is the `:mle` candidate itself.
            ref = VineCopulas._fit_one_pair_family(FT, Up, (); pair_method=:mle, kw...)
            @test sel.method == :mle
            @test sel.theta == ref.theta
            @test sel.loglik == ref.loglik
        else
            @test sel.method == :itau
        end
    end
    # A method the family does not have is Copulas.jl's error, raised under `strict=true`.
    @test_throws ArgumentError select_paircopula(Up; family_set=(ClaytonCopula,), pair_method=:unknown, strict=true)
    @test_throws ArgumentError VineCopulas._fit_one_pair_family(BB1Copula, Up, (); pair_method=:irho, kw...)
end

@testitem "Fit API – a Student candidate at the Gaussian endpoint" tags=[:Fit, :PairCopula, :Itau, :Student] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    Σ = [1.0 0.5; 0.5 1.0]
    U = rand(StableRNG(1), GaussianCopula(Σ), 2000)
    # Copulas.jl profiles nu on (0, ∞] and returns the Gaussian endpoint on
    # this sample (a nearby seed returns a finite nu near 1e7 instead).
    R = fit(TCopula, U; method=:itau)
    @test isinf(VineCopulas._vine_params(R).ν)

    # The candidate is an estimate on the boundary, not a failure: it scores
    # with the Gaussian likelihood and two parameters.
    sel = VineCopulas._fit_one_pair_family(TCopula, U, (); pair_method=:itau, selection_criterion=:bic, pair_kwargs=NamedTuple())
    @test isinf(sel.theta.ν)
    @test sel.npars == 2
    G = GaussianCopula(VineCopulas._vine_params(R).Σ)
    @test sel.loglik ≈ Distributions.loglikelihood(G, U) atol=1e-8
    # BIC prefers the one-parameter Gaussian with the same likelihood.
    @test select_paircopula(U; family_set=(GaussianCopula, TCopula), pair_method=:itau, strict=true) isa GaussianCopula
    Cinf = select_paircopula(U; family_set=(TCopula,), pair_method=:itau, include_independence=false, strict=true)
    @test Cinf isa TCopula && isinf(VineCopulas._vine_params(Cinf).ν)

    # The vine evaluates `TCopula(Inf, Σ)` as the Gaussian copula: kernels
    # and the vine density agree with the Gaussian pair (this also covers a
    # vine built by hand from the limit).
    Ginf = TCopula(Inf, Σ)
    Gg = GaussianCopula(Σ)
    for (u, v) in ((0.3, 0.7), (0.05, 0.95), (0.5, 0.5))
        @test VineCopulas.hfunc1(Ginf, u, v) ≈ VineCopulas.hfunc1(Gg, u, v) atol=1e-12
        @test VineCopulas.hfunc2(Ginf, u, v) ≈ VineCopulas.hfunc2(Gg, u, v) atol=1e-12
        @test VineCopulas.hinv1(Ginf, u, v) ≈ VineCopulas.hinv1(Gg, u, v) atol=1e-10
        @test VineCopulas.hinv2(Ginf, u, v) ≈ VineCopulas.hinv2(Gg, u, v) atol=1e-10
    end
    vinf = DVineCopula([1, 2], [(Ginf,)])
    vg = DVineCopula([1, 2], [(Gg,)])
    @test all(isfinite, Distributions.logpdf(vinf, U))
    @test Distributions.logpdf(vinf, U) ≈ Distributions.logpdf(vg, U) atol=1e-10
    @test rosenblatt(vinf, U) ≈ rosenblatt(vg, U) atol=1e-10
end

@testitem "Fit API – Kendall independence test" tags=[:Fit, :PairCopula, :Vine, :Independence] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    n = 500
    # The statistic and its reference distribution.
    @test VineCopulas._kendall_independence_pvalue(0.0, n) == 1.0
    @test VineCopulas._kendall_independence_pvalue(0.3, n) < 1e-10
    z = 3 * 0.05 * sqrt(n * (n - 1)) / sqrt(2 * (2n + 5))
    @test VineCopulas._kendall_independence_pvalue(0.05, n) ≈ 2 * ccdf(Normal(), z) atol=1e-14
    @test VineCopulas._kendall_independence_pvalue(-0.05, n) == VineCopulas._kendall_independence_pvalue(0.05, n)
    @test_throws ArgumentError VineCopulas._kendall_independence_pvalue(0.1, 1)

    Ui = rand(StableRNG(4208), 2, n)
    Ug = rand(StableRNG(4209), GaussianCopula([1.0 0.3; 0.3 1.0]), n)
    fams = (GaussianCopula, ClaytonCopula, FrankCopula)

    sel = VineCopulas._select_pair(Ui; family_set=fams, independence_test=:kendall, strict=true)
    @test sel.family == "Independence"
    @test sel.copula isa IndependentCopula
    @test select_paircopula(Ui; family_set=fams, independence_test=:kendall, strict=true) isa IndependentCopula
    sel = VineCopulas._select_pair(Ug; family_set=fams, independence_test=:kendall, strict=true)
    @test sel.family != "Independence"
    # Without the test the criterion alone decides; with it the gate overrides
    # `include_independence=false`, as `threshold` does.
    @test VineCopulas._select_pair(Ui; family_set=fams, include_independence=false, strict=true).family != "Independence"
    @test VineCopulas._select_pair(Ui; family_set=fams, include_independence=false, independence_test=:kendall, strict=true).family == "Independence"
    # A level above the p-value accepts nothing, so the pair is fitted.
    p_i = VineCopulas._kendall_independence_pvalue(VineCopulas._kendall_tau_b(view(Ui, 1, :), view(Ui, 2, :)), n)
    @test 0.05 < p_i < 1
    @test VineCopulas._select_pair(Ui; family_set=fams, include_independence=false, independence_test=:kendall,
        independence_level=prevfloat(1.0), strict=true).family != "Independence"

    # Vine entry points: independent data give an independence-only vine.
    U3 = rand(StableRNG(4210), 3, n)
    for VT in (CVineCopula, DVineCopula, RVineCopula)
        vc = fit(VT, U3; family_set=fams, independence_test=:kendall, independence_level=0.05, strict=true)
        @test all(C isa IndependentCopula for lvl in edges(vc) for C in lvl)
    end
    # A fixed R-vine structure takes the gate through the same path.
    vc0 = fit(RVineCopula, U3; family_set=fams, strict=true)
    vcs = fit(RVineCopula, U3; structure=structure(vc0), family_set=fams, independence_test=:kendall, strict=true)
    @test all(C isa IndependentCopula for lvl in edges(vcs) for C in lvl)
    # The model door stores the gate in its recipe.
    Mi = fit(VineModel, RVineCopula, U3; family_set=fams, independence_test=:kendall, strict=true)
    @test Mi.recipe.kwargs.independence_test == :kendall
    @test all(C isa IndependentCopula for lvl in edges(Copulas.fitted_distribution(Mi)) for C in lvl)

    for kw in ((; independence_test=:foo), (; independence_level=0.0), (; independence_level=1.0), (; independence_level=-0.1))
        @test_throws ArgumentError select_paircopula(Ui; family_set=fams, kw...)
        @test_throws ArgumentError fit(CVineCopula, U3; family_set=fams, kw...)
        @test_throws ArgumentError fit(DVineCopula, U3; family_set=fams, kw...)
        @test_throws ArgumentError fit(RVineCopula, U3; family_set=fams, kw...)
    end
end
