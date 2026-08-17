# Student-t copula study

`TCopula` is kept out of the default benchmark battery because its numerical
values are correctness-validated and its remaining performance profile is
diagnosed at the scalar Student-t CDF/quantile level. Vine density traversal
now uses fused pair kernels so density and conditional CDFs share the two base
`t_ν` quantiles for each edge/observation.

Run the focused study from the package root:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

This runs:

1. scalar diagnostics for `StatsFuns.tdistcdf` and `StatsFuns.tdistinvcdf`
   across several degrees of freedom and central/tail probabilities;
2. primitive pair-copula benchmarks for density, conditionals, inverse
   conditionals, and the independent-versus-fused density+h1+h2 path;
3. Julia vs `rvinecopulib` benchmarks and numerical validation for selected
   Student-t D-vines.

The validation CSV reports absolute and relative errors for `logpdf`,
Rosenblatt transforms, inverse Rosenblatt transforms, numerical CDF values,
and internal consistency checks.


## Pre-fusion v0.1.1 reference numbers

The following vectorized log-density results were recorded before the fused
pair-kernel and work-buffer changes. They are retained as a historical baseline,
not as post-optimization measurements:

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

These pre-fusion measurements are retained for historical comparison.

## Post-optimization local reference

On Apple Silicon with Julia 1.12.6, the fused-kernel/Rmath path produced:

| p | trunc | Julia median | rvinecopulib median | remaining gap | speedup vs pre-fusion | Julia memory | Julia allocations |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 | 1 | 11.515 ms | 2.24 ms | 5.14× | 3.37× | 0.391 MiB | 11 |
| 5 | 4 | 142.884 ms | 56.0 ms | 2.55× | 8.35× | 0.860 MiB | 11 |
| 20 | 2 | 473.946 ms | 183 ms | 2.59× | 6.45× | 3.141 MiB | 11 |

Relative to the pre-fusion run, log-density runtime fell by roughly 70–88%, while the previous per-observation Student allocation explosion disappeared: each of these end-to-end D-vine evaluations now performs only 11 Julia allocations. The full-density gap therefore fell from roughly 17–21× to about 2.6× for the multi-tree cases. The p=2 case remains wider because it contains only a density edge and cannot benefit from density+h-function fusion.

The scalar/primitive diagnostics also show why the remaining gap is now mostly below the vine traversal layer. `_pair_step` is allocation-free, and for representative ν values its density+h1+h2 path is generally about 2.4–2.6× faster than evaluating the three primitives independently (ν=2 is a smaller 1.28× special case). Direct Rmath `qt`/`pt` calls remove the large StatsFuns tail/incomplete-beta overhead for ordinary Float32/Float64 evaluation, but scalar Student CDF/quantile work still dominates wall time.

Log-density parity with `rvinecopulib` remained tight after the optimization: maximum absolute errors were approximately `5.2e-13`, `1.3e-10`, and `3.4e-11` for the three cases above. The performance harness also prints raw Rosenblatt arrays, but those rows should not be treated as a transform-parity gate because that harness does not normalize the cross-library transform convention; use `benchmarks/correctness/` for direct Rosenblatt/inverse-Rosenblatt parity checks.

### What fusion removes

For an edge that needs density plus both h-functions, the old independent path
performed six base `t_ν` quantile evaluations (two in each primitive). The fused
`_pair_step` performs two base quantiles and reuses them, while still requiring
two conditional `t_{ν+1}` CDF calls. The Float32/Float64 hot path now calls Rmath `pt`/`qt` directly, avoiding the
allocation-heavy generic incomplete-beta inversion previously reached through
`StatsFuns.tdistinvcdf`. The diagnostics retain StatsFuns as the legacy/comparison backend. Central-range
quantiles and ordinary CDF values are cross-checked against StatsFuns; extreme
tails use a backend round trip plus an exact ν=2 inverse-CDF identity instead of
treating either numerical inverse as an oracle. No approximation is introduced
by either optimization.
