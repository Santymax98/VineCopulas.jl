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

The older large regression tests are preserved under `test/legacy` and run through `test/regression`, so the migration to `TestItems.jl` does not discard coverage.

## Adding tests for a new pair-copula

A new pair-copula should pass at least the generic pair-copula contract:

```julia
M.check_paircopula(C)
```

This checks finite density/log-density behavior, valid h-functions, and inverse h-function round trips on a grid. Singular families may need specialized inequalities instead of strict round trips.

Prefer adding tests in `test/paircopulas/generic.jl` or a new family-specific test file, with clear tags such as `:PairCopula`, `:Miscellaneous`, `:ExtremeValue`, or `:Archimedean`.
