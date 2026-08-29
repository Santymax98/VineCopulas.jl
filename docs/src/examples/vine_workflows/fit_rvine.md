# Fit an R-vine from Data

This example starts with copula-scale data and lets `VineCopulas.jl` select an
R-vine structure and pair families.

```@example fit-rvine-example
using VineCopulas
using Distributions: fit
using Random

truth = DVineCopula(
    [1, 2, 3, 4],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.4), FrankCopula(2, 2.2)],
     [GumbelCopula(2, 1.25), JoeCopula(2, 1.3)]];
    trunc=2,
)

U = rand(MersenneTwister(2026), truth, 250)
fit_rvine = fit(RVineCopula, U; trunc=2, family_set=:default)

(order = order(fit_rvine),
 truncation = truncation(fit_rvine),
 pairs = sum(length, edges(fit_rvine)))
```

Inspect the selected pair-copula types:

```@example fit-rvine-example
map(level -> map(typeof, level), edges(fit_rvine))
```

The exact selected families can change with the sample and selection settings.
The important workflow is stable: fit the model, inspect its structure, and then
evaluate it like any other copula.

```@example fit-rvine-example
loglikelihood(fit_rvine, U)
```
