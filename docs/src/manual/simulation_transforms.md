# Simulation and Transforms

## Simulation

Vine models support ordinary random simulation through `rand` and quasi-Monte Carlo simulation through `simulate_qmc`.

```julia
U = rand(vine, 10_000)
Q = simulate_qmc(vine, 10_000)
```

## Rosenblatt transform

For a fitted or explicit vine ``C``, the Rosenblatt transform maps dependent observations to conditionally uniform coordinates:

```julia
Z = rosenblatt(vine, U)
```

The inverse transform reconstructs observations from independent uniforms:

```julia
U2 = inverse_rosenblatt(vine, Z)
maximum(abs.(U2 .- U))
```

In-place variants are available for repeated workloads:

```julia
rosenblatt!(dest, vine, U)
inverse_rosenblatt!(dest, vine, Z)
```

Truncation is respected by every transform. A vine truncated at level ``q`` treats the pair-copulas of trees ``q+1, \ldots, p-1`` as independence copulas, whose conditional functions are the identity, so the Rosenblatt transform undoes exactly the ``q`` conditional trees the model stores and the inverse transform rebuilds them. This holds for C-vines, D-vines, and standard general R-vines alike, so `rand`, `simulate_qmc`, and the numerical CDF are available at any truncation depth. A truncated vine and the same vine padded to full depth with independence pair-copulas produce the same transforms, the same samples, and the same density.

## Numerical CDF

The multivariate CDF is evaluated numerically for general vines. Use `set_cdf_nsamples!` to control the integration budget and `enable_deterministic_cdf!` when reproducibility is more important than randomization.
