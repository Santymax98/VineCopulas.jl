# Experimental diagnostic for private vine-fitting execution modes. This is not
# public API and is intentionally excluded from the continuous benchmark suite.
using BenchmarkTools
using Copulas
using Distributions
using LinearAlgebra
using Random
using VineCopulas

BLAS.set_num_threads(1)

const WORKLOADS = ((6, 500, 2), (10, 1_000, 3))
const ENGINES = (
    "cvine" => VineCopulas._fit_cvine_sequential,
    "dvine" => VineCopulas._fit_dvine_sequential,
    "rvine" => VineCopulas._fit_rvine_sequential,
)
const MODES = ("sequential" => false, "threaded" => true)
const SMOKE = get(ENV, "THREADING_BENCHMARK_SMOKE", "false") == "true"
const SAMPLES = SMOKE ? 1 : 3
const EVALS = 1
const SECONDS = 60

function check_equivalence(fit, U, trunc)
    results = [fit(U; trunc=trunc, trace=false, threaded=threaded) for (_, threaded) in MODES]
    reference = first(results)
    for result in Iterators.drop(results, 1)
        truncation(result) == truncation(reference) || error("threading changed truncation")
        isapprox(VineCopulas.loglikelihood(result, U), VineCopulas.loglikelihood(reference, U); rtol=1e-10, atol=1e-10) ||
            error("threading changed fitted-vine loglikelihood")
        sprint(show, result) == sprint(show, reference) || error("threading changed fitted vine structure, family, rotation, or parameters")
    end
end

function benchmark_mode(fit, U, trunc, threaded)
    fit(U; trunc=trunc, trace=false, threaded=threaded) # warm-up
    return run(@benchmarkable($fit($U; trunc=$trunc, trace=false, threaded=$threaded);
        samples=SAMPLES, evals=EVALS, seconds=SECONDS))
end

println("engine,p,n,trunc,threads,mode,median_ns,min_ns,bytes,allocs")
workloads = SMOKE ? (first(WORKLOADS),) : WORKLOADS
engines = SMOKE ? (first(ENGINES),) : ENGINES
for (workload_index, (p, n, trunc)) in enumerate(workloads)
    U = rand(MersenneTwister(7_300 + workload_index), p, n)
    for (engine, fit) in engines
        check_equivalence(fit, U, trunc)
        for (mode, threaded) in MODES
            trial = benchmark_mode(fit, U, trunc, threaded)
            estimate = median(trial)
            fastest = minimum(trial)
            println(join((engine, p, n, trunc, Threads.nthreads(), mode, round(Int, estimate.time), round(Int, fastest.time), estimate.memory, estimate.allocs), ','))
        end
    end
end
