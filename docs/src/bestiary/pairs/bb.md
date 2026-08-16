# BB pair copulas

Two-parameter BB families provide more flexible dependence and tail shapes than the one-parameter Archimedean families.

The default selector contains BB1, BB6, BB7, and BB8. The broader parametric catalog also exposes BB2, BB3, BB9, and BB10.

```julia
BB1Copula(2, 0.8, 1.6)
BB6Copula(2, 1.5, 1.7)
BB7Copula(2, 1.6, 1.2)
BB8Copula(2, 1.8, 0.7)
```

For automatic selection, the default BB families use finite `vinecopulib`-aligned parameter boxes. The implementation optimizes on the interior because several boundary values reduce a BB family to a simpler family that is already present in the candidate set.

Those selection boxes do not change direct BB construction through `Copulas.jl`.
