# Threaded fitting benchmark (issue #45).
#
# Times one automatic R-vine fit of a 20-variable, 2263-observation panel with
# the default family set, `trunc=4`, under `threaded=true`, on the threads the
# process was started with, and checks that the fitted log-likelihood equals the
# sequential fit's. Run it once per thread count from the repository root:
#
#     for t in 1 4 8 16; do
#       julia -t $t --project=benchmarks benchmarks/fitting/threaded_fit.jl mle
#     done
#     julia -t 1 --project=benchmarks benchmarks/fitting/threaded_fit.jl itau
#
# The panel is a Student-t copula (5 degrees of freedom) with a three-factor
# correlation matrix of uneven strength, the shape of a daily-returns panel. It
# is generated from a fixed seed, so every run fits the same data.

using Random
using LinearAlgebra
using Distributions: fit, loglikelihood
using Copulas
using VineCopulas

BLAS.set_num_threads(1)

method = Symbol(get(ARGS, 1, "mle"))
p, n, trunc = 20, 2263, 4

rng = MersenneTwister(2263)
A = randn(rng, p, 3) .* [1.2 0.6 0.3]
Σ = A * A' + 0.8 * I
d = sqrt.(diag(Σ))
Σ = Matrix(Symmetric(Σ ./ (d * d')))
U = rand(rng, TCopula(5, Σ), n)

# Warm-up on a slice, so compilation is excluded from the timing.
fit(RVineCopula, U[1:4, 1:200]; trunc=2, pair_method=method, threaded=true)
fit(RVineCopula, U[1:4, 1:200]; trunc=2, pair_method=method)

t_thr = @elapsed vc_thr = fit(RVineCopula, U; trunc=trunc, pair_method=method, threaded=true)
ll_thr = loglikelihood(vc_thr, U)
println("threads=", Threads.nthreads(), " method=", method, " threaded=true  seconds=", round(t_thr; digits=1), " loglik=", ll_thr)

if Threads.nthreads() == 1
    t_seq = @elapsed vc_seq = fit(RVineCopula, U; trunc=trunc, pair_method=method)
    ll_seq = loglikelihood(vc_seq, U)
    println("threads=1 method=", method, " threaded=false seconds=", round(t_seq; digits=1), " loglik=", ll_seq)
    ll_seq == ll_thr || error("threaded and sequential fits differ: $ll_thr vs $ll_seq")
end
