include("julia_helpers.jl")

using BenchmarkTools
using Distributions: logpdf, cdf
using Random
using Statistics
using Printf

const FAMILY = env_string("FAMILY", "gaussian")
const MODEL = env_string("MODEL", "D")
const p = env_int("P", 5)
const n = env_int("N", 10_000)
const trunc = env_int("TRUNC", p - 1)
const samples = env_int("SAMPLES", 20)
const cdf_points = env_int("CDF_POINTS", 25)
const cdf_n = env_int("CDF_N", 10_000)
const include_cdf = env_bool("INCLUDE_CDF", true)
const randomized_cdf = env_bool("RANDOMIZED_CDF", false)

vine = make_vine(MODEL, FAMILY, p, trunc)
rng = MersenneTwister(2026)
U = rand(rng, vine, n)
Z = rosenblatt(vine, U)
Ucdf = U[:, 1:min(cdf_points, n)]

function summarize_trial(name::AbstractString, trial)
    times_s = trial.times ./ 1e9
    r = (
        operation=name,
        min_s=minimum(times_s),
        median_s=median(times_s),
        max_s=maximum(times_s),
        memory_mib=trial.memory / 1024^2,
        allocs=trial.allocs,
    )
    @printf("%-24s min = %.8f s | median = %.8f s | max = %.8f s | memory = %.3f MiB | allocs = %d\n",
            r.operation, r.min_s, r.median_s, r.max_s, r.memory_mib, r.allocs)
    return r
end

println("VineCopulas.jl benchmark")
println("family      = ", FAMILY)
println("model       = ", MODEL)
println("p           = ", p)
println("n           = ", n)
println("trunc       = ", trunc)
println("samples     = ", samples)
println("cdf_points  = ", cdf_points)
println("cdf_n       = ", cdf_n)
println("cdf_qmc_rand= ", randomized_cdf)
println("edge type   = ", maybe_edge_eltype(vine))
println()

results = NamedTuple[]
push!(results, summarize_trial("logpdf vector", @benchmark logpdf($vine, $U) samples=samples evals=1))
push!(results, summarize_trial("loglikelihood sum", @benchmark sum(logpdf($vine, $U)) samples=samples evals=1))
push!(results, summarize_trial("rosenblatt", @benchmark rosenblatt($vine, $U) samples=samples evals=1))
push!(results, summarize_trial("inverse_rosenblatt", @benchmark inverse_rosenblatt($vine, $Z) samples=samples evals=1))
push!(results, summarize_trial("rand", @benchmark rand(rng2, $vine, $n) setup=(rng2 = MersenneTwister(2026)) samples=samples evals=1))
if include_cdf
    push!(results, summarize_trial("cdf qmc matrix", @benchmark cdf($vine, $Ucdf; N=$cdf_n, randomized=$randomized_cdf) samples=samples evals=1))
end

outpath = "benchmarks/results/bench_julia_$(MODEL)_$(FAMILY)_p$(p)_n$(n)_trunc$(trunc).csv"
write_rows(outpath,
    ("operation", "min_s", "median_s", "max_s", "memory_mib", "allocs"),
    ((r.operation, r.min_s, r.median_s, r.max_s, r.memory_mib, r.allocs) for r in results)
)
println("\nSaved: ", outpath)
