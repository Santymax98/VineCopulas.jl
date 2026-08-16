@testitem "Concrete pair-copula edge types are preserved" tags=[:Vines, :Performance] setup=[M] begin
    pc = M.gaussian_pair(0.35)
    E = [[pc for _ in 1:(5-k)] for k in 1:4]

    dv = DVineCopula(collect(1:5), E)
    cv = CVineCopula(collect(1:5), E)
    rv = RVineCopula(collect(1:5), [[2, 3, 4, 5], [2, 3, 4], [2, 3], [2]], E)

    @test eltype(edges(dv)[1]) <: GaussianCopula
    @test eltype(edges(cv)[1]) <: GaussianCopula
    @test eltype(edges(rv)[1]) <: GaussianCopula
    @test !(eltype(edges(dv)[1]) === Copulas.Copula{2})
end

@testitem "Tuple edge levels preserve mixed family positions" tags=[:Vines, :Performance] setup=[M] begin
    g = M.gaussian_pair(0.35)
    c = M.clayton_pair(1.5)
    f = M.frank_pair(2.5)
    E = ((g, c), (f,))
    dv = DVineCopula([1, 2, 3], E)

    @test edges(dv) === E
    @test edges(dv)[1][1] isa GaussianCopula
    @test edges(dv)[1][2] isa ClaytonCopula
    @test edges(dv)[2][1] isa FrankCopula
end

@testitem "Mixed vector edge levels preserve C/D density semantics" tags=[:Vines, :Performance, :MixedFamily] setup=[M] begin
    using Test
    using Distributions

    g = M.gaussian_pair(0.35)
    c = M.clayton_pair(1.5)
    f = M.frank_pair(2.5)
    Etuple = ((g, c), (f,))
    Evector = [collect(Etuple[1]), collect(Etuple[2])]
    U = [0.21 0.47 0.82; 0.36 0.61 0.73; 0.57 0.29 0.68]

    for ctor in (CVineCopula, DVineCopula)
        tuple_vine = ctor([1, 2, 3], Etuple)
        vector_vine = ctor([1, 2, 3], Evector)
        @test logpdf(vector_vine, U) ≈ logpdf(tuple_vine, U) atol=2e-12 rtol=2e-12
    end
end

@testitem "Gaussian pair primitives have negligible scalar-loop allocations" tags=[:PairCopula, :Performance] setup=[M] begin
    pc = M.gaussian_pair(0.35)
    u = range(0.05, 0.95; length=100)
    v = range(0.95, 0.05; length=100)
    buf = Vector{Float64}(undef, 2)

    function local_sum(C, u, v, buf)
        s = 0.0
        @inbounds for i in eachindex(u, v)
            s += VineCopulas._pair_logpdf(C, u[i], v[i], buf)
            s += hfunc1(C, u[i], v[i])
            s += hfunc2(C, u[i], v[i])
            s += hinv1(C, u[i], v[i])
            s += hinv2(C, u[i], v[i])
        end
        return s
    end

    # Warm-up before measuring allocations. Some Julia/CI combinations may
    # report a tiny runtime allocation even for effectively allocation-free
    # scalar loops, so we test for negligible allocation rather than exactly 0.
    local_sum(pc, u, v, buf)

    bytes = @allocated local_sum(pc, u, v, buf)

    @test bytes <= 64
    @test @inferred(local_sum(pc, u, v, buf)) isa Float64
end
