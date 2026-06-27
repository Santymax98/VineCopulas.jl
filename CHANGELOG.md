# Changelog

All notable changes to `VineCopulas.jl` will be documented in this file.

The format follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers follow Julia package registration conventions.

## [0.1.0] - unreleased

### Added

- Native Julia C-vine, D-vine, and R-vine copula types.
- `Distributions.jl` integration for `pdf`, `logpdf`, `cdf`, `rand`, and `insupport`.
- Rosenblatt and inverse Rosenblatt transforms.
- Truncated C-vine and D-vine support.
- R-vine matrix exchange helpers.
- Pair-copula conditional primitives `hfunc1`, `hfunc2`, `hinv1`, and `hinv2`.
- Support for elliptical, Archimedean, BB, survival/rotated, and bivariate extreme-value pair-copulas from `Copulas.jl`.
- Stable conditional inverses for several Archimedean and extreme-value families.
- Modular test suite based on `TestItems.jl`.

### Known limitations

- No automatic pair-copula estimation yet.
- No automatic family, truncation, or vine-structure selection yet.
- General truncated R-vine Rosenblatt traversal is not part of the stable v0.1 scope.
- Performance work such as allocation-free kernels and multithreading is deferred to later releases.
