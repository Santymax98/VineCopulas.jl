using VineCopulas
using BenchmarkTools
using StatsFuns
using Statistics

const DFS = (1.25, 2, 4, 10, 30, 80.0)
const PROBS = (1e-6, 1e-3, 0.5, 1 - 1e-3, 1 - 1e-6)

function report(label, trial)
    est = median(trial)
    println(
        rpad(label, 28),
        lpad(round(est.time; digits=1), 12), " ns   ",
        lpad(est.memory, 8), " bytes   ",
        lpad(est.allocs, 5), " allocs",
    )
end

println("Core Student-t scalar functions")
println("Representative degrees of freedom and central/tail probabilities")
println()

for ν in DFS
    println("ν=$ν")
    for p in PROBS
        x = StatsFuns.tdistinvcdf(Float64(ν), p)
        report("StatsFuns invcdf p=$(p)", @benchmark StatsFuns.tdistinvcdf($(Float64(ν)), $p) samples=100 evals=1)
        report("VineCopulas _t_quantile", @benchmark VineCopulas._t_quantile($(Val(ν)), $p) samples=100 evals=1)
        report("StatsFuns cdf", @benchmark StatsFuns.tdistcdf($(Float64(ν)), $x) samples=100 evals=1)
        report("VineCopulas _t_cdf", @benchmark VineCopulas._t_cdf($(Val(ν)), $x) samples=100 evals=1)
    end
    println()
end
