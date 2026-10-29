using BenchmarkTools
using Copulas
using Distributions
using LinearAlgebra
using Random
using VineCopulas

# Continuous benchmarks are deliberately small and Julia-only. Larger R parity
# campaigns and allocation investigations remain under benchmark/correctness
# and benchmark/diagnostics.
BenchmarkTools.DEFAULT_PARAMETERS.seconds = 1
BLAS.set_num_threads(1)

const SEED = 73
const SUITE = BenchmarkGroup()

function bench_sampling(C, n)
    @benchmarkable rand(rng, $C, $n) setup=(rng=MersenneTwister(SEED)) evals=1
end

bench_logpdf(C, U) = @benchmarkable logpdf($C, $U) evals=1
bench_rosenblatt(C, U) = @benchmarkable rosenblatt($C, $U) evals=1
bench_inverse_rosenblatt(C, Z) = @benchmarkable inverse_rosenblatt($C, $Z) evals=1

function bench_pair_selection(U)
    work = () -> select_paircopula(U; family_set=(GaussianCopula, TCopula, ClaytonCopula, FrankCopula),
                                   allow_rotations=false, strict=true)
    @benchmarkable $work() evals=1
end

function bench_fixed_fit(U, S)
    work = () -> fit(RVineCopula, U; structure=S, family_set=(GaussianCopula, ClaytonCopula), allow_rotations=false)
    @benchmarkable $work() evals=1
end

function bench_automatic_fit(U)
    work = () -> fit(RVineCopula, U; trunc=2, family_set=(GaussianCopula, ClaytonCopula), allow_rotations=false)
    @benchmarkable $work() evals=1
end

function bench_mbicv(U)
    work = () -> fit(DVineCopula, U; trunc=:mbicv, max_trunc=2,
                     family_set=(GaussianCopula, ClaytonCopula), allow_rotations=false)
    @benchmarkable $work() evals=1
end

function bench_cdf(C, u)
    @benchmarkable cdf($C, $u; N=256, randomized=false) evals=1
end

const pair = GaussianCopula([1.0 0.55; 0.55 1.0])
const cvine = CVineCopula([1, 2, 3], [[pair, pair], [pair]])
const dvine = DVineCopula([1, 2, 3], [[pair, pair], [pair]])
const rvine = RVineCopula([1, 2, 3], [[2, 3], [2]], [[pair, pair], [pair]])
const rng = MersenneTwister(SEED)
const U3 = rand(rng, rvine, 500)
const Z3 = rosenblatt(rvine, U3)
const U2 = rand(rng, TCopula(4.0, [1.0 0.5; 0.5 1.0]), 500)
const Ufit = rand(rng, rvine, 160)

SUITE["evaluation"] = BenchmarkGroup()
SUITE["sampling"] = BenchmarkGroup()
SUITE["transforms"] = BenchmarkGroup()
SUITE["fitting"] = BenchmarkGroup()
SUITE["selection"] = BenchmarkGroup()
SUITE["probability"] = BenchmarkGroup()

SUITE["evaluation"]["cvine_logpdf"] = bench_logpdf(cvine, U3)
SUITE["evaluation"]["dvine_logpdf"] = bench_logpdf(dvine, U3)
SUITE["evaluation"]["rvine_logpdf"] = bench_logpdf(rvine, U3)
SUITE["sampling"]["rvine_rand"] = bench_sampling(rvine, 500)
SUITE["transforms"]["rvine_rosenblatt"] = bench_rosenblatt(rvine, U3)
SUITE["transforms"]["rvine_inverse_rosenblatt"] = bench_inverse_rosenblatt(rvine, Z3)
SUITE["fitting"]["fixed_rvine"] = bench_fixed_fit(Ufit, structure(rvine))
SUITE["fitting"]["automatic_rvine"] = bench_automatic_fit(Ufit)
SUITE["selection"]["pair_family"] = bench_pair_selection(U2)
SUITE["selection"]["student_mle"] = @benchmarkable fit(TCopula, $U2; method=:mle) evals=1
SUITE["selection"]["mbicv_truncation"] = bench_mbicv(Ufit)
# Keep this indicator-CDF entry as the stable baseline for a future reduced
# conditional RQMC algorithm; do not add a reduced implementation here.
SUITE["probability"]["cdf_indicator"] = bench_cdf(rvine, [0.6, 0.6, 0.6])
