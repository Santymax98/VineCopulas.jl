# Vine fitting and model-selection tests.
# Small family sets keep CI cost bounded; the production default is broader.

@testitem "Fit API – PairCopula selection" tags=[:Fit, :PairCopula] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1201)
    C0 = ClaytonCopula(2, 2.5)
    U = rand(rng, C0, 1200)

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)

    C = fit(
        PairCopula,
        U;
        family_set=fams,
        selection_criterion=:bic,
        allow_rotations=false,
    )
    @test C isa Copulas.Copula{2}
    @test VineCopulas._short_family_name(C) == "Clayton"

    F = fit(
        CopulaModel,
        PairCopula,
        U;
        family_set=fams,
        selection_criterion=:bic,
        allow_rotations=false,
    )
    @test F.result isa Copulas.Copula{2}
    @test F.method == :select
    @test isfinite(F.ll)
    @test isfinite(Copulas.StatsBase.aic(F))
    @test isfinite(Copulas.StatsBase.bic(F))
    @test Copulas.StatsBase.vcov(F) === nothing
end

@testitem "Fit API – rotated pair selection" tags=[:Fit, :PairCopula, :Rotation] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1202)
    C0 = SurvivalCopula(ClaytonCopula(2, 3.0), (1,))
    U = rand(rng, C0, 1600)

    F = fit(
        CopulaModel,
        PairCopula,
        U;
        family_set=(ClaytonCopula,),
        selection_criterion=:bic,
        allow_rotations=true,
        preselect=true,
        include_independence=true,
    )
    @test F.result isa Copulas.SurvivalCopula
    @test get(F.method_details, :rotation, 0) in (90, 270)
    @test F.ll > 0
end

@testitem "Fit API – Clayton vine-selection domain is finite and positive" tags=[:Fit, :PairCopula, :Rotation, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1203)
    truth = SurvivalCopula(ClaytonCopula(2, 2.0), (1,))
    U = rand(rng, truth, 700)

    # `preselect=false` forces all four rotations to be fitted.  This is the
    # configuration used by the cross-package correctness gate and previously
    # exposed a negative-theta Clayton MLE with -Inf likelihood.
    F = fit(
        CopulaModel,
        PairCopula,
        U;
        family_set=(ClaytonCopula,),
        pair_method=:mle,
        selection_criterion=:aic,
        allow_rotations=true,
        preselect=false,
        include_independence=false,
        strict=true,
    )

    base = F.result isa SurvivalCopula ? F.result.C : F.result
    θ = Distributions.params(base).θ
    @test 1.0e-10 < θ < 28.0
    @test isfinite(F.ll)
    @test get(F.method_details, :rotation, -1) in (0, 90, 180, 270)

    # The broader Copulas.jl family remains available outside vine selection.
    @test ClaytonCopula(2, -0.25) isa Copulas.Copula{2}
end

@testitem "Fit API – Student vine-selection df matches vinecopulib domain" tags=[:Fit, :PairCopula, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1204)
    Sigma = [1.0 0.55; 0.55 1.0]
    # Copulas.jl supports the broader mathematical domain nu > 0.  Generate a
    # heavy-tailed sample below vinecopulib's lower fitting bound to ensure the
    # vine selector itself still remains in the aligned 2 < nu < 50 range.
    U = rand(rng, TCopula(1.25, Sigma), 600)

    F = fit(
        CopulaModel,
        PairCopula,
        U;
        family_set=(TCopula,),
        pair_method=:mle,
        selection_criterion=:aic,
        allow_rotations=false,
        preselect=false,
        include_independence=false,
        strict=true,
    )

    p = Distributions.params(F.result)
    @test abs(p.Σ[1, 2]) < 1.0
    @test 2.0 < p.ν < 50.0
    @test isfinite(F.ll)

    # Direct Copulas.jl construction keeps the broader nu > 0 domain.
    @test TCopula(1.25, Sigma) isa Copulas.Copula{2}
end

@testitem "Fit API – Gumbel/Joe vine-selection boundaries are safe" tags=[:Fit, :PairCopula, :Rotation, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1205)
    truth = GaussianCopula([1.0 0.35; 0.35 1.0])
    U = rand(rng, truth, 500)

    # Force every rotation to be fitted under strict mode.  The native
    # Archimedean constrained MLE can probe theta < 1 during trial steps for
    # Gumbel/Joe; vine selection uses a bounded transformed parameter instead.
    for (FT, hi) in ((GumbelCopula, 50.0), (JoeCopula, 30.0))
        F = fit(
            CopulaModel,
            PairCopula,
            U;
            family_set=(FT,),
            pair_method=:mle,
            selection_criterion=:aic,
            allow_rotations=true,
            preselect=false,
            include_independence=false,
            strict=true,
        )

        base = F.result isa SurvivalCopula ? F.result.C : F.result
        theta = Distributions.params(base).θ
        @test 1.0 < theta < hi
        @test isfinite(F.ll)
        @test get(F.method_details, :rotation, -1) in (0, 90, 180, 270)
    end
end

@testitem "Fit API – Gaussian vine selection maximizes copula likelihood" tags=[:Fit, :PairCopula, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas

    # Deterministic normal scores chosen so that the sample Pearson
    # correlation (used by the normal-score MvNormal fit) differs materially
    # from the direct Gaussian copula MLE.  This guards the finite-sample case
    # that can otherwise change pair-family selection.
    z1 = [
        -0.789121, -0.167787, 1.487925, 0.393974, 1.120231,
         0.777104, -0.436464, 0.741952, -0.116595, -0.122389,
         0.297167, -1.325930, 1.392166, -0.471090, 1.200269,
         0.336321, 1.732033, -0.459969, -0.111795, 0.537769,
    ]
    z2 = [
        -2.702032, 0.644028, 2.185593, 1.223794, 1.214885,
         0.142574, 0.963670, 1.345007, 0.234323, -0.156080,
        -0.313183, -1.993197, 1.822312, -2.507589, 0.129987,
         0.232541, 1.625898, 1.431677, 0.837426, -0.122637,
    ]

    N01 = Normal()
    U = Matrix{Float64}(undef, 2, length(z1))
    U[1, :] .= cdf.(N01, z1)
    U[2, :] .= cdf.(N01, z2)

    F = fit(
        CopulaModel,
        PairCopula,
        U;
        family_set=(GaussianCopula,),
        pair_method=:mle,
        selection_criterion=:aic,
        allow_rotations=false,
        preselect=false,
        include_independence=false,
        strict=true,
    )

    @test F.result isa GaussianCopula
    rho = Distributions.params(F.result).Σ[1, 2]
    @test rho ≈ 0.5561662333 atol=5.0e-5
    @test F.ll ≈ 5.140188517 atol=2.0e-6

    # Check local optimality directly in copula likelihood, not merely against
    # a particular external optimizer implementation.
    for delta in (-0.02, -0.005, 0.005, 0.02)
        Cδ = GaussianCopula(2, rho + delta)
        @test F.ll >= Distributions.loglikelihood(Cδ, U) - 1.0e-8
    end
end

@testitem "Fit API – weak Clayton/Gumbel MLE stays away from independence" tags=[:Fit, :PairCopula, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1206)
    cases = (
        (ClaytonCopula(2, 0.40), ClaytonCopula, 0.10),
        (GumbelCopula(2, 1.20), GumbelCopula, 1.05),
    )

    for (truth, FT, guard) in cases
        U = rand(rng, truth, 1200)
        F = fit(
            CopulaModel,
            PairCopula,
            U;
            family_set=(FT,),
            pair_method=:mle,
            selection_criterion=:aic,
            allow_rotations=false,
            preselect=false,
            include_independence=false,
            strict=true,
        )

        base = F.result isa SurvivalCopula ? F.result.C : F.result
        theta = Distributions.params(base).θ
        @test theta > guard
        @test isfinite(F.ll)
    end
end


@testitem "Fit API – selection bounds do not narrow direct Copulas.jl domains" tags=[:Fit, :PairCopula, :Regression] setup=[M] begin
    using Test
    using Copulas
    using VineCopulas

    direct_models = (
        ClaytonCopula(2, -0.35),
        TCopula(80.0, [1.0 0.4; 0.4 1.0]),
        GumbelCopula(2, 60.0),
        JoeCopula(2, 40.0),
        BB1Copula(2, 8.0, 8.0),
        BB6Copula(2, 7.0, 9.0),
        BB7Copula(2, 7.0, 26.0),
        BB8Copula(2, 9.0, 5.0e-5),
    )

    @test all(C -> C isa PairCopula, direct_models)
end

@testitem "Fit API – default BB selection uses finite vinecopulib boxes" tags=[:Fit, :PairCopula, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1207)
    cases = (
        (BB1Copula(2, 0.8, 1.6), BB1Copula, (0.0, 1.0), (7.0, 7.0)),
        (BB6Copula(2, 1.5, 1.7), BB6Copula, (1.0, 1.0), (6.0, 8.0)),
        (BB7Copula(2, 1.6, 1.2), BB7Copula, (1.0, 0.01), (6.0, 25.0)),
        (BB8Copula(2, 1.8, 0.7), BB8Copula, (1.0, 1.0e-4), (8.0, 1.0)),
    )

    for (truth, FT, lo, hi) in cases
        U = rand(rng, truth, 300)
        F = fit(
            CopulaModel,
            PairCopula,
            U;
            family_set=(FT,),
            pair_method=:mle,
            selection_criterion=:bic,
            allow_rotations=false,
            preselect=false,
            include_independence=false,
            strict=true,
        )
        base = F.result isa SurvivalCopula ? F.result.C : F.result
        vals = collect(values(Distributions.params(base)))
        @test length(vals) == 2
        @test all(isfinite, vals)
        @test lo[1] < vals[1] < hi[1]
        @test lo[2] < vals[2] < hi[2]
        @test isfinite(F.ll)
    end
end

@testitem "Fit API – C-vine quick and full" tags=[:Fit, :Vine, :CVine] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1301)
    C0 = M.cvine3()
    U = rand(rng, C0, 900)
    fams = (GaussianCopula, ClaytonCopula, FrankCopula)

    C = fit(
        CVineCopula,
        U;
        order=[1,2,3],
        family_set=fams,
        allow_rotations=false,
    )
    @test C isa CVineCopula
    @test order(C) == (1,2,3)
    @test truncation(C) == 2
    @test all(isfinite, logpdf(C, U[:, 1:20]))

    F = fit(
        CopulaModel,
        CVineCopula,
        U;
        order=[1,2,3],
        family_set=fams,
        allow_rotations=false,
    )
    @test F.result isa CVineCopula
    @test F.method == :sequential
    @test length(Copulas.StatsBase.coef(F)) == Copulas.StatsBase.dof(F)
    @test length(Copulas.StatsBase.coefnames(F)) == Copulas.StatsBase.dof(F)
    @test isfinite(Copulas.StatsBase.aic(F))
    @test isfinite(Copulas.StatsBase.bic(F))
    @test Copulas.StatsBase.vcov(F) === nothing

    Cauto = fit(
        CVineCopula,
        U;
        family_set=(GaussianCopula, ClaytonCopula),
        allow_rotations=false,
    )
    @test sort(collect(order(Cauto))) == [1,2,3]
end

@testitem "Fit API – D-vine exact order and full model" tags=[:Fit, :Vine, :DVine] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1302)
    C0 = M.dvine4()
    U = rand(rng, C0, 900)

    C = fit(
        DVineCopula,
        U;
        order_method=:exact,
        exact_order_max=8,
        family_set=(GaussianCopula, ClaytonCopula, FrankCopula),
        allow_rotations=false,
    )
    @test C isa DVineCopula
    @test sort(collect(order(C))) == collect(1:4)
    @test truncation(C) == 3
    @test all(isfinite, logpdf(C, U[:, 1:20]))

    F = fit(
        CopulaModel,
        DVineCopula,
        U;
        order=collect(order(C)),
        family_set=(GaussianCopula, ClaytonCopula),
        allow_rotations=false,
    )
    @test F.result isa DVineCopula
    @test F.method == :sequential
    @test get(F.method_details, :order_method, nothing) == :fixed
    @test Copulas.StatsBase.vcov(F) === nothing
end

@testitem "R-vine DAG – standard nonidentity order" tags=[:Fit, :Vine, :RVine, :Rosenblatt, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    # Standard D-vine structure expressed as a general R-vine under a
    # non-identity diagonal order. This deliberately does NOT use the package's
    # legacy `_looks_like_dvine` representation.
    ord = [3, 1, 4, 2]
    S = [
        [1, 4, 2],
        [4, 2],
        [2],
    ]

    E = [
        (
            GaussianCopula([1.0 0.45; 0.45 1.0]),
            ClaytonCopula(2, 1.8),
            FrankCopula(2, 2.2),
        ),
        (
            GumbelCopula(2, 1.35),
            GaussianCopula([1.0 -0.25; -0.25 1.0]),
        ),
        (
            FrankCopula(2, 1.5),
        ),
    ]

    R = RVineCopula(ord, S, E)
    D = DVineCopula(ord, E)
    @test !VineCopulas._looks_like_dvine(R)

    rng = StableRNG(1401)
    Z = rand(rng, 4, 256)

    # Same pair-copula construction represented through the mature D-vine
    # engine and through the standard R-vine DAG.
    #
    # IMPORTANT: the Rosenblatt transform is ordering-dependent.  The D-vine
    # engine conditions left-to-right along `ord`, whereas a standard R-vine
    # matrix is naturally simulated in reverse diagonal order.  Therefore
    # inverse_rosenblatt(D, Z) and inverse_rosenblatt(R, Z) are *not* expected
    # to agree pathwise for the same Z, even when the two objects encode the
    # same density.
    UD = inverse_rosenblatt(D, Z)
    UR = inverse_rosenblatt(R, Z)

    # Structural equivalence is tested at the density level on two independent
    # sets of points.  This is deterministic and stronger than comparing only
    # samples produced by one of the two Rosenblatt maps.
    Q = rand(rng, 4, 256)
    @test logpdf(R, Q) ≈ logpdf(D, Q) atol=2e-7 rtol=2e-7
    @test logpdf(R, UD) ≈ logpdf(D, UD) atol=2e-7 rtol=2e-7

    # Each triangular transport must be internally invertible.
    @test rosenblatt(D, UD) ≈ Z atol=2e-6 rtol=2e-6
    Zhat = rosenblatt(R, UR)
    @test Zhat ≈ Z atol=2e-6 rtol=2e-6

    @test size(UR) == (4, 256)
    @test all(x -> 0 < x < 1, UR)
    @test all(isfinite, logpdf(R, UR))
end

@testitem "Fit API – fixed standard R-vine" tags=[:Fit, :Vine, :RVine, :Structure] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    ord = [3, 1, 4, 2]
    S = (
        [1, 4, 2],
        [4, 2],
        [2],
    )
    st = RVineStructure(ord, S; trunc=3)

    # Build a valid source model in the same standard structure.
    E0 = [
        (
            GaussianCopula([1.0 0.4; 0.4 1.0]),
            ClaytonCopula(2, 1.5),
            FrankCopula(2, 2.0),
        ),
        (
            GaussianCopula([1.0 0.3; 0.3 1.0]),
            ClaytonCopula(2, 1.2),
        ),
        (
            FrankCopula(2, 1.2),
        ),
    ]
    R0 = RVineCopula(ord, S, E0)

    rng = StableRNG(1402)
    U = rand(rng, R0, 1000)

    R = fit(
        RVineCopula,
        U;
        structure=st,
        family_set=(GaussianCopula, ClaytonCopula, FrankCopula),
        allow_rotations=false,
    )
    @test R isa RVineCopula
    @test collect(order(R)) == ord
    @test struct_array(R) == S
    @test all(isfinite, logpdf(R, U[:, 1:50]))

    F = fit(
        CopulaModel,
        RVineCopula,
        U;
        structure=st,
        family_set=(GaussianCopula, ClaytonCopula),
        allow_rotations=false,
    )
    @test F.result isa RVineCopula
    @test get(F.method_details, :structure_method, nothing) == :fixed
    @test length(Copulas.StatsBase.coefnames(F)) == Copulas.StatsBase.dof(F)
    @test Copulas.StatsBase.vcov(F) === nothing
end

@testitem "Fit API – fixed branching general R-vine" tags=[:Fit, :Vine, :RVine, :Structure, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    source = M.rvine5_general()
    st = RVineStructure(collect(order(source)), struct_array(source); trunc=4)
    rng = StableRNG(14025)
    U = rand(rng, source, 350)

    # A single family isolates the fixed-structure sequential traversal from
    # family-selection noise.  All ten edges of a truly branching R-vine must
    # receive the correct conditional pseudo-observations.
    R = fit(
        RVineCopula,
        U;
        structure=st,
        family_set=(GaussianCopula,),
        selection_criterion=:aic,
        allow_rotations=false,
        preselect=false,
        include_independence=false,
        strict=true,
    )

    @test R isa RVineCopula
    @test order(R) == order(source)
    @test struct_array(R) == struct_array(source)
    @test truncation(R) == 4
    @test sum(length, edges(R)) == 10
    @test VineCopulas._compile_standard_rvine(R).p == 5
    @test all(isfinite, logpdf(R, U[:, 1:40]))

    Z = 0.02 .+ 0.96 .* rand(rng, 5, 48)
    X = inverse_rosenblatt(R, Z)
    @test rosenblatt(R, X) ≈ Z atol=5e-6 rtol=5e-6
end

@testitem "Fit API – automatic R-vine MST" tags=[:Fit, :Vine, :RVine, :Structure, :MST] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(1403)

    # Use a mature D-vine sampler as the data generator; the estimator itself
    # is free to discover a general R-vine.
    source = M.dvine4()
    U = rand(rng, source, 1200)

    fams = (GaussianCopula, ClaytonCopula, FrankCopula)
    R = fit(
        RVineCopula,
        U;
        family_set=fams,
        selection_criterion=:bic,
        tree_criterion=:tau,
        tree_algorithm=:mst,
        allow_rotations=false,
    )

    @test R isa RVineCopula
    @test sort(collect(order(R))) == collect(1:4)
    @test truncation(R) == 3
    @test length(edges(R)) == 3
    @test length(edges(R)[1]) == 3
    @test length(edges(R)[2]) == 2
    @test length(edges(R)[3]) == 1

    # The fitted structure must compile under the standard conditional-state
    # execution plan.
    plan = VineCopulas._compile_standard_rvine(R)
    @test plan.p == 4
    @test plan.q == 3

    Z = rand(rng, 4, 128)
    X = inverse_rosenblatt(R, Z)
    Z2 = rosenblatt(R, X)
    @test Z2 ≈ Z atol=5e-6 rtol=5e-6
    @test all(isfinite, logpdf(R, X))

    F = fit(
        CopulaModel,
        RVineCopula,
        U;
        trunc=2,
        family_set=(GaussianCopula, ClaytonCopula),
        selection_criterion=:bic,
        allow_rotations=false,
    )
    @test F.result isa RVineCopula
    @test truncation(F.result) == 2
    @test get(F.method_details, :structure_method, nothing) == :dissmann_mst
    @test get(F.method_details, :tree_criterion, nothing) == :tau
    @test isfinite(F.ll)
    @test isfinite(Copulas.StatsBase.aic(F))
    @test isfinite(Copulas.StatsBase.bic(F))
end


@testitem "Fit API – automatic R-vine structural campaign" tags=[:Fit, :Vine, :RVine, :Structure, :MST, :Regression] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    # Multiple independent samples force the MST selector through different
    # tree sequences.  A single cheap Gaussian family isolates structural
    # correctness from family-selection and optimizer combinatorics.
    for seed in (1411, 1412, 1413)
        rng = StableRNG(seed)
        U = 0.01 .+ 0.98 .* rand(rng, 6, 180)
        R = fit(
            RVineCopula,
            U;
            trunc=3,
            family_set=(GaussianCopula,),
            selection_criterion=:aic,
            tree_criterion=:tau,
            tree_algorithm=:mst,
            allow_rotations=false,
            preselect=false,
            include_independence=false,
            strict=true,
        )

        @test R isa RVineCopula
        @test truncation(R) == 3
        @test VineCopulas._validate_rvine_structure(order(R), struct_array(R), 6, 3) == :standard
        plan = VineCopulas._compile_standard_rvine(R)
        @test plan.p == 6
        @test plan.q == 3

        Z = 0.02 .+ 0.96 .* rand(rng, 6, 32)
        X = inverse_rosenblatt(R, Z)
        @test all(isfinite, logpdf(R, X))
        @test rosenblatt(R, X) ≈ Z atol=7e-6 rtol=7e-6
    end
end

@testitem "Fit API – legacy D-vine-like R-vine structure normalization" tags=[:Fit, :Vine, :RVine, :Compatibility] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    source = M.rvine3_dvine_like()
    U = rand(StableRNG(1404), source, 700)
    legacy = RVineStructure([1,2,3], ([2,3], [2]); trunc=2)

    F = fit(
        CopulaModel,
        RVineCopula,
        U;
        structure=legacy,
        family_set=(GaussianCopula, ClaytonCopula, FrankCopula),
        allow_rotations=false,
    )

    @test F.result isa RVineCopula
    @test get(F.method_details, :structure_method, nothing) == :fixed_legacy_dvine_normalized
    @test struct_array(F.result) == ([2,3], [3])
    @test VineCopulas._compile_standard_rvine(F.result).p == 3
end

@testitem "Fit internals – Kendall tau-b and exact D-vine path" tags=[:Fit, :Numerical, :Structure] setup=[M] begin
    using Test
    using Copulas
    using VineCopulas

    x = [0.1, 0.1, 0.4, 0.6, 0.6, 0.9, 0.95]
    y = [0.2, 0.3, 0.3, 0.7, 0.65, 0.8, 0.99]
    τ1 = VineCopulas._kendall_tau_b(x, y)
    τ2 = Copulas.StatsBase.corkendall(hcat(x, y))[1, 2]
    @test τ1 ≈ τ2 atol=1e-12 rtol=1e-12

    # Unique maximum Hamiltonian path: 1-2-3-4 (or its reversal).
    W = [
        0.0  9.0  1.0  0.5
        9.0  0.0  8.0  1.0
        1.0  8.0  0.0  7.0
        0.5  1.0  7.0  0.0
    ]
    path = VineCopulas._max_weight_hamiltonian_path(W)
    @test path == [1,2,3,4] || path == [4,3,2,1]

    # Gumbel-Barnett has negative base association; positive empirical tau
    # therefore requires a one-margin rotation.
    rpos = VineCopulas._rotation_candidates(GumbelBarnettCopula, 0.25, true, true)
    rneg = VineCopulas._rotation_candidates(GumbelBarnettCopula, -0.25, true, true)
    @test (1,) in rpos && (2,) in rpos
    @test () in rneg && (1,2) in rneg
end

@testitem "Fit validation – invalid controls" tags=[:Fit, :Validation] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas

    U = rand(3, 100)

    @test_throws ArgumentError fit(
        DVineCopula, U;
        trunc=0,
        family_set=(GaussianCopula,),
    )

    @test_throws ArgumentError fit(
        RVineCopula, U;
        tree_criterion=:unknown,
        family_set=(GaussianCopula,),
    )

    @test_throws ArgumentError fit(
        PairCopula, rand(2, 100);
        selection_criterion=:unknown,
        family_set=(GaussianCopula,),
    )

    @test_throws ArgumentError fit(
        CVineCopula, U;
        threshold=-0.1,
        family_set=(GaussianCopula,),
    )

    @test_throws ArgumentError fit(
        DVineCopula, U;
        threshold=1.1,
        family_set=(GaussianCopula,),
    )

    @test_throws ArgumentError fit(
        DVineCopula, U;
        exact_order_max=1,
        family_set=(GaussianCopula,),
    )
end
