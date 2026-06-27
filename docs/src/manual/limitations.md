# Limitations

`VineCopulas.jl` v0.1 is a construction and evaluation core. The following features are intentionally outside the stable v0.1 scope:

- automatic pair-copula parameter estimation;
- automatic pair-copula family selection;
- automatic vine-structure selection;
- automatic truncation selection;
- fully optimized allocation-free kernels;
- systematic benchmarking against C++ implementations such as `vinecopulib`;
- stable general truncated R-vine Rosenblatt traversal.

These features are planned for later releases. The v0.1 line prioritizes correctness, explicit constructors, pair-copula conditional primitives, and reproducible tests.
