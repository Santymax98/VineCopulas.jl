@testitem "Generic – DVineCopula" tags=[:Generic, :Vine, :DVine] setup=[M] begin
    M.check(M.dvine2())
    M.check(M.dvine3())
    M.check(M.dvine4())
end

@testitem "Density – DVineCopula" tags=[:Density, :Vine, :DVine] setup=[M] begin
    M.check_density(M.dvine3())
    M.check_density(M.dvine4())
end

@testitem "Sampling – DVineCopula" tags=[:Sampling, :Vine, :DVine] setup=[M] begin
    M.check_sampling(M.dvine2(); seed=301)
    M.check_sampling(M.dvine3(); seed=302)
    M.check_sampling(M.dvine4(); seed=303)
end

@testitem "Rosenblatt – DVineCopula" tags=[:Rosenblatt, :Vine, :DVine] setup=[M] begin
    M.check_rosenblatt(M.dvine2(); seed=401)
    M.check_rosenblatt(M.dvine3(); seed=402)
    M.check_rosenblatt(M.dvine4(); seed=403)
end
