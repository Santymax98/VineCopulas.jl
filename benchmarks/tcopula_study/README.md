# Student-t copula study

`TCopula` is kept out of the default benchmark battery because its numerical
values are correct, but its performance is currently dominated by scalar
Student-t CDF/quantile evaluations.

Run the focused study from the package root:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

This runs:

1. scalar diagnostics for `StatsFuns.tdistcdf`, `StatsFuns.tdistpdf`,
   `StatsFuns.tdistinvcdf`, `VineCopulas._t_quantile`, and `VineCopulas._t_cdf`;
2. primitive pair-copula benchmarks for `_pair_logpdf`, `hfunc1`, `hfunc2`,
   `hinv1`, and `hinv2`;
3. Julia vs `rvinecopulib` benchmarks and numerical validation for selected
   Student-t D-vines.

The validation CSV reports absolute and relative errors for `logpdf`,
Rosenblatt transforms, inverse Rosenblatt transforms, numerical CDF values,
and internal consistency checks.


## Current local reference numbers

The uploaded benchmark run produced the following vectorized log-density results:

| p | trunc | Julia median | rvinecopulib median | rvinecopulib faster by | Julia memory | Julia allocations |
|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1 | 38.8 ms | 2.2 ms | 17.6× | 17.7 MiB | 119,257 |
| 5 | 4 | 1192.6 ms | 55.9 ms | 21.3× | 519.3 MiB | 3,560,275 |
| 20 | 2 | 3059.0 ms | 182.0 ms | 16.8× | 1355.4 MiB | 9,307,335 |

Log-density validation against `rvinecopulib` remained tight:

| p | trunc | logpdf max abs. | logpdf mean abs. |
|---:|---:|---:|---:|
| 2 | 1 | 5.17e-13 | 1.79e-15 |
| 5 | 4 | 1.30e-10 | 2.58e-14 |
| 20 | 2 | 3.39e-11 | 4.20e-14 |

These results justify keeping `TCopula` outside the default benchmark route while preserving it as a correctness-validated family.
