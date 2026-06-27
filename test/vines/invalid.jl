@testitem "Invalid – vine constructors and CDF options" tags=[:Invalid, :Constructor, :Structure, :Vine] setup=[M] begin
    using Distributions: cdf
    E = M.vine_edges(4, 1)
    @test_throws ArgumentError DVineCopula([1, 2, 3, 4], E; trunc=0)
    @test_throws ArgumentError CVineCopula([1, 2, 3, 4], E; trunc=4)
    @test_throws ArgumentError RVineCopula([1, 2, 3, 4], [[2, 3, 4]], E; trunc=0)

    V = DVineCopula([1, 2, 3, 4], E; trunc=1)
    @test_throws ArgumentError cdf(V, fill(0.5, 4, 2); method=:invalid, N=32)
end
