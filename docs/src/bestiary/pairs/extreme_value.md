# Extreme-value pair copulas

`VineCopulas.jl` supports bivariate extreme-value pair copulas exposed by `Copulas.jl`, including smooth and singular cases when the required conditional operations are available.

These families can be used explicitly on vine edges and benefit from specialized conditional routines where numerical inversion would otherwise be fragile.

They are not included in `DEFAULT_PAIR_FAMILIES`. Automatic selection currently focuses on the parametric family set with external `rvinecopulib` coverage.
