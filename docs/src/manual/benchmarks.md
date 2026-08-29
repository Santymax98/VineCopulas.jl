# Benchmarks

Benchmarks in `VineCopulas.jl` serve two different purposes:

- correctness gates show that the Julia implementation agrees with an external
  reference on deterministic fixtures;
- performance benchmarks explain where the Julia implementation is fast, where
  it is near parity, and where optimization work remains.

!!! warning "Correctness before timing"
    A faster result is not meaningful until both implementations are known to be
    evaluating or fitting the same model. Read correctness reports before
    interpreting speed tables.

## Correctness against rvinecopulib

The external reference is R `rvinecopulib`, which wraps the C++ `vinecopulib`
library. The correctness gate checks:

- pair-copula log densities, h-functions, and inverse h-functions;
- fixed general R-vine evaluation and transforms;
- fixed-structure fitting;
- automatic Dissmann-style structure selection.

Equivalent R-vine matrices can encode the same conditioned and conditioning
sets, so the gate compares represented edges and numerical behavior rather than
raw matrix text.

Run:

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmarks/correctness/run_correctness_gate.sh

PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmarks/correctness/run_correctness_gate.sh
```

The `v0.1.1` release-candidate gate passed both supported parity modes:

| Mode | Fit | ``\Delta\ell/n`` | Parameters | Structure | Families | Fitted parameters |
|---|---|---:|---:|---|---|---|
| common | automatic | ``6.29\times10^{-8}`` | 10 / 10 | PASS | PASS | PASS |
| common | fixed | ``7.56\times10^{-8}`` | 11 / 11 | PASS | PASS | PASS |
| default | automatic | ``1.04\times10^{-7}`` | 11 / 11 | PASS | PASS | PASS |
| default | fixed | ``1.30\times10^{-7}`` | 11 / 11 | PASS | PASS | PASS |

The fixed-model stage also passed all pair fixtures and both general R-vine
fixtures. Representative fixed-vine discrepancies were around ``10^{-12}`` for
log density and below ``3\times 10^{-10}`` for inverse transforms.

## Performance overview

The standard evaluation battery measures log density, Rosenblatt transform,
inverse Rosenblatt transform, simulation, and numerical CDF behavior. It keeps
evaluation separate from fitting because they stress different parts of the
implementation.

Run:

```bash
bash benchmarks/run_main.sh
```

Fitting benchmarks use a separate entry point:

```bash
bash benchmarks/fitting/run_fit.sh
```

!!! tip
    Use the benchmark reports to choose optimization targets. For example,
    standalone pair primitives and fused vine traversal can have different
    bottlenecks.

The reference evaluation campaign used ``n=10{,}000`` observations on an Apple
Silicon macOS system with Julia 1.12.6, R 4.5.3, and `rvinecopulib` 0.7.3.1.0.
These numbers are machine-specific, but the profile is useful:

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

Gaussian and Clayton are consistently faster in this battery. Gumbel is close
to parity, while Frank log density is modestly faster in `rvinecopulib`.

The fitting benchmark is currently the main performance gap:

| Task | Common model space | Default model space |
|---|---|---|
| Gaussian pair selection | R 3.40× faster | R 7.25× faster |
| Clayton pair selection | R 3.71× faster | R 8.45× faster |
| Fixed-structure R-vine | R 3.16× faster | R 6.74× faster |
| Automatic R-vine | R 3.31× faster | R 6.93× faster |

This is not a correctness issue: the corresponding common and default
correctness gates pass. It is the clearest performance target for future work.

## Generic vs specialized pair conditionals

The architectural question is not simply whether `hfunc1(C, u, v)` is fast. It
is whether the specialized vine spelling still adds value over the canonical
`Copulas.jl` conditioning interface:

```julia
hfunc1(C, u, v)
cdf(condition(C, 2, v), u)

hinv1(C, q, v)
quantile(condition(C, 2, v), q)
```

Focused diagnostics live in:

```bash
julia --project=benchmarks benchmarks/diagnostics/condition_fallback.jl
julia --project=benchmarks benchmarks/diagnostics/fused_pair_kernels.jl
julia --project=benchmarks benchmarks/diagnostics/vine_engine_allocations.jl
```

The goal is to decide which optimized paths remain justified. Generic
compatibility comes first; family-specific or fused methods should be retained
when they are measurably faster, more stable, or avoid important allocations.

## Reproducing results

Instantiate the benchmark environment:

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

Then run the correctness and performance commands above from the repository
root. Generated reports are written under `benchmarks/reports/` and
`benchmarks/correctness/results/`.

!!! note
    Benchmark numbers are local measurements. They are useful for tracking
    regressions and prioritizing engineering work, not as hardware-independent
    guarantees.
