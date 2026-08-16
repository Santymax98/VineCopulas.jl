# Changelog

All notable changes to `VineCopulas.jl` are documented here. Version numbers follow Julia package registration conventions.

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
