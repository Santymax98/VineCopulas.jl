# R-vines

`RVineCopula` represents regular-vine structures through an order, a structure array, and a triangular collection of pair-copulas.

```julia
using VineCopulas

order = [1, 2, 3]
struct_array = [[2, 3], [2]]
edges = [
    [GaussianCopula([1.0 0.5; 0.5 1.0]), ClaytonCopula(2, 2.0)],
    [FrankCopula(2, 3.0)],
]

rv = RVineCopula(order, struct_array, edges)
```

Matrix exchange helpers are available through [`rvine_matrix`](@ref):

```julia
M = rvine_matrix(rv)
rv2 = RVineCopula(M, collect(edges(rv)))
```

General R-vine support is still more experimental than C-vine and D-vine support. Natural D-vine-like R-vines delegate to the D-vine engine. General truncated R-vine Rosenblatt traversal is not part of the stable v0.1 scope.
