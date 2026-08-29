# Archimedean pair copulas

The default one-parameter Archimedean set contains Clayton, Gumbel, Frank, and Joe. The broader catalog also includes AMH, Gumbel-Barnett, and inverse-Gaussian Archimedean families.

```julia
ClaytonCopula(2, 1.5)
GumbelCopula(2, 1.4)
FrankCopula(2, 3.0)
JoeCopula(2, 1.6)
```

Clayton, Gumbel, and Joe use rotations in automatic selection to represent alternative tail orientations and negative association. Frank already spans both association signs in its base bivariate parameterization.

The public constructors keep the parameter domains defined by `Copulas.jl`. Automatic vine selection can use a narrower candidate domain; see [Fitting and selection](../../manual/fitting_selection.md).
