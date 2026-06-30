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

@testitem "Gaussian pair primitives are allocation-free in scalar loops" tags=[:PairCopula, :Performance] setup=[M] begin
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

    local_sum(pc, u, v, buf) # warm-up
    @test @allocated(local_sum(pc, u, v, buf)) == 0
end
