# Pair-copula selection

Automatic pair selection evaluates a candidate family set, optional rotations, and optional independence, then chooses the smallest model-selection score.

```julia
fit(
    PairCopula,
    U;
    family_set=:default,
    pair_method=:mle,
    selection_criterion=:bic,
    allow_rotations=true,
    preselect=true,
    include_independence=true,
)
```

## Criteria

- `:loglik` selects the largest fitted log-likelihood.
- `:aic` minimizes ``-2\ell + 2k``.
- `:bic` minimizes ``-2\ell + k\log n``.

Here ``k`` is the number of pair-copula parameters and ``n`` is the number of observations.

## Family sets

- `family_set=:default` uses the validated default parametric set.
- `family_set=:all` uses the broader parametric set.
- A tuple or vector gives complete control over the candidates.

## Preselection

`preselect=true` currently prunes impossible rotation signs using empirical dependence. It is intentionally simpler than `vinecopulib`'s full family-preselection heuristics. Correctness parity benchmarks disable preselection so both engines search the same explicit candidate space.
