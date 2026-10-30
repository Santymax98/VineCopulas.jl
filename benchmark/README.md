# VineCopulas.jl benchmarks

The canonical Julia-only suite is `benchmark/benchmarks.jl`: it defines a
small `BenchmarkTools.SUITE` used by Tachometer to compare pull requests with
their merge base. It covers representative evaluation, sampling, transforms,
fitting, selection, and indicator-CDF paths. The larger campaigns below remain
manual diagnostics; they are not part of continuous PR timing.

The threading diagnostics `diagnostics/threaded_pair_selection.jl` and
`diagnostics/threaded_vine_fitting.jl` reproduce representative local studies.
Candidate selection observed about 1.9×, 3.0× and 3.6× speedups at 2, 4 and 8
Julia threads; edge-threaded vines observed about 1.8×, 2.9× and 3.5× median
speedups. These are workload observations, not guarantees.

Run all commands from the repository root.

## Continuous BenchmarkTools suite

```bash
julia --project=benchmark -e '
using Pkg
Pkg.develop(path=".")
Pkg.instantiate()
include("benchmark/benchmarks.jl")
using BenchmarkTools
run(SUITE; verbose=true)
'
```

Tachometer runs the same definitions on pull requests that change source or
benchmark files. It is intentionally Julia-only; `rvinecopulib` parity stays
in the manual correctness campaign.

## Setup

```bash
julia --project=benchmark -e '
using Pkg
Pkg.develop(path=".")
Pkg.resolve()
Pkg.instantiate()
'

Rscript -e 'install.packages("rvinecopulib", repos="https://cloud.r-project.org")'
```

## Correctness

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmark/correctness/run_correctness_gate.sh

PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmark/correctness/run_correctness_gate.sh
```

The gate checks pair primitives, fixed general R-vines, fixed-structure fitting, and automatic Dißmann/Kruskal selection against `rvinecopulib` with strict tolerances.

## Evaluation speed

```bash
bash benchmark/run_main.sh
```

The standard battery uses Gaussian, Clayton, Gumbel, and Frank D-vines:

```text
p=5,  n=10000, trunc=4
p=10, n=10000, trunc=2
p=20, n=10000, trunc=2
```

`run_main.sh` regenerates the Markdown and CSV summaries under `benchmark/reports/`. Only cases requested in the current run are included.

Run one case with:

```bash
FAMILY=gaussian MODEL=D P=10 N=10000 TRUNC=2 \
  bash benchmark/run_one.sh
```

## Fitting speed

```bash
MODE=common N=1000 P=5 REPEATS=3 \
  bash benchmark/fitting/run_fit.sh

MODE=default N=1000 P=5 REPEATS=3 \
  bash benchmark/fitting/run_fit.sh
```

Each mode measures pair selection, fixed-structure R-vine fitting, and automatic R-vine fitting.

## Focused engine diagnostics

```bash
julia --project=benchmark benchmark/diagnostics/condition_fallback.jl
julia --project=benchmark benchmark/diagnostics/fused_pair_kernels.jl
julia --project=benchmark benchmark/diagnostics/vine_engine_allocations.jl
```

These isolate the pair-copula boundary with `Copulas.condition`, fused pair-kernel speedups, and C-/D-/R-vine allocation behavior from the larger benchmark campaign.

For a quick local smoke run:

```bash
SMOKE=1 julia --project=benchmark benchmark/diagnostics/condition_fallback.jl
```

The default `MATRIX=core` keeps the run focused on FGM, Gaussian, Student, Clayton, Frank, Gumbel, and Joe. Set `MATRIX=full` to include BB and extreme-value families, `FAMILIES=gaussian,student,clayton` to narrow the matrix, `SAMPLES=20` to increase measurement stability, or `OUT=benchmark/reports/condition_fallback.csv` to persist the results.

## Student-t study

```bash
bash benchmark/tcopula_study/run_t_study.sh
```

Student-t remains separate because the patch changes both traversal reuse and its Float32/Float64 scalar backend. The hot path uses direct Rmath `qt`/`pt`; the diagnostics compare those calls with StatsFuns across several degrees of freedom and tail-heavy probabilities.

## Outputs

Raw data and logs are local artifacts. The compact reports intended for review live under:

```text
benchmark/reports/
```

See the documentation under **Benchmarks** for interpretation and reproducibility notes.
