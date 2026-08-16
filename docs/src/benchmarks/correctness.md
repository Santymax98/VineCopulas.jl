# Correctness

Correctness is the release gate. `benchmarks/correctness/` compares VineCopulas.jl with `rvinecopulib` using shared deterministic inputs and strict tolerances.

## What is validated?

The gate is sequential:

1. **Pair copulas** — log density, h-functions, and inverse h-functions for Independence, Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7, and BB8, including representative rotations.
2. **Fixed general R-vines** — structure exchange, log density, Rosenblatt transform, and inverse Rosenblatt transform on branching 5D and 7D fixtures.
3. **Fixed-structure fitting** — selected families and rotations, fitted parameters, parameter count, and likelihood while the R-vine structure is held fixed.
4. **Automatic structure selection** — the same quantities after Dißmann-style sequential selection with deterministic Kruskal maximum-spanning trees.

Equivalent R-vine matrices can encode the same conditioned and conditioning sets. Structure parity is therefore checked through represented edges rather than raw matrix equality.

## Release reference

The `v0.1.1` release candidate was checked with ``N=800`` in both supported parity modes.

| Mode | Fit | ``\Delta\ell/n`` | Parameters | Structure | Families | Fitted parameters |
|---|---|---:|---:|---|---|---|
| common | automatic | ``6.29\times10^{-8}`` | 10 / 10 | PASS | PASS | PASS |
| common | fixed | ``7.56\times10^{-8}`` | 11 / 11 | PASS | PASS | PASS |
| default | automatic | ``1.04\times10^{-7}`` | 11 / 11 | PASS | PASS | PASS |
| default | fixed | ``1.30\times10^{-7}`` | 11 / 11 | PASS | PASS | PASS |

The largest raw fitted-parameter difference was approximately ``5.54\times10^{-5}`` in the common fixed-structure run and ``5.91\times10^{-6}`` in the default fixed-structure run. Both complete fitting/selection gates passed without weakening the configured tolerances.

The fixed-model stage also passed for all pair fixtures and both general R-vine fixtures. Representative fixed-vine discrepancies were on the order of ``10^{-12}`` for log density and below ``3\times10^{-10}`` for inverse transforms.

## Common and default model spaces

`common` aligns the primary parametric search space in both engines:

- Gaussian, Student-t, Clayton, Gumbel, Frank, and Joe;
- rotations enabled;
- AIC selection;
- no family preselection;
- independence excluded;
- absolute Kendall's ``\tau`` tree weights;
- Kruskal maximum-spanning trees.

Run it with:

```bash
PARITY_N=800 PARITY_FIT_MODE=common \
  bash benchmarks/correctness/run_correctness_gate.sh
```

`default` exercises the broader package selector: independence plus Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7, and BB8, using BIC.

```bash
PARITY_N=800 PARITY_FIT_MODE=default \
  bash benchmarks/correctness/run_correctness_gate.sh
```

## Selection parameter domains

Some families use finite **selection parameter domains** so that VineCopulas.jl and `rvinecopulib` optimize over the same candidate space. These bounds belong to automatic selection only. They do **not** narrow the mathematical parameter domain available when a copula is constructed and used directly through Copulas.jl.

This distinction is important: vine truncation controls how many trees are retained, while selection parameter domains control only the optimizer's candidate region for a pair family.

## Failure policy

A failure is diagnostic. The gate does not pass by silently dropping a family, changing `strict=true`, or relaxing tolerances. Primitive and traversal failures are resolved before fitting differences are interpreted.
