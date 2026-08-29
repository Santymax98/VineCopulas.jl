# Reproducing results

Run benchmark commands from the repository root. Correctness, evaluation speed, and fitting speed have separate entry points so each result can be reproduced without running the entire suite.

## 1. Prepare the environments

Instantiate the Julia benchmark project:

```bash
julia --project=benchmarks -e '
using Pkg
Pkg.develop(path=".")
Pkg.resolve()
Pkg.instantiate()
'
```

Install the R reference dependency once:

```bash
Rscript -e 'install.packages("rvinecopulib", repos="https://cloud.r-project.org")'
```

The fitting and correctness R scripts intentionally contain only the small amount of code needed to call `rvinecopulib` and write reference results.

## 2. Correctness gate

Run both release parity modes:

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmarks/correctness/run_correctness_gate.sh

PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmarks/correctness/run_correctness_gate.sh
```

Human-readable diagnostics are written to:

```text
benchmarks/correctness/results/fixed_report.txt
benchmarks/correctness/results/fit_report.txt
```

Shared deterministic fixtures are versioned with the benchmark harness; generated bridge files and local results are not.

## 3. Evaluation speed

Run the standard evaluation campaign:

```bash
bash benchmarks/run_main.sh
```

The command runs the configured family/scenario battery and regenerates:

```text
benchmarks/reports/benchmark_summary.md
benchmarks/reports/benchmark_times_summary.csv
benchmarks/reports/benchmark_validation_summary.csv
```

Only cases requested by that invocation are summarized, so unrelated files from older local experiments are not included.

For one targeted case:

```bash
FAMILY=gumbel MODEL=D P=10 N=10000 TRUNC=2 \
  bash benchmarks/run_one.sh
```

## 4. Focused kernel and allocation diagnostics

To isolate the optimizations used by the vine engines from the full benchmark battery, run:

```bash
julia --project=benchmarks benchmarks/diagnostics/condition_fallback.jl
julia --project=benchmarks benchmarks/diagnostics/fused_pair_kernels.jl
julia --project=benchmarks benchmarks/diagnostics/vine_engine_allocations.jl
```

The condition fallback diagnostic compares `hfunc1`, `hfunc2`, `hinv1`, and `hinv2` with the canonical `cdf`/`quantile` routes through `Copulas.condition`. The fused-kernel diagnostic compares the historical three-independent-primitive pattern with the fused pair step for Gaussian, Student, Clayton, Frank, and Gumbel. The vine-engine diagnostic reports end-to-end `logpdf` time, memory, and allocations for homogeneous and mixed C-, D-, and standard R-vines over several dimensions and truncation levels. Set `N` and `SAMPLES` in the environment to change its workload.

For a quick smoke run:

```bash
SMOKE=1 julia --project=benchmarks benchmarks/diagnostics/condition_fallback.jl
```

Useful filters include:

```bash
MATRIX=full FAMILIES=gaussian,student,clayton SAMPLES=20 \
  OUT=benchmarks/reports/condition_fallback.csv \
  julia --project=benchmarks benchmarks/diagnostics/condition_fallback.jl
```

The default `MATRIX=core` keeps this diagnostic short; use `MATRIX=full` when characterizing BB and extreme-value paths before changing specializations.

The Student-specific study remains separate because scalar Student-t CDF/quantile calls can dominate even after repeated base quantiles are removed:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

Its diagnostics cover several degrees of freedom, central probabilities, extreme tails, Rmath-versus-StatsFuns scalar kernels, backend round-trip checks plus an exact ν=2 tail check, primitive allocations, and fused versus independent density/h-function evaluation.

## 5. Fitting speed

Run both selector spaces:

```bash
MODE=common N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh

MODE=default N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh
```

Each run benchmarks:

- Gaussian pair-family selection;
- Clayton pair-family selection;
- fixed-structure R-vine fitting;
- automatic R-vine fitting.

The generated reports are:

```text
benchmarks/reports/fitting_benchmark_common.md
benchmarks/reports/fitting_benchmark_default.md
```

## 6. Full speed suite

After correctness has already been established:

```bash
bash benchmarks/run_all.sh
```

## Reproducibility notes

Timing results depend on hardware, Julia/R versions, system load, and compiler state. The scripts warm up the measured operation before recording repetitions and report medians for the fitting battery.

When publishing or comparing benchmark results, record at least:

- operating system and architecture;
- Julia version;
- R version;
- VineCopulas.jl version or commit;
- Copulas.jl version;
- `rvinecopulib` version;
- ``n``, ``p``, truncation level, family set, and number of repetitions.

Generated raw data and logs are local artifacts. The lightweight Markdown/CSV reports under `benchmarks/reports/` are the reviewable outputs intended to accompany the documentation.
