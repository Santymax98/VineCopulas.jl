@testitem "Unit interval clamping preserves representable probabilities" tags=[:Numerical, :Clamping, :UnitInterval] setup=[M] begin
    @test VineCopulas._clp(1e-10) == 1e-10
    @test VineCopulas._clp(1.0-1e-10) == 1.0-1e-10
    @test VineCopulas._clp(1e-22) == 1e-22
    @test VineCopulas._clp(0.0) == nextfloat(0.0)
    @test VineCopulas._clp(1.0) == prevfloat(1.0)
end
