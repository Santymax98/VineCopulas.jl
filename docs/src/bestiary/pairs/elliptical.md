# Elliptical pair copulas

The default elliptical families are Gaussian and Student-t.

| Family | Parameters used in pair models | Typical role |
|---|---|---|
| Gaussian | correlation ``\rho`` | symmetric dependence without tail dependence |
| Student-t | correlation ``\rho``, degrees of freedom ``\nu`` | symmetric dependence with heavier joint tails |

Both base families admit positive and negative association, so automatic selection does not create rotated duplicates for them.

```julia
C1 = GaussianCopula(2, 0.6)
C2 = TCopula(5.0, [1.0 0.6; 0.6 1.0])
```

The Student-t family is numerically validated but remains a performance target because repeated scalar t-CDF and t-quantile evaluations are comparatively expensive.
