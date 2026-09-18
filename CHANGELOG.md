# Changelog

All notable changes to `VineCopulas.jl` are documented here. Version numbers follow Julia package registration conventions.

## [Unreleased]

### Added

- Exact conditional simulation through the vine's own sampling recursion: `rand`, `rand!`, `simulate_qmc`, `inverse_rosenblatt`, and `inverse_rosenblatt!` accept `fixed=(js, Ujs)` to hold the coordinates `js` at known uniforms and draw the remaining coordinates from their conditional law, at the cost of an unconditional draw.
- `admits_conditioning(vine, js)`, the structure predicate that says when that draw is exact: `js` at either end of a D-vine path, the first roots of a C-vine, or the tail of a standard R-vine's order. A draw whose predicate is `false` refuses with an `ArgumentError` that names the fit-side fix.
- `fit(RVineCopula, U; sampling_tail=js)` peels the selected trees so that `js` sits at the end of the order whenever the trees allow it, without changing the trees or the pair copulas.
- Four built-in tree criteria beside `:tau` and `:rho`, each the absolute value of a documented statistic: `tree_criterion=:hoeffd` (Hoeffding's `D`, Hollander & Wolfe form scaled by 30), `:mcor` (the maximum correlation coefficient by the ACE algorithm of Breiman & Friedman, with vinecopulib's smoother and tolerances), `:joe` (Joe's Gaussian-copula mutual information `-log(1 - r²)/2` on normal scores, unbounded), and `:cxi` (Chatterjee's coefficient, symmetrised by the larger direction). The manual states the estimator, the range and the reference of each.
- `tree_criterion` accepts a function `(u_a, u_b, a, b, D) -> Real` on every vine engine. It is called once per candidate edge `(a, b | D)` with the two conditional pseudo-observation vectors and the labels, and its value, used as is, is the edge weight in structure selection. A value that is not a finite `Real` is an `ArgumentError` naming the edge.
- `fit(RVineCopula, U; groups=g)`, an optional structural prior on the first tree: with `g` a vector of one group id per variable, tree 1 is the maximum spanning tree, under the same criterion, among the spanning trees in which every group induces a connected subtree. One Kruskal pass with the key `(is cross-group, -weight, labels)` computes it exactly; the manual states the optimisation problem, proves the decomposition into a maximum spanning tree per group plus one on the quotient graph of the groups, and cites the clustered-tree and vine literature. Higher trees are unchanged; `groups = ones(Int, p)` is the unconstrained fit exactly; `structure` and `groups` are refused together. `benchmarks/fitting/grouped_tree1.jl` reports the tree-1 objective and log-likelihood gaps on block-structured data.

### Fixed

- The Clayton pair kernels for `θ > 0` work in log space: `hinv1`/`hinv2` collapsed to the clamp floor once `q·ϕ⁽¹⁾(ϕ⁻¹(v))` underflowed and returned `NaN` once `v^(-θ)` overflowed, and the h-functions and density saturated at the same overflow, so a conditioning argument below about `1e-108` (θ = 2) gave a wrong or non-finite conditional. Every representable argument now gives a finite one.

### Changed

- Standard general R-vines truncated below full depth support Rosenblatt/inverse Rosenblatt transforms, `rand`, `simulate_qmc`, and the simulation-based numerical `cdf`. The execution-plan transforms introduced in 0.1.2 already honoured the truncation depth; the guard that refused them, the legacy matrix traversal it protected, and the documentation that stated the limitation are removed. A test checks a truncated standard R-vine against the same edges padded to full depth with independence pair-copulas.
- `threshold` is compared with the tree criterion's value on the criterion's own scale, and its admissible range follows the criterion: `[0, 1]` for `:tau`, `:rho`, `:hoeffd`, `:mcor` and `:cxi`, `[0, ∞)` for `:joe`, any finite value for a function. The mechanism is unchanged: an edge whose weight is below the threshold gets an independence pair-copula.
## [0.1.2] - 2026-08-16

### Added

- Fused pair-copula kernels combining density and conditional-function evaluation for vine traversals.
- Specialized fused kernels for Gaussian, Student-t, Clayton, Frank, Gumbel, rotated/survival, independent, and extreme-value pair copulas.
- Reproducible diagnostics for fused pair kernels and vine-engine allocations.
- Dynamic GitHub star count and package-install shortcut in the documentation navigation bar.

### Changed

- Generic pair-copula conditional evaluation now falls back through the public `Copulas.condition` interface.
- C-vine and D-vine engines reuse work buffers instead of allocating intermediate arrays at each tree level.
- Vine traversals use fused kernels and function barriers to reduce dispatch overhead and allocations.
- General R-vine evaluation uses a precomputed internal execution plan.
- Float32 and Float64 Student-t conditional primitives use `Rmath` for faster scalar CDF and quantile evaluation.
- Restored the VitePress documentation landing page and refreshed the navigation bar.
- Expanded compatibility to QuasiMonteCarlo 0.4 and Roots 3 while retaining previous supported versions.

### Performance

- Representative fused pair kernels are roughly 1.8×–2.4× faster with zero scalar allocations.
- C-vine and D-vine evaluation substantially reduces allocations through reusable work buffers.
- Student-t vine evaluation shows substantial end-to-end speedups while preserving numerical agreement with `rvinecopulib`.

## [0.1.1] - 2026-08-16

### Added

- Pair-copula parameter fitting and automatic family/rotation selection with log-likelihood, AIC, and BIC criteria.
- Sequential fitting for fixed C-vine, D-vine, and standard R-vine structures.
- Automatic C-vine and D-vine ordering and Dissmann-style R-vine structure selection with deterministic maximum-spanning trees.
- Fitted `CopulaModel` metadata for selected family, rotation, criterion, parameters, convergence information, and structure diagnostics.
- Selection-specific parameter domains aligned with `vinecopulib` for the default family set while preserving the broader public domains provided by `Copulas.jl`.
- A staged correctness gate against R `rvinecopulib` covering pair primitives, general R-vine evaluation, fixed-structure fitting, and automatic structure/family selection.
- Separate, reproducible evaluation and fitting performance benchmarks.

### Changed

- Reorganized the fitting implementation into a small shared entry point plus focused pair, C/D-vine, and R-vine files.
- Strengthened general R-vine validation and traversal for branching, relabeled, nonidentity-order, and truncated structures.
- Documentation reorganized around Guide, Bestiary, Fitting & Selection, Benchmarks, and Developer sections.
- `Optim.jl` is now a direct dependency of the fitting layer instead of being reached through another package's internals.

### Fixed

- Negative-parameter bivariate Clayton density and conditional evaluation now respect finite support.
- Joe conditional inversion is robust in extreme upper-tail Float64 regimes.
- Weak-dependence Clayton and Gumbel selection no longer collapses spuriously to the independence boundary.
- Bivariate Gaussian selection now maximizes the Gaussian copula likelihood directly, preventing finite-sample family-selection discrepancies caused by the normal-score correlation shortcut.
- Student-t selection uses the same finite degrees-of-freedom search domain as the external `vinecopulib` reference.
- Default BB-family selection uses finite, family-specific candidate boxes to avoid invalid/non-finite optimizer excursions.

### Known limitations

- Truncation depth is user-controlled; automatic data-driven truncation selection is not implemented yet.
- Fitting is sequential rather than a joint full-vine maximum-likelihood optimization.
- Standard general R-vines truncated below full depth support fitting and density evaluation, but Rosenblatt/inverse Rosenblatt transforms, simulation, and the simulation-based numerical CDF currently require full depth.
- Observation weights, missing/discrete-data fitting, nonparametric pair-copula selection, and parallel edge fitting are not yet part of the public fitting API.

## [0.1.0] - 2026-06-27

### Added

- Native Julia C-vine, D-vine, and R-vine copula types.
- `Distributions.jl` integration for `pdf`, `logpdf`, `cdf`, `rand`, and `insupport`.
- Rosenblatt and inverse Rosenblatt transforms.
- Truncated C-vine and D-vine support.
- R-vine matrix exchange helpers.
- Pair-copula conditional primitives `hfunc1`, `hfunc2`, `hinv1`, and `hinv2`.
- Performance-oriented pair-copula source layout under `src/PairCopulas/`.
- Support for elliptical, Archimedean, BB, survival/rotated, and bivariate extreme-value pair-copulas from `Copulas.jl`.
- Modular test suite based on `TestItems.jl`.
