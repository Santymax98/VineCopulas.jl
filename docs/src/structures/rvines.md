# R-vines

`RVineCopula` represents regular-vine structures through an order, a structure array, and a triangular collection of pair-copulas.

```@example rvine-page
using VineCopulas

order0 = [1, 2, 3]
structure0 = [[2, 3], [2]]
edges0 = [
    [GaussianCopula([1.0 0.5; 0.5 1.0]), ClaytonCopula(2, 2.0)],
    [FrankCopula(2, 3.0)],
]

rv = RVineCopula(order0, structure0, edges0)
rvine_matrix(rv)
```

Matrix exchange helpers are available through [`rvine_matrix`](@ref):

```@example rvine-page
M = rvine_matrix(rv)
rv2 = RVineCopula(M, collect(edges(rv)))
(order(rv2), struct_array(rv2))
```

General R-vine support is more experimental than C-vine and D-vine support. Natural D-vine-like R-vines delegate to the D-vine engine. General full, non-truncated R-vines have experimental density and Rosenblatt/inverse Rosenblatt traversal. General truncated R-vine Rosenblatt traversal is not part of the stable v0.1 scope.

The pair-copula containers preserve concrete types where possible. For mixed R-vines, tuple levels can be used when the user wants the compiler to retain family information per edge.
