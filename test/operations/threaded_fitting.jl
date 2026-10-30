@testitem "Fit API - threaded fitting agrees with sequential fitting" tags=[:Fit, :Threading] setup=[M] begin
    using Test, Distributions, Copulas, VineCopulas, StableRNGs

    rng = StableRNG(541)
    R = [1.0 0.55 0.30; 0.55 1.0 0.45; 0.30 0.45 1.0]
    U = rand(rng, GaussianCopula(R), 180)
    fams = (GaussianCopula, TCopula, ClaytonCopula)
    w = [isodd(i) ? 0.5 : 1.5 for i in axes(U, 2)]

    for weights in (nothing, w)
        a = VineCopulas._select_pair(U[1:2, :]; family_set=fams, weights=weights)
        b = VineCopulas._select_pair(U[1:2, :]; family_set=fams, weights=weights, threaded=true)
        @test (a.family, a.rotation, a.method, a.theta) == (b.family, b.rotation, b.method, b.theta)
        @test a.loglik == b.loglik
        @test a.score == b.score
    end
    @test_throws ArgumentError select_paircopula(U[1:2, :]; family_set=(String,), strict=true, threaded=true)
    trace_path, trace_io = mktemp()
    try
        redirect_stdout(trace_io) do
            select_paircopula(U[1:2, :]; family_set=fams, trace=true, threaded=true)
        end
    finally
        close(trace_io)
    end
    @test occursin("pair candidate:", read(trace_path, String))
    rm(trace_path)

    for VT in (CVineCopula, DVineCopula, RVineCopula)
        a = fit(VT, U; trunc=2, family_set=(GaussianCopula,), allow_rotations=false, weights=w)
        b = fit(VT, U; trunc=2, family_set=(GaussianCopula,), allow_rotations=false, weights=w, threaded=true)
        @test VineCopulas.loglikelihood(a, U) ≈ VineCopulas.loglikelihood(b, U)
    end

    automatic = fit(RVineCopula, U; trunc=2, family_set=(GaussianCopula,), allow_rotations=false)
    fixed_kwargs = (; structure=automatic.structure, trunc=2, family_set=(GaussianCopula,), allow_rotations=false, weights=w)
    fixed = fit(RVineCopula, U; fixed_kwargs...)
    threaded_fixed = fit(RVineCopula, U; fixed_kwargs..., threaded=true)
    repeated_fixed = fit(RVineCopula, U; fixed_kwargs..., threaded=true)
    @test VineCopulas.loglikelihood(fixed, U) ≈ VineCopulas.loglikelihood(threaded_fixed, U)
    @test VineCopulas.loglikelihood(threaded_fixed, U) ≈ VineCopulas.loglikelihood(repeated_fixed, U)

    a = fit(DVineCopula, U; trunc=:mbicv, max_trunc=2, family_set=(GaussianCopula,), allow_rotations=false, weights=w)
    b = fit(DVineCopula, U; trunc=:mbicv, max_trunc=2, family_set=(GaussianCopula,), allow_rotations=false, weights=w, threaded=true)
    @test truncation(a) == truncation(b)

    M0 = fit(VineModel, DVineCopula, U; trunc=2, family_set=(GaussianCopula,), allow_rotations=false, threaded=true)
    @test !haskey(M0.recipe.kwargs, :threaded)
end
