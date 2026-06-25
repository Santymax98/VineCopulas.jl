using Test
using Random
using Distributions
using Copulas
using VineCopulas
using ForwardDiff

const EV_INTERIOR_GRID = (1e-8, 1e-4, 0.01, 0.20, 0.50, 0.80, 0.99, 1-1e-8)
const EV_ROUNDTRIP_GRID = (1e-4, 0.01, 0.20, 0.50, 0.85, 0.99, 1-1e-4)
const EV_QUANTILE_GRID = (1e-8, 1e-4, 0.01, 0.20, 0.50, 0.80, 0.99, 1-1e-8)
const EV_INPUT_ROUNDTRIP_MINPROB = 1e-12

smooth_extreme_value_candidates() = filter(p -> !_is_singular_extreme_value(p.second), extreme_value_candidates())
singular_extreme_value_candidates() = filter(p -> _is_singular_extreme_value(p.second), extreme_value_candidates())

@testset "Extreme-value conditional primitives" begin
    @testset "Safeguarded logit solver keeps its best residual" begin
        root = sqrt(2.0)
        z = VineCopulas._ev_solve_logit(x -> (root-exp(x), -exp(x)), 0.0)
        @test z ≈ log(root) atol=8eps(Float64) rtol=8eps(Float64)
    end

    @testset "Degenerate tail constructors reduce exactly" begin
        @test Copulas.ExtremeValueCopula(2, Copulas.NoTail()) isa Copulas.IndependentCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.MTail()) isa Copulas.MCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.LogTail(1.0)) isa Copulas.IndependentCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(0.0)) isa Copulas.IndependentCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(Inf)) isa Copulas.MCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(0.0)) isa Copulas.IndependentCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(Inf)) isa Copulas.MCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.CuadrasAugeTail(1.0)) isa Copulas.MCopula
        @test Copulas.ExtremeValueCopula(2, Copulas.tEVTail(4.0, 1.0)) isa Copulas.MCopula
    end

    @testset "Galambos boundary Pickands factors" begin
        C = Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5))
        for t in (1e-12, 1e-10, 1e-8, 1-1e-8, 1-1e-10, 1-1e-12)
            _, _, B1, B2 = VineCopulas._ev_A_dA(C.tail, t)
            @test isfinite(B1)
            @test isfinite(B2)
            @test 0.0 <= B1 <= 1.0
            @test 0.0 <= B2 <= 1.0
        end

        for u in PAIR_GRID, v in PAIR_GRID
            @test hinv1(C, hfunc1(C, u, v), v) ≈ u atol=1e-8 rtol=1e-8
            @test hinv2(C, hfunc2(C, u, v), u) ≈ v atol=1e-8 rtol=1e-8
        end
    end

    @testset "Husler-Reiss boundary Pickands factors" begin
        C = Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(1.2))
        for t in (1e-12, 1e-10, 1e-8, 1-1e-8, 1-1e-10, 1-1e-12)
            A = Copulas.A(C.tail, t)
            dA = Copulas.dA(C.tail, t)
            B1, B2 = VineCopulas._ev_pickands_factors(C.tail, t, A, dA)
            @test isfinite(B1)
            @test isfinite(B2)
            @test 0.0 <= B1 <= 1.0
            @test 0.0 <= B2 <= 1.0
        end
    end

    @testset "h-functions agree with BivEVDistortion" begin
        for (name, C) in extreme_value_candidates()
            @testset "$name" begin
                for u in EV_INTERIOR_GRID, v in EV_INTERIOR_GRID
                    q1 = hfunc1(C, u, v)
                    q2 = hfunc2(C, u, v)
                    q1ref = VineCopulas._clp(cdf(_conditional_dist1(C, v), u))
                    q2ref = VineCopulas._clp(cdf(_conditional_dist2(C, u), v))

                    @test isfinite(q1)
                    @test isfinite(q2)
                    @test 0 < q1 < 1
                    @test 0 < q2 < 1
                    @test q1 ≈ q1ref atol=5e-10 rtol=5e-10
                    @test q2 ≈ q2ref atol=5e-10 rtol=5e-10
                end
            end
        end
    end

    @testset "Smooth conditional roundtrips" begin
        for (name, C) in smooth_extreme_value_candidates()
            @testset "$name" begin
                for u in EV_ROUNDTRIP_GRID, v in EV_ROUNDTRIP_GRID
                    q1 = hfunc1(C, u, v)
                    q2 = hfunc2(C, u, v)
                    uhat = hinv1(C, q1, v)
                    vhat = hinv2(C, q2, u)

                    if EV_INPUT_ROUNDTRIP_MINPROB < q1 < 1-EV_INPUT_ROUNDTRIP_MINPROB
                        @test uhat ≈ u atol=2e-8 rtol=2e-7
                    else
                        @test hfunc1(C, uhat, v) ≈ q1 atol=32eps(Float64) rtol=5e-12
                    end

                    if EV_INPUT_ROUNDTRIP_MINPROB < q2 < 1-EV_INPUT_ROUNDTRIP_MINPROB
                        @test vhat ≈ v atol=2e-8 rtol=2e-7
                    else
                        @test hfunc2(C, u, vhat) ≈ q2 atol=32eps(Float64) rtol=5e-12
                    end
                end

                for q in EV_QUANTILE_GRID, base in (1e-4, 0.01, 0.20, 0.50, 0.90, 1-1e-4)
                    u = hinv1(C, q, base)
                    v = hinv2(C, q, base)
                    @test hfunc1(C, u, base) ≈ q atol=5e-11 rtol=5e-7
                    @test hfunc2(C, base, v) ≈ q atol=5e-11 rtol=5e-7
                end
            end
        end
    end

    @testset "LogTail reuses the analytic Gumbel inverse" begin
        for θ in (1.01, 1.5, 4.0)
            E = Copulas.ExtremeValueCopula(2, Copulas.LogTail(θ))
            G = Copulas.GumbelCopula(2, θ)

            for u in EV_ROUNDTRIP_GRID, v in EV_ROUNDTRIP_GRID
                @test hfunc1(E, u, v) ≈ hfunc1(G, u, v) atol=5e-12 rtol=5e-12
                @test hfunc2(E, u, v) ≈ hfunc2(G, u, v) atol=5e-12 rtol=5e-12
            end

            for q in EV_QUANTILE_GRID, base in (0.01, 0.20, 0.50, 0.90, 0.99)
                @test hinv1(E, q, base) ≈ hinv1(G, q, base) atol=5e-12 rtol=5e-12
                @test hinv2(E, q, base) ≈ hinv2(G, q, base) atol=5e-12 rtol=5e-12
            end
        end
    end

    @testset "Singular tails use generalized quantiles" begin
        for (name, C) in singular_extreme_value_candidates()
            @testset "$name" begin
                for q in EV_QUANTILE_GRID, base in (0.01, 0.20, 0.50, 0.90, 0.99)
                    D1 = _conditional_dist1(C, base)
                    D2 = _conditional_dist2(C, base)
                    u = hinv1(C, q, base)
                    v = hinv2(C, q, base)

                    @test u ≈ VineCopulas._clp(quantile(D1, q)) atol=5e-12 rtol=5e-12
                    @test v ≈ VineCopulas._clp(quantile(D2, q)) atol=5e-12 rtol=5e-12
                    @test hfunc1(C, u, base) >= q-5e-12
                    @test hfunc2(C, base, v) >= q-5e-12

                end

                for base in (0.05, 0.30, 0.70, 0.95)
                    @test issorted(hinv1.(Ref(C), EV_QUANTILE_GRID, base))
                    @test issorted(hinv2.(Ref(C), EV_QUANTILE_GRID, base))
                end
            end
        end
    end

    @testset "Monotonicity" begin
        for (name, C) in extreme_value_candidates()
            @testset "$name" begin
                for base in (0.01, 0.20, 0.50, 0.90, 0.99)
                    h1 = [hfunc1(C, u, base) for u in EV_INTERIOR_GRID]
                    h2 = [hfunc2(C, base, v) for v in EV_INTERIOR_GRID]
                    @test issorted(h1)
                    @test issorted(h2)
                    @test all(isfinite, h1)
                    @test all(isfinite, h2)
                end
            end
        end
    end

    @testset "CDF derivatives and automatic differentiation" begin
        families = (
            Copulas.ExtremeValueCopula(2, Copulas.LogTail(1.5)),
            Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5)),
            Copulas.ExtremeValueCopula(2, Copulas.MixedTail(0.4)),
            Copulas.ExtremeValueCopula(2, Copulas.AsymMixedTail(0.3, 0.1)),
        )

        for C in families
            u, v = 0.31, 0.47
            q1ad = ForwardDiff.derivative(z -> cdf(C, [u, z]), v)
            q2ad = ForwardDiff.derivative(z -> cdf(C, [z, v]), u)
            d1 = ForwardDiff.derivative(z -> hfunc1(C, z, v), u)
            d2 = ForwardDiff.derivative(z -> hfunc2(C, u, z), v)
            density = pdf(C, [u, v])

            @test hfunc1(C, u, v) ≈ q1ad atol=2e-9 rtol=2e-8
            @test hfunc2(C, u, v) ≈ q2ad atol=2e-9 rtol=2e-8
            @test isfinite(d1) && d1 > 0
            @test isfinite(d2) && d2 > 0
            @test d1 ≈ density atol=2e-7 rtol=2e-6
            @test d2 ≈ density atol=2e-7 rtol=2e-6
        end
    end

    @testset "BigFloat" begin
        setprecision(BigFloat, 256) do
            families = (
                Copulas.ExtremeValueCopula(2, Copulas.LogTail(big"1.5")),
                Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(big"1.5")),
                Copulas.ExtremeValueCopula(2, Copulas.MixedTail(big"0.4")),
            )
            u, v = big"0.237", big"0.683"

            for C in families
                q1 = hfunc1(C, u, v)
                q2 = hfunc2(C, u, v)
                uhat = hinv1(C, q1, v)
                vhat = hinv2(C, q2, u)

                @test q1 isa BigFloat
                @test q2 isa BigFloat
                @test uhat isa BigFloat
                @test vhat isa BigFloat
                @test uhat ≈ u rtol=big"1e-40"
                @test vhat ≈ v rtol=big"1e-40"
            end

            C = Copulas.ExtremeValueCopula(2, Copulas.MixedTail(big"0.4"))
            base = big"0.683"

            for z in (big"-30", big"15")
                t = VineCopulas._ev_t_from_logit(z)
                target = exp(log(base)*exp(z))
                q = hfunc1(C, target, base)
                @test (z < 0) == (t < big"1e-12")
                @test hinv1(C, q, base) ≈ target rtol=big"1e-35"
            end

            for z in (big"-15", big"30")
                t = VineCopulas._ev_t_from_logit(z)
                target = exp(log(base)*exp(-z))
                q = hfunc2(C, base, target)
                @test (z > 0) == (one(t)-t < big"1e-12")
                @test hinv2(C, q, base) ≈ target rtol=big"1e-35"
            end
        end
    end
end

@testset "Extreme-value pair-copulas inside C- and D-vines" begin
    rng = MersenneTwister(2026)
    E1 = Copulas.ExtremeValueCopula(2, Copulas.LogTail(1.5))
    E2 = Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.2))
    E3 = Copulas.ExtremeValueCopula(2, Copulas.MixedTail(0.4))

    vines = (
        DVineCopula(order=(1, 2, 3), paircopulas=((E1, E2), (E3,))),
        CVineCopula(order=(1, 2, 3), paircopulas=((E1, E2), (E3,))),
    )

    Z = rand(rng, 3, 250)
    for vine in vines
        U = inverse_rosenblatt(vine, Z)
        Z2 = rosenblatt(vine, U)
        U2 = inverse_rosenblatt(vine, Z2)

        @test all(isfinite, U)
        @test maximum(abs.(Z-Z2)) < 2e-6
        @test maximum(abs.(U-U2)) < 2e-7
    end
end
