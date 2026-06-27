# Pair-copula decomposition

Vines express a multivariate copula density as a product of bivariate copula densities evaluated at recursively computed conditional probabilities.

## D-vine density

For the order ``(1,\ldots,p)``, a full D-vine density can be written as

```math
c(u_1,\ldots,u_p)
= \prod_{k=1}^{p-1}\prod_{i=1}^{p-k}
  c_{i,i+k;i+1:\,i+k-1}
  \left(
    u_{i\mid i+1:\,i+k-1},
    u_{i+k\mid i+1:\,i+k-1}
  \right).
```

Here ``c_{i,i+k;i+1:\,i+k-1}`` is the pair-copula density assigned to tree ``k`` and edge ``i``. In the package this corresponds to:

```julia
edges[k][i]
```

with coordinates `(left, right)`.

## C-vine density

For a C-vine order ``(r_1,\ldots,r_p)``, tree ``k`` has root ``r_k`` and edges connecting the root to variables ``r_{k+1},\ldots,r_p``. A full C-vine density is

```math
c(u_1,\ldots,u_p)
= \prod_{k=1}^{p-1}\prod_{i=1}^{p-k}
  c_{r_k,r_{k+i};r_1:\,r_{k-1}}
  \left(
    u_{r_k\mid r_1:\,r_{k-1}},
    u_{r_{k+i}\mid r_1:\,r_{k-1}}
  \right).
```

In the package this is also stored as `edges[k][i]`, but the interpretation is different: the first coordinate is the current root and the second coordinate is the child.

## Truncated vines

A truncated vine stops after tree ``q < p-1``. Pair-copulas above tree ``q`` are omitted, which is equivalent to using independence copulas for higher-order conditional pairs in the simplified construction.

```@example pcc-trunc
using VineCopulas

edges = [
    [GaussianCopula([1.0 0.4; 0.4 1.0]), ClaytonCopula(2, 1.5), FrankCopula(2, 2.0)],
    [GumbelCopula(2, 1.3), JoeCopula(2, 1.4)],
]

cv = CVineCopula([4, 3, 2, 1], edges; trunc=2)
truncation(cv)
```
