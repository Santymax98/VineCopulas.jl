@testitem "Regression – core vine interface" tags=[:Regression, :Core, :Vine, :CVine, :DVine, :RVine, :CDF] setup=[M] begin
    include(joinpath(@__DIR__, "fixtures", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "fixtures", "test_core.jlinc"))
end
