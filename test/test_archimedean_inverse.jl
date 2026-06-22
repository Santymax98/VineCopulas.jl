using Test
using Copulas
using VineCopulas

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

    @testset "BB2" begin
        for θ in (0.5, 1.0, 2.0), δ in (0.5, 1.0, 2.0), s in (0.1, 0.5, 1.0, 2.0, 5.0)
            _check_derivative_inverse(Copulas.BB2Generator(θ, δ), s; atol=1e-10, rtol=1e-10)
        end
    end
end

@testset "Generic fallback BB-family smoke grid" begin
    generators = (
        Copulas.BB1Generator(1.2, 1.5),
        Copulas.BB3Generator(1.2, 1.5),
        Copulas.BB8Generator(1.2, 0.5),
        Copulas.BB9Generator(1.2, 1.5),
        Copulas.BB10Generator(1.2, 0.5),
    )
    for G in generators, s in (0.1, 0.5, 2.0)
        _check_derivative_inverse(G, s; atol=1e-7, rtol=1e-7)
    end
end
