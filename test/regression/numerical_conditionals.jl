@testitem "Regression – negative Clayton finite support" tags=[:Regression, :PairCopula, :Clayton] begin
    using Test
    using Copulas
    using VineCopulas

    C = ClaytonCopula(2, -0.5)
    buf = zeros(Float64, 2)

    # Outside the absolutely continuous support u^(-θ)+v^(-θ)-1 ≤ 0.
    @test VineCopulas._pair_logpdf(C, 0.04, 0.04, buf) == -Inf
    @test VineCopulas._arch_hfunc(C.G, 0.04, 0.04) == 0.0

    # Interior support remains finite and the conditional quantile round-trips.
    @test isfinite(VineCopulas._pair_logpdf(C, 0.81, 0.81, buf))
    q = 0.37
    base = 0.72
    u = hinv1(C, q, base)
    @test hfunc1(C, u, base) ≈ q atol=1e-8 rtol=1e-8
end

@testitem "Regression – Joe conditional tail stability" tags=[:Regression, :PairCopula, :Joe] begin
    using Test
    using Copulas
    using VineCopulas

    # In the ordinary interior, Joe conditional quantiles should have the
    # familiar numerical round-trip property.
    for θ in (1.01, 1.25, 2.0, 5.0, 12.0), base in (1e-8, 0.05, 0.5, 0.95, 0.999), q in (1e-8, 0.1, 0.5, 0.9, 1 - 1e-8)
        C = JoeCopula(2, θ)
        u = hinv1(C, q, base)
        @test isfinite(u)
        @test 0.0 < u < 1.0
        @test hfunc1(C, u, base) ≈ q atol=2e-9 rtol=2e-9
    end

    # At machine-endpoint bases the real-valued inverse can lie between two
    # consecutive Float64 values.  The correct finite-precision contract is
    # therefore the generalized inverse: the returned u is the smallest
    # representable value for which h(u | base) >= q.  Test the bracket in the
    # same stable log coordinate used by the implementation; do not weaken the
    # assertion merely to hide an unrepresentable real quantile.
    qs = (nextfloat(0.0), 1e-14, 1e-8, 0.1, 0.5, 0.9, 1 - 1e-12, prevfloat(1.0))
    bases = (nextfloat(0.0), 1e-14, 1e-8, 0.05, 0.5, 0.95, 1 - 1e-12, prevfloat(1.0))
    ulo = nextfloat(0.0)
    uhi = prevfloat(1.0)

    for θ in (1.01, 1.25, 2.0, 5.0, 12.0)
        C = JoeCopula(2, θ)
        for base0 in bases, q0 in qs
            base = VineCopulas._clp(base0)
            q = VineCopulas._clp(q0)
            u = hinv1(C, q, base)

            @test isfinite(u)
            @test ulo <= u <= uhi

            logq = log(q)
            logh_lo = VineCopulas._joe_logh_x(C.G, -log1p(-ulo), base)
            logh_hi = VineCopulas._joe_logh_x(C.G, -log1p(-uhi), base)

            if logq <= logh_lo
                @test u == ulo
            elseif logq > logh_hi
                @test u == uhi
            else
                loghu = VineCopulas._joe_logh_x(C.G, -log1p(-u), base)
                tol = 128eps(Float64) * max(1.0, abs(logq), abs(loghu))
                @test loghu >= logq - tol

                uprev = prevfloat(u)
                if uprev > 0.0
                    loghp = VineCopulas._joe_logh_x(C.G, -log1p(-uprev), base)
                    @test loghp <= logq + tol
                end
            end
        end

        # Quantiles must remain monotone even when several probabilities map
        # to adjacent representable values in a very steep tail.
        for base in bases
            us = [hinv1(C, q, VineCopulas._clp(base)) for q in qs]
            @test issorted(us)
        end
    end
end
