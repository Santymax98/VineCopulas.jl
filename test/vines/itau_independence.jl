# Kendall-tau inversion (`pair_method=:itau`) and the Kendall independence
# test.  The inversion is checked against its closed forms and against the
# vine selection boxes; the regression is that `:itau` runs on the default
# family set instead of dropping the BB families.

@testitem "Fit API – :itau closed forms" tags=[:Fit, :PairCopula, :Itau] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    rng = StableRNG(4201)
    U = rand(rng, ClaytonCopula(2, 2.0), 800)
    τ = VineCopulas._kendall_tau_b(view(U, 1, :), view(U, 2, :))
    @test 0 < τ < 1

    function itau(FT)
        fit(PairCopula, U; family_set=(FT,), pair_method=:itau, allow_rotations=false,
            include_independence=false, strict=true)
    end

    @test Distributions.params(itau(GaussianCopula)).Σ[1, 2] ≈ sinpi(τ / 2) atol=1e-12
    @test Distributions.params(itau(ClaytonCopula)).θ ≈ 2τ / (1 - τ) atol=1e-12
    @test Distributions.params(itau(GumbelCopula)).θ ≈ 1 / (1 - τ) atol=1e-12
    # Frank and Joe invert tau by a bracketed root: the fitted copula
    # reproduces the sample tau.
    @test Copulas.τ(itau(FrankCopula)) ≈ τ atol=1e-8
    @test Copulas.τ(itau(JoeCopula)) ≈ τ atol=1e-8
    @test VineCopulas._short_family_name(itau(JoeCopula)) == "Joe"

    # A negative sample tau lands on the lower edge of the positive selection
    # box for the base Clayton/Gumbel/Joe candidates instead of leaving it.
    Uneg = rand(StableRNG(4202), SurvivalCopula(ClaytonCopula(2, 2.0), (1,)), 800)
    τneg = VineCopulas._kendall_tau_b(view(Uneg, 1, :), view(Uneg, 2, :))
    @test τneg < 0
    for (FT, lo, hi) in ((ClaytonCopula, VineCopulas._VINE_CLAYTON_LO, VineCopulas._VINE_CLAYTON_HI),
                         (GumbelCopula, VineCopulas._VINE_GUMBEL_LO, VineCopulas._VINE_GUMBEL_HI),
                         (JoeCopula, VineCopulas._VINE_JOE_LO, VineCopulas._VINE_JOE_HI))
        C, meta = VineCopulas._fit_vine_itau(FT, Uneg, τneg)
        θ = Distributions.params(C).θ
        @test lo < θ < hi
        @test θ == nextfloat(Float64(lo))
        @test meta.converged
        @test isfinite(Distributions.loglikelihood(C, Uneg))
    end
    # Frank spans both signs and takes the negative parameter directly.
    Cf, _ = VineCopulas._fit_vine_itau(FrankCopula, Uneg, τneg)
    @test Distributions.params(Cf).θ < 0
    @test Copulas.τ(Cf) ≈ τneg atol=1e-8
    # A zero tau keeps the Gaussian and Frank candidates identifiable.
    Cg, _ = VineCopulas._fit_vine_itau(GaussianCopula, U, 0.0)
    @test Cg isa GaussianCopula
    Cf0, _ = VineCopulas._fit_vine_itau(FrankCopula, U, 0.0)
    @test Cf0 isa FrankCopula
end

@testitem "Fit API – :itau Student profiles nu inside the selection box" tags=[:Fit, :PairCopula, :Itau] setup=[M] begin
    using Test
    using Distributions
    using Copulas
    using VineCopulas
    using StableRNGs

    U = rand(StableRNG(4203), TCopula(4, [1.0 0.6; 0.6 1.0]), 5000)
    τ = VineCopulas._kendall_tau_b(view(U, 1, :), view(U, 2, :))
    C = fit(PairCopula, U; family_set=(TCopula,), pair_method=:itau, allow_rotations=false,
        include_independence=false, strict=true)
    p = Distributions.params(C)
    # Kendall's tau of an elliptical copula is a function of rho alone, so rho
    # is the closed-form inversion exactly; nu is the profile maximizer.
    @test p.Σ[1, 2] ≈ sinpi(τ / 2) atol=1e-12
    @test 3.0 < p.ν < 6.0
    # The profile maximizer beats every other nu at the same rho.
    ll(ν) = Distributions.loglikelihood(TCopula(ν, p.Σ), U)
    @test all(ll(p.ν) >= ll(ν) for ν in (2.5, 3.0, 5.0, 8.0, 20.0, 49.0))

    # A sample below vinecopulib's lower df bound is clamped to the box, as
    # the `:mle` selector already does (Copulas.jl's own `:itau` returns the
    # unbounded profile maximizer, here about 1.26).
    Uh = rand(StableRNG(4204), TCopula(1.25, [1.0 0.55; 0.55 1.0]), 600)
    Ch = fit(PairCopula, Uh; family_set=(TCopula,), pair_method=:itau, allow_rotations=false,
        include_independence=false, strict=true)
    ph = Distributions.params(Ch)
    @test VineCopulas._VINE_STUDENT_NU_LO < ph.ν < VineCopulas._VINE_STUDENT_NU_HI
    @test abs(ph.Σ[1, 2]) < 1.0
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

    Up = rand(StableRNG(4206), ClaytonCopula(2, 2.0), 800)
    for FT in VineCopulas.DEFAULT_PAIR_FAMILIES
        @test VineCopulas._resolve_pair_method(FT, :mle) == :mle
        @test VineCopulas._resolve_pair_method(FT, :default) == :mle
        sel = VineCopulas._fit_one_pair_family(FT, Up, (); pair_method=:itau, selection_criterion=:bic,
            pair_kwargs=NamedTuple())
        expected = VineCopulas._has_local_itau(FT) ? :itau : :mle
        @test VineCopulas._resolve_pair_method(FT, :itau) == expected
        @test sel.method == expected
        @test isfinite(sel.loglik)
    end
    # A method the family does not have is still an error under any name.
    @test_throws ArgumentError VineCopulas._resolve_pair_method(ClaytonCopula, :unknown)

    # A rotated candidate uses the reflected sample's tau without a second
    # rank pass: a single-axis reflection negates it.
    Ur = rand(StableRNG(4207), SurvivalCopula(ClaytonCopula(2, 3.0), (1,)), 1600)
    τr = VineCopulas._kendall_tau_b(view(Ur, 1, :), view(Ur, 2, :))
    sel = VineCopulas._select_pair(Ur; family_set=(ClaytonCopula,), pair_method=:itau, strict=true)
    @test sel.method == :itau
    @test sel.rotation in (90, 270)
    Uf = VineCopulas._flip_pair_data(Ur, (1,))
    τf = VineCopulas._kendall_tau_b(view(Uf, 1, :), view(Uf, 2, :))
    @test τf ≈ -τr atol=1e-12
    @test sel.theta.θ ≈ 2τf / (1 - τf) atol=1e-12
    mle = VineCopulas._select_pair(Ur; family_set=(ClaytonCopula,), pair_method=:mle, strict=true)
    @test abs(sel.theta.θ - mle.theta.θ) < 0.2

    # The C- and D-vine paths take the same keyword.
    @test fit(CVineCopula, U; pair_method=:itau, strict=true) isa CVineCopula
    @test fit(DVineCopula, U; pair_method=:itau, strict=true) isa DVineCopula
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

    for kw in ((; independence_test=:foo), (; independence_level=0.0), (; independence_level=1.0), (; independence_level=-0.1))
        @test_throws ArgumentError fit(PairCopula, Ui; family_set=fams, kw...)
        @test_throws ArgumentError fit(CVineCopula, U3; family_set=fams, kw...)
        @test_throws ArgumentError fit(DVineCopula, U3; family_set=fams, kw...)
        @test_throws ArgumentError fit(RVineCopula, U3; family_set=fams, kw...)
    end
end
