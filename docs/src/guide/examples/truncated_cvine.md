# Truncated C-vine

A truncated C-vine uses only the first `trunc` trees. Higher-order pair-copulas are omitted.

```@example truncated-cvine
using VineCopulas
using Random

edges = [
    [GaussianCopula([1.0 0.4; 0.4 1.0]), ClaytonCopula(2, 1.5), FrankCopula(2, 2.0)],
    [GumbelCopula(2, 1.3), JoeCopula(2, 1.4)],
]

cv = CVineCopula([4, 3, 2, 1], edges; trunc=2)
truncation(cv)
```

```@example truncated-cvine
U = rand(MersenneTwister(321), cv, 1_000)
Z = rosenblatt(cv, U)
U2 = inverse_rosenblatt(cv, Z)
maximum(abs.(U2 .- U))
```
