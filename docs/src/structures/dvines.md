# D-vines

A D-vine is represented by an order and a triangular collection of pair-copula edges.

```julia
using VineCopulas

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

dv = DVineCopula(
    [1, 2, 3],
    [[C12, C23], [C13_2]],
)
```

For tree `k`, `edges[k][i]` represents the pair-copula between `order[i]` and `order[i+k]` conditional on the variables between them in the D-vine path.

D-vines support density evaluation, simulation, Rosenblatt transforms, inverse Rosenblatt transforms, and truncation.
