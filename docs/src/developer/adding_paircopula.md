# Adding a pair copula

A bivariate `Copulas.jl` copula can be used inside a vine when its density and
conditional operations are reliable.

Support for **evaluation**, **specialized kernels**, and **automatic fitting
and selection** are separate levels of integration.

## Basic evaluation contract

For generic vine evaluation, the underlying bivariate copula should provide
reliable behavior for operations equivalent to

```julia
logpdf(C, [u, v])

D1 = condition(C, 2, v)
cdf(D1, u)
quantile(D1, q)

D2 = condition(C, 1, u)
cdf(D2, v)
quantile(D2, q)
```

`VineCopulas.jl` uses these operations to provide generic pair-copula density
and conditional fallbacks.

Therefore a new `Copulas.jl` family does not necessarily require duplicated
`hfunc1`, `hfunc2`, `hinv1`, or `hinv2` implementations.

## Optional specialized kernels

A family may specialize any of

```julia
_pair_logpdf(C, u, v, buf)

hfunc1(C, u, v)
hfunc2(C, u, v)

hinv1(C, q, v)
hinv2(C, q, u)
```

when doing so materially improves performance, allocation behavior,
numerical stability, tail behavior, or handling of singular distributions.

Specialized methods must remain consistent with the generic conditional
definitions

```math
h_1(u,v)=F_{1\mid2}(u\mid v),
```

and

```math
h_2(u,v)=F_{2\mid1}(v\mid u).
```

For smooth families, the expected inverse round trips are

```math
h_1(h_1^{-1}(q,v),v) \approx q
```

and

```math
h_2(u,h_2^{-1}(q,u)) \approx q.
```

Singular families should instead satisfy the appropriate generalized-inverse
conditions.

## Fitting and selection support

Evaluation support is distinct from automatic fitting and family selection.

Before adding a family to `DEFAULT_PAIR_FAMILIES`, also provide:

- parameter estimation support;
- valid fitting and selection parameter domains;
- rotation support where applicable;
- selection metadata;
- pair-level correctness tests;
- fitting and family-selection tests.

A family may therefore be fully usable in a manually specified vine without
being a candidate for automatic family selection.

## Workflow

1. Implement and validate the bivariate copula in `Copulas.jl`.
2. Verify its density and `condition` interface.
3. Test the generic `VineCopulas.jl` pair-copula fallback.
4. Add specialized kernels only when justified by correctness, stability, or
   performance.
5. Add pair-level conditional and inverse-conditional tests.
6. Add at least one small vine-level integration test.
7. Add fitting and selection support separately if the family should become
   an automatic candidate.
8. Update the Bestiary and fitting documentation as appropriate.

## Source location

| Family type | Location |
|---|---|
| Generic pair primitives | `src/PairCopulas/Generic.jl` |
| Elliptical | `src/PairCopulas/Ellipticals/` |
| Archimedean and BB | `src/PairCopulas/Archimedeans/` |
| Extreme-value | `src/PairCopulas/ExtremeValue/` |
| Miscellaneous | `src/PairCopulas/Miscellaneous/` |
