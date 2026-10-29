@testitem "Regression - Archimedean inverse identities" tags=[:Regression, :PairCopula, :Archimedean, :BB, :Inverse, :AD, :BigFloat] setup=[M] begin
    include(joinpath(@__DIR__, "fixtures", "test_helpers.jlinc"))
    include(joinpath(@__DIR__, "fixtures", "test_archimedean_inverse.jlinc"))
end
