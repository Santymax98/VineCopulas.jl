# Truncated C-vine

```julia
using VineCopulas
using Random

edges = [
    [GaussianCopula([1.0 0.4; 0.4 1.0]), ClaytonCopula(2, 1.5), FrankCopula(2, 2.0)],
    [GumbelCopula(2, 1.3), JoeCopula(2, 1.4)],
]

cv = CVineCopula([4, 3, 2, 1], edges; trunc=2)
U = rand(MersenneTwister(321), cv, 50)
Z = rosenblatt(cv, U)
U2 = inverse_rosenblatt(cv, Z)
maximum(abs.(U2 .- U))
```
