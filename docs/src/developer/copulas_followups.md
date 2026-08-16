# Copulas.jl follow-ups

The vine parity campaign exposed a few upstream questions worth testing independently in `Copulas.jl`. They are deliberately kept separate from VineCopulas-specific selection domains.

| Priority | Topic | Reproducible condition |
|---|---|---|
| high | Gaussian `:mle` | deterministic 20-point normal-score sample in `test/vines/fitting.jl`; direct copula MLE gives ``\hat\rho\approx0.556166`` |
| medium | generic transformed-space MLE | weak Clayton/Gumbel interior optima on higher-tree pseudo-observations collapsed to the independence boundary in a custom bounded wrapper |
| low | Archimedean `xtol` | keyword is accepted by the one-parameter MLE; verify that it actually changes optimizer termination settings |
| stress test | Joe/Gumbel boundary robustness | ``\theta\in\{1.01,1.05,1.10\}`` with ``n\in\{100,500,1000\}`` |

## Gaussian direct copula MLE

The cleanest standalone regression fixture is already in `test/vines/fitting.jl` under `Gaussian vine selection maximizes copula likelihood`. Its 20 normal-score pairs have sample Pearson correlation about `0.673483`, while direct maximization of the Gaussian copula likelihood gives

$$\hat\rho \approx 0.5561662333, \qquad \ell(\hat\rho) \approx 5.140188517.$$

Using the normal-score sample correlation gives a smaller copula log-likelihood, about `4.473895`. This is the first upstream test to write: compare `fit(GaussianCopula, U; method=:mle)` with direct maximization of `loglikelihood(GaussianCopula(2, ρ), U)` over ``-1<\rho<1``.

The same issue changed a real vine family decision in the `PARITY_N=300` correctness fixture at tree-4 edge `(1,4 | 2:3:5)`: the normal-score route gave log-likelihood about `24.317022`, while the direct/reference fit gave about `24.472079`.

## Generic transformed-space MLE near independence

This was observed in custom bounded wrappers, so it should not be reported as a native Clayton/Gumbel bug without a separate test. The exact vine pseudo-observation cases were:

| Edge | Family | Boundary estimate | Bounded/reference estimate |
|---|---|---:|---:|
| `(1,5 | 2:3)` | Clayton | ``\theta\approx10^{-10}`` | ``\theta\approx0.36079`` |
| `(1,5 | 2:3)` | Gumbel | ``\theta\approx1`` | ``\theta\approx1.18641`` |
| `(3,4 | 2:5)` | Clayton | ``\theta\approx10^{-10}`` | ``\theta\approx0.35090`` |
| `(3,4 | 2:5)` | Gumbel | ``\theta\approx1`` | ``\theta\approx1.17526`` |

A useful upstream regression is a small custom one-parameter copula wrapper with a logistic bounded transform and a weak but clear interior likelihood optimum. The generic MLE should not silently settle at a transformed boundary.

## Archimedean `xtol`

The specialized one-parameter Archimedean MLE accepts `xtol`. Verify that the value is passed to the optimizer's stopping criteria rather than only stored in returned metadata.

## Joe/Gumbel boundary stress test

For native fits, simulate Joe and Gumbel samples near independence with ``\theta\in\{1.01,1.05,1.10\}`` and ``n\in\{100,500,1000\}``. The MLE should remain in the valid domain and should not fail because an optimizer trial crosses the constructor boundary.

## What is not an upstream bug

The narrower Student-t, Clayton, Gumbel, Joe, and BB boxes used by automatic vine selection are compatibility choices. `Copulas.jl` can legitimately expose broader mathematical parameter domains; `VineCopulas.jl` narrows only the candidate space used by its automatic selector.
