# AIC and BIC Comparison

This example compares two manually specified vines on the same data. In real
workflows, the compared models might come from different structures, truncation
levels, or candidate family sets.

```@example model-comparison-example
using VineCopulas
using Distributions: fit
using Random

truth = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula(2, 0.55), ClaytonCopula(2, 1.5)],
     [FrankCopula(2, 2.0)]],
)

U = rand(MersenneTwister(44), truth, 250)

candidate_a = fit(DVineCopula, U; order=[1, 2, 3], family_set=:default)
candidate_b = fit(DVineCopula, U; order=[1, 3, 2], family_set=:default)

(
    aic_a = aic(candidate_a, U),
    aic_b = aic(candidate_b, U),
    bic_a = bic(candidate_a, U),
    bic_b = bic(candidate_b, U),
)
```

Smaller AIC/BIC is preferred for the corresponding criterion.

!!! warning
    AIC and BIC are model-selection scores for a fitted candidate on a fixed
    dataset. They are not a guarantee that sequential vine fitting found a
    global full-vine optimum.
