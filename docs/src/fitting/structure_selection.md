# Structure selection

## Dependence weights

Structure selection can use absolute Kendall's ``\tau`` or Spearman's ``\rho``:

```julia
tree_criterion=:tau
# or
tree_criterion=:rho
```

## R-vine selection

Automatic R-vine fitting follows a Dissmann-style sequential procedure:

1. compute pairwise dependence weights;
2. construct a maximum spanning tree;
3. fit the selected pair copulas;
4. generate conditional pseudo-observations;
5. build the next candidate graph under the proximity condition;
6. repeat until the requested truncation level.

`tree_algorithm=:kruskal` provides deterministic maximum-spanning-tree selection and is the route used by the external parity gate.

## C- and D-vines

C-vine order selection favors variables with strong aggregate dependence. D-vine order selection treats the first tree as a path problem and uses an exact route when practical, with a deterministic fallback for larger dimensions.
