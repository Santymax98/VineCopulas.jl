# Fitting Architecture

The fitting layer should stay simple for ordinary users while leaving room for
more algorithms over time.

## Current keyword API

This must remain enough:

```julia
fit(RVineCopula, U)
```

Additional keywords control candidate families, criteria, rotations, structure,
truncation, and thresholds:

```julia
fit(
    RVineCopula,
    U;
    family_set=:default,
    selection_criterion=:bic,
    tree_criterion=:tau,
    tree_algorithm=:kruskal,
    allow_rotations=true,
)
```

Simple scalar configuration should remain keyword-based. Do not introduce types
only to replace a boolean, a threshold, or a symbol that is not an extension
point.

## Strategy objects, eventually

As the package grows, some concepts may deserve dispatchable strategies:

- tree criteria;
- maximum-spanning-tree algorithms;
- structure learners;
- pair selectors;
- truncation selectors;
- threshold selectors.

The reason to introduce a strategy object is extensibility: external users
should be able to add a new algorithm without editing one large central
`if/elseif` chain.

!!! warning "Do not over-type simple options"
    A strategy type should represent behavior. It should not be a wrapper around
    a scalar parameter unless dispatch genuinely simplifies the implementation.

## Distribution versus fitted result

A vine copula object is the probabilistic model. It should contain the structure
and pair-copulas needed to evaluate, simulate, and transform observations.

Fitting metadata belongs in `CopulaModel`:

- fit method;
- convergence flag;
- iterations;
- log-likelihood;
- AIC/BIC and future mBICV;
- selected truncation;
- edge-level diagnostics;
- selection traces.

This separation keeps model evaluation lightweight and avoids turning
distribution objects into mutable analysis logs.

## Near-term extension priorities

The next fitting-related additions should be staged:

1. document current behavior and edge metadata;
2. add automatic truncation selection;
3. add mBICV scoring;
4. expose richer diagnostics through fitted-result metadata;
5. only then consider public strategy objects.

The strategy architecture should follow real pressure from new algorithms rather
than arriving as a speculative object model.
