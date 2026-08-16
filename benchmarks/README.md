# VineCopulas.jl benchmarks

The benchmark suite keeps **correctness** and **speed** separate. Run all commands from the repository root.

## Setup

```bash
julia --project=benchmarks -e '
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
  bash benchmarks/correctness/run_correctness_gate.sh

PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmarks/correctness/run_correctness_gate.sh
```

The gate checks pair primitives, fixed general R-vines, fixed-structure fitting, and automatic Dißmann/Kruskal selection against `rvinecopulib` with strict tolerances.

## Evaluation speed

```bash
bash benchmarks/run_main.sh
```

The standard battery uses Gaussian, Clayton, Gumbel, and Frank D-vines:

```text
p=5,  n=10000, trunc=4
p=10, n=10000, trunc=2
p=20, n=10000, trunc=2
```

`run_main.sh` regenerates the Markdown and CSV summaries under `benchmarks/reports/`. Only cases requested in the current run are included.

Run one case with:

```bash
FAMILY=gaussian MODEL=D P=10 N=10000 TRUNC=2 \
  bash benchmarks/run_one.sh
```

## Fitting speed

```bash
MODE=common N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh

MODE=default N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh
```

Each mode measures pair selection, fixed-structure R-vine fitting, and automatic R-vine fitting.

## Student-t study

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

Student-t remains separate because its current bottleneck is different from the standard one-parameter family paths.

## Outputs

Raw data and logs are local artifacts. The compact reports intended for review live under:

```text
benchmarks/reports/
```

See the documentation under **Benchmarks** for interpretation and reproducibility notes.
