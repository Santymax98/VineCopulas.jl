@testitem "VineModel – sequential statistical interface" tags=[:Fit, :Vine, :VineModel] setup=[M] begin
    using StatsBase
    using Random
    using Distributions

    U = rand(MersenneTwister(42), 3, 30)
    kwargs = (; family_set=(GaussianCopula,), allow_rotations=false,
              include_independence=false)

    for VT in (CVineCopula, DVineCopula, RVineCopula)
        C = fit(VT, U; kwargs...)
        model = fit(VineModel, VT, U; kwargs...)
        @test model isa VineModel
        @test fitted_distribution(model) isa VT
        @test fitting_method(model) == :sequential
        @test nobs(model) == size(U, 2)
        @test coef(model) == VineCopulas._vine_parameter_metadata(C)[2]
        @test length(coef(model)) == dof(model) == length(coefnames(model))
        @test Distributions.loglikelihood(model) == VineCopulas.loglikelihood(fitted_distribution(model), U)
        @test isfinite(StatsBase.aic(model))
        @test isfinite(StatsBase.bic(model))
        @test StatsBase.aic(model) == 2StatsBase.dof(model) - 2Distributions.loglikelihood(model)
        @test StatsBase.bic(model) == StatsBase.dof(model) * log(StatsBase.nobs(model)) -
                                     2Distributions.loglikelihood(model)
        @test order(model) == order(fitted_distribution(model))
        @test typeof(structure(model)) == typeof(structure(fitted_distribution(model)))
        @test truncation(model) == truncation(fitted_distribution(model))
        @test length(edge_table(model)) == length(VineCopulas.vine_edges(model))
    end
end

@testitem "Vine parameter metadata is contract-independent" tags=[:Vine, :VineModel, :Stats] setup=[M] begin
    using Copulas
    using Distributions
    using StatsBase
    using Random

    pairs = (
        ("Gaussian", GaussianCopula(2, 0.2), 1),
        ("Student", TCopula(5.0, [1.0 0.2; 0.2 1.0]), 2),
        ("FGM", FGMCopula(2, 0.2), 1),
        ("BB1", BB1Copula(2, 1.5, 2.0), 2),
        ("MOTail", ExtremeValueCopula(2, Copulas.MOTail(0.3, 0.4, 0.5)), 3),
        ("BC2Tail", ExtremeValueCopula(2, Copulas.BC2Tail(0.3, 0.4)), 2),
        ("AsymLogTail", ExtremeValueCopula(2, Copulas.AsymLogTail(1.5, 0.3, 0.7)), 3),
        ("AsymGalambosTail", ExtremeValueCopula(2, Copulas.AsymGalambosTail(1.5, 0.3, 0.7)), 3),
        ("AsymMixedTail", ExtremeValueCopula(2, Copulas.AsymMixedTail(0.3, 0.1)), 2),
    )

    for (_, C, expected) in pairs
        @test npars(C) == expected
        @test length(VineCopulas._flatten_fit_params(VineCopulas._vine_params(C))[2]) == expected
    end

    U = rand(MersenneTwister(2026), 2, 24)
    model = fit(VineModel, CVineCopula, U;
                family_set=(FGMCopula,), include_independence=false,
                allow_rotations=false)
    @test coefnames(model) == ["T1:E1:FGM:θ"]
    @test coef(model) == [only(VineCopulas._vine_params(fitted_distribution(model)).θ)]
    @test dof(model) == npars(fitted_distribution(model)) == 1
    rows = edge_table(model)
    @test length(rows) == 1
    @test rows[1].parameters == VineCopulas._vine_params(fitted_distribution(model))
end

@testitem "Vine topology classification is mathematical" tags=[:Vine, :Structure, :VineModel] setup=[M] begin
    c2 = CVineCopula([1, 2], [[GaussianCopula(2, 0.2)]])
    c3 = CVineCopula([1, 2, 3], [[GaussianCopula(2, 0.2), GaussianCopula(2, 0.3)], [GaussianCopula(2, 0.1)]])
    c4 = CVineCopula([2, 4, 1, 3], [[GaussianCopula(2, 0.2), GaussianCopula(2, 0.3), GaussianCopula(2, 0.4)], [GaussianCopula(2, 0.1), GaussianCopula(2, 0.2)], [GaussianCopula(2, 0.1)]])
    d4 = DVineCopula([2, 4, 1, 3], [[GaussianCopula(2, 0.2), GaussianCopula(2, 0.3), GaussianCopula(2, 0.4)], [GaussianCopula(2, 0.1), GaussianCopula(2, 0.2)], [GaussianCopula(2, 0.1)]])
    @test vine_kind(c2) == :cvine_dvine
    @test vine_kind(c3) == :cvine_dvine
    @test vine_kind(c4) == :cvine
    @test vine_kind(d4) == :dvine
    @test vine_kind(M.rvine5_general()) == :general_rvine
    @test vine_kind(truncate(M.rvine5_general(), 2)) == :general_rvine
end

@testitem "VineModel – fixed-family refit contract" tags=[:Fit, :Vine, :VineModel, :Inference] setup=[M] begin
    using Copulas
    using Distributions
    using Random

    U = rand(MersenneTwister(81), 3, 36)
    # FGM reaches _fit_one_pair_family's public fallback but is intentionally
    # absent from ALL_PARAMETRIC_PAIR_FAMILIES.
    model = fit(VineModel, CVineCopula, U;
                family_set=[FGMCopula], include_independence=false,
                allow_rotations=false)
    @test model.recipe.kwargs.family_set == (FGMCopula,)
    @test fitted_distribution(VineCopulas._refit(model, U)) isa CVineCopula

    rotated = fit(VineModel, DVineCopula, U;
                  family_set=(ClaytonCopula,), include_independence=false,
                  allow_rotations=true, preselect=false)
    replay = VineCopulas._refit(rotated, U)
    @test fitted_distribution(replay) isa DVineCopula
    @test [VineCopulas._rotation_of(e.copula) for e in VineCopulas.vine_edges(fitted_distribution(replay))] ==
          [VineCopulas._rotation_of(e.copula) for e in VineCopulas.vine_edges(fitted_distribution(rotated))]

    legacy = RVineStructure([1, 2, 3], ([2, 3], [2]); trunc=2)
    legacy_model = fit(VineModel, RVineCopula, U; structure=legacy,
                       family_set=(GaussianCopula,), include_independence=false,
                       allow_rotations=false)
    legacy_replay = VineCopulas._refit(legacy_model, U)
    @test fitted_distribution(legacy_replay) isa RVineCopula
    @test structure(fitted_distribution(legacy_replay)).order == structure(fitted_distribution(legacy_model)).order
    @test struct_array(fitted_distribution(legacy_replay)) == struct_array(fitted_distribution(legacy_model))
end

@testitem "VineInference – fixed-selection bootstrap" tags=[:Fit, :Vine, :VineInference] setup=[M] begin
    using StatsBase
    using Random

    U = rand(MersenneTwister(7), 3, 24)
    model = fit(VineModel, RVineCopula, U;
                family_set=(GaussianCopula,), allow_rotations=false,
                include_independence=false)
    I1 = infer(model; method=:bootstrap, nresamples=3, rng=MersenneTwister(9))
    I2 = infer(model; method=:bootstrap, nresamples=3, rng=MersenneTwister(9))
    V = vcov(I1)
    @test I1 isa VineInference
    @test I1.method == :bootstrap
    @test V == vcov(I2)
    @test size(V) == (dof(model), dof(model))
    @test all(isfinite, V)
    @test V == V'
    @test length(stderror(I1)) == dof(model)
    lo, hi = confint(I1)
    @test length(lo) == dof(model) == length(hi)
    @test_throws ArgumentError infer(model; method=:hessian)
    @test_throws ArgumentError infer(model; method=:bootstrap, nresamples=1)
    @test_throws ArgumentError infer(model; method=:invalid)
end
