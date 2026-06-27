# Pair-copula conditionals

Vine algorithms require bivariate conditional distribution functions and their inverses. The public API is:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

These are used recursively by `logpdf`, `rosenblatt`, `inverse_rosenblatt`, and `rand` for vine objects.

The generic fallback uses automatic differentiation and safeguarded scalar root finding. Specialized methods are provided when a family has a closed-form inverse or when a numerically stable coordinate system is needed.
