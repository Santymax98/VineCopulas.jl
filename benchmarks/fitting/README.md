# Fitting benchmarks

This folder measures fitting and selection speed. Correctness is handled separately by `benchmarks/correctness/`.

Run the two model spaces from the repository root:

```bash
MODE=common N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh

MODE=default N=1000 P=5 REPEATS=3 \
  bash benchmarks/fitting/run_fit.sh
```

`common` uses Gaussian, Student-t, Clayton, Gumbel, Frank, and Joe with AIC. `default` uses the package default family set, includes independence and BB families, and uses BIC.

Each run contains four tasks:

- Gaussian pair-family selection;
- Clayton pair-family selection;
- fixed-structure R-vine fitting on a shared D-vine structure;
- automatic R-vine fitting including tree selection.

The R reference remains intentionally small: read the shared data, call `bicop()` or `vinecop()`, record elapsed time, and write one CSV file.

Generated reports are written to:

```text
benchmarks/reports/fitting_benchmark_common.md
benchmarks/reports/fitting_benchmark_default.md
```

Do not interpret a timing result as a correctness result. Promote timings to the public documentation only after the corresponding correctness gate passes.
