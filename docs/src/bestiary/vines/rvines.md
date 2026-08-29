# R-vines

`RVineCopula` represents a general regular vine. It supports standard R-vine structures, matrix exchange, density evaluation, simulation, Rosenblatt transforms, fixed-structure fitting, and automatic Dissmann-style structure selection.

## Fixed structure

Construct an `RVineStructure` and fit its pair copulas:

```julia
st = RVineStructure(order, struct_array)
model = fit(RVineCopula, U; structure=st)
```

The structure can also be paired directly with an explicit edge array:

```julia
model = RVineCopula(st, edges)
```

## Automatic structure selection

```julia
model = fit(
    RVineCopula,
    U;
    family_set=:default,
    tree_criterion=:tau,
    tree_algorithm=:kruskal,
    selection_criterion=:bic,
)
```

The first tree is a maximum spanning tree using absolute dependence scores. Higher trees are selected under the R-vine proximity condition and fitted sequentially.

## Matrix exchange

```julia
M = rvine_matrix(model)
```

Matrix representations can differ across packages even when they encode the same vine. For interoperability, compare the represented edges and conditioning sets rather than raw matrix strings.
