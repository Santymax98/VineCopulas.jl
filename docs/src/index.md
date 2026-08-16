# VineCopulas.jl

`VineCopulas.jl` is a native Julia package for building, fitting, selecting, evaluating, and simulating C-vine, D-vine, and regular-vine copula models on top of `Copulas.jl`.

The package follows the `Distributions.jl`/`Copulas.jl` ecosystem: explicit vine models are copulas, pair copulas come from `Copulas.jl`, and fitting is exposed through `fit`.

## What is available

- C-vine, D-vine, and general R-vine models.
- `pdf`, `logpdf`, `rand`, numerical `cdf`, Rosenblatt, and inverse Rosenblatt transforms.
- Pair-copula fitting with family and rotation selection.
- Sequential fitting for fixed vine structures.
- Automatic C-vine and D-vine ordering.
- Dissmann-style R-vine structure selection with maximum spanning trees.
- AIC, BIC, log-likelihood, Kendall-``\tau``, and Spearman-``\rho`` controls.
- Truncated vine evaluation and user-controlled fitting truncation.
- External correctness checks against `rvinecopulib` and reproducible performance benchmarks.

## Quick example

```julia
using VineCopulas
using Distributions
using Random

rng = MersenneTwister(42)
truth = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.4)],
     [FrankCopula(2, 2.0)]],
)

U = rand(rng, truth, 1_000)

fitted = fit(
    DVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    allow_rotations=true,
)

loglikelihood(fitted, U)
maximum(abs.(inverse_rosenblatt(fitted, rosenblatt(fitted, U)) .- U))
```

Matrices are interpreted as `p × n`: rows are variables and columns are observations.

## Documentation map

The site has six top-level sections:

- **Home** — this overview, quick example, and citation.
- **Guide** — installation, first models, simulation, examples, compatibility, and conventions.
- **Bestiary** — supported vine structures and pair-copula families.
- **Fitting & Selection** — pair fitting, vine fitting, structure selection, and parameter-domain controls.
- **Benchmarks** — correctness and speed comparisons against `rvinecopulib`.
- **Developer** — architecture, API, testing, upstream follow-ups, and the roadmap.

The version selector in the documentation provides the development site, the latest stable release, and retained tagged versions.

## Citation

If you use `VineCopulas.jl`, please cite the package metadata in `CITATION.cff`:

```bibtex
@software{jimenez_vinecopulas,
  author  = {Santiago Jimenez and contributors},
  title   = {VineCopulas.jl},
  url     = {https://github.com/Santymax98/VineCopulas.jl},
  version = {0.1.1},
  year    = {2026}
}
```
