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
- AIC/BIC/mBICV;
- selected truncation;
- edge-level diagnostics;
- selection traces.

This separation keeps model evaluation lightweight and avoids turning
distribution objects into mutable analysis logs.

## Near-term extension priorities

The next fitting-related additions should be staged:

1. document current behavior and edge metadata;
2. expose richer diagnostics through fitted-result metadata;
3. only then consider public strategy objects.

Automatic truncation selection and mBICV scoring are in: `trunc=:mbicv` runs
the greedy tree-by-tree rule inside the three sequential engines and the
fixed-structure R-vine path, and `mbicv` is the public read.

The strategy architecture should follow real pressure from new algorithms rather
than arriving as a speculative object model.
