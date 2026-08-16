# Testing

The package uses `TestItems.jl` with shared contracts in `test/common.jl`.

Run everything with:

```julia
using Pkg
Pkg.test()
```

For focused development:

```julia
using TestItemRunner
@run_package_tests filter = ti -> :PairCopula in ti.tags
@run_package_tests filter = ti -> :CVine in ti.tags
@run_package_tests filter = ti -> :DVine in ti.tags
@run_package_tests filter = ti -> :RVine in ti.tags
@run_package_tests filter = ti -> :Fit in ti.tags
```

## Release checks

A release candidate should pass, in order:

```bash
julia --project=. -e 'using Pkg; Pkg.test()'
PARITY_N=800 PARITY_FIT_MODE=common bash benchmarks/correctness/run_correctness_gate.sh
PARITY_N=800 PARITY_FIT_MODE=default bash benchmarks/correctness/run_correctness_gate.sh
```

Then build the documentation and run the performance suites. Correctness failures are fixed rather than hidden by loosening tolerances or removing candidates from the parity set.
