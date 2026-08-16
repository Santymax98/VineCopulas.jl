# Vine structures

A vine copula decomposes a multivariate copula density into bivariate pair-copula terms organized in trees. `VineCopulas.jl` implements three structure families.

- **C-vine:** each tree is organized around a root variable.
- **D-vine:** each tree follows a path structure.
- **R-vine:** the general regular-vine representation, including C- and D-vines as special cases.

For a ``p``-dimensional untruncated vine, tree ``t`` contains ``p-t`` pair copulas. The density is the product of those pair-copula densities evaluated at recursively computed conditional arguments.

Use C- or D-vines when their structure is meaningful for the application. Use an R-vine when the dependence graph should be selected more flexibly from the data.
