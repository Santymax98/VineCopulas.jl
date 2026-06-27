# C-vines

A C-vine has one root variable per tree. The first tree connects the first root to all other variables. The second tree connects the second root to the remaining variables conditional on the first root, and so on.

For `CVineCopula(order, edges)`, tree `k` has root `order[k]`. The entry `edges[k][i]` represents

```math
C_{r,c\mid D},
\qquad r=\texttt{order[k]},\quad c=\texttt{order[k+i]},\quad D=\texttt{order[1:k-1]}.
```

Pair-copula coordinates are `(root, child)`.

```@example cvine-page
using VineCopulas

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C13 = ClaytonCopula(2, 2.0)
C23_1 = FrankCopula(2, 3.0)

cv = CVineCopula([1, 2, 3], [[C12, C13], [C23_1]])
(order(cv), truncation(cv), length(edges(cv)))
```

Truncated C-vines are constructed with `trunc`.
