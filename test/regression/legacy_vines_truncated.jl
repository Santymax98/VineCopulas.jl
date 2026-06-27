@testitem "Regression – truncated vines and R-vine matrices" tags=[:Regression, :Vine, :Truncation, :RVine, :Matrix, :Rosenblatt] setup=[M] begin
    include(joinpath(@__DIR__, "..", "legacy", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "..", "legacy", "test_vines_truncated.jlinc"))
end
