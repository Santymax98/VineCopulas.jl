using Test
using Distributions
using Copulas
using VineCopulas

@testset "Bivariate pair-copula conditional primitives" begin
    pairs = paircopula_candidates()

    @test !isempty(pairs)


    for (label, C) in pairs
        println("Testing pair-copula: ", label)
        flush(stdout)

        @testset "$label" begin
            is_ev = _is_extreme_value(C)
            is_singular_ev = _is_singular_extreme_value(C)

            for u in PAIR_GRID, v in PAIR_GRID
                ℓ = logpdf(C, [u, v])
                d = pdf(C, [u, v])

                # A copula with a singular component can have zero density
                # with respect to Lebesgue measure on parts of the square.
                @test !isnan(ℓ)
                @test isfinite(d)
                @test d >= 0.0

                if iszero(d)
                    @test ℓ == -Inf
                    @test exp(ℓ) == 0.0
                else
                    @test isfinite(ℓ)
                    @test d ≈ exp(ℓ) rtol = 1e-8 atol = 1e-10
                end

                q1 = hfunc1(C, u, v)
                q2 = hfunc2(C, u, v)

                @test isfinite(q1)
                @test isfinite(q2)
                @test 0.0 <= q1 <= 1.0
                @test 0.0 <= q2 <= 1.0

                # For every extreme-value copula, compare the generic
                # h-functions with Copulas.jl's conditional distortion.
                D1 = nothing
                D2 = nothing

                if is_ev
                    D1 = _conditional_dist1(C, v)
                    D2 = _conditional_dist2(C, u)

                    q1_ref = VineCopulas._clp(cdf(D1, u))
                    q2_ref = VineCopulas._clp(cdf(D2, v))

                    @test q1 ≈ q1_ref atol = 1e-10 rtol = 1e-10
                    @test q2 ≈ q2_ref atol = 1e-10 rtol = 1e-10
                end

                # The identity ∂h/∂u = c only applies pointwise away from
                # jumps and singular curves. Do not use a central
                # difference for singular extreme-value copulas.
                if !is_singular_ev
                    d1 = _finite_pdf_h1(C, u, v)
                    d2 = _finite_pdf_h2(C, u, v)

                    @test d1 ≈ d atol = 5e-3 rtol = 5e-3
                    @test d2 ≈ d atol = 5e-3 rtol = 5e-3
                end

                û = hinv1(C, q1, v)
                v̂ = hinv2(C, q2, u)

                @test isfinite(û)
                @test isfinite(v̂)
                @test 0.0 < û < 1.0
                @test 0.0 < v̂ < 1.0

                if is_singular_ev
                    # For discontinuous or flat conditional CDFs,
                    # Q(F(u)) need not equal u. Compare against the exact
                    # generalized inverse supplied by Copulas.jl.
                    u_ref = VineCopulas._clp(quantile(D1, q1))
                    v_ref = VineCopulas._clp(quantile(D2, q2))

                    @test û ≈ u_ref atol = 1e-8 rtol = 1e-8
                    @test v̂ ≈ v_ref atol = 1e-8 rtol = 1e-8
                else
                    @test û ≈ u atol = 1e-5 rtol = 1e-5
                    @test v̂ ≈ v atol = 1e-5 rtol = 1e-5
                end
            end
        end
    end
end