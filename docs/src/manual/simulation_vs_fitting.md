# Simulation vs fitting

`VineCopulas.jl` v0.1 is a construction and evaluation package. It assumes that the user already knows the vine structure and the pair-copula parameters.

## Simulation and evaluation

The package currently supports:

- constructing explicit C-vines, D-vines, and supported R-vines;
- evaluating `pdf` and `logpdf`;
- simulating with `rand` and `simulate_qmc`;
- computing Rosenblatt and inverse Rosenblatt transforms;
- computing `loglikelihood`, `aic`, and `bic` for explicit models.

## Fitting and selection

The package does not yet estimate pair-copula parameters, select families, select structures, or choose truncation levels automatically. A future fitting layer will likely need:

1. pseudo-observation handling or integration with `Copulas.pseudos`,
2. pair-copula parameter estimation,
3. family selection using log-likelihood, AIC, BIC or other criteria,
4. tree selection using dependence scores such as Kendall's ``\tau`` or Spearman's ``\rho``,
5. truncation selection,
6. fitted wrapper types that preserve estimation metadata.

For now, users should transform raw data to the copula scale and construct a vine explicitly.
