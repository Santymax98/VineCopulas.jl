# Roadmap VineCopulas.jl

## v0.1.0 — Correctness-oriented core

- [x] Native Julia package extending `Copulas.jl`
- [x] `AbstractVineCopula{p} <: Copulas.Copula{p}`
- [x] C-vine, D-vine and R-vine data structures
- [x] `logpdf`, `pdf`, `rand`, numerical `cdf`
- [x] Rosenblatt and inverse Rosenblatt transforms
- [x] ASCII and Unicode h-functions
- [x] SurvivalCopula conditionals
- [x] Smooth and singular bivariate extreme-value conditionals
- [x] Stable specialized inverses for Clayton, AMH, Gumbel, Joe, Frank, Gumbel–Barnett, inverse Gaussian and BB1–BB10
- [x] Tests for dimensions 5 and 10 and truncations 1 and 2
- [x] Lossless package-native R-vine matrix exchange

## v0.1.x — Complete conditional layer

- [x] specialized `_inv_ϕ¹` for BB1–BB10
- [x] broad boundary and `BigFloat` tests for the BB families
- [x] common analytic Pickands h-functions for smooth bivariate extreme-value copulas
- [x] generalized conditional quantiles for singular extreme-value copulas
- [x] unconstrained logit-coordinate solver for smooth extreme-value inverses
- [ ] add stable direct Pickands factors for tEV and asymmetric tails where beneficial
- [ ] broaden extreme-value parameter sweeps, AD coverage and vine integration
- [ ] add explicit tested support for empirical extreme-value tails

## v0.2.0 — Pair-copula estimation

- [ ] `fit_paircopula`
- [ ] parameter estimation with domain-safe transforms
- [ ] family selection by log-likelihood, AIC and BIC
- [ ] rotations and survival-family selection

## v0.3.0 — Fixed-structure vine fitting

- [ ] sequential estimation for fixed C-/D-/R-vine structures
- [ ] parameter and family selection per edge
- [ ] truncation-aware fitting

## v0.4.0 — Structure selection

- [ ] maximum spanning tree selection
- [ ] Dissmann-type structure selection
- [ ] Kendall-tau weights
- [ ] data-driven truncation selection

## v0.5.0 — Performance release

- [ ] preallocated workspaces
- [ ] allocation-free `logpdf!`
- [ ] generic element types where practical
- [ ] multithreading
- [ ] benchmarks against `rvinecopulib`

## v1.0.0 — Stable API

- [ ] stable constructors and matrix convention
- [ ] validated general R-vine traversal
- [ ] full documentation and examples
- [ ] compatibility examples with `SklarDist`, `Turing.jl` and data workflows
