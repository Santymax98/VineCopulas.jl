# Rosenblatt transforms

The Rosenblatt transform maps observations from a copula distribution to independent uniforms. Its inverse maps independent uniforms into observations from the target copula.

For a vine copula ``C`` in dimension ``p``, the transform is a recursive sequence of conditional distribution evaluations:

```math
z_1 = u_1, \qquad
z_j = F_{j\mid 1:(j-1)}(u_j\mid u_1,\ldots,u_{j-1}),\quad j=2,\ldots,p.
```

The inverse transform recursively applies inverse conditional distributions.

## API

```julia
rosenblatt(vine, U)
inverse_rosenblatt(vine, Z)
rosenblatt!(out, vine, U)
inverse_rosenblatt!(out, vine, Z)
```

The non-mutating methods return matrices with the same `p × n` shape as the input.

```@example rosenblatt
using VineCopulas
using Random

vine = DVineCopula(
    [1, 2, 3],
    [[GaussianCopula([1.0 0.5; 0.5 1.0]), ClaytonCopula(2, 2.0)], [FrankCopula(2, 3.0)]],
)

U = rand(MersenneTwister(11), vine, 100)
Z = rosenblatt(vine, U)
Uhat = inverse_rosenblatt(vine, Z)
maximum(abs.(Uhat .- U))
```

## Uses

Rosenblatt transforms are useful for simulation, model checking, goodness-of-fit diagnostics, and converting dependence models into independent uniforms.
