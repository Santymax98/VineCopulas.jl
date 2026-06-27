# C-vines

A C-vine is represented by an order and a triangular collection of pair-copula edges.

```julia
using VineCopulas

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C13 = ClaytonCopula(2, 2.0)
C23_1 = FrankCopula(2, 3.0)

cv = CVineCopula(
    [1, 2, 3],
    [[C12, C13], [C23_1]],
)
```

For tree `k`, `edges[k][i]` represents a pair-copula whose root is `order[k]`, whose child is `order[k+i]`, and whose conditioning set is `order[1:k-1]`.

The main operations are:

```julia
logpdf(cv, [0.2, 0.5, 0.7])
rand(cv, 100)
rosenblatt(cv, rand(cv, 100))
```

Truncated C-vines are constructed with `trunc`:

```julia
CVineCopula([1, 2, 3, 4], edges; trunc=2)
```
