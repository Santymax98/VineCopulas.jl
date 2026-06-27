# Large simulation

This example simulates a larger sample from a manually specified vine. It is intended to show the shape of a workflow, not to claim benchmark-level performance.

```@example large-simulation
using VineCopulas
using Distributions: logpdf
using Random
using Statistics

edges = [
    [
        GaussianCopula([1.0 0.45; 0.45 1.0]),
        ClaytonCopula(2, 1.6),
        FrankCopula(2, 2.5),
        GumbelCopula(2, 1.3),
    ],
    [
        JoeCopula(2, 1.4),
        GaussianCopula([1.0 0.25; 0.25 1.0]),
        ClaytonCopula(2, 1.2),
    ],
]

vine = DVineCopula([1, 2, 3, 4, 5], edges; trunc=2)
U = rand(MersenneTwister(7), vine, 10_000)
size(U)
```

```@example large-simulation
mean(logpdf(vine, U))
```

```@example large-simulation
round.(mean(U; dims=2), digits=3)
```

For local experiments, increasing the sample size to `100_000` is usually a better stress test than doing it inside the documentation build.
