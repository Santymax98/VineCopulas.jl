# Vine truncation

A vine truncated at level ``q`` retains trees ``1,\ldots,q`` and treats higher-tree dependence as independence.

For a ``p``-dimensional model, full depth is ``p-1``.

```julia
model = fit(RVineCopula, U; trunc=2)
```

or construct an explicit truncated vine directly. An already constructed model
can also be structurally reduced:

```julia
truncated = truncate(model, 2)
truncation(truncated)
```

`truncate(model, q)` returns a new model with the same public vine type, the same
variable order, and the first ``q`` pair-copula trees. It cannot expand a model
whose higher trees were not stored.

Truncation is a structural property of the vine and must not be confused with **candidate parameter bounds** used by automatic family selection. Parameter bounds restrict an optimizer's search space; vine truncation removes higher trees from the model.

For standard general R-vines, truncation below full depth currently applies to fitting and density evaluation. Rosenblatt/inverse Rosenblatt transforms, simulation, and the simulation-based numerical CDF require full depth. Truncated C- and D-vines retain their transform and simulation paths.

Automatic data-driven selection of the truncation level is not yet part of the public API.

!!! tip
    Use truncation as a modeling decision, not only as a speed knob. A smaller
    truncation level can improve interpretability and reduce variance, but it
    also assumes that omitted higher-tree conditional dependences are negligible.

!!! warning "Level zero"
    Mathematically, truncation at level zero corresponds to the independence
    copula. The current public `truncate` API starts at level one; level-zero
    support should be added deliberately with matching traversal and fitting
    semantics.
