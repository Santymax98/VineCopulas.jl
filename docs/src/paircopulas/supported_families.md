# Supported pair-copula families

`VineCopulas.jl` uses bivariate pair-copulas from `Copulas.jl`. A pair-copula can be used in a vine when the required conditional primitives are available.

Currently tested groups include:

| Group | Examples |
|---|---|
| Elliptical | Gaussian, Student-t |
| Archimedean | Clayton, Frank, Gumbel, AMH, Joe, Gumbel–Barnett, inverse Gaussian |
| BB families | BB1, BB2, BB3, BB6, BB7, BB8, BB9, BB10 |
| Extreme-value | Logistic, Galambos, Hüsler–Reiss, Mixed, asymmetric tails, Marshall–Olkin, Cuadras–Augé, BC2, extreme-t |
| Transformations | Survival and rotated pair-copulas where supported by `Copulas.jl` |

The mathematical definitions and parameter domains of the individual pair-copulas are those of `Copulas.jl`.
