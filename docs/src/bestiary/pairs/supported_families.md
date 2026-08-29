# Supported families

Pair copulas come from `Copulas.jl`; `VineCopulas.jl` supplies vine-oriented conditional kernels, rotations, and selection rules around them.

## Default automatic-selection set

| Group | Families |
|---|---|
| Elliptical | Gaussian, Student-t |
| One-parameter Archimedean | Clayton, Gumbel, Frank, Joe |
| Two-parameter BB | BB1, BB6, BB7, BB8 |
| Optional | Independence |

`DEFAULT_PAIR_FAMILIES` is the set that receives the strongest fitting and external-parity coverage. Independence is controlled separately with `include_independence=true`.

## Broader parametric set

`ALL_PARAMETRIC_PAIR_FAMILIES` additionally contains AMH, Gumbel-Barnett, inverse-Gaussian Archimedean, BB2, BB3, BB9, and BB10 families.

The broader set is useful for explicit experiments and user-specified candidate sets. It is not automatically promoted to the default set until fitting, rotations, and conditional primitives have dedicated regression coverage.

## Direct construction

Automatic-selection membership does not limit explicit vine models. Any compatible bivariate `Copulas.jl` copula can be placed on an edge when the required conditional operations are available through the specialized or generic interface.

!!! warning
    Do not treat `DEFAULT_PAIR_FAMILIES` as a complete list of copulas that can
    appear in a vine. It is the default automatic-selection set, not the
    mathematical compatibility boundary.
