# Pair Copulas in Vines

Pair copulas are the bivariate building blocks on vine edges. In
`VineCopulas.jl`, a pair copula is not a new family enum or a parallel
mathematical hierarchy:

```julia
PairCopula === Copulas.Copula{2}
```

That design keeps the package close to `Copulas.jl`: individual copula families
belong upstream, while vine-specific traversal and selection belong here.

## Copulas.jl ownership

`Copulas.jl` owns the mathematical behavior of individual pair-copulas:
parameter domains, `cdf`, `pdf`, `logpdf`, `rand`, conditioning, fitting methods,
and distribution-level semantics.

`VineCopulas.jl` owns the vine use of those pair-copulas:

- attaching pair-copulas to edges;
- propagating conditional probabilities through trees;
- choosing pair families during vine selection;
- composing pair log-densities into a vine log-density;
- using fused kernels when traversal needs several pair quantities together.

!!! tip "Extension rule"
    A compatible `Copulas.Copula{2}` should be usable in a vine without defining
    a VineCopulas-specific family type. Extra `VineCopulas.jl` methods are
    performance hooks, not the semantic starting point.

## h-functions

For a bivariate copula ``C``,

```math
h_1(u,v) = F_{1\mid 2}(u\mid v),
\qquad
h_2(u,v) = F_{2\mid 1}(v\mid u).
```

The public API uses the common vine names:

```@example pair-hfunc
using VineCopulas

C = GaussianCopula(2, 0.6)

(h1 = hfunc1(C, 0.25, 0.8),
 h2 = hfunc2(C, 0.25, 0.8))
```

Conceptually these agree with `Copulas.condition`:

```julia
cdf(condition(C, 2, v), u)
cdf(condition(C, 1, u), v)
```

The first call fixes the second coordinate at `v` and evaluates the conditional
distribution of the first coordinate. The second call fixes the first coordinate
at `u`.

## Conditional inverses

Inverse h-functions map a conditional probability back to a copula-scale
coordinate:

```@example pair-hinv
using VineCopulas

C = ClaytonCopula(2, 1.5)
v = 0.7
q = 0.35

u = hinv1(C, q, v)
(u = u, roundtrip = hfunc1(C, u, v))
```

They are used by inverse Rosenblatt transforms and simulation. For compatible
pair copulas, the semantic fallback is the conditional quantile:

```julia
quantile(condition(C, 2, v), q)
quantile(condition(C, 1, u), q)
```

!!! warning "Generalized inverse semantics"
    Inverse h-functions should behave like conditional quantiles, not like an
    arbitrary root-finding branch. This matters near boundaries and for singular
    or nearly singular pair-copulas.

## Rotations

Rotations reuse a base pair-copula with coordinate flips. They are useful because
many one-sided tail-dependent families only represent one dependence orientation
in their base form.

```@example pair-rotation
using VineCopulas
using Copulas

base = ClaytonCopula(2, 2.0)
rotated = SurvivalCopula(base, (false, true))

(base_tau = Copulas.τ(base), rotated_tau = Copulas.τ(rotated))
```

During automatic selection, `allow_rotations=true` lets the selector consider
rotated versions where appropriate.

!!! note
    Gaussian, Student-t, and Frank pair-copulas already support both positive
    and negative association in their base parameterization, so the default
    search does not need rotated duplicates for them.

## Supported families

The default automatic-selection set is intentionally smaller than the complete
catalog available through `Copulas.jl`.

| Group | Families |
|---|---|
| Elliptical | Gaussian, Student-t |
| One-parameter Archimedean | Clayton, Gumbel, Frank, Joe |
| Two-parameter BB | BB1, BB6, BB7, BB8 |
| Optional | Independence |

`ALL_PARAMETRIC_PAIR_FAMILIES` additionally includes AMH, Gumbel-Barnett,
inverse-Gaussian Archimedean, BB2, BB3, BB9, and BB10 families.

The bestiary describes the supported groups from a vine perspective. For the
mathematics of each individual copula family, use the `Copulas.jl`
documentation.

## A custom-compatible pair

Explicit vines accept compatible bivariate copulas directly:

```julia
vine = DVineCopula([1, 2, 3], [[C12, C23], [C13_2]])
```

The pair objects may be different families on different edges. This is one of
the main strengths of vine models.

!!! warning "Fitting needs more than evaluation"
    Manual construction only needs pair conditional operations for the vine
    tasks you call. Automatic selection also needs fitting support and parameter
    accounting. A pair-copula can therefore be valid for manual vines before it
    is a good automatic-selection candidate.
