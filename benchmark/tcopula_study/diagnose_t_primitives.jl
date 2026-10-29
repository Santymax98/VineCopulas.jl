using BenchmarkTools
using Copulas
using Random
using Statistics
using VineCopulas

const DFS = (1.25, 2, 4, 10, 30, 80.0)
const M = parse(Int, get(ENV, "M", "10000"))
const SAMPLES = parse(Int, get(ENV, "SAMPLES", "10"))

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

function loop_hinv1(C, q, v)
    s = 0.0
    @inbounds for i in eachindex(q, v)
        s += hinv1(C, q[i], v[i])
    end
    return s
end

function loop_independent_step(C, u, v, buf)
    s = 0.0
    @inbounds for i in eachindex(u, v)
        logc = VineCopulas._pair_logpdf(C, u[i], v[i], buf)
        h1 = hfunc1(C, u[i], v[i])
        h2 = hfunc2(C, u[i], v[i])
        s += logc + h1 + h2
    end
    return s
end

function loop_fused_step(C, u, v, buf)
    s = 0.0
    @inbounds for i in eachindex(u, v)
        logc, h1, h2 = VineCopulas._pair_step(C, u[i], v[i], buf)
        s += logc + h1 + h2
    end
    return s
end

function report(label, trial)
    est = median(trial)
    println(
        rpad(label, 24),
        "median=", lpad(round(est.time / 1e6; digits=3), 9), " ms",
        "  memory=", lpad(round(est.memory / 1024^2; digits=3), 9), " MiB",
        "  allocs=", est.allocs,
    )
    return est
end

rng = MersenneTwister(123)
u_random = rand(rng, M)
v_random = rand(rng, M)
q_random = rand(rng, M)
tail_grid = (1e-6, 1e-3, 0.02, 0.5, 0.98, 1 - 1e-3, 1 - 1e-6)
u_tail = [tail_grid[mod1(i, length(tail_grid))] for i in 1:M]
v_tail = [tail_grid[mod1(3 * i + 1, length(tail_grid))] for i in 1:M]
q_tail = [tail_grid[mod1(5 * i + 2, length(tail_grid))] for i in 1:M]
buf = Vector{Float64}(undef, 2)

println("TCopula primitive benchmark")
println("m=$M, samples=$SAMPLES")
println("Fused density+h1+h2 uses 2 base t_ν quantiles per pair instead of 6.")
println()

for ν in DFS
    C = TCopula(ν, [1.0 0.35; 0.35 1.0])
    println("ν=$ν — central/random inputs")
    report("_pair_logpdf", @benchmark loop_logpdf($C, $u_random, $v_random, $buf) samples=SAMPLES evals=1)
    report("hfunc1", @benchmark loop_hfunc1($C, $u_random, $v_random) samples=SAMPLES evals=1)
    report("hinv1", @benchmark loop_hinv1($C, $q_random, $v_random) samples=SAMPLES evals=1)
    old = report("independent triplet", @benchmark loop_independent_step($C, $u_random, $v_random, $buf) samples=SAMPLES evals=1)
    new = report("fused _pair_step", @benchmark loop_fused_step($C, $u_random, $v_random, $buf) samples=SAMPLES evals=1)
    println("  triplet speedup: ", round(old.time / new.time; digits=2), "x")

    println("ν=$ν — tail-heavy inputs")
    report("hfunc1 tails", @benchmark loop_hfunc1($C, $u_tail, $v_tail) samples=SAMPLES evals=1)
    report("hinv1 tails", @benchmark loop_hinv1($C, $q_tail, $v_tail) samples=SAMPLES evals=1)
    oldtail = report("independent tails", @benchmark loop_independent_step($C, $u_tail, $v_tail, $buf) samples=SAMPLES evals=1)
    newtail = report("fused tails", @benchmark loop_fused_step($C, $u_tail, $v_tail, $buf) samples=SAMPLES evals=1)
    println("  tail triplet speedup: ", round(oldtail.time / newtail.time; digits=2), "x")
    println()
end
