using Test
using TestItems
using TestItemRunner
using VineCopulas

# Run all test items by default.
# Examples for local filtering:
#   @run_package_tests filter = ti -> :CVine in ti.tags
#   @run_package_tests filter = ti -> :ExtremeValue in ti.tags
#   @run_package_tests filter = ti -> :BigFloat in ti.tags
#   @run_package_tests filter = ti -> :PairCopula in ti.tags && :BB in ti.tags
@run_package_tests
