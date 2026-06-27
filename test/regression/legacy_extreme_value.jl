@testitem "Regression – extreme-value conditional primitives" tags=[:Regression, :PairCopula, :ExtremeValue, :Conditional, :Inverse, :BigFloat] setup=[M] begin
    include(joinpath(@__DIR__, "..", "legacy", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "..", "legacy", "test_extreme_value.jlinc"))
end
