@testitem "Regression – mixed-family vines" tags=[:Regression, :Vine, :CVine, :DVine, :MixedFamily, :Rosenblatt] setup=[M] begin
    include(joinpath(@__DIR__, "..", "legacy", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "..", "legacy", "test_vines_mixed.jlinc"))
end
