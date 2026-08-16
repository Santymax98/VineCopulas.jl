# Fitting and selection

`VineCopulas.jl` uses sequential vine estimation. Pair copulas are fitted one edge at a time, their h-functions create conditional pseudo-observations, and the next tree is fitted from those transformed data.

The same public `fit` interface covers pair copulas and vine models.

## Pair copula

```julia
pair = fit(
    PairCopula,
    U2;
    family_set=:default,
    selection_criterion=:bic,
    allow_rotations=true,
)
```

## Fixed vine

```julia
model = fit(
    RVineCopula,
    U;
    structure=st,
    family_set=:default,
)
```

## Automatic R-vine

```julia
model = fit(
    RVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    tree_criterion=:tau,
    tree_algorithm=:kruskal,
)
```

Use `fit(CopulaModel, ...)` when fitting metadata are needed. Quick fits return the fitted copula directly.

The current layer performs sequential estimation and post-selection model scoring. It does not claim joint maximum-likelihood estimation of all vine parameters.
