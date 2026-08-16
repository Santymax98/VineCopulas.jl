# Fitting benchmark — common

Configuration: `n=1000`, vine `p=5`, `repeats=3`; each task is warmed up once and the reported time is the median.

| Task | Dataset | Julia | `rvinecopulib` | Interpretation |
|---|---|---:|---:|---|
| Pair selection | pair_gaussian | 0.4656 s | 0.137 s | R 3.4× faster |
| Pair selection | pair_clayton | 0.4483 s | 0.121 s | R 3.71× faster |
| Fixed-structure R-vine | gaussian_ar1 | 4.419 s | 1.399 s | R 3.16× faster |
| Automatic R-vine | gaussian_ar1 | 4.413 s | 1.334 s | R 3.31× faster |

The fixed-structure row removes structure selection from the end-to-end workflow; the automatic row also includes tree selection. The rows should not be subtracted to estimate a standalone structure-selection cost. Correctness is checked by the separate correctness gate before these timings are promoted to the documentation.
