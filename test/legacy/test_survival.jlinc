using Test
using Distributions
using Copulas
using StableRNGs
using VineCopulas

@testset "SurvivalCopula conditional primitives" begin
    bases = [
        "Gaussian"          => GaussianCopula([1.0 0.5; 0.5 1.0]),
        "Clayton positive"  => ClaytonCopula(2, 2.0),
        "Clayton negative"  => ClaytonCopula(2, -0.5),
        "Frank positive"    => FrankCopula(2, 3.0),
        "Frank negative"    => FrankCopula(2, -3.0),
        "Gumbel"            => GumbelCopula(2, 1.5),
        "AMH positive"      => AMHCopula(2, 0.5),
        "AMH negative"      => AMHCopula(2, -0.5),
    ]

    flipsets = ((1,), (2,), (1, 2))
    grid = (0.20, 0.50, 0.80)

    for (label, C) in bases, flips in flipsets
        S = SurvivalCopula(C, flips)

        @testset "$label, flips = $flips" begin
            fu = 1 in flips
            fv = 2 in flips

            for u in grid, v in grid
                uu = fu ? 1 - u : u
                vv = fv ? 1 - v : v

                expected_h1 = hfunc1(C, uu, vv)
                expected_h2 = hfunc2(C, uu, vv)

                expected_h1 = fu ? 1 - expected_h1 : expected_h1
                expected_h2 = fv ? 1 - expected_h2 : expected_h2

                q1 = hfunc1(S, u, v)
                q2 = hfunc2(S, u, v)

                @test isfinite(q1)
                @test isfinite(q2)

                @test 0.0 < q1 < 1.0
                @test 0.0 < q2 < 1.0

                @test q1 ≈ expected_h1 atol = 1e-10 rtol = 1e-10
                @test q2 ≈ expected_h2 atol = 1e-10 rtol = 1e-10

                û = hinv1(S, q1, v)
                v̂ = hinv2(S, q2, u)

                @test isfinite(û)
                @test isfinite(v̂)
                @test 0.0 < û < 1.0
                @test 0.0 < v̂ < 1.0

                @test hfunc1(S, û, v) ≈ q1 atol = 1e-7 rtol = 1e-7
                @test hfunc2(S, u, v̂) ≈ q2 atol = 1e-7 rtol = 1e-7

                d = pdf(S, [u, v])

                if d > sqrt(eps(Float64))
                    @test û ≈ u atol = 1e-7 rtol = 1e-7
                    @test v̂ ≈ v atol = 1e-7 rtol = 1e-7
                else
                    @test d == 0.0
                end
            end
        end
    end
end

@testset "Negative Clayton support boundary" begin
    θ = -0.5
    C = ClaytonCopula(2, θ)

    v = 0.20
    u = 0.20

    ustar = (1 - v^(-θ))^(-1 / θ)

    q = hfunc1(C, u, v)
    û = hinv1(C, q, v)

    @test pdf(C, [u, v]) == 0.0
    @test û ≈ ustar atol = 1e-7 rtol = 1e-7
    @test hfunc1(C, û, v) ≈ q atol = 1e-7 rtol = 1e-7
end

@testset "SurvivalCopula matrix helpers" begin
    C = SurvivalCopula(ClaytonCopula(2, 2.0), (1,))

    U = [
        0.20 0.30
        0.50 0.60
        0.80 0.70
    ]

    h1 = hfunc1(C, U)
    h2 = hfunc2(C, U)

    @test length(h1) == size(U, 1)
    @test length(h2) == size(U, 1)

    for i in axes(U, 1)
        @test h1[i] ≈ hfunc1(C, U[i, 1], U[i, 2])
        @test h2[i] ≈ hfunc2(C, U[i, 1], U[i, 2])
    end
end

@testset "SurvivalCopula inside a D-vine" begin
    rng = StableRNG(123)

    C12 = SurvivalCopula(
        ClaytonCopula(2, 2.0),
        (1,)
    )

    C23 = SurvivalCopula(
        GumbelCopula(2, 1.5),
        (2,)
    )

    C13 = SurvivalCopula(
        FrankCopula(2, 3.0),
        (1, 2)
    )

    vine = DVineCopula(
        order = (1, 2, 3),
        paircopulas = (
            (C12, C23),
            (C13,)
        )
    )

    u = [0.25, 0.50, 0.75]

    ℓ = logpdf(vine, u)
    d = pdf(vine, u)

    @test isfinite(ℓ)
    @test isfinite(d)
    @test d > 0.0
    @test d ≈ exp(ℓ) atol = 1e-10 rtol = 1e-10

    U = rand(rng, vine, 500)

    @test size(U) == (3, 500)
    @test all(x -> 0.0 < x < 1.0, U)

    Z = rosenblatt(vine, U)
    U2 = inverse_rosenblatt(vine, Z)

    @test maximum(abs.(U .- U2)) < 1e-6
end