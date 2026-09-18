@testitem "simulate_qmc takes a generator for the Owen scramble" tags=[:Numerical, :QMC, :Simulation] setup=[M] begin
    using Random, StableRNGs, VineCopulas
    using VineCopulas: simulate_qmc
    vc = M.cvine3()
    N = 16

    # The generator drives the scramble: same state, same points; different states, different points.
    A = simulate_qmc(StableRNG(1), vc, N)
    @test size(A) == (3, N)
    @test all(x -> 0 ≤ x ≤ 1, A)
    @test A == simulate_qmc(StableRNG(1), vc, N)
    @test A != simulate_qmc(StableRNG(2), vc, N)

    # The generator-free method keeps its fixed internal seed and is unchanged.
    Q = simulate_qmc(vc, N)
    @test Q == simulate_qmc(vc, N)
    @test Q == simulate_qmc(Random.MersenneTwister(VineCopulas._CDF_QMC_SEED[]), vc, N)
    @test Q[:, 1] ≈ [0.37991794920526445, 0.06079248820928869, 0.18573668630133114] rtol=1e-12
    @test Q[:, end] ≈ [0.45560199255123734, 0.5599779132457914, 0.7396865168179203] rtol=1e-12

    # Unscrambled Sobol points ignore the generator.
    R = simulate_qmc(vc, N; randomized=false)
    @test R == simulate_qmc(StableRNG(1), vc, N; randomized=false)
    @test R == simulate_qmc(StableRNG(2), vc, N; randomized=false)
end

@testitem "cdf forwards its rng to the QMC scramble" tags=[:Numerical, :QMC, :CDF] setup=[M] begin
    using Random, StableRNGs, VineCopulas
    using Distributions: cdf
    vc = M.cvine3()
    u = [0.3, 0.6, 0.8]
    U = [u u]

    # A caller-supplied generator makes :qmc reproducible and replicable.
    @test cdf(vc, u; N=1024, rng=StableRNG(1)) == cdf(vc, u; N=1024, rng=StableRNG(1))
    @test cdf(vc, u; N=1024, rng=StableRNG(1)) != cdf(vc, u; N=1024, rng=StableRNG(2))
    @test cdf(vc, U; N=1024, rng=StableRNG(1)) == cdf(vc, U; N=1024, rng=StableRNG(1))
    @test cdf(vc, U; N=1024, rng=StableRNG(1)) == fill(cdf(vc, u; N=1024, rng=StableRNG(1)), 2)

    # Without an rng the :qmc default is the fixed-seed scramble, as before.
    @test cdf(vc, u; N=1024) == cdf(vc, u; N=1024)
    @test cdf(vc, u; N=1024) == cdf(vc, u; N=1024, rng=Random.MersenneTwister(VineCopulas._CDF_QMC_SEED[]))
    @test cdf(vc, u; N=1024) ≈ 0.23046875

    # randomized=false ignores the generator.
    @test cdf(vc, u; N=1024, randomized=false, rng=StableRNG(1)) == cdf(vc, u; N=1024, randomized=false, rng=StableRNG(2))

    # :mc still honours the generator.
    @test cdf(vc, u; method=:mc, N=1024, rng=StableRNG(1)) == cdf(vc, u; method=:mc, N=1024, rng=StableRNG(1))
    @test_throws ArgumentError cdf(vc, u; method=:bogus)
end
