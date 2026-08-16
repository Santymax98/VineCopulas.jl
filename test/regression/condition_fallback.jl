@testitem "Regression – generic pair fallback via Copulas.condition" tags=[:Regression, :PairCopula, :ConditionFallback] begin
    using Test
    using Copulas
    using Distributions
    using VineCopulas

    θ = 0.6
    C = FGMCopula(2, θ)

    # For the bivariate FGM copula
    #
    # C(u,v) = uv [1 + θ(1-u)(1-v)]
    #
    # the two conditional CDFs are available analytically.
    h1_exact(u, v) = u * (1 + θ * (1 - u) * (1 - 2v))
    h2_exact(u, v) = v * (1 + θ * (1 - v) * (1 - 2u))

    for u in (0.07, 0.23, 0.61, 0.91),
        v in (0.11, 0.37, 0.73, 0.94)

        @test hfunc1(C, u, v) ≈ h1_exact(u, v) atol=2e-12 rtol=2e-12
        @test hfunc2(C, u, v) ≈ h2_exact(u, v) atol=2e-12 rtol=2e-12
    end

    # Check inverse conditionals as genuine round trips.
    for q in (0.03, 0.19, 0.50, 0.81, 0.97),
        base in (0.08, 0.29, 0.67, 0.93)

        u = hinv1(C, q, base)
        v = hinv2(C, q, base)

        @test hfunc1(C, u, base) ≈ q atol=2e-12 rtol=2e-12
        @test hfunc2(C, base, v) ≈ q atol=2e-12 rtol=2e-12
    end
end
