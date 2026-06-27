@testmodule M begin
    using Test
    using Random
    using StableRNGs
    using Distributions
    using Copulas
    using VineCopulas
    using ForwardDiff

    const rng = StableRNG(2026)
    const PAIR_GRID = (0.25, 0.50, 0.75)
    const PROB_GRID = (0.05, 0.25, 0.50, 0.75, 0.95)
    const VINE_POINT_GRID = (0.20, 0.50, 0.80)

    stable_rng(seed::Integer=2026) = StableRNG(seed)

    # ------------------------------------------------------------------
    # Pair-copula fixtures
    # ------------------------------------------------------------------

    gaussian_pair(ρ=0.5) = GaussianCopula([1.0 ρ; ρ 1.0])
    t_pair(ρ=0.4, ν=4) = TCopula(ν, [1.0 ρ; ρ 1.0])
    clayton_pair(θ=2.0) = ClaytonCopula(2, θ)
    frank_pair(θ=3.0) = FrankCopula(2, θ)
    gumbel_pair(θ=1.5) = GumbelCopula(2, θ)
    amh_pair(θ=0.5) = AMHCopula(2, θ)
    joe_pair(θ=1.5) = JoeCopula(2, θ)

    elliptical_candidates() = Pair{String,Copulas.Copula{2}}[
        "Gaussian" => gaussian_pair(0.5),
        "t" => t_pair(0.4, 4),
    ]

    archimedean_candidates() = Pair{String,Copulas.Copula{2}}[
        "Clayton" => clayton_pair(2.0),
        "Frank" => frank_pair(3.0),
        "Gumbel" => gumbel_pair(1.5),
        "AMH" => amh_pair(0.5),
        "Joe" => joe_pair(1.5),
        "GumbelBarnett" => GumbelBarnettCopula(2, 0.5),
        "InvGaussian" => InvGaussianCopula(2, 1.5),
        "BB1" => BB1Copula(2, 1.2, 1.5),
        "BB2" => BB2Copula(2, 1.2, 1.5),
        "BB3" => BB3Copula(2, 1.2, 1.5),
        "BB6" => BB6Copula(2, 1.2, 1.5),
        "BB7" => BB7Copula(2, 1.2, 1.5),
        "BB8" => BB8Copula(2, 1.5, 0.6),
        "BB9" => BB9Copula(2, 1.5, 0.8),
        "BB10" => BB10Copula(2, 1.5, 0.6),
    ]

    extreme_value_candidates() = Pair{String,Copulas.Copula{2}}[
        "LogTail" => Copulas.ExtremeValueCopula(2, Copulas.LogTail(1.5)),
        "GalambosTail" => Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5)),
        "HuslerReissTail" => Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(1.2)),
        "CuadrasAugeTail" => Copulas.ExtremeValueCopula(2, Copulas.CuadrasAugeTail(0.5)),
        "MOTail" => Copulas.ExtremeValueCopula(2, Copulas.MOTail(0.3, 0.4, 0.5)),
        "MixedTail" => Copulas.ExtremeValueCopula(2, Copulas.MixedTail(0.4)),
        "AsymLogTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymLogTail(1.5, 0.3, 0.7)),
        "AsymGalambosTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymGalambosTail(1.5, 0.3, 0.7)),
        "AsymMixedTail" => Copulas.ExtremeValueCopula(2, Copulas.AsymMixedTail(0.3, 0.1)),
        "BC2Tail" => Copulas.ExtremeValueCopula(2, Copulas.BC2Tail(0.3, 0.4)),
        "tEVTail" => Copulas.ExtremeValueCopula(2, Copulas.tEVTail(4.0, 0.5)),
    ]

    paircopula_candidates() = vcat(elliptical_candidates(), archimedean_candidates(), extreme_value_candidates())

    is_extreme_value(C) = C isa Copulas.ExtremeValueCopula{2}
    is_singular_extreme_value(C) = is_extreme_value(C) && C.tail isa Union{Copulas.CuadrasAugeTail,Copulas.MOTail,Copulas.BC2Tail,Copulas.EmpiricalEVTail}

    # ------------------------------------------------------------------
    # Vine fixtures
    # ------------------------------------------------------------------

    function vine_edges(p::Int, trunc::Int=p-1)
        pool = VineCopulas.PairCopula[
            gaussian_pair(0.35),
            clayton_pair(1.5),
            frank_pair(2.5),
            gumbel_pair(1.3),
        ]
        return [[pool[mod1(i+k, length(pool))] for i in 1:(p-k)] for k in 1:trunc]
    end

    cvine2() = CVineCopula([1, 2], vine_edges(2))
    cvine3() = CVineCopula([1, 2, 3], [[gaussian_pair(0.4), clayton_pair(2.0)], [frank_pair(3.0)]])
    cvine4() = CVineCopula([4, 3, 2, 1], vine_edges(4))
    cvine4_truncated() = CVineCopula([4, 3, 2, 1], vine_edges(4, 2); trunc=2)

    dvine2() = DVineCopula([1, 2], vine_edges(2))
    dvine3() = DVineCopula([1, 2, 3], [[gaussian_pair(0.5), clayton_pair(2.0)], [frank_pair(3.0)]])
    dvine4() = DVineCopula([1, 2, 3, 4], vine_edges(4))
    dvine4_truncated() = DVineCopula([1, 2, 3, 4], vine_edges(4, 2); trunc=2)

    function rvine2()
        ord = [1, 2]
        S = [[2]]
        return RVineCopula(ord, S, vine_edges(2))
    end

    function rvine3_dvine_like()
        ord = [1, 2, 3]
        S = [[2, 3], [2]]
        E = [[gaussian_pair(0.5), clayton_pair(2.0)], [frank_pair(3.0)]]
        return RVineCopula(ord, S, E)
    end

    function rvine4_dvine_like()
        ord = [1, 2, 3, 4]
        S = [[2, 3, 4], [2, 3], [2]]
        return RVineCopula(ord, S, vine_edges(4))
    end

    function rvine4_truncated()
        ord = [4, 2, 3, 1]
        S = [[ord[i+1] for i in 1:3], [ord[i+1] for i in 1:2]]
        E = vine_edges(4, 2)
        return RVineCopula(ord, S, E; trunc=2)
    end

    default_points(p::Int) = [fill(x, p) for x in VINE_POINT_GRID]
    default_points(vine::VineCopulas.AbstractVineCopula) = default_points(length(vine))

    # ------------------------------------------------------------------
    # Generic contracts for pair-copulas
    # ------------------------------------------------------------------

    function check_pair_density(C; grid=PAIR_GRID)
        @test C isa Copulas.Copula{2}
        for u in grid, v in grid
            ℓ = logpdf(C, [u, v])
            d = pdf(C, [u, v])
            @test !isnan(ℓ)
            @test isfinite(d)
            @test d ≥ 0
            if iszero(d)
                @test ℓ == -Inf
            else
                @test isfinite(ℓ)
                @test d ≈ exp(ℓ) atol=1e-10 rtol=1e-8
            end
        end
        nothing
    end

    function check_conditionals(C; grid=PAIR_GRID)
        for u in grid, v in grid
            q1 = hfunc1(C, u, v)
            q2 = hfunc2(C, u, v)
            @test isfinite(q1)
            @test isfinite(q2)
            @test 0 ≤ q1 ≤ 1
            @test 0 ≤ q2 ≤ 1
        end
        nothing
    end

    function check_inverse_conditionals(C; grid=PAIR_GRID)
        for u in grid, v in grid
            q1 = hfunc1(C, u, v)
            q2 = hfunc2(C, u, v)
            uhat = hinv1(C, q1, v)
            vhat = hinv2(C, q2, u)
            @test isfinite(uhat)
            @test isfinite(vhat)
            @test 0 < uhat < 1
            @test 0 < vhat < 1
            if !is_singular_extreme_value(C)
                @test uhat ≈ u atol=1e-5 rtol=1e-5
                @test vhat ≈ v atol=1e-5 rtol=1e-5
            else
                @test hfunc1(C, uhat, v) ≥ q1 - 1e-10
                @test hfunc2(C, u, vhat) ≥ q2 - 1e-10
            end
        end
        nothing
    end

    function check_paircopula(C)
        check_pair_density(C)
        check_conditionals(C)
        check_inverse_conditionals(C)
        nothing
    end

    # ------------------------------------------------------------------
    # Generic contracts for vines
    # ------------------------------------------------------------------

    function check_constructor(vine)
        @test vine isa VineCopulas.AbstractVineCopula
        @test length(vine) ≥ 2
        @test 1 ≤ truncation(vine) ≤ length(vine)-1
        nothing
    end

    function check_structure(vine)
        p = length(vine)
        q = truncation(vine)
        @test length(order(vine)) == p
        @test sort(collect(order(vine))) == collect(1:p)
        @test length(edges(vine)) == q
        for k in 1:q
            @test length(edges(vine)[k]) == p-k
            @test all(C -> C isa Copulas.Copula{2}, edges(vine)[k])
        end
        nothing
    end

    function check_density(vine; points=default_points(vine))
        for u in points
            @test Distributions.insupport(vine, u)
            d = pdf(vine, u)
            ℓ = logpdf(vine, u)
            @test !isnan(ℓ)
            @test d ≥ 0
            if isfinite(ℓ)
                @test d ≈ exp(ℓ) atol=1e-10 rtol=1e-8
            else
                @test iszero(d)
            end
        end
        nothing
    end

    function check_sampling(vine; seed=2026, n=128)
        U = rand(stable_rng(seed), vine, n)
        @test size(U) == (length(vine), n)
        @test all(isfinite, U)
        @test all(x -> 0 ≤ x ≤ 1, U)
        nothing
    end

    function check_rosenblatt(vine; seed=2026, n=64, atol=1e-7, rtol=1e-7)
        U = rand(stable_rng(seed), vine, n)
        Z = rosenblatt(vine, U)
        Uhat = inverse_rosenblatt(vine, Z)
        @test size(Z) == size(U)
        @test size(Uhat) == size(U)
        @test all(x -> 0 ≤ x ≤ 1, Z)
        @test Uhat ≈ U atol=atol rtol=rtol
        nothing
    end

    function check(vine)
        check_constructor(vine)
        check_structure(vine)
        check_density(vine)
        check_sampling(vine; n=32)
        nothing
    end
end
