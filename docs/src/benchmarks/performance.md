# Performance

Performance is measured only after the corresponding correctness checks pass. Evaluation and fitting are reported separately because they exercise very different parts of the package.

The reference results below were obtained on an Apple Silicon macOS system with Julia 1.12.6, R 4.5.3, and `rvinecopulib` 0.7.3.1.0. They are useful for understanding the current performance profile, not as hardware-independent guarantees.

## Evaluation benchmark

Run the standard battery with:

```bash
bash benchmarks/run_main.sh
```

The current campaign uses ``n=10{,}000`` observations and three D-vine scenarios:

| ``p`` | truncation |
|---:|---:|
| 5 | 4 |
| 10 | 2 |
| 20 | 2 |

### Vectorized log density

| Family | ``p`` | Julia | `rvinecopulib` | Interpretation |
|---|---:|---:|---:|---|
| Gaussian | 5 | 14.0 ms | 21.9 ms | Julia 1.56× faster |
| Gaussian | 10 | 16.8 ms | 33.0 ms | Julia 1.96× faster |
| Gaussian | 20 | 37.9 ms | 72.0 ms | Julia 1.90× faster |
| Clayton | 5 | 13.7 ms | 18.8 ms | Julia 1.38× faster |
| Clayton | 10 | 17.1 ms | 27.6 ms | Julia 1.62× faster |
| Clayton | 20 | 39.3 ms | 61.8 ms | Julia 1.57× faster |
| Gumbel | 5 | 31.0 ms | 30.1 ms | near parity |
| Gumbel | 10 | 38.4 ms | 45.3 ms | Julia 1.18× faster |
| Gumbel | 20 | 85.3 ms | 100.1 ms | Julia 1.17× faster |
| Frank | 5 | 20.8 ms | 15.6 ms | R 1.33× faster |
| Frank | 10 | 24.0 ms | 21.9 ms | R 1.10× faster |
| Frank | 20 | 54.8 ms | 49.0 ms | R 1.12× faster |

Gaussian and Clayton are consistently faster in this battery. Gumbel is close to parity, while Frank log density is modestly faster in `rvinecopulib`.

### Transforms and simulation

The transform profile is family-dependent:

| Family | Rosenblatt | Inverse Rosenblatt | Simulation |
|---|---|---|---|
| Gaussian | parity to Julia 1.36× faster | Julia 1.09–1.41× faster | Julia 1.07–1.44× faster |
| Clayton | Julia 1.08–1.45× faster | R 1.86–2.04× faster | R 1.88–2.06× faster |
| Gumbel | parity to R 1.38× faster | R 1.60–1.82× faster | R 1.62–1.84× faster |
| Frank | R 1.14–1.56× faster | Julia 8.92–11.98× faster | Julia 8.94–11.84× faster |

This makes the current optimization targets clear: Clayton/Gumbel inverse h-function paths remain slower, while Frank inversion and simulation are particularly strong.

### Numerical checks used with the timing battery

The evaluation runner also records numerical diagnostics. In the current campaign:

- worst log-density maximum absolute difference: ``4.64\times10^{-10}``;
- worst `inverse_rosenblatt(rosenblatt(U))` maximum absolute error: ``9.06\times10^{-11}``;
- worst `rosenblatt(inverse_rosenblatt(Z))` maximum absolute error: ``1.29\times10^{-10}``;
- largest numerical CDF QMC absolute difference: ``8.6\times10^{-3}``.

CDF is estimated numerically, so its QMC discrepancy is not interpreted as an exact identity check. The strict cross-library correctness gate, rather than the timing battery, is the authority for release correctness.

## Fitting benchmark

Fitting is currently the main performance gap. The benchmark uses ``n=1000``, ``p=5``, three timed repetitions after warm-up, and one thread on the R side.

### Common model space

| Task | Julia | `rvinecopulib` | Interpretation |
|---|---:|---:|---|
| Gaussian pair selection | 0.466 s | 0.137 s | R 3.40× faster |
| Clayton pair selection | 0.448 s | 0.121 s | R 3.71× faster |
| Fixed-structure R-vine | 4.419 s | 1.399 s | R 3.16× faster |
| Automatic R-vine | 4.413 s | 1.334 s | R 3.31× faster |

### Default model space

| Task | Julia | `rvinecopulib` | Interpretation |
|---|---:|---:|---|
| Gaussian pair selection | 1.545 s | 0.213 s | R 7.25× faster |
| Clayton pair selection | 1.554 s | 0.184 s | R 8.45× faster |
| Fixed-structure R-vine | 14.740 s | 2.186 s | R 6.74× faster |
| Automatic R-vine | 14.791 s | 2.133 s | R 6.93× faster |

The broader default family set substantially increases fitting cost in both implementations, but the increase is larger in VineCopulas.jl. This is therefore a performance target rather than a correctness issue: the corresponding ``N=800`` common and default correctness gates both pass.

The fixed and automatic rows should not be subtracted to estimate the cost of tree selection. They are end-to-end timings of two fitting paths, and small differences can be dominated by optimizer behavior and timing variability.

## Student-t

Student-t is kept outside the standard table:

```bash
bash benchmarks/tcopula_study/run_t_study.sh
```

The v0.1.1 reference run predates fused pair kernels. In that implementation, an active D-/R-vine edge evaluated density, `hfunc1`, and `hfunc2` independently, requiring six base ``t_ν`` quantiles where two are sufficient. The fused Student pair step reuses those two quantiles for all three outputs.

The focused study reports both the independent and fused patterns, allocation counts, several degrees of freedom, and tail-heavy inputs. For Float32/Float64 inputs the Student hot path also uses direct Rmath `qt`/`pt` calls, while StatsFuns remains the legacy/comparison implementation and the fallback for nonstandard `Real` wrappers. This removes the allocation-heavy incomplete-beta inverse from ordinary vine evaluation without introducing an approximation.

A post-optimization Apple-Silicon/Julia-1.12.6 run reduced Student D-vine vectorized log-density from the pre-fusion `38.8/1192.6/3059 ms` reference values to about `11.5/142.9/473.9 ms` for `(p,trunc)=(2,1),(5,4),(20,2)`. Against the same `rvinecopulib` benchmark this leaves gaps of about `5.1×`, `2.55×`, and `2.59×`, respectively. The multi-tree cases therefore closed most of the previous 17–21× gap while preserving max absolute log-density agreement at roughly `1e-10` or better. End-to-end Student D-vine log-density now uses only 11 Julia allocations in all three cases; the remaining runtime is dominated by scalar Student CDF/quantile work rather than vine-engine allocation. Re-run the focused study and the correctness gate on the target machine before treating these machine-specific numbers as release benchmarks.
