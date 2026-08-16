# Adding a pair copula

A bivariate `Copulas.jl` family can be used in a vine when its density and conditional operations are reliable.

## Required contract

```julia
_pair_logpdf(C, u, v, buf)
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

For smooth families the expected round trips are ``h_1(h_1^{-1}(q\mid v),v) \approx q`` and ``h_2(u,h_2^{-1}(q\mid u)) \approx q``. Singular families should use the appropriate generalized-inverse inequalities instead.

## Workflow

1. Confirm the family has valid `cdf`, `pdf`, and `logpdf` behavior in `Copulas.jl`.
2. Test the generic conditional fallback.
3. Add a specialized kernel only when it improves stability or speed.
4. Add pair-level tests through the shared pair-copula contract.
5. Add at least one small vine-level integration test.
6. Update the Bestiary if the family becomes supported or selectable.

## Source location

| Family type | Location |
|---|---|
| Elliptical | `src/PairCopulas/Ellipticals/` |
| Archimedean and BB | `src/PairCopulas/Archimedeans/` |
| Extreme-value | `src/PairCopulas/ExtremeValue/` |
| Miscellaneous | `src/PairCopulas/Miscellaneous/` |

Do not add a family to `DEFAULT_PAIR_FAMILIES` until its fitting, rotations, and conditional primitives have dedicated correctness coverage.
