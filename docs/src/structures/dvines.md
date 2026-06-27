# D-vines

A D-vine is based on a path order. In a D-vine, tree `k` connects variables that are `k` steps apart in the path.

For `DVineCopula(order, edges)`, the entry `edges[k][i]` represents

```math
C_{a,b\mid D},
\qquad a=\texttt{order[i]},\quad b=\texttt{order[i+k]},\quad D=\texttt{order[i+1:i+k-1]}.
```

Pair-copula coordinates are `(left, right)`.

```@example dvine-page
using VineCopulas

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C13_2 = FrankCopula(2, 3.0)

dv = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
(order(dv), truncation(dv), length(edges(dv)))
```

D-vines support density evaluation, simulation, Rosenblatt transforms, inverse Rosenblatt transforms, and truncation.
