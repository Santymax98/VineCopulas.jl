using Test
using Random
using Distributions
using Copulas
using VineCopulas

function _mixed_edges(p::Int, trunc::Int)
    pool = VineCopulas.PairCopula[
        Copulas.GaussianCopula([1.0 0.35; 0.35 1.0]),
        Copulas.ClaytonCopula(2, 1.5),
        Copulas.FrankCopula(2, 2.5),
        Copulas.GumbelCopula(2, 1.3),
    ]
    return [[pool[mod1(i+k, length(pool))] for i in 1:(p-k)] for k in 1:trunc]
end

@testset "Truncated vine Rosenblatt transforms" begin
    rng = MersenneTwister(2026)

    for p in (5, 10), trunc in (1, 2)
        order = reverse(collect(1:p))
        edges = _mixed_edges(p, trunc)

        for V in (DVineCopula(order, edges; trunc=trunc), CVineCopula(order, edges; trunc=trunc))
            U = rand(rng, V, p == 5 ? 100 : 30)
            Z = rosenblatt(V, U)
            U2 = inverse_rosenblatt(V, Z)

            @test size(U) == size(Z)
            @test size(Z) == size(U2)
            @test all(0 .< U .< 1)
            @test maximum(abs.(U-U2)) < 1e-6
            @test all(isfinite, logpdf(V, U))
        end
    end
end

@testset "R-vine matrix exchange roundtrip" begin
    p, trunc = 5, 2
    ord = [5, 2, 4, 1, 3]
    S = [[ord[i+1] for i in 1:(p-k)] for k in 1:trunc]
    E = _mixed_edges(p, trunc)

    rv = RVineCopula(ord, S, E; trunc=trunc)
    M = rvine_matrix(rv)
    rv2 = RVineCopula(M, E)

    @test order(rv2) == Tuple(ord)
    @test struct_array(rv2) == Tuple(Vector{Int}.(S))
    @test truncation(rv2) == trunc
    @test rvine_matrix(rv2) == M

    rng = MersenneTwister(19)
    U = rand(rng, rv2, 40)
    @test maximum(abs.(U - inverse_rosenblatt(rv2, rosenblatt(rv2, U)))) < 1e-6
end

@testset "Constructor and CDF validation" begin
    E = _mixed_edges(4, 1)
    @test_throws ArgumentError DVineCopula([1, 2, 3, 4], E; trunc=0)
    @test_throws ArgumentError CVineCopula([1, 2, 3, 4], E; trunc=4)
    @test_throws ArgumentError RVineCopula([1, 2, 3, 4], [[2, 3, 4]], E; trunc=0)

    V = DVineCopula([1, 2, 3, 4], E; trunc=1)
    @test_throws ArgumentError cdf(V, fill(0.5, 4, 2); method=:invalid, N=32)
end
