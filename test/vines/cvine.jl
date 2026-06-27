@testitem "Generic – CVineCopula" tags=[:Generic, :Vine, :CVine] setup=[M] begin
    M.check(M.cvine2())
    M.check(M.cvine3())
    M.check(M.cvine4())
end

@testitem "Density – CVineCopula" tags=[:Density, :Vine, :CVine] setup=[M] begin
    M.check_density(M.cvine3())
    M.check_density(M.cvine4())
end

@testitem "Sampling – CVineCopula" tags=[:Sampling, :Vine, :CVine] setup=[M] begin
    M.check_sampling(M.cvine2(); seed=101)
    M.check_sampling(M.cvine3(); seed=102)
    M.check_sampling(M.cvine4(); seed=103)
end

@testitem "Rosenblatt – CVineCopula" tags=[:Rosenblatt, :Vine, :CVine] setup=[M] begin
    M.check_rosenblatt(M.cvine2(); seed=201)
    M.check_rosenblatt(M.cvine3(); seed=202)
    M.check_rosenblatt(M.cvine4(); seed=203)
end
