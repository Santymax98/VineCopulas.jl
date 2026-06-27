# Limitations

`VineCopulas.jl` v0.1 is a correctness-oriented construction and evaluation core. The following features are not part of the stable v0.1 scope.

| Area | Status |
|---|---|
| Pair-copula parameter estimation | Not implemented yet |
| Automatic family selection | Not implemented yet |
| Automatic C-vine/D-vine/R-vine structure selection | Not implemented yet |
| Automatic truncation selection | Not implemented yet |
| Mixed discrete/continuous data | Not implemented |
| Non-simplified vines | Not implemented |
| Allocation-free high-performance kernels | Not implemented yet |
| Benchmarked C++ parity | Not claimed |
| General truncated R-vine Rosenblatt traversal | Not stable yet |
| Plackett/FGM/Raftery/M/W as tested vine pair-copulas | Not yet exposed as tested vine pair-copulas |

This does not mean these features are impossible in Julia. It means they are intentionally not advertised as implemented until the corresponding algorithms, tests, and documentation exist.

The v0.1 release focuses on explicit model construction, conditional primitives, simulation, density evaluation, Rosenblatt transforms, and a robust test suite.
