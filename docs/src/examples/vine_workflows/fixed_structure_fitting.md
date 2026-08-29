# Fixed-structure Fitting

When the vine structure is known from domain knowledge or from a previous model,
pass it explicitly and let the package estimate/select the pair-copulas on that
structure.

```@example fixed-structure-example
using VineCopulas
using Distributions: fit
using Random

ord = [3, 1, 4, 2]
S = ([1, 4, 2], [4, 2], [2])
st = RVineStructure(ord, S; trunc=3)

truth = RVineCopula(
    st,
    [
        [GaussianCopula(2, 0.4), ClaytonCopula(2, 1.5), FrankCopula(2, 2.0)],
        [GaussianCopula(2, 0.3), ClaytonCopula(2, 1.2)],
        [FrankCopula(2, 1.2)],
    ],
)

U = rand(MersenneTwister(31), truth, 250)

fit_fixed = fit(RVineCopula, U; structure=st, family_set=:default)

(order = order(fit_fixed),
 truncation = truncation(fit_fixed),
 same_order = order(fit_fixed) == order(truth))
```

The structure is fixed, but the pair-copula families are still selected from the
candidate set:

```@example fixed-structure-example
map(level -> map(typeof, level), edges(fit_fixed))
```

Use an explicit vine constructor instead of `fit` when both structure and
pair-copulas should be fixed.
