# Vine truncation

A vine truncated at level ``q`` retains trees ``1,\ldots,q`` and treats higher-tree dependence as independence.

For a ``p``-dimensional model, full depth is ``p-1``.

```julia
model = fit(RVineCopula, U; trunc=2)
```

or construct an explicit truncated C- or D-vine directly.

Truncation is a structural property of the vine and must not be confused with **candidate parameter bounds** used by automatic family selection. Parameter bounds restrict an optimizer's search space; vine truncation removes higher trees from the model.

For standard general R-vines, truncation below full depth currently applies to fitting and density evaluation. Rosenblatt/inverse Rosenblatt transforms, simulation, and the simulation-based numerical CDF require full depth. Truncated C- and D-vines retain their transform and simulation paths.

Automatic data-driven selection of the truncation level is not yet part of the public API.
