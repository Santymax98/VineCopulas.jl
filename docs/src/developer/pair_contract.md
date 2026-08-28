# Pair-copula contract

`VineCopulas.jl` follows a generic-compatibility-first rule:

> Any compatible `Copulas.Copula{2}` should be usable as a pair-copula edge
> without requiring VineCopulas-specific methods.

Specialized VineCopulas methods are optional fast paths. They may improve
runtime, allocations, numerical stability, tail behavior, or fused vine
traversal, but they should not redefine the mathematical meaning of a
pair-copula family.

## Ownership boundary

`Copulas.jl` owns the mathematics and statistical behavior of individual
copulas:

- distribution functions and densities;
- conditional distributions;
- conditional quantiles;
- random generation for the standalone copula;
- family parameter domains;
- family-level fitting and dependence measures.

`VineCopulas.jl` owns vine-specific composition:

- C-, D-, and R-vine structures;
- edge traversal and conditional-state propagation;
- Rosenblatt and inverse Rosenblatt transforms for vine compositions;
- vine simulation;
- structure, family, and rotation selection;
- truncation and thresholding of vine structures;
- vine-specific diagnostics and selection metadata;
- fused kernels that compute several pair quantities because a vine traversal
  needs them together.

This split keeps reusable pair-family mathematics upstream in `Copulas.jl`
while allowing `VineCopulas.jl` to specialize the hot paths created by vine
algorithms.

## Minimum semantic contract

For manual construction and generic evaluation inside a vine, a pair copula
should support operations equivalent to:

```julia
logpdf(C, [u, v])

cdf(condition(C, 2, v), u)
cdf(condition(C, 1, u), v)

quantile(condition(C, 2, v), q)
quantile(condition(C, 1, u), q)
```

The index passed to `condition` is the coordinate being fixed. Thus
`condition(C, 2, v)` is the conditional distribution of the first coordinate
given the second coordinate, and `condition(C, 1, u)` is the conditional
distribution of the second coordinate given the first coordinate.

The public vine terminology maps to those operations as:

```julia
hfunc1(C, u, v) = cdf(condition(C, 2, v), u)
hfunc2(C, u, v) = cdf(condition(C, 1, u), v)

hinv1(C, q, v) = quantile(condition(C, 2, v), q)
hinv2(C, q, u) = quantile(condition(C, 1, u), q)
```

These formulas define the semantic fallback. A new bivariate copula that
satisfies this contract can be used on a vine edge even when
`VineCopulas.jl` has no family-specific method for it.

## Public convenience API

The h-functions are public because they are standard vine terminology and are
useful to users:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

They should remain equivalent to the `Copulas.condition` formulation. Users
can call either style depending on whether they want vine terminology or the
canonical `Copulas.jl` conditional-distribution interface.

## Optional fast paths

Some families may define specialized public h-functions or inverse
h-functions:

```julia
hfunc1(C, u, v)
hfunc2(C, u, v)
hinv1(C, q, v)
hinv2(C, q, u)
```

Those methods are justified when they provide one or more of:

- fewer allocations;
- fewer repeated coordinate transforms;
- closed-form expressions;
- better behavior in the tails;
- better behavior near independence or parameter boundaries;
- correct generalized-inverse behavior for nonsmooth or singular cases.

They must remain numerically consistent with the generic conditional
definitions.

## Internal fused hooks

Hot vine traversals may need density and one or more h-functions for the same
edge and observation. The internal fused protocol exists for that reason:

```julia
_pair_logpdf(C, u, v, buf)
_pair_hfuncs(C, u, v)
_pair_step(C, u, v, buf)
_pair_logpdf_h1(C, u, v, buf)
_pair_logpdf_h2(C, u, v, buf)
```

These hooks are private implementation details. They may change without a
deprecation cycle, and external packages should not rely on them as stable
extension points.

When a family specializes one of these hooks, the method should:

- be semantically equivalent to the public density and h-function operations;
- use only call-local scratch state;
- avoid hidden shared mutable state;
- preserve reentrancy and thread safety;
- include parity tests against the generic `condition` formulation;
- be supported by benchmark evidence when it exists primarily for speed.

The generic implementations compose the public primitives, so these hooks are
performance extensions rather than semantic requirements.

## Evaluation support versus selection support

Pair-copula evaluation and automatic pair-family selection are separate
capabilities.

A copula can be fully usable in a manually specified vine when it satisfies
the semantic contract above. Automatic fitting and selection additionally
require:

- a robust fitting method;
- parameter count metadata;
- valid optimization domains;
- sensible starting values;
- rotation handling where applicable;
- selection-score metadata;
- tests for near-independence, interior parameters, and boundary behavior.

Therefore a family should not be added to `DEFAULT_PAIR_FAMILIES` merely
because it can be evaluated. Selection support is a stronger contract.

## Compatibility with Copulas.jl versions

`VineCopulas.jl` should distinguish stable public `Copulas.jl` APIs from
internal or newly merged upstream mechanisms. In particular, code and
documentation may rely on public operations such as `condition`, `cdf`,
`quantile`, and `logpdf`, but should avoid designing against unstable
internal helpers unless the required `Copulas.jl` version is explicit.

When upstream `Copulas.jl` adds faster or more stable pair conditional
primitives, `VineCopulas.jl` should benchmark them against local
specializations before removing any existing fast path.
