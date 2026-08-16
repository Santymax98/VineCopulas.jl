using BenchmarkTools
using Copulas
using VineCopulas

const U = 0.37
const V = 0.72
const Q = 0.41

const CASES = (
    "FGM (generic fallback)" => FGMCopula(2, 0.6),
    "Gaussian (specialized)" => GaussianCopula([1.0 0.6; 0.6 1.0]),
    "Clayton (specialized)" => ClaytonCopula(2, 2.0),
    "Frank (specialized)" => FrankCopula(2, 3.0),
)

function report(label, trial)
    est = BenchmarkTools.median(trial)

    println(
        rpad(label, 12),
        lpad(round(est.time; digits=1), 10), " ns   ",
        lpad(est.memory, 6), " bytes   ",
        lpad(est.allocs, 3), " allocs",
    )
end

println("Pair-copula conditional fallback benchmark")
println("u=$U, v=$V, q=$Q")

for (name, C) in CASES
    println("\n", name)

    report("hfunc1", @benchmark hfunc1($C, $U, $V))
    report("hfunc2", @benchmark hfunc2($C, $U, $V))
    report("hinv1",  @benchmark hinv1($C, $Q, $V))
    report("hinv2",  @benchmark hinv2($C, $Q, $U))
end
