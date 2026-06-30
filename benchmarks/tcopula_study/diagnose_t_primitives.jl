using BenchmarkTools
using Random

include(joinpath(@__DIR__, "..", "julia_helpers.jl"))

pc = paircopula("t")

rng = MersenneTwister(123)
m = parse(Int, get(ENV, "M", "100000"))

u = rand(rng, m)
v = rand(rng, m)
q = rand(rng, m)

buf = Vector{Float64}(undef, 2)

function loop_logpdf(C, u, v, buf)
    s = 0.0
    @inbounds for i in eachindex(u, v)
        s += VineCopulas._pair_logpdf(C, u[i], v[i], buf)
    end
    return s
end

function loop_hfunc1(C, u, v)
    s = 0.0
    @inbounds for i in eachindex(u, v)
        s += hfunc1(C, u[i], v[i])
    end
    return s
end

function loop_hfunc2(C, u, v)
    s = 0.0
    @inbounds for i in eachindex(u, v)
        s += hfunc2(C, u[i], v[i])
    end
    return s
end

function loop_hinv1(C, q, v)
    s = 0.0
    @inbounds for i in eachindex(q, v)
        s += hinv1(C, q[i], v[i])
    end
    return s
end

function loop_hinv2(C, q, u)
    s = 0.0
    @inbounds for i in eachindex(q, u)
        s += hinv2(C, q[i], u[i])
    end
    return s
end

println("TCopula primitive benchmark")
println("pc = ", typeof(pc))
println("m  = ", m)
println()

println("_pair_logpdf")
@btime loop_logpdf($pc, $u, $v, $buf)

println("hfunc1")
@btime loop_hfunc1($pc, $u, $v)

println("hfunc2")
@btime loop_hfunc2($pc, $u, $v)

println("hinv1")
@btime loop_hinv1($pc, $q, $v)

println("hinv2")
@btime loop_hinv2($pc, $q, $u)
