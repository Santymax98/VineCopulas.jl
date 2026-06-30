# VineCopulas.jl benchmarks

This folder contains local performance benchmarks and numerical validation
against `rvinecopulib`. Benchmarks are intentionally separate from the package
unit tests and are not required for registration.

Generated outputs are ignored by git:

```text
benchmarks/results/
benchmarks/reference/
benchmarks/logs/
```

## Setup

From the package root:

```bash
julia --project=benchmarks -e 'using Pkg; Pkg.develop(path=pwd()); Pkg.instantiate()'
```

In R, install the required packages once:

```r
install.packages(c("rvinecopulib", "bench"))
```

## Clean main route

Run the main benchmark/validation battery for the families currently suitable
for the ordinary performance table:

```bash
bash benchmarks/run_main.sh
```

Default families:

```text
gaussian, clayton, gumbel, frank
```

Default scenarios:

```text
p=5,  n=10000, trunc=4
p=10, n=10000, trunc=2
p=20, n=10000, trunc=2
```

This route runs both timings and value validation. Validation CSVs include
absolute and relative errors for `logpdf`, Rosenblatt transforms, inverse
Rosenblatt transforms, numerical CDF values, and internal consistency checks.

## Generic single run

```bash
FAMILY=gaussian MODEL=D P=5 N=10000 TRUNC=4 bash benchmarks/run_one.sh
```

`run_one.sh` performs:

1. Julia performance benchmark;
2. R/`rvinecopulib` performance benchmark;
3. R reference value generation;
4. Julia numerical validation against the R reference.

## Student-t study route

Student-t is correct and validated, but currently performance-limited by scalar
Student-t CDF/quantile evaluations. It is studied separately:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

See `benchmarks/tcopula_study/README.md` for details.

## Other diagnostics

A bivariate Rosenblatt convention diagnostic is available after generating R
reference values:

```bash
FAMILY=gaussian MODEL=D P=2 N=10000 TRUNC=1 Rscript benchmarks/r_reference.R
FAMILY=gaussian MODEL=D P=2 N=10000 TRUNC=1 julia --project=benchmarks benchmarks/diagnostics/diagnose_rosenblatt_p2.jl
```



## Versioned summary reports

Raw benchmark outputs are generated locally and ignored by git. The repository keeps lightweight summary files under `benchmarks/reports/`:

```text
benchmarks/reports/benchmark_summary.md
benchmarks/reports/benchmark_times_summary.csv
benchmarks/reports/benchmark_validation_summary.csv
```

These summaries were generated from one local run and are used by the documentation page `docs/src/comparison/benchmarks.md`. Re-run the benchmark scripts to refresh them after performance-related changes.

## Environment variables

| Variable | Default | Meaning |
|---|---:|---|
| `MODEL` | `D` | `D` or `C` |
| `FAMILY` | `gaussian` | `gaussian`, `t`, `clayton`, `gumbel`, `frank`, `joe`, `bb1`, `bb6`, `bb7`, `bb8`, `mixed` |
| `P` | `5` | Dimension |
| `N` | `10000` | Number of evaluation/simulation points |
| `TRUNC` | `P-1` | Truncation level |
| `SAMPLES` | `20` in `run_one`, `5` in `run_main` | Julia BenchmarkTools samples |
| `ITERATIONS` | `20` in `run_one`, `5` in `run_main` | R bench iterations |
| `INCLUDE_CDF` | `true` | Include numerical CDF benchmark |
| `CDF_POINTS` | `25` in `run_one`, `10` in `run_main` | Number of points where CDF is evaluated |
| `CDF_N` | `10000` in `run_one`, `5000` in `run_main` | QMC/MC sample size for CDF approximation |
| `RUN_VALIDATION` | `true` | Run value validation against R |

## Deterministic vs approximate comparisons

Deterministic comparisons:

- `logpdf`;
- internal `inverse_rosenblatt(rosenblatt(U))` consistency;
- internal `rosenblatt(inverse_rosenblatt(Z))` consistency.

Convention-sensitive comparisons:

- Rosenblatt and inverse Rosenblatt values against `rvinecopulib`.

The bivariate diagnostic under `benchmarks/diagnostics/` helps identify whether
a mismatch is a convention/order difference rather than a density error.

Approximate comparison:

- `cdf`.

For general vine copulas, the CDF is evaluated numerically. Therefore CDF
comparisons should be interpreted with numerical tolerance, not as exact equality.
