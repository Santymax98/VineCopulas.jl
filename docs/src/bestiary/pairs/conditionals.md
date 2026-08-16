# Pair-copula conditionals

For a bivariate copula ``C``, `VineCopulas.jl` uses

$$h_1(u,v)=F_{1\mid2}(u\mid v), \qquad h_2(u,v)=F_{2\mid1}(v\mid u).$$

The public functions are:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

The inverses solve for the conditioned coordinate. They are central to simulation, Rosenblatt transforms, and the recursive pseudo-observations used by sequential fitting.

Specialized kernels are used where they materially improve stability or speed. A generic fallback keeps compatible bivariate copulas usable without requiring every family to duplicate the complete conditional implementation.
