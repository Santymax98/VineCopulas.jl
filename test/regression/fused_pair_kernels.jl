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

    fused_sum(C, u, v, buf)
    bytes = @allocated fused_sum(C, u, v, buf)

    @test bytes <= 64
    @test @inferred(fused_sum(C, u, v, buf)) isa Float64
end
