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
| Nonparametric pair-copulas | Not part of stable v0.1 | Yes |
| Discrete variables | Not part of stable v0.1 | Supported in rvinecopulib |
| Extensibility with `Copulas.jl` | Main design goal | Not the goal |
| Bayesian/probabilistic Julia workflows | Natural future direction | External to the package |

The honest positioning is therefore:

- use `rvinecopulib` when you need a mature production-ready fitting and selection workflow today;
- use `VineCopulas.jl` when you want explicit native Julia vine objects, direct integration with `Copulas.jl`, transparent conditional primitives, and a research-friendly base for future Julia workflows.

No speed superiority is claimed for `VineCopulas.jl` v0.1. Benchmarking against C++ belongs to a later performance milestone.
