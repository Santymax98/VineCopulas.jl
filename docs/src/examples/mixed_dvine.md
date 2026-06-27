# Mixed D-vine

A vine can mix different bivariate families across its edges.

```@example mixed-dvine
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
```

```@example mixed-dvine
U = rand(MersenneTwister(123), dv, 1_000)
(sum(logpdf(dv, U)), aic(dv, U), bic(dv, U))
```

```@example mixed-dvine
Z = rosenblatt(dv, U)
U2 = inverse_rosenblatt(dv, Z)
maximum(abs.(U2 .- U))
```
