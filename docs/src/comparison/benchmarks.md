# Benchmarks and numerical validation

This page records a local benchmark run comparing explicit D-vine operations in `VineCopulas.jl` against `rvinecopulib`. The goal is not to claim broad speed superiority. The goal is to make the current performance profile reproducible and to separate numerical correctness from implementation speed.

The local logs used for this page report Julia `1.12.0` on `aarch64-apple-darwin14`. Exact hardware was not recorded by the benchmark scripts, so the numbers should be read as a reproducible local reference, not as portable machine-independent constants.

## Reproducing the benchmark

From the package root, instantiate the benchmark environment:

```bash
julia --project=benchmarks -e 'using Pkg; Pkg.develop(path=pwd()); Pkg.instantiate()'
```

Install the R dependencies once:

```r
install.packages(c("rvinecopulib", "bench"))
```

Run the ordinary benchmark battery:

```bash
bash benchmarks/run_main.sh
```

The ordinary route excludes Student-t copulas so that the main table reflects the families whose current implementations are suitable for routine performance comparisons. Student-t is studied separately:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

The benchmark scripts generate raw outputs under `benchmarks/results/`, `benchmarks/reference/`, and `benchmarks/logs/`. These directories are ignored by git. The summarized tables shipped with the documentation are generated from those outputs.

## Main D-vine setup

The ordinary benchmark uses D-vines with `n = 10000` evaluation points and three scenarios:

| Scenario | Meaning |
|---|---|
| `p=5, trunc=4` | full five-dimensional D-vine |
| `p=10, trunc=2` | ten-dimensional truncated D-vine |
| `p=20, trunc=2` | twenty-dimensional truncated D-vine |

For this run, Julia used `SAMPLES=5`, R used `ITERATIONS=5`, CDF comparisons used `CDF_POINTS=10` and `CDF_N=5000`.

## Log-density performance

The table reports median vectorized log-density time. The speed ratio is `rvinecopulib median / Julia median`; values above `1` mean Julia was faster in this local run.

| Family | p | trunc | Julia median | rvinecopulib median | Julia speed ratio |
|---|---:|---:|---:|---:|---:|
| `clayton` | 5 | 4 | 22.1 ms | 18.8 ms | 0.85× |
| `clayton` | 10 | 2 | 25.4 ms | 27.8 ms | 1.09× |
| `clayton` | 20 | 2 | 55.7 ms | 61.9 ms | 1.11× |
| `frank` | 5 | 4 | 20.9 ms | 15.6 ms | 0.74× |
| `frank` | 10 | 2 | 24.0 ms | 21.8 ms | 0.91× |
| `frank` | 20 | 2 | 52.5 ms | 48.8 ms | 0.93× |
| `gaussian` | 5 | 4 | 14.1 ms | 22.2 ms | 1.58× |
| `gaussian` | 10 | 2 | 16.9 ms | 32.6 ms | 1.93× |
| `gaussian` | 20 | 2 | 38.1 ms | 72.5 ms | 1.90× |
| `gumbel` | 5 | 4 | 30.6 ms | 30.3 ms | 0.99× |
| `gumbel` | 10 | 2 | 38.6 ms | 45.3 ms | 1.17× |
| `gumbel` | 20 | 2 | 84.6 ms | 101.4 ms | 1.20× |

Summary:

| Family | Log-density speed ratio range | Interpretation |
|---|---:|---|
| `gaussian` | 1.58×–1.93× | Julia is consistently faster in these scenarios. |
| `clayton` | 0.85×–1.11× | near parity at p=5; Julia is faster for p=10 and p=20. |
| `gumbel` | 0.99×–1.20× | near parity at p=5; Julia is faster for p=10 and p=20. |
| `frank` | 0.74×–0.93× | rvinecopulib is still faster for log-density. |

These results are consistent with the implementation strategy: the Gaussian path has a direct closed-form bivariate density and conditional primitives; Clayton and Gumbel are competitive in larger truncated D-vines; Frank is correct but still has room for log-density optimization.

## Student-t study

Student-t copulas are validated numerically but remain outside the ordinary benchmark route. The current implementation uses direct bivariate t-copula formulas but still depends heavily on scalar Student-t quantile and CDF evaluations. In this local run, that cost dominates runtime and allocation counts.

| p | trunc | Julia median | rvinecopulib median | rvinecopulib faster by | Julia memory | Julia allocations |
|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1 | 38.8 ms | 2.2 ms | 17.6× | 17.7 MiB | 119,257 |
| 5 | 4 | 1192.6 ms | 55.9 ms | 21.3× | 519.3 MiB | 3,560,275 |
| 20 | 2 | 3059.0 ms | 182.0 ms | 16.8× | 1355.4 MiB | 9,307,335 |

The important point is not that `TCopula` is mathematically wrong; it is not. The log-density values agree closely with `rvinecopulib`. The issue is performance of the scalar Student-t numerical primitives in the current implementation.

## Numerical validation

The following table reports log-density agreement against `rvinecopulib` reference values.

| Family | p | trunc | max abs. | mean abs. | max rel. |
|---|---:|---:|---:|---:|---:|
| `clayton` | 5 | 4 | 1.22e-13 | 8.37e-15 | 1.83e-11 |
| `clayton` | 10 | 2 | 8.17e-14 | 8.63e-15 | 3.18e-12 |
| `clayton` | 20 | 2 | 5.12e-13 | 1.62e-14 | 1.22e-12 |
| `frank` | 5 | 4 | 3.94e-12 | 6.26e-15 | 5.45e-11 |
| `frank` | 10 | 2 | 3.87e-11 | 1.15e-14 | 4.94e-10 |
| `frank` | 20 | 2 | 2.12e-10 | 3.98e-14 | 3.98e-10 |
| `gaussian` | 5 | 4 | 3.89e-12 | 4.65e-15 | 1.53e-10 |
| `gaussian` | 10 | 2 | 2.29e-12 | 6.24e-15 | 3.93e-10 |
| `gaussian` | 20 | 2 | 1.41e-11 | 1.22e-14 | 2.68e-11 |
| `gumbel` | 5 | 4 | 4.64e-10 | 6.55e-14 | 1.14e-10 |
| `gumbel` | 10 | 2 | 2.74e-10 | 4.29e-14 | 2.27e-11 |
| `gumbel` | 20 | 2 | 2.43e-10 | 5.41e-14 | 1.95e-11 |
| `t` | 2 | 1 | 5.17e-13 | 1.79e-15 | 8.76e-12 |
| `t` | 5 | 4 | 1.30e-10 | 2.58e-14 | 3.09e-10 |
| `t` | 20 | 2 | 3.39e-11 | 4.20e-14 | 8.02e-09 |

Across the tested families, deterministic log-density agreement is close to floating-point precision for the implemented formulas. The larger direct Rosenblatt differences against `rvinecopulib` are convention/order dependent; they should not be read as density errors. Internal consistency is the relevant transform check:

| Check | Worst max abs. over uploaded benchmark results | Worst mean abs. |
|---|---:|---:|
| `inverse_rosenblatt(rosenblatt(U)) ≈ U` | 9.06e-11 | 2.03e-15 |
| `rosenblatt(inverse_rosenblatt(Z)) ≈ Z` | 1.29e-10 | 2.87e-15 |

The numerical CDF is approximate for general vines. In this run, the largest reported CDF QMC absolute difference was `8.60e-03`. CDF comparisons should therefore be interpreted with Monte Carlo / quasi-Monte Carlo tolerance, not as exact identities.

## Interpretation

- `GaussianCopula` is currently the strongest performance case: Julia is faster than `rvinecopulib` for vectorized log-density in all three tested scenarios.
- `ClaytonCopula` and `GumbelCopula` are competitive for log-density, especially in the `p=10` and `p=20` truncated scenarios.
- `FrankCopula` is validated but remains somewhat slower in log-density.
- `TCopula` is correct and validated, but performance-limited by Student-t CDF/quantile evaluations; it is documented as a separate optimization target.

