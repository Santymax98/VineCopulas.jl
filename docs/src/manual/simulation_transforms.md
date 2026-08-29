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

For **standard general R-vines** truncated below full depth, density evaluation and fitting are available, but Rosenblatt/inverse Rosenblatt transforms are not yet implemented. Because `rand`, `simulate_qmc`, and the numerical CDF use the inverse Rosenblatt transform, those operations currently require a full-depth standard general R-vine. Truncated C- and D-vines are not subject to this limitation.

!!! warning
    This limitation is structural, not cosmetic. A truncated general R-vine must
    still define a coherent traversal plan for transforms before `rand`,
    `simulate_qmc`, or simulation-based CDF estimation can use it.

## Numerical CDF

The multivariate CDF is evaluated numerically for general vines. Use `set_cdf_nsamples!` to control the integration budget and `enable_deterministic_cdf!` when reproducibility is more important than randomization.
