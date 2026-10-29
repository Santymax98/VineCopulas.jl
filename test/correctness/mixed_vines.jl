@testitem "Regression - mixed-family vines" tags=[:Regression, :Vine, :CVine, :DVine, :MixedFamily, :Rosenblatt] setup=[M] begin
    include(joinpath(@__DIR__, "fixtures", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "fixtures", "test_vines_mixed.jlinc"))
end
