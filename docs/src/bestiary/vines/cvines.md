# C-vines

A C-vine assigns a root variable to each tree. The first root connects to every other variable, the second root connects the remaining variables conditional on the first, and so on.

Use a C-vine when some variables naturally act as central drivers of dependence.
The first root is especially important because it appears in every first-tree
edge.

## Explicit construction

```julia
C12 = GaussianCopula(2, 0.5)
C13 = ClaytonCopula(2, 1.2)
C23_1 = FrankCopula(2, 2.0)

vine = CVineCopula([1, 2, 3], [[C12, C13], [C23_1]])
```

## Fitting

Fix the root order:

```julia
fit(CVineCopula, U; order=[1, 2, 3])
```

or let the package select an order from the data:

```julia
fit(CVineCopula, U; tree_criterion=:tau)
```

The fit is sequential: pair copulas are estimated tree by tree and their h-functions generate the conditional data required by the next tree.

!!! tip
    A C-vine order is easiest to explain when the first few roots have a domain
    interpretation, such as market-wide risk factors, central sensors, or shared
    environmental drivers.
