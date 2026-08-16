# Vine fitting

## C-vines

```julia
fit(CVineCopula, U; order=[1, 2, 3, 4])
```

Without `order`, a data-driven order is selected from dependence scores.

## D-vines

```julia
fit(DVineCopula, U; order=[1, 2, 3, 4])
```

Without `order`, the package selects a path through the variables.

## R-vines

For a fixed structure:

```julia
fit(RVineCopula, U; structure=st)
```

For a data-driven structure:

```julia
fit(RVineCopula, U; tree_criterion=:tau, tree_algorithm=:kruskal)
```

## Truncation and threshold

`trunc=q` stops fitting after tree ``q``. `threshold` can force sufficiently weak pair dependencies to independence during the sequential procedure.

Automatic selection of the truncation depth is future work; the current API expects the user to choose it explicitly.
