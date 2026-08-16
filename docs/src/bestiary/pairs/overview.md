# Pair copulas

Pair copulas are the bivariate building blocks attached to vine edges. `PairCopula` is an alias for `Copulas.Copula{2}`, so the package uses the bivariate families provided by `Copulas.jl` while adding vine-oriented conditional kernels and selection logic.

The default automatic-selection set is intentionally smaller than the complete parametric catalog. It receives the strongest external correctness coverage and includes Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB6, BB7, and BB8. Independence is controlled separately.

Use `family_set=:all` to expose the broader parametric set, or pass an explicit tuple of families when the candidate set is part of the model specification.
