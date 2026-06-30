# Comparison with rvinecopulib / vinecopulib

`rvinecopulib` is the R interface to `vinecopulib`, a header-only C++ library for vine copula models. It is a mature statistical modeling package with high-performance algorithms, parameter estimation, model selection, simulation, visualization, and support for nonparametric and multi-parameter families.

`VineCopulas.jl` has a different first goal: provide a native Julia construction and evaluation core that composes pair-copulas from `Copulas.jl`.

| Feature | `VineCopulas.jl` v0.1 | `rvinecopulib` / `vinecopulib` |
|---|---|---|
| Language | Julia | C++ core, R interface, Python interface |
| Main scope | Explicit construction, evaluation, simulation, transforms | Full statistical modeling workflow |
| C-vines / D-vines | Yes | Yes |
| R-vines | Partial/experimental | Mature |
| Density and simulation | Yes | Yes |
| h-functions and inverse h-functions | Yes, via Julia API | Yes |
| Automatic pair-copula fitting | Not yet | Yes |
| Automatic family selection | Not yet | Yes |
| Automatic structure selection | Not yet | Yes |
| Automatic truncation selection | Not yet | Yes |
| Nonparametric pair-copulas | Not part of stable v0.1 | Yes, including `tll` |
| Discrete variables | Not part of stable v0.1 | Supported in rvinecopulib |
| Extensibility with `Copulas.jl` | Main design goal | Not the goal |
| Bayesian/probabilistic Julia workflows | Natural future direction | External to the package |

The honest positioning is therefore:

- use `rvinecopulib` when you need a mature production-ready fitting and selection workflow today;
- use `VineCopulas.jl` when you want explicit native Julia vine objects, direct integration with `Copulas.jl`, transparent conditional primitives, and a research-friendly base for future Julia workflows.

No broad speed superiority is claimed for `VineCopulas.jl` v0.1. The package now includes local benchmarking scripts under `benchmarks/` for comparable explicit C-vine/D-vine operations. These scripts intentionally avoid fitting, family selection and structure selection, because those workflows are not yet implemented in `VineCopulas.jl`.

The overlapping parametric families targeted by the local benchmark scripts are independence, Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7 and BB8. Nonparametric `tll` is outside the stable v0.1 scope.

## Local benchmark results

A reproducible local benchmark summary is available in [Benchmarks and numerical validation](benchmarks.md). The main results are:

- Gaussian D-vines are currently faster in `VineCopulas.jl` for vectorized log-density in the tested scenarios.
- Clayton and Gumbel D-vines are competitive for log-density, especially in larger truncated vines.
- Frank D-vines are numerically validated but still slightly slower in log-density.
- Student-t D-vines are numerically validated but substantially slower because the current implementation is dominated by scalar Student-t CDF/quantile evaluations.

The benchmark suite compares explicit operations only: density/log-density, Rosenblatt transforms, inverse Rosenblatt transforms, simulation and numerical CDF evaluation. It does not compare fitting, selection, model search or nonparametric estimation, because those workflows are outside the stable v0.1 scope of `VineCopulas.jl`.

