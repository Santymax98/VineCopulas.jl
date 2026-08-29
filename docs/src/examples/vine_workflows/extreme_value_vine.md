# Extreme-value vine

Extreme-value pair-copulas can be used as vine edges when their conditional primitives are available.

```@example ev-vine
using VineCopulas
using Copulas
using Distributions: logpdf
using Random

C12 = Copulas.ExtremeValueCopula(2, Copulas.GalambosTail(1.5))
C23 = Copulas.ExtremeValueCopula(2, Copulas.HuslerReissTail(1.2))
C13_2 = GaussianCopula([1.0 0.3; 0.3 1.0])

dv = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
U = rand(MersenneTwister(2026), dv, 500)
logpdf(dv, U[:, 1])
```

```@example ev-vine
Z = rosenblatt(dv, U)
maximum(abs.(inverse_rosenblatt(dv, Z) .- U))
```
