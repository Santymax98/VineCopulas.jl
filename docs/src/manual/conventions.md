# Conventions

## Conditional pair-copula convention

For a bivariate copula ``C`` and coordinates ``(u, v)``, the package uses

```math
h_1(u,v) = F_{1\mid 2}(u\mid v) = \frac{\partial C(u,v)}{\partial v},
```

```math
h_2(u,v) = F_{2\mid 1}(v\mid u) = \frac{\partial C(u,v)}{\partial u}.
```

The ASCII API is:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The Unicode aliases are also exported:

```julia
h₁(C, u, v)
h₂(C, u, v)
h₁⁻¹(C, q, v)
h₂⁻¹(C, q, u)
```

`hinv1` inverts the first coordinate given the second coordinate. `hinv2` inverts the second coordinate given the first coordinate.

## Probability clamping

The package preserves representable interior probabilities. Clamping is used to avoid invalid exact boundary evaluations, not to erase valid values near `0` or `1`. This is important for high-precision tests and for extreme-value conditional inverses.

## Truncation

For C-vines and D-vines, `trunc` controls the number of active trees. Pair-copulas above the truncation level are not used. A truncation level of `p - 1` corresponds to the full vine.
