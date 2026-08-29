# D-vines

A D-vine is built from a variable ordering. Tree 1 contains adjacent pairs in that order; higher trees connect variables farther apart conditionally on the variables between them.

Use a D-vine when the variables have a path-like interpretation, such as time,
space, maturities, ordered measurements, or an externally meaningful ranking.

## Explicit construction

```julia
C12 = GaussianCopula(2, 0.5)
C23 = ClaytonCopula(2, 1.2)
C13_2 = FrankCopula(2, 2.0)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
```

## Fitting

```julia
fit(DVineCopula, U; order=[1, 2, 3])
```

Without an order, `VineCopulas.jl` selects a path using the requested dependence criterion. Exact path search is used when practical; larger problems use a deterministic heuristic route.

!!! note
    D-vines are often easier to inspect than general R-vines because every edge
    can be read relative to one path order.
