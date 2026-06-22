using Test
using Random
using Distributions
using Copulas
using VineCopulas

@testset "Mixed-family D-vine roundtrip" begin
    rng = MersenneTwister(123)

    C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
    C23 = ClaytonCopula(2, 2.0)
    C13 = FrankCopula(2, 3.0)

    vine = DVineCopula(
        order = (1, 2, 3),
        paircopulas = (
            (C12, C23),
            (C13,)
        )
    )

    u = [0.2, 0.5, 0.7]

    @test isfinite(logpdf(vine, u))
    @test pdf(vine, u) > 0
    @test 0.0 <= cdf(vine, u; N = 1_000) <= 1.0

    U = rand(rng, vine, 500)
    Z = rosenblatt(vine, U)
    U2 = inverse_rosenblatt(vine, Z)

    @test maximum(abs.(U .- U2)) < 1e-8
end

@testset "Mixed-family C-vine roundtrip" begin
    rng = MersenneTwister(123)

    C12 = GaussianCopula([1.0 0.4; 0.4 1.0])
    C13 = GumbelCopula(2, 1.5)
    C23 = AMHCopula(2, 0.5)

    vine = CVineCopula(
        order = (1, 2, 3),
        paircopulas = (
            (C12, C13),
            (C23,)
        )
    )

    u = [0.25, 0.55, 0.75]

    @test isfinite(logpdf(vine, u))
    @test pdf(vine, u) > 0
    @test 0.0 <= cdf(vine, u; N = 1_000) <= 1.0

    U = rand(rng, vine, 500)
    Z = rosenblatt(vine, U)
    U2 = inverse_rosenblatt(vine, Z)

    @test maximum(abs.(U .- U2)) < 1e-8
end
@testset "BB1 inside C- and D-vines" begin
    rng = MersenneTwister(321)
    B = BB1Copula(2, 1.2, 1.5)
    vines = (
        DVineCopula(order=(1, 2, 3), paircopulas=((B, B), (B,))),
        CVineCopula(order=(1, 2, 3), paircopulas=((B, B), (B,))),
    )
    for vine in vines
        U = rand(rng, vine, 250)
        @test maximum(abs.(U .- inverse_rosenblatt(vine, rosenblatt(vine, U)))) < 1e-7
    end
end
