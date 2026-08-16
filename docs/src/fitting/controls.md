# Controls and parameter domains

## Main controls

| Keyword | Typical values | Purpose |
|---|---|---|
| `family_set` | `:default`, `:all`, tuple | candidate pair families |
| `pair_method` | `:mle` | pair-parameter fitting method |
| `selection_criterion` | `:loglik`, `:aic`, `:bic` | family score |
| `allow_rotations` | `true`, `false` | search rotated families |
| `preselect` | `true`, `false` | prune incompatible rotations |
| `include_independence` | `true`, `false` | include independence as a candidate |
| `tree_criterion` | `:tau`, `:rho` | structure weights |
| `tree_algorithm` | `:kruskal` | maximum spanning tree algorithm |
| `trunc` | integer | maximum fitted tree |
| `threshold` | nonnegative real | weak-dependence independence rule |
| `strict` | `true`, `false` | rethrow candidate-fit failures instead of skipping failed candidates |
| `trace` | `true`, `false` | print candidate-level fitting diagnostics |

## Selection parameter domains

For the default family set, some automatic-selection fits use finite domains matching `vinecopulib`. This makes AIC/BIC comparisons and external correctness tests meaningful because both engines optimize over the same candidate model space.

| Family | Selection domain |
|---|---|
| Gaussian | ``-1 < \rho < 1`` |
| Student-t | ``-1 < \rho < 1``, ``2 < \nu < 50`` |
| Clayton | ``10^{-10} < \theta < 28`` |
| Frank | ``-35 < \theta < 35`` |
| Gumbel | ``1 < \theta < 50`` |
| Joe | ``1 < \theta < 30`` |
| BB1 | ``0 < \theta < 7``, ``1 < \delta < 7`` |
| BB6 | ``1 < \theta < 6``, ``1 < \delta < 8`` |
| BB7 | ``1 < \theta < 6``, ``0.01 < \delta < 25`` |
| BB8 | ``1 < \vartheta < 8``, ``10^{-4} < \delta < 1`` |

The strict inequalities reflect the implementation's use of interior points. Boundary values often reduce a BB family to a simpler family and are already represented elsewhere in the candidate set.

## These bounds do not change the public copulas

The bounds above apply to **automatic vine selection only**. Direct construction and direct `Copulas.jl` fitting keep the mathematical domains defined by `Copulas.jl`.

For example, bivariate Clayton in `Copulas.jl` also supports negative parameters. Vine selection instead uses positive Clayton plus 90/270 degree rotations because that is the conventional `vinecopulib` candidate parameterization.

Likewise, `Copulas.jl` permits Student-t degrees of freedom outside the selection interval, and direct Frank construction is not redefined by the selector's finite search interval. These are model-selection compatibility choices, not new mathematical domains for the underlying copulas.
