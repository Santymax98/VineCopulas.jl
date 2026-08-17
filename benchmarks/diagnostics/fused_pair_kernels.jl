using BenchmarkTools
using Copulas
using VineCopulas

const U = 0.37
const V = 0.72
const BUF = Vector{Float64}(undef, 2)

const CASES = (
    "gaussian" => GaussianCopula([1.0 0.35; 0.35 1.0]),
    "student"  => TCopula(4, [1.0 0.35; 0.35 1.0]),
    "clayton"  => ClaytonCopula(2, 1.5),
    "frank"    => FrankCopula(2, 2.5),
    "gumbel"   => GumbelCopula(2, 1.3),
)

# This deliberately reproduces the pre-#10 traversal pattern.  It remains a
# useful baseline after the fused methods land because it forces three separate
# primitive calls on the same edge/observation.
@inline function independent_step(C, u, v, buf)
    return (
        VineCopulas._pair_logpdf(C, u, v, buf),
        hfunc1(C, u, v),
        hfunc2(C, u, v),
    )
end

function report(label, trial)
    est = BenchmarkTools.median(trial)
    println(
        rpad(label, 20),
        lpad(round(est.time; digits=1), 12), " ns   ",
        lpad(est.memory, 8), " bytes   ",
        lpad(est.allocs, 5), " allocs",
    )
    return est
end

println("Fused pair-kernel diagnostic")
println("u=$U, v=$V")
println("Gaussian/Student density+h1+h2: base quantile calls 6 -> 2 by construction.")
println()

for (name, C) in CASES
    println(name)
    old = report("independent primitives", @benchmark independent_step($C, $U, $V, $BUF))
    new = report("_pair_step", @benchmark VineCopulas._pair_step($C, $U, $V, $BUF))
    println("  median speedup: ", round(old.time / new.time; digits=2), "x")
    println()
end
