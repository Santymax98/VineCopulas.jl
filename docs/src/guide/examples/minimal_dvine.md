# Minimal D-vine

This example builds the smallest non-trivial D-vine, evaluates its density, simulates data, and computes a Rosenblatt round-trip.

```@example minimal-dvine
using VineCopulas
using Distributions: logpdf, pdf
using Random

C12 = GaussianCopula([1.0 0.55; 0.55 1.0])
C23 = ClaytonCopula(2, 1.8)
C13_2 = FrankCopula(2, 2.5)

vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
```

```@example minimal-dvine
u = [0.2, 0.6, 0.8]
(logpdf(vine, u), pdf(vine, u))
```

```@example minimal-dvine
U = rand(MersenneTwister(123), vine, 1_000)
size(U)
```

```@example minimal-dvine
Z = rosenblatt(vine, U)
maximum(abs.(inverse_rosenblatt(vine, Z) .- U))
```
