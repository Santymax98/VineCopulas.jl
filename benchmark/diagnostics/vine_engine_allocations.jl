using BenchmarkTools
using Copulas
using Distributions: logpdf
using Random
using Statistics
using VineCopulas

const N = parse(Int, get(ENV, "N", "2000"))
const SAMPLES = parse(Int, get(ENV, "SAMPLES", "10"))

pair(f::Symbol) =
    f === :gaussian ? GaussianCopula([1.0 0.35; 0.35 1.0]) :
    f === :student  ? TCopula(4, [1.0 0.35; 0.35 1.0]) :
    f === :clayton  ? ClaytonCopula(2, 1.5) :
    f === :frank    ? FrankCopula(2, 2.5) :
    f === :gumbel   ? GumbelCopula(2, 1.3) :
    error("unsupported family $f")

const MIXED_POOL = (:gaussian, :student, :clayton, :frank, :gumbel)

function edge_levels(p, q, family::Symbol)
    if family === :mixed
        return [
            [pair(MIXED_POOL[mod1(t + e - 1, length(MIXED_POOL))]) for e in 1:(p-t)]
            for t in 1:q
        ]
    end
    C = pair(family)
    return [[C for _ in 1:(p-t)] for t in 1:q]
end

function make_cd(kind::Symbol, p::Int, q::Int, family::Symbol)
    E = edge_levels(p, q, family)
    ord = collect(1:p)
    return kind === :C ? CVineCopula(ord, E; trunc=q) : DVineCopula(ord, E; trunc=q)
end

const R5_ORDER = [1, 3, 2, 4, 5]
const R5_STRUCT = [[2, 2, 4, 5], [3, 4, 5], [4, 5], [5]]
const R7_ORDER = [4, 3, 7, 1, 2, 5, 6]
const R7_STRUCT = [
    [5, 2, 6, 6, 6, 6],
    [6, 6, 1, 2, 5],
    [2, 5, 2, 5],
    [1, 1, 5],
    [3, 7],
    [7],
]

function make_rvine(p::Int, q::Int, family::Symbol)
    ord, Sfull = p == 5 ? (R5_ORDER, R5_STRUCT) :
                 p == 7 ? (R7_ORDER, R7_STRUCT) :
                 error("R diagnostic supports p=5 or p=7")
    E = edge_levels(p, q, family)
    return RVineCopula(ord, Sfull[1:q], E; trunc=q)
end

function report(name, vine, U)
    trial = @benchmark logpdf($vine, $U) samples=SAMPLES evals=1
    est = median(trial)
    println(
        rpad(name, 28),
        " median=", lpad(round(est.time / 1e6; digits=3), 9), " ms",
        "  memory=", lpad(round(est.memory / 1024^2; digits=3), 9), " MiB",
        "  allocs=", est.allocs,
    )
end

rng = MersenneTwister(2026)
println("Vine-engine allocation diagnostic")
println("n=$N, samples=$SAMPLES")
println()

for family in (:gaussian, :student, :clayton, :frank, :gumbel, :mixed)
    for (p, q) in ((5, 4), (20, 2))
        U = rand(rng, p, N)
        report("C $family p=$p q=$q", make_cd(:C, p, q, family), U)
        report("D $family p=$p q=$q", make_cd(:D, p, q, family), U)
    end
    for (p, q) in ((5, 2), (5, 4), (7, 2), (7, 6))
        U = rand(rng, p, N)
        report("R $family p=$p q=$q", make_rvine(p, q, family), U)
    end
    println()
end
