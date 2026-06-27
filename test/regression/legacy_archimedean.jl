@testitem "Regression – Archimedean inverse identities" tags=[:Regression, :PairCopula, :Archimedean, :BB, :Inverse, :AD, :BigFloat] setup=[M] begin
    include(joinpath(@__DIR__, "..", "legacy", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "..", "legacy", "test_archimedean_inverse.jlinc"))
end
