# Testing

The test suite uses `TestItems.jl`. Each test item is small, tagged, and independent. Shared contracts are defined in `test/common.jl`.

Run the full suite with:

```julia
using Pkg
Pkg.test()
```

For local development, filters can be used with `TestItemRunner.jl`:

```julia
using TestItemRunner
@run_package_tests filter = ti -> :CVine in ti.tags
@run_package_tests filter = ti -> :DVine in ti.tags
@run_package_tests filter = ti -> :RVine in ti.tags
@run_package_tests filter = ti -> :PairCopula in ti.tags
@run_package_tests filter = ti -> :ExtremeValue in ti.tags
@run_package_tests filter = ti -> :Rosenblatt in ti.tags
```

The current suite keeps the older large regression tests under `test/legacy` while newer tests are organized by functionality under `test/paircopulas`, `test/vines`, and `test/numerical`.

When adding tests, prefer reusing existing contracts such as `M.check(vine)` and `M.check_paircopula(C)` instead of duplicating the same mathematical properties in many files.
