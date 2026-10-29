@testitem "Regression - bivariate pair-copula primitives" tags=[:Regression, :PairCopula, :Conditional, :Inverse, :Density] setup=[M] begin
    include(joinpath(@__DIR__, "fixtures", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "fixtures", "test_paircopulas.jlinc"))
end
