using Test
using Copulas
using VineCopulas
using ForwardDiff

function _check_derivative_inverse(G, s; atol=1e-9, rtol=1e-9)
    y = Copulas.ϕ⁽¹⁾(G, s)
    @test isfinite(y)
    @test y < 0
    ŝ = VineCopulas._inv_ϕ¹(G, y)
    @test isfinite(ŝ)
    @test ŝ >= 0
    @test ŝ ≈ s atol=atol rtol=rtol
    @test Copulas.ϕ⁽¹⁾(G, ŝ) ≈ y atol=max(atol, 1e-12) rtol=max(rtol, 1e-9)
end

@testset "Archimedean inverse identity — representative families" begin
    for (mode, candidates) in (("specialized", archimedean_specialized_candidates()), ("generic fallback", archimedean_fallback_candidates()))
        @testset "$mode" begin
            for (name, C) in candidates
                @testset "$name" for s in S_GRID
                    _check_derivative_inverse(C.G, s; atol=1e-7, rtol=1e-7)
                end
            end
        end
    end
end

@testset "Archimedean h/hinv functional roundtrip" begin
    for (name, C) in archimedean_candidates()
        @testset "$name" begin
            for u in ARCH_GRID, v in ARCH_GRID
                q1, q2 = hfunc1(C, u, v), hfunc2(C, u, v)
                @test 0 < q1 < 1
                @test 0 < q2 < 1

                û, v̂ = hinv1(C, q1, v), hinv2(C, q2, u)
                @test 0 < û < 1
                @test 0 < v̂ < 1

                is_bb2 = C.G isa Copulas.BB2Generator
                q1_saturated = is_bb2 && q1 == prevfloat(one(q1))
                q2_saturated = is_bb2 && q2 == prevfloat(one(q2))
                q1_saturated || @test û ≈ u atol=1e-7 rtol=1e-7
                q2_saturated || @test v̂ ≈ v atol=1e-7 rtol=1e-7

                if is_bb2 && (q1_saturated || q2_saturated)
                    setprecision(BigFloat, 256) do
                        ub, vb = BigFloat(u), BigFloat(v)
                        if q1_saturated
                            @test Float64(hinv1(C, hfunc1(C, ub, vb), vb)) ≈ u atol=1e-12 rtol=1e-12
                        end
                        if q2_saturated
                            @test Float64(hinv2(C, hfunc2(C, ub, vb), ub)) ≈ v atol=1e-12 rtol=1e-12
                        end
                    end
                end
            end
        end
    end
end

@testset "Unit interval clamping preserves representable probabilities" begin
    @test VineCopulas._clp(1e-10) == 1e-10
    @test VineCopulas._clp(1.0-1e-10) == 1.0-1e-10
    @test VineCopulas._clp(1e-22) == 1e-22
    @test VineCopulas._clp(0.0) == nextfloat(0.0)
    @test VineCopulas._clp(1.0) == prevfloat(1.0)
end

@testset "LogExpFunctions integration and AD" begin
    @test !isdefined(VineCopulas, :_softplus)
    @test !isdefined(VineCopulas, :_logistic)
    @test !isdefined(VineCopulas, :_logexpm1)
    @test !isdefined(VineCopulas, :_logaddexp)
    @test !isdefined(VineCopulas, :_logsubexp)

    @test VineCopulas._logaddexp_minus_one(0.0, 0.0) ≈ 0.0 atol=eps(Float64)
    @test VineCopulas._logaddexp_minus_one(2.0, 1.0) ≈ log(exp(2.0) + exp(1.0) - 1.0)
    @test isfinite(VineCopulas._logaddexp_minus_one(1_000.0, 999.0))
    @test VineCopulas._logsubexp_plus_one(3.0, 1.0) ≈ log(exp(3.0) - exp(1.0) + 1.0)
    @test isfinite(VineCopulas._logsubexp_plus_one(1_000.0, 999.0))
    @test VineCopulas._logsubexp_plus_one(2.0, 2.0) == 0.0
    @test_throws DomainError VineCopulas._logsubexp_plus_one(1.0, 2.0)

    C = Copulas.BB1Copula(2, 1.2, 1.5)
    d = ForwardDiff.derivative(u -> hfunc1(C, u, 0.4), 0.3)
    @test isfinite(d)
    @test d > 0
end

@testset "Specialized inverse parameter sweep" begin
    @testset "Clayton" begin
        for θ in (-0.5, 0.5, 2.0), s in (0.01, 0.20, 1.00)
            _check_derivative_inverse(Copulas.ClaytonGenerator(θ), s; atol=1e-10, rtol=1e-10)
        end
    end

    @testset "AMH" begin
        for θ in (-0.5, 0.5, 0.9), s in (0.1, 0.5, 2.0, 5.0)
            _check_derivative_inverse(Copulas.AMHGenerator(θ), s; atol=1e-10, rtol=1e-10)
        end
    end

    @testset "Gumbel" begin
        for θ in (1.2, 1.5, 3.0), s in (0.1, 0.5, 2.0, 5.0)
            _check_derivative_inverse(Copulas.GumbelGenerator(θ), s; atol=1e-10, rtol=1e-10)
        end
    end

    @testset "Joe" begin
        for θ in (1.2, 1.5, 3.0), s in (0.1, 0.5, 2.0, 5.0)
            _check_derivative_inverse(Copulas.JoeGenerator(θ), s; atol=1e-9, rtol=1e-9)
        end
    end

    @testset "Frank positive and negative" begin
        for θ in (-5.0, -1.0, 1.0, 5.0), s in (0.1, 0.5, 2.0, 5.0)
            _check_derivative_inverse(Copulas.FrankGenerator(θ), s; atol=1e-10, rtol=1e-10)
        end
    end

    @testset "GumbelBarnett" begin
        for θ in (0.2, 0.5, 1.0), s in (0.1, 0.5, 1.0, 2.0, 5.0)
            G = Copulas.GumbelBarnettGenerator(θ)
            y = Copulas.ϕ⁽¹⁾(G, s)
            ŝ = VineCopulas._inv_ϕ¹(G, y)
            if zero(y) < abs(y) < floatmin(typeof(y))
                @test abs(log(-Copulas.ϕ⁽¹⁾(G, ŝ))-log(-y)) <= 1e-12
            else
                @test ŝ ≈ s atol=1e-10 rtol=1e-10
            end
        end
        setprecision(BigFloat, 256) do
            G, s = Copulas.GumbelBarnettGenerator(big"0.2"), big"5.0"
            @test VineCopulas._inv_ϕ¹(G, Copulas.ϕ⁽¹⁾(G, s)) ≈ s atol=big"1e-60" rtol=big"1e-60"
        end
    end

    @testset "InvGaussian" begin
        for θ in (0.5, 1.0, 2.0, Inf), s in (0.1, 0.5, 1.0, 2.0, 5.0)
            _check_derivative_inverse(Copulas.InvGaussianGenerator(θ), s; atol=1e-10, rtol=1e-10)
        end
    end

    @testset "BB1 numerical inverse in log-coordinate" begin
        for θ in (0.2, 1.2, 5.0), δ in (1.01, 1.5, 3.0), s in (1e-8, 1e-3, 0.1, 1.0, 10.0, 1e3)
            _check_derivative_inverse(Copulas.BB1Generator(θ, δ), s; atol=2e-10, rtol=2e-10)
        end
        for θ in (0.5, 2.0), δ in (1.2, 4.0)
            G = Copulas.BB1Generator(θ, δ)
            ys = [Copulas.ϕ⁽¹⁾(G, s) for s in (1e-4, 1e-2, 1.0, 1e2)]
            @test issorted(ys)
            @test all(VineCopulas._inv_ϕ¹(G, ys[i]) < VineCopulas._inv_ϕ¹(G, ys[i+1]) for i in 1:length(ys)-1)
        end
        setprecision(BigFloat, 256) do
            G, s = Copulas.BB1Generator(big"0.3", big"2.5"), big"1e40"
            @test VineCopulas._inv_ϕ¹(G, Copulas.ϕ⁽¹⁾(G, s)) ≈ s rtol=big"1e-60"
        end
        G = Copulas.BB1Generator(1.2, 1.5)
        @test VineCopulas._inv_ϕ¹(G, -Inf) == 0.0
        @test VineCopulas._inv_ϕ¹(G, -0.0) == Inf
        @test_throws DomainError VineCopulas._inv_ϕ¹(G, 0.1)
        @test_throws DomainError VineCopulas._inv_ϕ¹(G, NaN)
    end

    @testset "BB2" begin
        for θ in (0.5, 1.0, 2.0), δ in (0.5, 1.0, 2.0), s in (0.1, 0.5, 1.0, 2.0, 5.0)
            _check_derivative_inverse(Copulas.BB2Generator(θ, δ), s; atol=1e-10, rtol=1e-10)
        end
    end
end

@testset "Generic fallback BB-family smoke grid" begin
    generators = (
        Copulas.BB3Generator(1.2, 1.5),
        Copulas.BB8Generator(1.2, 0.5),
        Copulas.BB9Generator(1.2, 1.5),
        Copulas.BB10Generator(1.2, 0.5),
    )
    for G in generators, s in (0.1, 0.5, 2.0)
        _check_derivative_inverse(G, s; atol=1e-7, rtol=1e-7)
    end
end
