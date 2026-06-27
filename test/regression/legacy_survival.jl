@testitem "Regression – SurvivalCopula primitives" tags=[:Regression, :PairCopula, :Survival, :Conditional, :Inverse] setup=[M] begin
    include(joinpath(@__DIR__, "..", "legacy", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "..", "legacy", "test_survival.jlinc"))
end
