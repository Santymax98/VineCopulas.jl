# Benchmarks

The benchmark suite has two jobs: **validate numerical behavior** and **measure runtime**. They are kept separate on purpose. A timing comparison is only meaningful after both implementations have been shown to represent and fit the same model.

VineCopulas.jl uses R [`rvinecopulib`](https://vinecopulib.github.io/rvinecopulib/) as the external reference implementation.

| Goal | Command | Main output |
|---|---|---|
| Correctness | `benchmarks/correctness/run_correctness_gate.sh` | strict PASS/FAIL reports |
| Evaluation speed | `benchmarks/run_main.sh` | timing and numerical summaries |
| Fitting speed | `benchmarks/fitting/run_fit.sh` | compact fitting comparison |

## What is covered?

The correctness gate covers pair-copula primitives, fixed general R-vines, fixed-structure fitting, and automatic Dißmann/Kruskal structure selection. The performance suite separately measures evaluation, transforms, simulation, and fitting.

The standard evaluation battery uses Gaussian, Clayton, Gumbel, and Frank D-vines at ``n=10{,}000``. Student-t is kept in a separate study because its runtime profile is dominated by scalar Student-t CDF and quantile evaluations.

## Reading the results

Timing tables use a plain-language final column such as **Julia 1.56× faster**, **R 1.33× faster**, or **near parity**. The raw ratio is therefore not needed to interpret a table.

All reported timings are local measurements, not hardware-independent performance claims. Generated CSV files contain the detailed values; the documentation keeps only the results needed to understand the current performance profile.

For the exact commands and generated files, see [Reproducing results](@ref).
