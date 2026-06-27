# h-functions and inverse h-functions

Vine algorithms are built from conditional distribution functions of bivariate copulas. For a bivariate copula ``C`` with arguments ``(u,v)``, `VineCopulas.jl` uses the convention

```math
h_1(u,v) = F_{1\mid 2}(u\mid v) = \frac{\partial C(u,v)}{\partial v},
```

```math
h_2(u,v) = F_{2\mid 1}(v\mid u) = \frac{\partial C(u,v)}{\partial u}.
```

The public API is:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

`hinv1` solves for the first coordinate ``u`` given ``q`` and ``v``. `hinv2` solves for the second coordinate ``v`` given ``q`` and ``u``.

## Example

```@example h-functions
using VineCopulas

C = ClaytonCopula(2, 2.0)
u, v = 0.25, 0.75

q1 = hfunc1(C, u, v)
q2 = hfunc2(C, u, v)

(u, hinv1(C, q1, v), v, hinv2(C, q2, u))
```

## Why inverses matter

Simulation from a vine is recursive. The algorithm starts with independent uniforms and then applies inverse conditional distributions. Therefore, every pair-copula used for simulation must have reliable `hinv1` and `hinv2` methods.

Density evaluation only needs the pair density and the forward h-functions, but Rosenblatt inversion and random generation require the inverse h-functions.

## Generic and specialized paths

The package provides a generic fallback based on automatic differentiation and safeguarded scalar root-finding. Specialized methods are implemented for families where analytic formulas or stable coordinate systems are available.

This design makes contribution straightforward: a new bivariate copula can first rely on generic fallbacks; if tests expose instability or performance issues, family-specific `hfunc`/`hinv` methods can be added.
