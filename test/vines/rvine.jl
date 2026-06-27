@testitem "Generic – RVineCopula" tags=[:Generic, :Vine, :RVine] setup=[M] begin
    M.check(M.rvine2())
    M.check(M.rvine3_dvine_like())
    M.check(M.rvine4_dvine_like())
end

@testitem "Sampling – RVineCopula" tags=[:Sampling, :Vine, :RVine] setup=[M] begin
    M.check_sampling(M.rvine2(); seed=501)
    M.check_sampling(M.rvine3_dvine_like(); seed=502)
    M.check_sampling(M.rvine4_dvine_like(); seed=503)
end

@testitem "Rosenblatt – RVineCopula" tags=[:Rosenblatt, :Vine, :RVine] setup=[M] begin
    M.check_rosenblatt(M.rvine2(); seed=601)
    M.check_rosenblatt(M.rvine3_dvine_like(); seed=602)
    M.check_rosenblatt(M.rvine4_dvine_like(); seed=603)
end

@testitem "Matrix exchange – RVineCopula" tags=[:Structure, :Matrix, :Vine, :RVine] setup=[M] begin
    rv = M.rvine4_truncated()
    A = rvine_matrix(rv)
    rv2 = RVineCopula(A, collect(edges(rv)))
    @test order(rv2) == order(rv)
    @test struct_array(rv2) == struct_array(rv)
    @test truncation(rv2) == truncation(rv)
    @test rvine_matrix(rv2) == A
end
