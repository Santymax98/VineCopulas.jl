# Rotations

Asymmetric positive-dependence families can represent negative association through rotations.

`VineCopulas.jl` follows the usual 0, 90, 180, and 270 degree convention and represents rotations through `Copulas.SurvivalCopula` flips.

During automatic selection:

```julia
fit(PairCopula, U; allow_rotations=true)
```

When `preselect=true`, the empirical dependence sign can remove rotations that cannot match the data. Set `preselect=false` for exhaustive parity or benchmark campaigns.

Gaussian, Student-t, and Frank already admit both signs in their base parameterization and therefore do not need rotated duplicates in the default search.
