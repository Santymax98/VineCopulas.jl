# Fitting benchmark — default

Configuration: `n=1000`, vine `p=5`, `repeats=3`; each task is warmed up once and the reported time is the median.

| Task | Dataset | Julia | `rvinecopulib` | Interpretation |
|---|---|---:|---:|---|
| Pair selection | pair_gaussian | 1.545 s | 0.213 s | R 7.25× faster |
| Pair selection | pair_clayton | 1.554 s | 0.184 s | R 8.45× faster |
| Fixed-structure R-vine | gaussian_ar1 | 14.74 s | 2.186 s | R 6.74× faster |
| Automatic R-vine | gaussian_ar1 | 14.79 s | 2.133 s | R 6.93× faster |

The fixed-structure row removes structure selection from the end-to-end workflow; the automatic row also includes tree selection. The rows should not be subtracted to estimate a standalone structure-selection cost. Correctness is checked by the separate correctness gate before these timings are promoted to the documentation.
