@testitem "Regression – fused pair kernels preserve primitives" tags=[:Regression, :PairCopula, :Performance] setup=[M] begin
    using Test
    using Copulas
    using Distributions
    using VineCopulas

    cases = (
        M.gaussian_pair(0.45),
        M.t_pair(0.40, 4),
        M.clayton_pair(1.7),
        ClaytonCopula(2, -0.5),
        M.frank_pair(2.4),
        M.gumbel_pair(1.4),
        M.joe_pair(1.6),
        BB1Copula(2, 1.2, 1.5),
        SurvivalCopula(M.t_pair(0.35, 5), (1,)),
    )
    points = ((0.07, 0.13), (0.23, 0.71), (0.51, 0.44), (0.88, 0.91))
    buf = Vector{Float64}(undef, 2)

    for C in cases, (u, v) in points
        logc = VineCopulas._pair_logpdf(C, u, v, buf)
        h1 = hfunc1(C, u, v)
        h2 = hfunc2(C, u, v)

        got_logc, got_h1, got_h2 = VineCopulas._pair_step(C, u, v, buf)
        @test got_logc ≈ logc atol=2e-11 rtol=2e-11
        @test got_h1 ≈ h1 atol=2e-11 rtol=2e-11
        @test got_h2 ≈ h2 atol=2e-11 rtol=2e-11

        got_h1b, got_h2b = VineCopulas._pair_hfuncs(C, u, v)
        @test got_h1b ≈ h1 atol=2e-11 rtol=2e-11
        @test got_h2b ≈ h2 atol=2e-11 rtol=2e-11

        got_logc1, got_h1c = VineCopulas._pair_logpdf_h1(C, u, v, buf)
        got_logc2, got_h2c = VineCopulas._pair_logpdf_h2(C, u, v, buf)
        @test got_logc1 ≈ logc atol=2e-11 rtol=2e-11
        @test got_logc2 ≈ logc atol=2e-11 rtol=2e-11
        @test got_h1c ≈ h1 atol=2e-11 rtol=2e-11
        @test got_h2c ≈ h2 atol=2e-11 rtol=2e-11
    end
end

@testitem "Regression – closed-form Archimedean h-functions agree with condition" tags=[:Regression, :PairCopula, :Conditional] setup=[M] begin
    using Test
    using Copulas
    using Distributions
    using VineCopulas

    for C in (M.clayton_pair(1.7), M.frank_pair(2.4), M.gumbel_pair(1.4)),
        (u, v) in ((0.08, 0.17), (0.31, 0.66), (0.79, 0.43), (0.93, 0.87))

        ref1 = cdf(condition(C, 2, v), u)
        ref2 = cdf(condition(C, 1, u), v)
        @test hfunc1(C, u, v) ≈ ref1 atol=5e-10 rtol=5e-10
        @test hfunc2(C, u, v) ≈ ref2 atol=5e-10 rtol=5e-10
    end
end

@testitem "Regression – batched pair h-functions are alias safe" tags=[:Regression, :PairCopula, :Performance] setup=[M] begin
    using Test
    using VineCopulas

    for C in (M.gaussian_pair(0.45), M.t_pair(0.35, 5), M.clayton_pair(1.8))
        u0 = [0.08, 0.21, 0.47, 0.76, 0.92]
        v0 = [0.91, 0.72, 0.53, 0.34, 0.14]
        ref1 = [hfunc1(C, u0[i], v0[i]) for i in eachindex(u0)]
        ref2 = [hfunc2(C, u0[i], v0[i]) for i in eachindex(u0)]

        u = copy(u0)
        v = copy(v0)
        out1, out2 = VineCopulas._pair_hfuncs!(u, v, C, u, v)
        @test out1 === u
        @test out2 === v
        @test u ≈ ref1 atol=2e-11 rtol=2e-11
        @test v ≈ ref2 atol=2e-11 rtol=2e-11

        h2 = copy(v0)
        VineCopulas._pair_hfunc2!(h2, C, u0, h2)
        @test h2 ≈ ref2 atol=2e-11 rtol=2e-11

        buf = Vector{Float64}(undef, 2)
        reflog = [VineCopulas._pair_logpdf(C, u0[i], v0[i], buf) for i in eachindex(u0)]

        ll = zeros(length(u0))
        u = copy(u0)
        v = copy(v0)
        VineCopulas._pair_step_add!(ll, u, v, C, u, v, buf)
        @test ll ≈ reflog atol=2e-11 rtol=2e-11
        @test u ≈ ref1 atol=2e-11 rtol=2e-11
        @test v ≈ ref2 atol=2e-11 rtol=2e-11

        ll2 = zeros(length(u0))
        v = copy(v0)
        VineCopulas._pair_logpdf_h2_add!(ll2, v, C, u0, v, buf)
        @test ll2 ≈ reflog atol=2e-11 rtol=2e-11
        @test v ≈ ref2 atol=2e-11 rtol=2e-11
    end
end

@testitem "Fused Gaussian and Student pair steps are inferred" tags=[:PairCopula, :Performance] setup=[M] begin
    using Test
    using VineCopulas

    buf = Vector{Float64}(undef, 2)
    G = M.gaussian_pair(0.35)
    T = M.t_pair(0.35, 4)

    @test @inferred(VineCopulas._pair_step(G, 0.31, 0.72, buf)) isa NTuple{3,Float64}
    @test @inferred(VineCopulas._pair_step(T, 0.31, 0.72, buf)) isa NTuple{3,Float64}
    @test @inferred(VineCopulas._pair_logpdf_h2(G, 0.31, 0.72, buf)) isa NTuple{2,Float64}
    @test @inferred(VineCopulas._pair_logpdf_h2(T, 0.31, 0.72, buf)) isa NTuple{2,Float64}
end

@testitem "Regression – Rmath Student kernels preserve CDF semantics and tail accuracy" tags=[:Regression, :PairCopula, :Student, :Performance] begin
    using Test
    using StatsFuns
    using VineCopulas

    probs = (1e-10, 1e-8, 1e-6, 1e-3, 0.1, 0.5, 0.9, 1 - 1e-3, 1 - 1e-6, 1 - 1e-8, 1 - 1e-10)
    xs = (-25.0, -8.0, -2.0, 0.0, 1.5, 6.0, 20.0)

    # StatsFuns is a useful cross-check in the central range, but its
    # incomplete-beta route loses tail accuracy for some low-ν probabilities.
    # Keep the independent comparison where both backends are well behaved.
    moderate_probs = (1e-3, 0.1, 0.5, 0.9, 1 - 1e-3)
    for ν in (1.25, 2, 4, 10, 30, 80.0)
        vν = Val(ν)
        for p in moderate_probs
            got = VineCopulas._t_quantile(vν, p)
            ref = StatsFuns.tdistinvcdf(Float64(ν), p)
            @test got ≈ ref atol=2e-9 rtol=2e-9
        end
        for x in xs
            got = VineCopulas._t_cdf(vν, x)
            ref = StatsFuns.tdistcdf(Float64(ν), x)
            @test got ≈ ref atol=2e-12 rtol=2e-12
        end

        # For the extreme probabilities, verify the pt/qt parameterization and
        # tail semantics by round-tripping through the same scalar backend.
        # Independent tail accuracy is checked below with the exact ν=2 law.
        for p in probs
            x = VineCopulas._t_quantile(vν, p)
            tail = p <= 0.5 ? VineCopulas._t_cdf(vν, x) : VineCopulas._t_cdf(vν, -x)
            target = min(p, 1 - p)
            @test tail ≈ target atol=1e-18 rtol=5e-12
        end
    end

    # ν=2 has an exact inverse CDF:
    #     t₂⁻¹(p) = (2p - 1) / sqrt(2p(1-p)).
    # This gives an external tail check without relying on either numerical
    # inverse implementation.
    for p in probs
        expected = (2p - 1) / sqrt(2p * (1 - p))
        got = VineCopulas._t_quantile(Val(2), p)
        @test got ≈ expected atol=2e-10 rtol=2e-12
    end
end

@testitem "Homogeneous and mixed vine logpdf return types are inferred" tags=[:Vines, :Performance] setup=[M] begin
    using Test
    using Distributions
    using VineCopulas

    g = M.gaussian_pair(0.35)
    E = [[g for _ in 1:(5 - t)] for t in 1:4]
    U = fill(0.43, 5, 3)

    C = CVineCopula(collect(1:5), E)
    D = DVineCopula(collect(1:5), E)

    Rmix = M.rvine5_general()
    R = RVineCopula(collect(order(Rmix)), [collect(s) for s in struct_array(Rmix)], E)

    @test @inferred(logpdf(C, U)) isa Vector{Float64}
    @test @inferred(logpdf(D, U)) isa Vector{Float64}
    @test @inferred(logpdf(R, U)) isa Vector{Float64}
    @test @inferred(logpdf(Rmix, U)) isa Vector{Float64}
end

@testitem "Student fused scalar loop has negligible Julia allocations" tags=[:PairCopula, :Student, :Performance] setup=[M] begin
    using Test
    using VineCopulas

    C = M.t_pair(0.35, 4)
    u = collect(range(0.03, 0.97; length=128))
    v = reverse(copy(u))
    buf = Vector{Float64}(undef, 2)

    function fused_sum(C, u, v, buf)
        s = 0.0
        @inbounds for i in eachindex(u, v)
            logc, h1, h2 = VineCopulas._pair_step(C, u[i], v[i], buf)
            s += logc + h1 + h2
        end
        return s
    end

    # Public params copies the correlation matrix; prepare once per loop.
    C = VineCopulas._prepare_pair(C)
    fused_sum(C, u, v, buf)
    bytes = @allocated fused_sum(C, u, v, buf)

    @test bytes <= 64
    @test @inferred(fused_sum(C, u, v, buf)) isa Float64
end

@testitem "Prepared elliptical kernels preserve scalar primitives" tags=[:PairCopula, :Regression] setup=[M] begin
    buf = Vector{Float64}(undef, 2)
    for C in (M.gaussian_pair(0.35), M.t_pair(-0.35, 4))
        K = @inferred VineCopulas._prepare_pair(C)
        @test VineCopulas._prepare_pair(K) === K
        for (u, v) in ((0.31, 0.72), (1e-8, 0.9), (0.8, 1 - 1e-8))
            @test all(isapprox.(VineCopulas._pair_step(K, u, v, buf), VineCopulas._pair_step(C, u, v, buf)))
            @test all(isapprox.(VineCopulas._pair_logpdf_h1(K, u, v, buf), VineCopulas._pair_logpdf_h1(C, u, v, buf)))
            @test all(isapprox.(VineCopulas._pair_logpdf_h2(K, u, v, buf), VineCopulas._pair_logpdf_h2(C, u, v, buf)))
            @test hfunc1(K, u, v) ≈ hfunc1(C, u, v)
            @test hfunc2(K, u, v) ≈ hfunc2(C, u, v)
            @test hinv1(K, u, v) ≈ hinv1(C, u, v)
            @test hinv2(K, u, v) ≈ hinv2(C, u, v)
        end
    end
end
@testitem "BB1 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (0.2, 1.2, 5.0), delta in (1.01, 1.5, 3.0)
        C = BB1Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "BB6 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (1.001, 1.2, 3.0), delta in (1.001, 1.5, 3.0)
        C = BB6Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            if u == 1e-8 && v == 0.19 && (theta, delta) in ((1.001, 3.0), (3.0, 1.5), (3.0, 3.0))
                # The Float64 public logpdf loses precision in the extreme lower tail.
                # Use the same public distribution API at high precision as the numerical
                # oracle rather than forcing the stable VineCopulas kernel to reproduce
                # that Float64 cancellation.
                setprecision(BigFloat, 256) do
                    Cbig = Copulas.BB6Copula(2, BigFloat(theta), BigFloat(delta))
                    ref = logpdf(Cbig, BigFloat[BigFloat(u), BigFloat(v)])
                    @test BigFloat(lc) ≈ ref atol=big"5e-13" rtol=big"5e-13"
                end
            else
                @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            end
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "BB7 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (1.001, 1.2, 3.0), delta in (0.1, 1.5, 5.0)
        C = BB7Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "BB8 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (1.001, 1.2, 3.0), delta in (0.05, 0.5, 0.999)
        C = BB8Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            if theta == 3.0 && delta == 0.999 &&
               (u, v) in ((1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
                # High precision guards against cancellation in the density reconstruction.
                setprecision(BigFloat, 256) do
                    Cbig = Copulas.BB8Copula(2, BigFloat(theta), BigFloat(delta))
                    ref = logpdf(Cbig, BigFloat[BigFloat(u), BigFloat(v)])
                    @test BigFloat(lc) ≈ ref atol=big"5e-13" rtol=big"5e-13"
                end
            end
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "BB2 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (0.01, 0.5, 2.0), delta in (0.01, 0.5, 2.0)
        C = BB2Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end

    # The Float64 public condition can overflow in this lower-tail regime.
    # Keep the public API as the oracle, evaluated at high precision.
    C = BB2Copula(2, 0.5, 0.5)
    setprecision(BigFloat, 256) do
        Cbig = Copulas.BB2Copula(2, big"0.5", big"0.5")
        u, v, q = 1e-8, 0.19, 1e-8
        conditional = Copulas.condition(Cbig, 1, BigFloat(u))
        @test BigFloat(hfunc2(C, u, v)) ≈ cdf(conditional, BigFloat(v)) atol=big"5e-13" rtol=big"5e-13"
        @test BigFloat(hinv2(C, q, u)) ≈ quantile(conditional, BigFloat(q)) atol=big"5e-21" rtol=big"5e-13"
        @test BigFloat(VineCopulas._pair_logpdf(C, u, v, buf)) ≈
              logpdf(Cbig, BigFloat[BigFloat(u), BigFloat(v)]) atol=big"5e-11" rtol=big"5e-13"
    end
end
@testitem "BB3 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions, LogExpFunctions

    # Copulas.jl's BB3 public logpdf clips inputs using Float64-specific
    # bounds even for BigFloat inputs. Extreme-tail correctness is checked
    # against the defining density at the original, unclipped point.
    function _bb3_logpdf_big_reference(theta, delta, u, v)
        setprecision(BigFloat, 256) do
            θ, δ, ub, vb = BigFloat(theta), BigFloat(delta), BigFloat(u), BigFloat(v)
            p, logδ = inv(θ), log(δ)
            t1, t2 = -log(ub), -log(vb)
            a, b = δ * t1^θ, δ * t2^θ
            L = LogExpFunctions.logexpm1(LogExpFunctions.logaddexp(a, b))
            r = exp(p * (log(L) - logδ))
            oneps = exp(L)
            g1 = δ^(-p) * p * L^(p - 1) / oneps
            g2 = δ^(-p) * p * ((p - 1) * L^(p - 2) - L^(p - 1)) / oneps^2
            φdd = exp(-r) * (g1^2 - g2)
            φdd > 0 || error("Invalid BB3 BigFloat reference density")
            logSu = logδ + log(θ) + a + (θ - 1) * log(t1) - log(ub)
            logSv = logδ + log(θ) + b + (θ - 1) * log(t2) - log(vb)
            return log(φdd) + logSu + logSv
        end
    end

    buf = zeros(2)
    for theta in (1.0, 1.001, 1.2, 3.0), delta in (0.2, 1.5, 5.0)
        C = BB3Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (0.2, 0.83))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            @test BigFloat(lc) ≈ _bb3_logpdf_big_reference(theta, delta, u, v) atol=big"5e-12" rtol=big"5e-13"
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
    for delta in (0.2, 1.0, 1.5, 5.0),
        (u, v) in ((1e-8, 0.19), (1e-6, 0.999999))
        C = BB3Copula(2, 3.0, delta)
        fast = @inferred VineCopulas._pair_logpdf(C, u, v, buf)
        ref = _bb3_logpdf_big_reference(3.0, delta, u, v)
        @test BigFloat(fast) ≈ ref atol=big"5e-12" rtol=big"5e-13"
    end
end
@testitem "BB9 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions
    buf = zeros(2)
    for theta in (1.0, 1.001, 1.5, 3.0), delta in (0.05, 0.7, 5.0)
        C = BB9Copula(2, theta, delta)
        for (u, v) in ((0.37, 0.72), (1e-8, 0.19), (1 - 1e-8, 0.83), (1e-6, 1 - 1e-6))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)
            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10
            setprecision(BigFloat, 256) do
                Cbig = Copulas.BB9Copula(2, BigFloat(theta), BigFloat(delta))
                ref = logpdf(Cbig, BigFloat[BigFloat(u), BigFloat(v)])
                @test BigFloat(lc) ≈ ref atol=big"5e-12" rtol=big"5e-13"
            end
            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "BB10 public-parameter density and fused kernels" tags=[:PairCopula, :BB, :Regression] begin
    using Distributions

    buf = zeros(2)

    for theta in (0.2, 0.5, 1.0, 1.5, 3.0),
        delta in (0.0, 0.05, 0.7, 0.999)

        C = BB10Copula(2, theta, delta)

        for (u, v) in (
            (0.37, 0.72),
            (1e-8, 0.19),
            (1 - 1e-8, 0.83),
            (1e-6, 1 - 1e-6),
        )
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)

            @test lc ≈ logpdf(C, [u, v]) atol=1e-10 rtol=1e-10

            setprecision(BigFloat, 256) do
                Cbig = Copulas.BB10Copula(
                    2,
                    BigFloat(theta),
                    BigFloat(delta),
                )
                ref = logpdf(
                    Cbig,
                    BigFloat[BigFloat(u), BigFloat(v)],
                )

                @test BigFloat(lc) ≈ ref atol=big"5e-12" rtol=big"5e-13"
            end

            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end
end

@testitem "AMH public-parameter closed kernels" tags=[:PairCopula, :Archimedean, :Regression] begin
    using Distributions
    using ForwardDiff

    buf = zeros(2)

    # Ordinary parameters: compare against the public Copulas.jl API.
    for theta in (-1.0, -0.9, -0.5, 0.0, 0.5, 0.9, 0.999)
        C = AMHCopula(2, theta)

        for (u, v) in ((0.37, 0.72), (0.2, 0.83), (1e-8, 0.19), (1 - 1e-8, 0.83))
            lc, h1, h2 = @inferred VineCopulas._pair_step(C, u, v, buf)

            @test lc ≈ logpdf(C, [u, v]) atol=2e-10 rtol=2e-10

            # Independent high-precision density reference: differentiate
            # the explicit AMH conditional rather than reusing the local
            # closed density formula.
            setprecision(BigFloat, 256) do
                θb, ub, vb = BigFloat(theta), BigFloat(u), BigFloat(v)

                href(x) = begin
                    D = 1 - θb * (1 - x) * (1 - vb)
                    x * (1 - θb * (1 - x)) / D^2
                end

                cref = ForwardDiff.derivative(href, ub)

                @test BigFloat(lc) ≈ log(cref) atol=big"5e-12" rtol=big"5e-13"
            end

            @test h1 == hfunc1(C, u, v)
            @test h2 == hfunc2(C, u, v)
            @test hinv1(C, h1, v) ≈ u atol=5e-9 rtol=5e-9
            @test hinv2(C, h2, u) ≈ v atol=5e-9 rtol=5e-9

            @test VineCopulas._pair_logpdf_h1(C, u, v, buf) == (lc, h1)
            @test VineCopulas._pair_logpdf_h2(C, u, v, buf) == (lc, h2)
        end
    end

    # θ = 0 is exact independence.
    C0 = AMHCopula(2, 0.0)

    for (u, v) in ((0.2, 0.7), (1e-8, 0.9), (0.999999, 1e-4))
        @test VineCopulas._pair_logpdf(C0, u, v, buf) == 0.0
        @test hfunc1(C0, u, v) == u
        @test hfunc2(C0, u, v) == v
        @test hinv1(C0, u, v) == u
        @test hinv2(C0, v, u) == v
    end

    # θ = 1 is the Clayton(θ=1) copula at the copula level.  This also
    # validates the AMH limit without relying on the degenerate AMH
    # generator representation at θ = 1.
    Camh = AMHCopula(2, 1.0)
    Cclayton = ClaytonCopula(2, 1.0)

    for (u, v) in ((0.37, 0.72), (0.01, 0.83), (0.999, 0.2))
        @test VineCopulas._pair_logpdf(Camh, u, v, buf) ≈
              VineCopulas._pair_logpdf(Cclayton, u, v, buf) atol=2e-12 rtol=2e-12

        @test hfunc1(Camh, u, v) ≈ hfunc1(Cclayton, u, v) atol=2e-12 rtol=2e-12
        @test hfunc2(Camh, u, v) ≈ hfunc2(Cclayton, u, v) atol=2e-12 rtol=2e-12

        q1 = hfunc1(Camh, u, v)
        q2 = hfunc2(Camh, u, v)

        @test hinv1(Camh, q1, v) ≈ u atol=5e-9 rtol=5e-9
        @test hinv2(Camh, q2, u) ≈ v atol=5e-9 rtol=5e-9
    end
end
