# Adding a new pair-copula

A contributor who wants to make a `Copulas.jl` bivariate family work reliably inside vines should implement and test the conditional primitive contract.

## Required contract

For a bivariate copula `C::Copulas.Copula{2}`, vines need:

```julia
_pair_logpdf(C, u, v, buf)  # scalar log-density contribution
hfunc1(C, u, v)             # F₁|₂(u | v)
hfunc2(C, u, v)             # F₂|₁(v | u)
hinv1(C, q, v)              # inverse in u, given v
hinv2(C, q, u)              # inverse in v, given u
```

The expected identities are:

```math
h_1(h_1^{-1}(q\mid v),v) \approx q,
\qquad
h_2(u,h_2^{-1}(q\mid u)) \approx q.
```

For singular families, generalized inverses are acceptable, but tests should encode the correct monotonic inequalities.

## Step-by-step checklist

1. Confirm that the family exists and has valid `pdf`, `logpdf`, and `cdf` in `Copulas.jl`.
2. Check whether the generic `ForwardDiff`/root-finding fallback is accurate enough.
3. If the fallback is unstable, add specialized methods in an appropriate file under `src/PairCopulas/`.
4. Add a pair-copula test using `M.check_paircopula(C)` or a singular-aware variant.
5. Add at least one vine-level test using the family inside a small `CVineCopula` or `DVineCopula`.
6. Update `docs/src/paircopulas/supported_families.md`.
7. Add a short example if the family has special interpretation.

## Where should code go?

| Family type | Suggested file |
|---|---|
| Elliptical | `src/PairCopulas/Ellipticals/<Family>.jl` |
| Archimedean or BB | `src/PairCopulas/Archimedeans/<Family>.jl` |
| Extreme-value | `src/PairCopulas/ExtremeValue/ExtremeValueCopula.jl` |
| Survival/rotated/miscellaneous | `src/PairCopulas/Miscellaneous/<Family>.jl` |

## Example skeleton

```julia
@inline function _pair_logpdf(C::Copulas.SomeCopula{2}, u::Real, v::Real, buf::Vector{Float64})
    # return log c(u,v) without allocating if possible
end

@inline function hfunc1(C::Copulas.SomeCopula{2}, u::Real, v::Real)
    u, v = _clp(u), _clp(v)
    # return F_{1|2}(u | v)
end

@inline function hfunc2(C::Copulas.SomeCopula{2}, u::Real, v::Real)
    u, v = _clp(u), _clp(v)
    # return F_{2|1}(v | u)
end

@inline hfunc1(C::Copulas.SomeCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc1(C, uv[1], uv[2])
@inline hfunc2(C::Copulas.SomeCopula{2}, uv::Tuple{<:Real,<:Real}) = hfunc2(C, uv[1], uv[2])

function hinv1(C::Copulas.SomeCopula{2}, q::Real, v::Real)
    q, v = _clp(q), _clp(v)
    # return u such that hfunc1(C, u, v) ≈ q
end

function hinv2(C::Copulas.SomeCopula{2}, q::Real, u::Real)
    q, u = _clp(q), _clp(u)
    # return v such that hfunc2(C, u, v) ≈ q
end
```

## Do not overpromise support

A family should move from “exists in `Copulas.jl`” to “supported in `VineCopulas.jl`” only after the conditional and inverse conditional primitives pass tests in the vine interface.
