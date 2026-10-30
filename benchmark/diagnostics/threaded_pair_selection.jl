using BenchmarkTools
using Copulas
using Distributions
using LinearAlgebra
using Random
using VineCopulas

BLAS.set_num_threads(1)

const SEED = 5_418
const SAMPLE_SIZES = (500, 2_000)
const TRUTHS = (
    "gaussian" => GaussianCopula([1.0 0.55; 0.55 1.0]),
    "student" => TCopula(4.0, [1.0 0.55; 0.55 1.0]),
    "clayton" => ClaytonCopula(2, 2.0),
)

# Pair selection is expensive enough that five independent samples with one
# evaluation each produce useful medians without turning this diagnostic into
# a long benchmark campaign. The samples are generated before timing.
const SAMPLES = 5
const EVALS = 1
const SECONDS = 30

function trial(U, threaded)
    select_paircopula(U; threaded=threaded) # warm compilation and both paths
    return run(@benchmarkable(select_paircopula($U; threaded=$threaded); samples=SAMPLES, evals=EVALS, seconds=SECONDS))
end

nanoseconds(x) = round(Int, x)

println("truth,n,threads,sequential_median_ns,threaded_median_ns,speedup,sequential_min_ns,threaded_min_ns,sequential_bytes,threaded_bytes,sequential_allocs,threaded_allocs")
for (truth_index, (label, C)) in enumerate(TRUTHS), n in SAMPLE_SIZES
    rng = MersenneTwister(SEED + 100truth_index + n)
    U = rand(rng, C, n)
    sequential = trial(U, false)
    threaded = trial(U, true)
    seq_median = median(sequential)
    threaded_median = median(threaded)
    seq_minimum = minimum(sequential)
    threaded_minimum = minimum(threaded)
    println(join((
        label,
        n,
        Threads.nthreads(),
        nanoseconds(seq_median.time),
        nanoseconds(threaded_median.time),
        round(seq_median.time / threaded_median.time; digits=3),
        nanoseconds(seq_minimum.time),
        nanoseconds(threaded_minimum.time),
        seq_median.memory,
        threaded_median.memory,
        seq_median.allocs,
        threaded_median.allocs,
    ), ','))
end
