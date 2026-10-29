using Test
using Random
using Distributions
using Copulas
using VineCopulas

@testset "VineCopulas.jl core" begin
    Cg = GaussianCopula([1.0 0.5; 0.5 1.0])
    Cc = ClaytonCopula(2, 2.0)
    Cg2 = GaussianCopula([1.0 0.2; 0.2 1.0])

    @testset "h-functions" begin
        for C in (Cg, Cc)
            for u in (0.15, 0.5, 0.85), v in (0.2, 0.55, 0.9)
                q1 = hfunc1(C, u, v)
                q2 = hfunc2(C, u, v)
                @test 1e-12 < q1 < 1 - 1e-12
                @test 1e-12 < q2 < 1 - 1e-12
                @test hinv1(C, q1, v) ≈ u atol=1e-8 rtol=1e-8
                @test hinv2(C, q2, u) ≈ v atol=1e-8 rtol=1e-8
            end
        end
    end

    @testset "D-vine dimension 3" begin
        dv = DVineCopula([1,2,3], [[Cg, Cc], [Cg2]])
        u = [0.2, 0.5, 0.7]
        val = pdf(dv, u)
        @test isfinite(val)
        @test val > 0

        u1,u2,u3 = u
        manual = pdf(Cg, [u1,u2]) * pdf(Cc, [u2,u3]) *
                 pdf(Cg2, [hfunc1(Cg, u1, u2), hfunc2(Cc, u2, u3)])
        @test pdf(dv, u) ≈ manual rtol=1e-8

        rng = MersenneTwister(123)
        U = rand(rng, dv, 200)
        @test size(U) == (3,200)
        @test all(0 .< U .< 1)

        Z = rosenblatt(dv, U)
        U2 = inverse_rosenblatt(dv, Z)
        @test maximum(abs.(U .- U2)) < 1e-6
    end

    @testset "C-vine dimension 3" begin
        cv = CVineCopula([1,2,3], [[Cg, Cc], [Cg2]])
        u = [0.2, 0.5, 0.7]
        @test isfinite(logpdf(cv, u))
        rng = MersenneTwister(123)
        U = rand(rng, cv, 200)
        @test size(U) == (3,200)
        @test all(0 .< U .< 1)
        Z = rosenblatt(cv, U)
        U2 = inverse_rosenblatt(cv, Z)
        @test maximum(abs.(U .- U2)) < 1e-6
    end

    @testset "CDF QMC" begin
        dv = DVineCopula([1,2,3], [[Cg, Cc], [Cg2]])
        u = [0.2, 0.5, 0.7]
        F = cdf(dv, u; method=:qmc, N=512, randomized=false)
        @test 0 <= F <= 1
    end

    @testset "R-vine natural D-vine delegation" begin
        rv = RVineCopula([1,2,3], [[2,3], [2]], [[Cg, Cc], [Cg2]])
        dv = DVineCopula([1,2,3], [[Cg, Cc], [Cg2]])
        u = [0.2,0.5,0.7]
        @test pdf(rv, u) ≈ pdf(dv, u) rtol=1e-10
        rng = MersenneTwister(42)
        U = rand(rng, rv, 20)
        @test size(U) == (3,20)
    end
end

@testset "Frank D-vine Rosenblatt roundtrip" begin
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

    U = rand(rng, vine, 250)
    Z = rosenblatt(vine, U)
    U2 = inverse_rosenblatt(vine, Z)

    @test maximum(abs.(U .- U2)) < 1e-8
end