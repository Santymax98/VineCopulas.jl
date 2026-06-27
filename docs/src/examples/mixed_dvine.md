# Mixed D-vine

```julia
using VineCopulas
using Distributions: logpdf
using Random

C12 = GaussianCopula([1.0 0.5; 0.5 1.0])
C23 = ClaytonCopula(2, 2.0)
C34 = FrankCopula(2, 3.0)
C13_2 = GumbelCopula(2, 1.4)
C24_3 = JoeCopula(2, 1.6)
C14_23 = BB1Copula(2, 1.2, 1.5)

dv = DVineCopula(
    [1, 2, 3, 4],
    [[C12, C23, C34], [C13_2, C24_3], [C14_23]],
)

U = rand(MersenneTwister(123), dv, 100)
logpdf(dv, U[:, 1])
```
